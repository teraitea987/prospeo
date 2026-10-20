import { afterEach, expect, test, vi } from "vitest";
import { EventEmitter } from "node:events";
import http from "node:http";
import https from "node:https";
import { analyze, parseTarget, publicIp, requestPinned, resolvePublic, LIMITS } from "../../analyzer/core.ts";
import { Resolver } from "node:dns/promises";
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

test.each(["http://127.0.0.1", "http://2130706433", "http://0177.0.0.1", "http://0x7f000001", "http://127.1", "http://[::1]", "http://[::ffff:127.0.0.1]", "http://[2606:4700::1111]", "http://169.254.169.254", "http://168.63.129.16", "http://100.100.100.200", "http://10.0.0.1", "http://192.168.1.1", "http://172.17.0.1", "http://localhost", "http://metadata.internal", "http://example.com:8080", "https://example.com:80", "ftp://example.com", "https://u:p@example.com", "https://example.com/#x", "https://example.com\\@127.0.0.1", "https://%65xample.com", "https://example.com.", " https://example.com", "https://example.com/\nfoo"])("refuse la cible ambiguë/interne %s", url => expect(() => parseTarget(url)).toThrow());
test.each(["0.0.0.0", "127.1.2.3", "10.4.5.6", "100.64.0.1", "169.254.1.1", "172.31.255.255", "192.0.0.8", "192.0.2.1", "198.18.0.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "255.255.255.255", "::", "::1", "::ffff:8.8.8.8", "fc00::1", "fe80::1", "ff00::1", "2001:db8::1", "2001::1", "2002:0808:0808::", "3fff::1"])("refuse IP spéciale %s", ip => expect(publicIp(ip)).toBe(false));
test("accepte les destinations publiques canoniques", () => {
  expect(parseTarget("https://example.com:443/page?q=1").href).toBe("https://example.com/page?q=1");
  expect(publicIp("8.8.8.8")).toBe(true); expect(publicIp("2606:4700::1111")).toBe(true);
});
test("vérifie toutes les réponses DNS, y compris AAAA, sans ignorer SERVFAIL", async () => {
  vi.spyOn(Resolver.prototype, "resolve4").mockResolvedValue(["8.8.8.8"] as never);
  const v6 = vi.spyOn(Resolver.prototype, "resolve6").mockResolvedValue(["::1"] as never);
  await expect(resolvePublic("example.com")).rejects.toThrow("DESTINATION");
  v6.mockRejectedValue(Object.assign(new Error(), { code: "ESERVFAIL" }));
  await expect(resolvePublic("example.com")).rejects.toThrow("DNS");
  v6.mockRejectedValue(Object.assign(new Error(), { code: "ENODATA" }));
  await expect(resolvePublic("example.com")).resolves.toEqual(["8.8.8.8"]);
});
const page = { status: 200, type: "text/html", html: '<title>Atelier</title><meta name="viewport" content="width=device-width">', bytes: 100 };
test("redirections revérifiées, rebinding refusé et aucun second appel vers une IP interne", async () => {
  const resolve = vi.fn().mockResolvedValueOnce(["8.8.8.8"]).mockResolvedValueOnce(["127.0.0.1"]);
  const request = vi.fn().mockResolvedValue({ ...page, status: 302, location: "/suite" });
  await expect(analyze("https://example.com", { resolve, request })).rejects.toThrow("DESTINATION");
  expect(request).toHaveBeenCalledTimes(1);
  resolve.mockReset().mockResolvedValue(["8.8.8.8"]);
  request.mockResolvedValue({ ...page, status: 302, location: "http://169.254.169.254" });
  await expect(analyze("https://example.com", { resolve, request })).rejects.toThrow();
  expect(resolve).toHaveBeenCalledTimes(1);
});
test("borne redirections, budget total et annulation", async () => {
  const deps = { resolve: vi.fn().mockResolvedValue(["8.8.8.8"]), request: vi.fn().mockResolvedValue({ ...page, status: 302, location: "/suite", bytes: 0 }) };
  await expect(analyze("https://example.com", deps)).rejects.toThrow("REDIRECT"); expect(deps.request).toHaveBeenCalledTimes(4);
  deps.request.mockResolvedValue({ ...page, bytes: LIMITS.bytes + 1 });
  await expect(analyze("https://example.com", deps)).rejects.toThrow("SIZE");
  deps.resolve.mockClear(); await expect(analyze("https://example.com", deps, AbortSignal.abort())).rejects.toThrow(); expect(deps.resolve).not.toHaveBeenCalled();
});
test("extrait seulement des signaux statiques, sans score ni contenu tiers", async () => {
  const deps = { resolve: vi.fn().mockResolvedValue(["8.8.8.8"]), request: vi.fn().mockResolvedValue(page) };
  const result = await analyze("https://example.com", deps);
  expect(result).toMatchObject({ status: 200, https: true, titlePresent: true, viewportPresent: true, redirects: 0 }); expect(result).not.toHaveProperty("score"); expect(result).not.toHaveProperty("htmlContent");
  deps.request.mockResolvedValue({ ...page, status: 404 });
  expect(await analyze("https://example.com", deps)).toMatchObject({ html: false, titlePresent: null, viewportPresent: null });
});
// Exercise the production transport, replacing only the OS HTTP socket.
function fakeTransport(client: typeof http | typeof https = http) {
  const req = new EventEmitter() as EventEmitter & { destroy: ReturnType<typeof vi.fn>; setTimeout: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn> };
  req.destroy = vi.fn(e => { req.emit("error", e); req.emit("close"); }); req.setTimeout = vi.fn(); req.end = vi.fn();
  const call = vi.spyOn(client, "request").mockReturnValue(req as never);
  const response = (headers = {}, chunks: Buffer[] = []) => {
    const res = new EventEmitter() as EventEmitter & { headers: object; statusCode: number; destroy: ReturnType<typeof vi.fn> };
    res.headers = { "content-type": "text/html", ...headers }; res.statusCode = 200; res.destroy = vi.fn();
    req.emit("response", res); for (const chunk of chunks) res.emit("data", chunk); res.emit("end");
  };
  return { req, call, response };
}
test("connexion épinglée à l’IP, Host/SNI conservés et adresse effective vérifiée", async () => {
  const { req, call, response } = fakeTransport(https);
  const pending = requestPinned(new URL("https://example.com/page"), "8.8.8.8", AbortSignal.timeout(1000));
  expect(call.mock.calls[0][0]).toMatchObject({ hostname: "8.8.8.8", servername: "example.com", agent: false, headers: { Host: "example.com", "Accept-Encoding": "identity" } });
  const socket = Object.assign(new EventEmitter(), { remoteAddress: "8.8.8.8", remotePort: 443 }); req.emit("socket", socket); socket.emit("secureConnect");
  response({}, [Buffer.from("<title>x</title>")]); await expect(pending).resolves.toMatchObject({ status: 200 });
});
test("adresse distante inattendue refusée avant exploitation de la réponse", async () => {
  const { req } = fakeTransport(); const pending = requestPinned(new URL("http://example.com"), "8.8.8.8", AbortSignal.timeout(1000));
  const socket = Object.assign(new EventEmitter(), { remoteAddress: "127.0.0.1", remotePort: 80 }); req.emit("socket", socket); socket.emit("connect");
  await expect(pending).rejects.toThrow("DESTINATION");
});
test.each([{ "content-encoding": "gzip" }, { "content-length": "512001" }, { "content-encoding": "br" }])("refuse compression/bombe et longueur excessive %j", async headers => {
  const { response } = fakeTransport(); const pending = requestPinned(new URL("http://example.com"), "8.8.8.8", AbortSignal.timeout(1000)); response(headers);
  await expect(pending).rejects.toThrow("SIZE_OR_ENCODING");
});
test("borne un flux chunked sans longueur déclarée et le délai de connexion", async () => {
  vi.useFakeTimers(); const { response } = fakeTransport();
  const pending = requestPinned(new URL("http://example.com"), "8.8.8.8", new AbortController().signal); response({}, [Buffer.alloc(LIMITS.bytes + 1)]); await expect(pending).rejects.toThrow("SIZE");
  const timed = requestPinned(new URL("http://example.com"), "8.8.8.8", new AbortController().signal);
  const asserted = expect(timed).rejects.toThrow("CONNECT_TIMEOUT"); await vi.advanceTimersByTimeAsync(LIMITS.connectMs); await asserted;
});
test("délai de lecture et annulation transmis au transport", async () => {
  const { req } = fakeTransport(); const pending = requestPinned(new URL("http://example.com"), "8.8.8.8", new AbortController().signal);
  const idle = req.setTimeout.mock.calls[0]; expect(idle[0]).toBe(3000); idle[1](); await expect(pending).rejects.toThrow("READ_TIMEOUT");
  const deps = { resolve: vi.fn().mockResolvedValue(["8.8.8.8"]), request: vi.fn((_url, _ip, abort: AbortSignal) => new Promise<never>((_, reject) => { abort.addEventListener("abort", () => reject(new Error("ABORTED")), { once: true }); })) };
  const controller = new AbortController(); const overall = analyze("https://example.com", deps, controller.signal); const asserted = expect(overall).rejects.toThrow("ABORTED");
  await Promise.resolve(); controller.abort(); await asserted;
});
