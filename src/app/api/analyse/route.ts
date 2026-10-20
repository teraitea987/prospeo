import { checkRealAccess } from "../../../server/auth/real-search-access";
import { runAnalysis, RunnerError } from "../../../server/analysis/runner";
import { analysisInput } from "../../../modules/analysis/contract";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const denied = checkRealAccess(request); if (denied) return denied;
  const headers = { "Cache-Control": "no-store" };
  // Next may normalize request.url to localhost internally. Validate the browser Host explicitly.
  const host = request.headers.get("host") ?? "";
  const origin = `http://${host}`;
  if (!/^(127\.0\.0\.1|localhost):[0-9]{1,5}$/.test(host) || request.headers.get("origin") !== origin || (request.headers.get("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")) return Response.json({ error: "Origine refusée." }, { status: 403, headers });
  if (request.headers.get("content-type") !== "application/json") return Response.json({ error: "Format refusé." }, { status: 415, headers });
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error();
    const decoder = new TextDecoder(); let body = ""; let bytes = 0;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; void reader.cancel(); }, 3000);
    try {
      for (;;) {
        const chunk = await reader.read();
        if (timedOut) throw new Error();
        if (chunk.done) break;
        bytes += chunk.value.length; if (bytes > 4096) throw new Error();
        body += decoder.decode(chunk.value, { stream: true });
      }
    } finally { clearTimeout(timer); await reader.cancel(); }
    const input = analysisInput.parse(JSON.parse(body + decoder.decode()));
    try { return Response.json({ observation: await runAnalysis(input.url) }, { headers }); }
    catch (error) {
      if (error instanceof RunnerError && error.code === "DISABLED") return Response.json({ error: "Analyse désactivée. Préparer l’analyseur isolé avec la commande documentée." }, { status: 503, headers });
      if (error instanceof RunnerError && error.code === "QUOTA") return Response.json({ error: "Une analyse est en cours ou le quota est atteint. Réessayez dans une minute." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
      return Response.json({ error: "Analyse impossible : destination refusée, site indisponible ou limite technique atteinte. Cela ne prouve pas l’absence de site." }, { status: 422, headers });
    }
  } catch { return Response.json({ error: "Paramètres invalides." }, { status: 400, headers }); }
}
