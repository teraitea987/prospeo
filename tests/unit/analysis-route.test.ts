import { afterEach, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("../../src/server/analysis/runner", () => ({ runAnalysis: vi.fn(), RunnerError: class extends Error { code: string; constructor(code: string) { super(code); this.code = code; } } }));
import { POST } from "../../src/app/api/analyse/route";
import { runAnalysis, RunnerError } from "../../src/server/analysis/runner";
const password = "fixture-password-no-production-value-0000";
function request(body = JSON.stringify({ url: "https://example.com" }), overrides: Record<string, string> = {}) {
  return new Request("http://127.0.0.1:3101/api/analyse", { method: "POST", headers: { Host: "127.0.0.1:3101", Authorization: `Basic ${Buffer.from(`prospeo:${password}`).toString("base64")}`, Origin: "http://127.0.0.1:3101", "Content-Type": "application/json", ...overrides }, body });
}
function access() { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("REAL_SEARCH_ENABLED", "true"); vi.stubEnv("REAL_SEARCH_PASSWORD", password); }
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
test("refuse production, anonyme et origine croisée avant tout lancement", async () => {
  access(); vi.stubEnv("NODE_ENV", "production"); expect((await POST(request())).status).toBe(404);
  vi.stubEnv("NODE_ENV", "development"); expect((await POST(request(undefined, { Authorization: "" }))).status).toBe(401);
  const invalidOrigins: Record<string, string>[] = [{ Origin: "https://intrus.example" }, { Origin: "" }, { "Sec-Fetch-Site": "cross-site" }];
  for (const overrides of invalidOrigins) expect((await POST(request(undefined, overrides))).status).toBe(403);
  expect(runAnalysis).not.toHaveBeenCalled();
});
test("borne et valide le corps et refuse le format de formulaire", async () => {
  access();
  expect((await POST(request(undefined, { "Content-Type": "text/plain" }))).status).toBe(415);
  for (const input of ["{", "x".repeat(4097), JSON.stringify({ url: "https://example.com", workspaceId: "intrus" })]) expect((await POST(request(input))).status).toBe(400);
  expect(runAnalysis).not.toHaveBeenCalled();
});
test("propage seulement le résultat validé ou une erreur publique sans détails sensibles", async () => {
  access(); vi.mocked(runAnalysis).mockRejectedValue(new RunnerError("DISABLED")); expect((await POST(request())).status).toBe(503);
  vi.mocked(runAnalysis).mockRejectedValue(new RunnerError("QUOTA")); const limited = await POST(request()); expect(limited.status).toBe(429); expect(limited.headers.get("retry-after")).toBe("60");
  vi.mocked(runAnalysis).mockRejectedValue(new Error("internal-secret")); const failure = await POST(request()); expect(failure.status).toBe(422); expect(await failure.text()).not.toContain("internal-secret");
});
