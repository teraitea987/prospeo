import { expect, test, request as apiRequest } from "@playwright/test";
test("accès réel protégé et affichage minimisé de la provenance", async ({ page, request }, testInfo) => {
  const anonymous = await apiRequest.newContext({ httpCredentials: { username: "incorrect", password: "incorrect" } });
  expect((await anonymous.get("http://127.0.0.1:3101/api/entreprises?q=atelier")).status()).toBe(401);
  expect((await anonymous.get("http://127.0.0.1:3101/recherche/reelle")).status()).toBe(401);
  expect((await anonymous.get("http://127.0.0.1:3101/api/codes-postaux?q=690")).status()).toBe(401);
  await anonymous.dispose();
  expect((await request.get("/api/entreprises?q=atelier&workspaceId=intrus")).status()).toBe(400);
  await page.route("**/api/entreprises?**", route => route.fulfill({ json: {
    items: [{ siren: "123456789", name: "Fixture SAS", employeeBand: "1 à 2 salariés", employeeYear: "2024", openEstablishments: 1, artisanActivity: true, city: "LYON", naf: "62.01Z", sourceUrl: "https://annuaire-entreprises.data.gouv.fr/entreprise/123456789" }],
    page: 1, pages: 1, total: 1, excluded: 0, source: "DINUM", collectedAt: "2026-10-20T10:00:00Z", confidence: "MEDIUM", verifiedAt: null,
  } }));
  await page.goto("/recherche/reelle");
  await page.getByLabel("Nom ou mots-clés").fill("fixture");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fixture SAS" })).toBeVisible();
  await expect(page.getByText(/Confiance moyenne/)).toBeVisible();
  await expect(page.getByLabel("Métiers ciblés")).toHaveValue("local");
  await expect(page.getByText("Activité artisanale déclarée", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Consulter la source officielle" })).toHaveAttribute("rel", "noopener noreferrer");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("reelle.png"), fullPage: true });
});
test("focus des trois champs, filtres facultatifs et autocomplétion au clavier", async ({ page, request }) => {
  await page.route("**/api/entreprises?**", route => route.fulfill({ json: { items: [], page: 1, pages: 0, total: 0, excluded: 0, source: "DINUM", collectedAt: "2026-10-20T10:00:00Z", confidence: "MEDIUM", verifiedAt: null } }));
  await page.goto("/recherche/reelle");
  for (const [label, value] of [["Nom ou mots-clés", "atelier"], ["Code NAF", "62.01Z"]]) {
    const input = page.getByLabel(label, { exact: false });
    await input.click(); await expect(input).toBeFocused();
    await input.pressSequentially(value); await expect(input).toHaveValue(value);
    await input.fill("");
  }
  const postal = page.getByRole("combobox", { name: "Code postal (facultatif)" });
  await postal.click(); await expect(postal).toBeFocused();
  await postal.pressSequentially("690");
  await expect(page.getByRole("option").filter({ hasText: "69003" })).toBeVisible();
  await postal.press("ArrowDown"); await postal.press("Enter");
  await expect(postal).toHaveValue(/^690\d{2}$/); await expect(postal).toBeFocused();
  const waiting = page.waitForRequest(r => r.url().includes("/api/entreprises?"));
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  const sent = new URL((await waiting).url());
  expect(sent.searchParams.get("q")).toBe("");
  expect(sent.searchParams.get("naf")).toBe("");
  await expect(page.getByText(/Aucune société éligible/)).toBeVisible();
  await postal.fill("Lyon");
  await page.getByRole("option").filter({ hasText: "69003" }).click();
  await expect(postal).toHaveValue("69003"); await expect(postal).toBeFocused();
  expect((await request.get("/api/entreprises?postal=99999")).status()).toBe(400);
  expect((await request.get("/api/entreprises")).status()).toBe(400);
  expect((await request.get("/api/codes-postaux?q=690")).status()).toBe(200);
  await postal.fill("");
  await page.getByLabel("Code NAF", { exact: false }).fill("62.01Z");
  const nafOnly = page.waitForRequest(r => r.url().includes("/api/entreprises?"));
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  expect(new URL((await nafOnly).url()).searchParams.get("naf")).toBe("62.01Z");
});
test("changer de code affiche l’établissement local, pas le siège parisien", async ({ page }) => {
  await page.route("**/api/entreprises?**", route => {
    const postal = new URL(route.request().url()).searchParams.get("postal");
    return route.fulfill({ json: { items: [{ siren: "123456789", name: "Même société de test", city: postal === "69003" ? "LYON" : "BASTIA", postal, siret: postal === "69003" ? "12345678900002" : "12345678900003", locationKind: "ESTABLISHMENT", headquartersCity: "PARIS", naf: "62.01Z", sourceUrl: "https://annuaire-entreprises.data.gouv.fr/entreprise/123456789" }], page: 1, pages: 1, total: 1, excluded: 0, source: "DINUM", collectedAt: "2026-10-20T10:00:00Z", confidence: "MEDIUM", verifiedAt: null } });
  });
  await page.goto("/recherche/reelle");
  const postal = page.getByRole("combobox", { name: "Code postal (facultatif)" });
  for (const [code, city, siret] of [["69003", "LYON", "12345678900002"], ["20600", "BASTIA", "12345678900003"]]) {
    await postal.fill(code);
    await page.getByRole("button", { name: "Rechercher", exact: true }).click();
    await expect(page.getByText(`Établissement correspondant : ${code} ${city}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`SIRET ${siret}`, { exact: true })).toBeVisible();
    await expect(page.getByText("Siège de la société : PARIS")).toBeVisible();
  }
});
test("qualification inconnue puis constat manuel sourcé, sans visite de site", async ({ page }) => {
  let siteVisits = 0;
  await page.route("https://example.com/**", route => { siteVisits++; return route.abort(); });
  await page.route("**/api/entreprises?**", route => route.fulfill({ json: {
    items: [{ siren: "123456789", name: "Fixture Qualification", city: "LYON", naf: "43.22A", sourceUrl: "https://annuaire-entreprises.data.gouv.fr/entreprise/123456789" }], page: 1, pages: 1, total: 1, excluded: 0, source: "DINUM", collectedAt: "2026-10-20T10:00:00Z", confidence: "MEDIUM", verifiedAt: null,
  } }));
  await page.goto("/recherche/reelle");
  await page.getByLabel("Nom ou mots-clés").fill("fixture");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  const panel = page.getByRole("region", { name: "Qualification de Fixture Qualification" });
  await expect(panel.getByText("Opportunité : Inconnue", { exact: true })).toBeVisible();
  await panel.getByText("Qualifier manuellement", { exact: true }).click();
  await panel.getByLabel("Constat", { exact: true }).selectOption("NOT_FOUND");
  await panel.getByLabel("Source du constat (URL)").fill("https://example.com/recherche");
  const today = new Date().toISOString().slice(0, 10);
  await panel.getByLabel("Date du constat").fill(today);
  await panel.getByRole("button", { name: "Évaluer le constat" }).click();
  await expect(panel.getByText("Opportunité : 80/100", { exact: true })).toBeVisible();
  await expect(panel.getByText(/cela ne prouve pas l’absence/)).toBeVisible();
  await panel.getByLabel("Constat", { exact: true }).selectOption("NO_NEED");
  await panel.getByLabel("Site de l’entreprise").fill("https://example.com");
  await panel.getByLabel("Détail du constat").fill("Aucun besoin identifié lors de mon examen.");
  await panel.getByRole("button", { name: "Évaluer le constat" }).click();
  await expect(panel.getByText("Opportunité : 0/100", { exact: true })).toBeVisible();
  await panel.getByLabel("Date du constat").fill("2000-01-01");
  await panel.getByRole("button", { name: "Évaluer le constat" }).click();
  await expect(panel.getByText("Opportunité : Inconnue", { exact: true })).toBeVisible();
  await expect(panel.getByText(/Constat de plus de 90 jours/)).toBeVisible();
  expect(siteVisits).toBe(0);
  await page.reload();
  await expect(page.getByText("Fixture Qualification", { exact: true })).toHaveCount(0);
});
