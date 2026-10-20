import { checkRealAccess } from "../../../server/auth/real-search-access";
import { suggestPostalCodes } from "../../../server/reference/postal-reference";
export function GET(request: Request) {
  const denied = checkRealAccess(request); if (denied) return denied;
  const params = new URL(request.url).searchParams;
  if (request.url.length > 512 || [...params.keys()].some(k => k !== "q") || params.getAll("q").length !== 1 || (params.get("q") ?? "").length > 80) return Response.json({ error: "Saisie invalide." }, { status: 400 });
  return Response.json(suggestPostalCodes(params.get("q") ?? ""), { headers: { "Cache-Control": "no-store" } });
}
