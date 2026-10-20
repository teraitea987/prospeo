import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { companyRepository } from "../../src/server/db/company-repository";

vi.mock("server-only", () => ({}));

// Fixtures uniques par exécution : aucune suppression de base existante.
const url = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.pathname !== "/prospeo") {
  throw new Error("Tests réservés à PostgreSQL local prospeo.");
}
const fixturePrefix = `test_${randomUUID().replaceAll("-", "")}`;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString(), max: 2 }) });
const a = randomUUID(); const b = randomUUID();
const repoA = companyRepository(db, { workspaceId: a });
const repoB = companyRepository(db, { workspaceId: b });
let companyA: string;
let companyB: string;
beforeAll(async () => {
  // Les fixtures portent des UUID uniques ; aucun reset/truncate de données existantes.
  await db.workspace.createMany({ data: [{ id: a, name: fixturePrefix + "_a" }, { id: b, name: fixturePrefix + "_b" }] });
  companyA = (await repoA.create({ name: "Entreprise A", siren: "123456789" })).id;
  companyB = (await repoB.create({ name: "Entreprise B", siren: "123456789" })).id;
});
afterAll(async () => {
  // Nettoyage strictement limité aux deux workspaces de cette exécution.
  await db.searchResult.deleteMany({ where: { workspaceId: { in: [a,b] } } });
  await db.observation.deleteMany({ where: { workspaceId: { in: [a,b] } } });
  await db.prospect.deleteMany({ where: { workspaceId: { in: [a,b] } } });
  await db.search.deleteMany({ where: { workspaceId: { in: [a,b] } } });
  await db.company.deleteMany({ where: { workspaceId: { in: [a,b] } } });
  await db.workspace.deleteMany({ where: { id: { in: [a,b] } } });
  await db.$disconnect();
});
it("isole les lectures et autorise le même SIREN chez deux propriétaires", async () => {
  expect(await repoA.find(companyB)).toBeNull();
  expect((await repoA.list()).map(c => c.id)).toEqual([companyA]);
  expect(await repoB.find(companyA)).toBeNull();
});
it("refuse de surcharger le propriétaire et valide les entrées", () => {
  expect(() => repoA.create({ name: "Intrus", workspaceId: b })).toThrow();
  expect(() => repoA.create({ name: "", siren: "invalide" })).toThrow();
});
it("conserve la source, les dates, la confiance et le caractère hypothétique", async () => {
  const collectedAt = new Date("2026-10-20T10:00:00Z");
  await repoA.observe(companyA, { field: "website", value: "inconnu", source: "fixture", sourceUrl: "https://example.com", collectedAt, kind: "HYPOTHESIS", confidence: "LOW" });
  const [observation] = await repoA.observations(companyA);
  expect(observation).toMatchObject({ source: "fixture", kind: "HYPOTHESIS", confidence: "LOW", collectedAt, verifiedAt: null });
  expect(await repoB.observations(companyA)).toEqual([]);
});
it("refuse les observations liées à une entreprise d’un autre workspace", async () => {
  await expect(repoA.observe(companyB, { field: "website", value: "test", source: "fixture", sourceUrl: "https://example.com", collectedAt: new Date(), kind: "FACT", confidence: "HIGH" })).rejects.toMatchObject({ code: "P2003" });
});
it("la base refuse un résultat et un prospect traversant les propriétaires", async () => {
  const search = await db.search.create({ data: { workspaceId: a, query: "test" } });
  await expect(db.searchResult.create({ data: { workspaceId: a, searchId: search.id, companyId: companyB } })).rejects.toMatchObject({ code: "P2003" });
  await expect(db.prospect.create({ data: { workspaceId: a, companyId: companyB } })).rejects.toMatchObject({ code: "P2003" });
  await db.searchResult.create({ data: { workspaceId: a, searchId: search.id, companyId: companyA } });
  await db.prospect.create({ data: { workspaceId: a, companyId: companyA } });
});
it("la base refuse les doublons dans un workspace", async () => {
  await expect(repoA.create({ name: "Doublon", siren: "123456789" })).rejects.toMatchObject({ code: "P2002" });
});

it("la base impose aussi les formats et l’ordre des dates", async () => {
  await expect(db.company.create({ data: { workspaceId: a, name: "Invalide", siren: "abc" } })).rejects.toThrow();
  await expect(db.observation.create({ data: { workspaceId: a, companyId: companyA,
    field: "website", value: "test", source: "fixture", sourceUrl: "https://example.com",
    kind: "FACT", confidence: "HIGH", collectedAt: new Date("2026-10-20"), verifiedAt: new Date("2026-10-19"),
  } })).rejects.toThrow();
});
