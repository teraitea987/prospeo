import { filtersSchema } from "../../../modules/search/filters";
import { searchDemo } from "../../../modules/search/demo-search";
export function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.url.length > 2048) return Response.json({ error: "Recherche trop longue." }, { status: 400, headers });
  const params = new URL(request.url).searchParams;
  const keys = [...params.keys()];
  if (new Set(keys).size !== keys.length) return Response.json({ error: "Paramètres répétés interdits." }, { status: 400, headers });
  const result = filtersSchema.safeParse(Object.fromEntries(params));
  if (!result.success) return Response.json({ error: "Vérifiez les filtres de recherche." }, { status: 400, headers });
  // Route de démonstration publique en lecture seule : aucun contexte propriétaire,
  // aucun accès DB ou fournisseur. Ne pas la raccorder aux données privées sans identité.
  return Response.json(searchDemo(result.data), { headers });
}
