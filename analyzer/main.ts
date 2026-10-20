import { analyze, AnalysisError } from "./core.ts";
// A second, independent deadline terminates DNS/socket processing even if a handler stalls.
const watchdog = setTimeout(() => process.exit(1), 14000);
try {
  let input = "";
  for await (const chunk of process.stdin) { input += chunk; if (Buffer.byteLength(input) > 4096) throw new AnalysisError("INPUT"); }
  const parsed = JSON.parse(input);
  if (!parsed || Object.keys(parsed).join() !== "url") throw new AnalysisError("INPUT");
  process.stdout.write(JSON.stringify({ ok: true, observation: await analyze(parsed.url) }));
} catch (error) {
  process.stdout.write(JSON.stringify({ ok: false, code: error instanceof AnalysisError ? error.code : "UNAVAILABLE" }));
} finally { clearTimeout(watchdog); }
