import "server-only";
import { execFile, spawn } from "node:child_process";
import { homedir } from "node:os";
import { promisify } from "node:util";
import { observationSchema } from "../../modules/analysis/contract";
import { CREATE_OPTIONS } from "./container";
const execute = promisify(execFile);
const env = { PATH: process.env.PATH, HOME: homedir(), NODE_ENV: "development" as const };
const host = ["--host", `unix://${homedir()}/.docker/run/docker.sock`];
export class RunnerError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.code = code; }
}
const quota = globalThis as typeof globalThis & { analysisQuota?: { active: boolean; times: number[] } };
export async function runAnalysis(url: string) {
  const image = process.env.ANALYZER_IMAGE;
  if (process.env.NODE_ENV !== "development" || process.env.ANALYSIS_ENABLED !== "true" || !image || !/^sha256:[a-f0-9]{64}$/.test(image)) throw new RunnerError("DISABLED");
  const state = quota.analysisQuota ??= { active: false, times: [] };
  state.times = state.times.filter(t => Date.now() - t < 60000);
  if (state.active || state.times.length >= 6) throw new RunnerError("QUOTA");
  state.active = true; state.times.push(Date.now());
  let container: string | undefined;
  try {
    const created = await execute("docker", [...host, "create", ...CREATE_OPTIONS, image], { env, timeout: 5000, maxBuffer: 8192 });
    container = created.stdout.trim();
    if (!/^[a-f0-9]{64}$/.test(container)) throw new RunnerError("UNAVAILABLE");
    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn("docker", [...host, "start", "--attach", "--interactive", container!], { env, stdio: ["pipe", "pipe", "pipe"] });
      let stdout = ""; let size = 0;
      const timeout = setTimeout(() => { child.kill("SIGKILL"); reject(new RunnerError("TIMEOUT")); }, 20000);
      child.stdout.on("data", (chunk: Buffer) => { size += chunk.length; if (size > 8192) { child.kill("SIGKILL"); reject(new RunnerError("OUTPUT")); } else stdout += chunk.toString(); });
      // Drain but never log container stderr: a hostile response must not become a log channel.
      child.stderr.on("data", () => {});
      child.on("error", reject);
      child.on("close", code => { clearTimeout(timeout); if (code === 0) resolve(stdout); else reject(new RunnerError("UNAVAILABLE")); });
      child.stdin.on("error", () => {});
      child.stdin.end(JSON.stringify({ url }));
    });
    const result = JSON.parse(output);
    if (result?.ok !== true) throw new RunnerError("CHECK_FAILED");
    return observationSchema.parse(result.observation);
  } finally {
    if (container && /^[a-f0-9]{64}$/.test(container)) {
      try { await execute("docker", [...host, "rm", "--force", container], { env, timeout: 5000, maxBuffer: 8192 }); }
      catch { /* Fixed container name blocks further jobs if cleanup fails. */ }
    }
    state.active = false;
  }
}
