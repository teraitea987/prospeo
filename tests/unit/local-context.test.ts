import { expect, it } from "vitest";
import { createLocalContext } from "../../src/server/auth/local-context";
const valid = { NODE_ENV: "development", LOCAL_DB_ACCESS: "enabled", LOCAL_WORKSPACE_ID: "a4e010e7-7d65-43d2-a9e4-92fc042e3e7e" };
it("refuse le contexte local en production même avec un opt-in", () => {
  expect(() => createLocalContext({ ...valid, NODE_ENV: "production" })).toThrow();
  expect(() => createLocalContext({ ...valid, NODE_ENV: "test" })).toThrow();
  expect(() => createLocalContext({ ...valid, LOCAL_DB_ACCESS: undefined })).toThrow();
  expect(() => createLocalContext({ ...valid, LOCAL_WORKSPACE_ID: "invalid" })).toThrow();
});
it("crée un contexte local immuable avec un opt-in explicite", () => {
  const context = createLocalContext(valid);
  expect(context.workspaceId).toBe(valid.LOCAL_WORKSPACE_ID);
  expect(Object.isFrozen(context)).toBe(true);
});
