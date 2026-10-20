import { afterEach, expect, test, vi } from "vitest";
import { EventEmitter } from "node:events";
import { promisify } from "node:util";
const mocks = vi.hoisted(() => ({ execute: vi.fn(), spawn: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("node:child_process", () => ({ execFile: Object.assign(vi.fn(), { [promisify.custom]: mocks.execute }), spawn: mocks.spawn }));
import { runAnalysis } from "../../src/server/analysis/runner";
const image = `sha256:${"a".repeat(64)}`, id = "b".repeat(64);
function setup() {
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("ANALYSIS_ENABLED", "true"); vi.stubEnv("ANALYZER_IMAGE", image);
  (globalThis as typeof globalThis & { analysisQuota?: unknown }).analysisQuota = undefined;
  mocks.execute.mockResolvedValue({ stdout: id, stderr: "" });
}
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); vi.useRealTimers(); });
test("aucun conteneur sans opt-in local et identifiant immuable", async () => {
  setup(); vi.stubEnv("NODE_ENV", "production"); await expect(runAnalysis("https://example.com")).rejects.toThrow("DISABLED");
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("ANALYZER_IMAGE", "tag:mutable"); await expect(runAnalysis("https://example.com")).rejects.toThrow("DISABLED");
  expect(mocks.execute).not.toHaveBeenCalled();
});
test("concurrence et délai bornés, aucun secret hérité, nettoyage après timeout", async () => {
  setup(); vi.useFakeTimers();
  const child = Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter(), stdin: Object.assign(new EventEmitter(), { end: vi.fn() }), kill: vi.fn() });
  mocks.spawn.mockReturnValue(child);
  const pending = runAnalysis("https://example.com"); const timed = expect(pending).rejects.toThrow("TIMEOUT");
  await vi.advanceTimersByTimeAsync(1);
  await expect(runAnalysis("https://example.com")).rejects.toThrow("QUOTA");
  expect(child.stdin.end).toHaveBeenCalledWith(JSON.stringify({ url: "https://example.com" }));
  const args = mocks.execute.mock.calls[0];
  expect(args[1]).toContain("--read-only"); expect(args[1]).toContain("--cap-drop=ALL"); expect(args[1]).not.toContain("https://example.com");
  expect(Object.keys(args[2].env).sort()).toEqual(["HOME", "NODE_ENV", "PATH"]);
  await vi.advanceTimersByTimeAsync(20000); await timed;
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
  expect(mocks.execute.mock.calls.at(-1)?.[1]).toContain("rm"); expect(mocks.execute.mock.calls.at(-1)?.[1]).toContain(id);
});
test("six tentatives par minute et aucun effacement d’un conteneur non acquis", async () => {
  setup(); mocks.execute.mockRejectedValue(new Error("name already in use"));
  for (let i = 0; i < 6; i++) await expect(runAnalysis("https://example.com")).rejects.toThrow("name already in use");
  await expect(runAnalysis("https://example.com")).rejects.toThrow("QUOTA");
  expect(mocks.execute).toHaveBeenCalledTimes(6);
  for (const call of mocks.execute.mock.calls) expect(call[1]).not.toContain("rm");
});
