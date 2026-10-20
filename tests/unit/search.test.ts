import { expect, it } from "vitest";
import { filtersSchema } from "../../src/modules/search/filters";
import { searchDemo } from "../../src/modules/search/demo-search";
import { GET } from "../../src/app/api/recherche/route";
it("filtre sans distinguer accents/casse et combine les critères", () => {
  const result = searchDemo(filtersSchema.parse({ q: "DEMO", city: "LYON", sector: "Artisanat", size: "1–9 salariés" }));
  expect(result.total).toBe(1);
  expect(result.items[0].name).toBe("Atelier Démo Aurore");
});
it("pagine de façon stable, borne la page et gère les résultats vides", () => {
  const first = searchDemo(filtersSchema.parse({}));
  const last = searchDemo(filtersSchema.parse({ page: "999" }));
  expect(first.total).toBe(12); expect(first.items).toHaveLength(6);
  expect(last.page).toBe(2);
  expect(first.items.map(c => c.id).some(id => last.items.some(c => c.id === id))).toBe(false);
  expect(searchDemo(filtersSchema.parse({ city: "inexistante" }))).toMatchObject({ items: [], total: 0, page: 1 });
});
it("refuse les filtres hors contrat côté serveur", async () => {
  for (const query of ["page=0", "page=-1", "page=1.5", "page=1000", "page=1&page=2", "sector=inconnu", "workspaceId=intrus", `q=${"a".repeat(101)}`, `q=${"a".repeat(2100)}`]) {
    expect(GET(new Request(`http://localhost/api/recherche?${query}`)).status).toBe(400);
  }
});
it("renvoie uniquement les fixtures sans cache et sans interpréter du contenu hostile", async () => {
  const response = GET(new Request("http://localhost/api/recherche?q=%3Cscript%3E"));
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toMatchObject({ demo: true, total: 0 });
});
