import { checkRealAccess } from "../../../server/auth/real-search-access";
import { realFiltersSchema } from "../../../modules/search/real-filters";
import { ProviderError, searchCompanies } from "../../../server/providers/company-search";
export async function GET(request: Request) {
  const denied = checkRealAccess(request); if (denied) return denied;
  const headers = { "Cache-Control": "no-store" };
  const params = new URL(request.url).searchParams;
  if (request.url.length > 2048 || [...params.keys()].some(k => params.getAll(k).length !== 1)) return Response.json({ error: "Paramètres invalides." }, { status: 400, headers });
  const input = realFiltersSchema.safeParse(Object.fromEntries(params));
  if (!input.success) return Response.json({ error: "Vérifiez les critères de recherche." }, { status: 400, headers });
  try { return Response.json(await searchCompanies(input.data), { headers }); }
  catch (error) {
    if (error instanceof ProviderError && error.code === "RATE_LIMIT") return Response.json({ error: "Quota atteint. Réessayez après le délai indiqué." }, { status: 429, headers: { ...headers, "Retry-After": String(error.retryAfter) } });
    return Response.json({ error: "La source est temporairement indisponible." }, { status: 502, headers });
  }
}
