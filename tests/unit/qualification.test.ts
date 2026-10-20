import { expect, it } from "vitest";
import { qualify } from "../../src/modules/qualification/rules";
const now = new Date("2026-10-20T12:00:00Z");
const evidence = { sourceUrl: "https://example.com/recherche", observedOn: "2026-10-20", websiteUrl: "https://example.com", note: "Observation manuelle décrite." };
it("ne transforme jamais un site inconnu en absence ou en score zéro", () => {
  expect(qualify({ status: "UNKNOWN" }, now)).toMatchObject({ score: null, state: "UNKNOWN", confidence: "LOW", version: "1.0" });
});
it("applique les règles approuvées et conserve source/date avec un score explicable", () => {
  for (const [status, score] of [["NOT_FOUND", 80], ["REFRESH_NEEDED", 40], ["NO_NEED", 0]] as const) {
    const result = qualify({ ...evidence, status, websiteUrl: status === "NOT_FOUND" ? "" : evidence.websiteUrl }, now);
    expect(result).toMatchObject({ score, sourceUrl: evidence.sourceUrl, observedOn: evidence.observedOn, kind: "COMMERCIAL_HYPOTHESIS", confidence: "MEDIUM" });
    expect(result.score).toBeGreaterThanOrEqual(0); expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanation.length).toBeGreaterThan(20);
  }
});
it("autorise exactement 90 jours mais retire le score après 90 jours", () => {
  const old = { ...evidence, status: "REFRESH_NEEDED", observedOn: "2026-07-22" };
  expect(qualify(old, now).score).toBe(40);
  expect(qualify({ ...old, observedOn: "2026-07-21" }, now)).toMatchObject({ score: null, state: "OUTDATED", confidence: "LOW" });
});
it("refuse dates futures/impossibles, sources dangereuses et absence contradictoire", () => {
  for (const fields of [{ observedOn: "2026-10-21" }, { observedOn: "2026-02-31" }, { sourceUrl: "javascript:alert(1)" }, { sourceUrl: "https://user:secret@example.com" }, { note: "court" }, { websiteUrl: "" }]) {
    expect(() => qualify({ ...evidence, status: "REFRESH_NEEDED", ...fields }, now)).toThrow();
  }
  expect(() => qualify({ ...evidence, status: "NOT_FOUND" }, now)).toThrow();
  expect(() => qualify({ status: "UNKNOWN", score: 80 }, now)).toThrow();
});
it("reste déterministe pour des observations identiques", () => {
  const input = { ...evidence, status: "NO_NEED" };
  expect(qualify(input, now)).toEqual(qualify(input, now));
});
