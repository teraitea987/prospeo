import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
// Explicit local opt-in; never activate until the sandbox passes its real network proof.
let content = readFileSync(".env", "utf8");
function save(enabled, image) {
  content = content.split("\n").filter(line => !/^(ANALYSIS_ENABLED|ANALYZER_IMAGE)=/.test(line)).join("\n").trimEnd();
  content += `\nANALYSIS_ENABLED=${enabled}\n${image ? `ANALYZER_IMAGE=${image}\n` : ""}`;
  writeFileSync(".env.analyzer.tmp", content, { mode: 0o600 }); renameSync(".env.analyzer.tmp", ".env");
}
save(false);
const proof = spawnSync(process.execPath, ["scripts/test-analyzer.mjs"], { stdio: "inherit" });
if (proof.status !== 0) throw new Error("Analyse désactivée : les contrôles isolés ont échoué.");
const image = execFileSync("docker", ["image", "inspect", "--format", "{{.Id}}", "prospeo-analyzer:iteration-06"], { encoding: "utf8", timeout: 5000 }).trim();
if (!/^sha256:[a-f0-9]{64}$/.test(image)) throw new Error("Identifiant d’image invalide, analyse désactivée.");
save(true, image);
console.log("Analyse locale activée sur l’image vérifiée. Redémarrer pnpm dev si nécessaire. Aucun secret affiché.");
