import { BlockList, isIP } from "node:net";
import { Resolver } from "node:dns/promises";
import http from "node:http";
import https from "node:https";

export const LIMITS = { dnsMs: 2000, connectMs: 3000, idleMs: 3000, totalMs: 12000, bytes: 512000, redirects: 3 } as const;
// Conservative special-use denylist, shared with the container firewall at build time.
export const DENIED_V4 = ["0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12", "192.0.0.0/24", "192.0.2.0/24", "192.88.99.0/24", "192.168.0.0/16", "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4", "240.0.0.0/4", "168.63.129.16/32"];
const blocked = new BlockList();
for (const cidr of DENIED_V4) { const [ip, prefix] = cidr.split("/"); blocked.addSubnet(ip, Number(prefix), "ipv4"); }
for (const [ip, prefix] of [["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]] as const) blocked.addSubnet(ip, prefix, "ipv6");
const global6 = new BlockList(); global6.addSubnet("2000::", 3, "ipv6");
export function publicIp(ip: string): boolean {
  const family = isIP(ip);
  return family === 4 ? !blocked.check(ip, "ipv4") : family === 6 && global6.check(ip, "ipv6") && !blocked.check(ip, "ipv6");
}
export class AnalysisError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}
// Control characters are explicitly forbidden in untrusted URLs.
// eslint-disable-next-line no-control-regex
const unsafeUrlCharacters = /[\s\\\u0000-\u001f\u007f]/u;
export function parseTarget(raw: unknown): URL {
  if (typeof raw !== "string" || raw.length > 2048 || unsafeUrlCharacters.test(raw) || !/^https?:\/\//.test(raw)) throw new AnalysisError("URL");
  let url: URL; try { url = new URL(raw); } catch { throw new AnalysisError("URL"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash || (url.port && url.port !== (url.protocol === "https:" ? "443" : "80"))) throw new AnalysisError("URL");
  const host = url.hostname;
  // Only unambiguous ASCII DNS names or dotted canonical IPv4. IPv6 destinations unsupported.
  const authority = raw.slice(raw.indexOf("://") + 3).split(/[/?#]/)[0];
  const originalHost = authority.replace(/:(80|443)$/, "");
  if (host.startsWith("[") || originalHost.toLowerCase() !== host || host.endsWith(".") || !host.includes(".") || host.length > 253) throw new AnalysisError("URL");
  if (isIP(host)) { if (!publicIp(host)) throw new AnalysisError("DESTINATION"); }
  else if (!host.split(".").every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) throw new AnalysisError("URL");
  if (/(?:^|\.)(?:localhost|local|internal|test|invalid|onion)$/.test(host)) throw new AnalysisError("DESTINATION");
  return url;
}
export async function resolvePublic(host: string): Promise<string[]> {
  if (isIP(host)) return [host];
  const resolver = new Resolver({ timeout: LIMITS.dnsMs, tries: 1 });
  const timer = setTimeout(() => resolver.cancel(), LIMITS.dnsMs);
  try {
    const answers = await Promise.all([resolver.resolve4(host), resolver.resolve6(host)].map(p => p.catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENODATA" || e.code === "ENOTFOUND") return [];
      throw new AnalysisError("DNS");
    })));
    const addresses = answers.flat();
    if (!addresses.length || addresses.length > 32 || !addresses.every(publicIp)) throw new AnalysisError("DESTINATION");
    const ipv4 = addresses.filter(ip => isIP(ip) === 4);
    if (!ipv4.length) throw new AnalysisError("IPV6_ONLY");
    return ipv4;
  } finally { clearTimeout(timer); resolver.cancel(); }
}
export type PageResponse = { status: number; location?: string; type: string; html: string; bytes: number };
export type Observation = { version: "1.0"; requestedUrl: string; finalUrl: string; observedAt: string; status: number; https: boolean; redirects: number; bytes: number; html: boolean; titlePresent: boolean | null; viewportPresent: boolean | null };
export function requestPinned(url: URL, address: string, signal: AbortSignal): Promise<PageResponse> {
  if (!publicIp(address) || isIP(address) !== 4) return Promise.reject(new AnalysisError("DESTINATION"));
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request({
      protocol: url.protocol, hostname: address, port: url.protocol === "https:" ? 443 : 80,
      servername: isIP(url.hostname) ? undefined : url.hostname,
      path: url.pathname + url.search, method: "GET", agent: false, signal,
      maxHeaderSize: 16384,
      headers: { Host: url.host, "User-Agent": "ProspeoTechnicalCheck/1.0", Accept: "text/html", "Accept-Encoding": "identity", Connection: "close" },
    });
    const fail = (code: string) => { const error = new AnalysisError(code); request.destroy(error); reject(error); };
    const connecting = setTimeout(() => fail("CONNECT_TIMEOUT"), LIMITS.connectMs);
    request.once("socket", socket => {
      socket.once(url.protocol === "https:" ? "secureConnect" : "connect", () => {
        clearTimeout(connecting);
        if (socket.remoteAddress !== address || socket.remotePort !== (url.protocol === "https:" ? 443 : 80)) fail("DESTINATION");
      });
    });
    request.setTimeout(LIMITS.idleMs, () => fail("READ_TIMEOUT"));
    request.once("error", reject);
    request.once("close", () => clearTimeout(connecting));
    request.once("upgrade", (_res, socket) => { socket.destroy(); fail("PROTOCOL"); });
    request.once("response", res => {
      const status = res.statusCode ?? 0;
      const type = String(res.headers["content-type"] ?? "");
      const length = res.headers["content-length"];
      const encoding = res.headers["content-encoding"];
      if ((encoding && encoding !== "identity") || (length && (!/^\d+$/.test(length) || Number(length) > LIMITS.bytes))) { res.destroy(); fail("SIZE_OR_ENCODING"); return; }
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = res.headers.location;
        res.destroy(); resolve({ status, location, type, html: "", bytes: 0 }); return;
      }
      let bytes = 0; const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > LIMITS.bytes) { res.destroy(); fail("SIZE"); }
        else chunks.push(chunk);
      });
      res.once("error", reject);
      res.once("end", () => resolve({ status, type, html: Buffer.concat(chunks).toString("utf8"), bytes }));
    });
    request.end();
  });
}
export async function analyze(raw: unknown, dependencies = { resolve: resolvePublic, request: requestPinned }, signal = AbortSignal.timeout(LIMITS.totalMs)): Promise<Observation> {
  const first = parseTarget(raw); let url = first;
  let totalBytes = 0;
  for (let hop = 0; hop <= LIMITS.redirects; hop++) {
    signal.throwIfAborted();
    const addresses = await dependencies.resolve(url.hostname);
    // Also validate injected resolver results: no second DNS lookup is made by the transport.
    if (!addresses.length || !addresses.every(publicIp) || isIP(addresses[0]) !== 4) throw new AnalysisError("DESTINATION");
    signal.throwIfAborted();
    const page = await dependencies.request(url, addresses[0], signal);
    totalBytes += page.bytes;
    if (totalBytes > LIMITS.bytes) throw new AnalysisError("SIZE");
    if ([301, 302, 303, 307, 308].includes(page.status)) {
      if (!page.location || unsafeUrlCharacters.test(page.location) || hop === LIMITS.redirects || page.location.length > 2048) throw new AnalysisError("REDIRECT");
      url = parseTarget(new URL(page.location, url).href); continue;
    }
    const html = /^text\/html(?:;|$)/i.test(page.type) && page.status >= 200 && page.status < 300;
    // Static markup only; no scripts, subresources or DOM execution. These are hints, not an audit.
    const markup = page.html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
    return { version: "1.0", requestedUrl: first.href, finalUrl: url.href, observedAt: new Date().toISOString(), status: page.status, https: url.protocol === "https:", redirects: hop, bytes: totalBytes, html, titlePresent: html ? /<title\b[^>]*>\s*[^<\s][\s\S]*?<\/title\s*>/i.test(markup) : null, viewportPresent: html ? /<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>/i.test(markup) : null };
  }
  throw new AnalysisError("REDIRECT");
}
