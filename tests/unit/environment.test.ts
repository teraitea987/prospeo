import { expect, it } from "vitest";
import { parseEnvironment } from "../../src/server/config/environment";
it("valide le mode serveur et exclut les variables non déclarées", () => {
  expect(parseEnvironment({ NODE_ENV: "production", SECRET_KEY: "factice" })).toEqual({ NODE_ENV: "production" });
  expect(parseEnvironment({})).toEqual({ NODE_ENV: "development" });
});
it("refuse les modes inconnus sans divulguer les valeurs reçues", () => {
  expect(() => parseEnvironment({ NODE_ENV: "secret-factice" })).toThrow(/^Configuration serveur invalide : NODE_ENV\.$/);
  expect(() => parseEnvironment({ NODE_ENV: ["production"] })).toThrow();
});
