import { expect, it } from "vitest";
import { isKnownPostalCode, suggestPostalCodes } from "../../src/server/reference/postal-reference";
it("propose des codes par préfixe ou commune, sans exiger un code entier", () => {
  expect(suggestPostalCodes("690").some(r => r.code === "69003")).toBe(true);
  expect(suggestPostalCodes("lyon").some(r => r.code.startsWith("69"))).toBe(true);
  expect(suggestPostalCodes("saint").length).toBeLessThanOrEqual(8);
  expect(suggestPostalCodes("9")).toEqual([]);
  expect(suggestPostalCodes("<script>")).toEqual([]);
});
it("valide les codes répertoriés et refuse les codes malformés ou inconnus", () => {
  expect(isKnownPostalCode("69003")).toBe(true);
  expect(isKnownPostalCode("99999")).toBe(false);
  expect(isKnownPostalCode("690")).toBe(false);
});
