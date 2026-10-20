import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createCompanyProvider } from "../../src/server/providers/company-search";
import { checkRealAccess } from "../../src/server/auth/real-search-access";
import { realFiltersSchema } from "../../src/modules/search/real-filters";
const filters = realFiltersSchema.parse({ q: "atelier" });
const company = { categorie_entreprise: "PME", tranche_effectif_salarie: "01", nombre_etablissements_ouverts: 1, siren: "123456789", nom_complet: "Fixture SAS", statut_diffusion: "O", nature_juridique: "5710", siege: { libelle_commune: "LYON" }, dirigeants: [{ nom: "À ne pas exposer" }] };
const payload = { results: [company, { ...company, siren: "234567891", nature_juridique: "1000" }, { ...company, siren: "345678912", statut_diffusion: "P" }], page: 1, total_pages: 1, total_results: 3 };
const response = (data: unknown) => Response.json(data);
it("refuse la production, l’absence d’opt-in et les mots de passe invalides", () => {
  const env = { NODE_ENV: "development", REAL_SEARCH_ENABLED: "true", REAL_SEARCH_PASSWORD: "x".repeat(40) };
  const auth = `Basic ${Buffer.from(`prospeo:${env.REAL_SEARCH_PASSWORD}`).toString("base64")}`;
  const request = new Request("http://localhost", { headers: { authorization: auth } });
  expect(checkRealAccess(request, env)).toBeNull();
  expect(checkRealAccess(request, { ...env, NODE_ENV: "production" })?.status).toBe(404);
  expect(checkRealAccess(request, { ...env, REAL_SEARCH_ENABLED: "false" })?.status).toBe(404);
  expect(checkRealAccess(new Request("http://localhost"), env)?.status).toBe(401);
  expect(checkRealAccess(request, { ...env, REAL_SEARCH_PASSWORD: "y".repeat(40) })?.status).toBe(401);
});
it("normalise, minimise et exclut les personnes physiques/non diffusibles", async () => {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(payload));
  const result = await createCompanyProvider(fetcher)(filters);
  expect(result.items).toHaveLength(1);
  expect(JSON.stringify(result)).not.toContain("dirigeants");
  expect(result).toMatchObject({ excluded: 2, confidence: "MEDIUM", verifiedAt: null });
  expect(result.collectedAt).toMatch(/^\d{4}-/);
  const [url, options] = fetcher.mock.calls[0];
  expect(String(url)).toContain("https://recherche-entreprises.api.gouv.fr/search?");
  expect(options?.redirect).toBe("error"); expect(options?.signal).toBeInstanceOf(AbortSignal);
});
it("respecte Retry-After sans relance automatique", async () => {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 429, headers: { "Retry-After": "120" } }));
  const search = createCompanyProvider(fetcher, () => 100000);
  await expect(search(filters)).rejects.toMatchObject({ code: "RATE_LIMIT", retryAfter: 120 });
  await expect(search(filters)).rejects.toMatchObject({ code: "RATE_LIMIT" });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("refuse les réponses invalides, trop grandes et les erreurs fournisseur", async () => {
  for (const res of [response({}), new Response("oops", { status: 503 }), response({ ...payload, page: 2 }), response({ results: Array(11).fill(company), page: 1, total_pages: 1, total_results: 11 }), new Response("x".repeat(512001), { headers: { "Content-Type": "application/json" } })]) {
    await expect(createCompanyProvider(vi.fn<typeof fetch>().mockResolvedValue(res))(filters)).rejects.toBeInstanceOf(Error);
  }
});
it("interrompt les appels lents et borne la concurrence", async () => {
  vi.useFakeTimers();
  try {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_url, options) => new Promise((_resolve, reject) => options?.signal?.addEventListener("abort", () => reject(new Error("aborted")))));
    const search = createCompanyProvider(fetcher);
    const pending = expect(search(filters)).rejects.toMatchObject({ code: "UNAVAILABLE" });
    await expect(search(filters)).rejects.toMatchObject({ code: "RATE_LIMIT" });
    await vi.advanceTimersByTimeAsync(8001); await pending;
  } finally { vi.useRealTimers(); }
});
it("borne le contrat et interdit SIREN/SIRET qui ignorent les filtres fournisseur", () => {
  for (const value of [{ q: "1" }, { q: "123456789" }, { q: "atelier", postal: "75" }, { q: "atelier", page: "100" }, { q: "atelier", workspaceId: "intrus" }]) expect(realFiltersSchema.safeParse(value).success).toBe(false);
});
it("borne les appels à vingt par minute même pour des recherches successives", async () => {
  let clock = 100000;
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => response(payload));
  const search = createCompanyProvider(fetcher, () => clock);
  for (let i = 0; i < 20; i++) { await search(filters); clock += 1001; }
  await expect(search(filters)).rejects.toMatchObject({ code: "RATE_LIMIT" });
  expect(fetcher).toHaveBeenCalledTimes(20);
});
it("accepte un code postal ou un code NAF seul et refuse les codes inconnus", async () => {
  expect(realFiltersSchema.safeParse({ postal: "69003" }).success).toBe(true);
  expect(realFiltersSchema.safeParse({ naf: "62.01Z" }).success).toBe(true);
  expect(realFiltersSchema.safeParse({}).success).toBe(false);
  expect(realFiltersSchema.safeParse({ postal: "99999" }).success).toBe(false);
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(payload));
  await createCompanyProvider(fetcher)(realFiltersSchema.parse({ postal: "69003" }));
  const url = new URL(String(fetcher.mock.calls[0][0]));
  expect(url.searchParams.has("q")).toBe(false);
  expect(url.searchParams.get("code_postal")).toBe("69003");
});
it("affiche l’établissement du code demandé même si la société et son siège sont identiques", async () => {
  const row = { ...company, siege: { libelle_commune: "PARIS", code_postal: "75015", siret: "12345678900001", etat_administratif: "A" }, matching_etablissements: [
    { libelle_commune: "LYON", code_postal: "69003", siret: "12345678900002", etat_administratif: "A" },
    { libelle_commune: "BASTIA", code_postal: "20600", siret: "12345678900003", etat_administratif: "A" },
  ] };
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => response({ ...payload, results: [row] }));
  const lyon = await createCompanyProvider(fetcher)(realFiltersSchema.parse({ postal: "69003" }));
  const bastia = await createCompanyProvider(fetcher)(realFiltersSchema.parse({ postal: "20600" }));
  expect(lyon.items[0]).toMatchObject({ city: "LYON", postal: "69003", siret: "12345678900002", locationKind: "ESTABLISHMENT", headquartersCity: "PARIS" });
  expect(bastia.items[0]).toMatchObject({ city: "BASTIA", postal: "20600", siret: "12345678900003" });
  expect(lyon.items[0].siren).toBe(bastia.items[0].siren);
});
it("ne montre pas une société sans preuve d’établissement actif dans le code demandé", async () => {
  for (const establishments of [[], [{ code_postal: "75015", siret: "12345678900001", etat_administratif: "A" }], [{ code_postal: "69003", siret: "12345678900001", etat_administratif: "F" }]]) {
    const row = { ...company, matching_etablissements: establishments };
    const result = await createCompanyProvider(vi.fn<typeof fetch>().mockResolvedValue(response({ ...payload, results: [row] })))(realFiltersSchema.parse({ postal: "69003" }));
    expect(result.items).toEqual([]); expect(result.excluded).toBe(1);
  }
});
it("exclut les grands groupes, effectifs trop grands/inconnus et réseaux multi-sites", async () => {
  const bad = [
    { ...company, categorie_entreprise: "GE" }, { ...company, categorie_entreprise: "ETI" },
    { ...company, tranche_effectif_salarie: "11" }, { ...company, tranche_effectif_salarie: null },
    { ...company, nombre_etablissements_ouverts: 50 }, { ...company, nombre_etablissements_ouverts: null },
  ];
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ ...payload, results: bad }));
  const result = await createCompanyProvider(fetcher)(filters);
  expect(result.items).toHaveLength(0); expect(result.excluded).toBe(6);
  const url = new URL(String(fetcher.mock.calls[0][0]));
  expect(url.searchParams.get("categorie_entreprise")).toBe("PME");
  expect(url.searchParams.get("tranche_effectif_salarie")).toBe("00,01,02,03");
});
it("met les activités artisanales déclarées avant les autres petites sociétés", async () => {
  const artisan = { ...company, siren: "456789123", siege: { libelle_commune: "LYON", activite_principale_registre_metier: "4332AA" } };
  const result = await createCompanyProvider(vi.fn<typeof fetch>().mockResolvedValue(response({ ...payload, results: [company, artisan] })))(filters);
  expect(result.items[0]).toMatchObject({ siren: "456789123", artisanActivity: true, employeeBand: "1 à 2 salariés" });
});
it("présélectionne les métiers de proximité, avec choix toutes petites sociétés et NAF précis", async () => {
  for (const [input, expected] of [[{ q: "atelier" }, "43.22A"], [{ q: "atelier", target: "small" }, null], [{ q: "atelier", naf: "62.01Z" }, "62.01Z"]] as const) {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(payload));
    await createCompanyProvider(fetcher)(realFiltersSchema.parse(input));
    const actual = new URL(String(fetcher.mock.calls[0][0])).searchParams.get("activite_principale");
    if (expected === null) expect(actual).toBeNull(); else expect(actual).toContain(expected);
  }
});
