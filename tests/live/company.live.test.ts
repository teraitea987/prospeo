import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createCompanyProvider } from "../../src/server/providers/company-search";
import { realFiltersSchema } from "../../src/modules/search/real-filters";
it("contrat réel sur une page de sociétés, sans stockage ni journaux de données", async () => {
  const result = await createCompanyProvider()(realFiltersSchema.parse({ q: "menuiserie" }));
  expect(result.source).toContain("DINUM");
  expect(result.total).toBeGreaterThan(0);
  expect(result.items.length).toBeGreaterThan(0);
  expect(result.items.length).toBeLessThanOrEqual(10);
  for (const item of result.items) expect(item.siren).toMatch(/^\d{9}$/);
});
it("accepte un code postal seul sans nom d’entreprise", async () => {
  const result = await createCompanyProvider()(realFiltersSchema.parse({ postal: "69003" }));
  expect(result.total).toBeGreaterThan(0);
  expect(result.items.length).toBeGreaterThan(0);
});
it("retourne des établissements locaux distincts pour Lyon et Bastia", async () => {
  const search = createCompanyProvider();
  const lyon = await search(realFiltersSchema.parse({ postal: "69003" }));
  await new Promise(resolve => setTimeout(resolve, 1100));
  const bastia = await search(realFiltersSchema.parse({ postal: "20600" }));
  expect(lyon.items.length).toBeGreaterThan(0); expect(bastia.items.length).toBeGreaterThan(0);
  expect(lyon.items.every(item => item.postal === "69003" && !!item.siret)).toBe(true);
  expect(bastia.items.every(item => item.postal === "20600" && !!item.siret)).toBe(true);
  const shared = lyon.items.filter(item => bastia.items.some(other => other.siren === item.siren));
  // Les entreprises multi-sites peuvent être communes, sans obligation de recouvrement.
  for (const item of shared) expect(bastia.items.find(other => other.siren === item.siren)?.siret).not.toBe(item.siret);
});
