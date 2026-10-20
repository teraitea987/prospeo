import { timingSafeEqual } from "node:crypto";
export function checkRealAccess(request: Request, env: Record<string, string | undefined> = process.env): Response | null {
  const headers = { "Cache-Control": "no-store" };
  if (env.NODE_ENV !== "development" || env.REAL_SEARCH_ENABLED !== "true" || !env.REAL_SEARCH_PASSWORD || env.REAL_SEARCH_PASSWORD.length < 32) {
    return Response.json({ error: "Recherche réelle désactivée." }, { status: 404, headers });
  }
  const raw = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`prospeo:${env.REAL_SEARCH_PASSWORD}`);
  const supplied = raw.startsWith("Basic ") && raw.length < 512 ? Buffer.from(raw.slice(6), "base64") : Buffer.alloc(0);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return Response.json({ error: "Authentification locale requise." }, { status: 401, headers: { ...headers, "WWW-Authenticate": 'Basic realm="Prospeo local", charset="UTF-8"' } });
  }
  return null;
}
