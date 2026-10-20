import { execFileSync, spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { CREATE_OPTIONS } from "../src/server/analysis/container.ts";
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8", timeout: 60000, maxBuffer: 1024 * 1024 });
const runtimeTag = "prospeo-analyzer:iteration-06";
const testTag = "prospeo-analyzer:integration-06";
// Build context has an explicit allowlist; never send the repository/.env to Docker.
for (const [target, tag] of [["runtime", runtimeTag], ["integration", testTag]]) {
  const built = spawnSync("docker", ["build", "--target", target, "-t", tag, "analyzer"], { stdio: "inherit", timeout: 180000 });
  assert.equal(built.status, 0, "Build analyzer failed");
}
try { docker("network", "inspect", "prospeo-analysis"); } catch { docker("network", "create", "--driver", "bridge", "prospeo-analysis"); }
const network = JSON.parse(docker("network", "inspect", "prospeo-analysis"))[0]; assert.equal(network.Driver, "bridge");
const runtime = docker("image", "inspect", "--format", "{{.Id}}", runtimeTag).trim();
const fixture = "prospeo-analysis-fixture-06";
let job;
try {
  docker("run", "-d", "--name", fixture, "--network", "prospeo-analysis", "--read-only", "--cap-drop=ALL", "--security-opt=no-new-privileges", "--memory=64m", "--pids-limit=32", "--entrypoint", "node", runtime, "--input-type=module", "-e", 'import http from "node:http"; http.createServer((_q,r)=>r.end("fixture")).listen(80,"0.0.0.0");');
  const address = JSON.parse(docker("inspect", fixture))[0].NetworkSettings.Networks["prospeo-analysis"].IPAddress;
  // Positive control: the same private fixture really is reachable without the firewall.
  assert.equal(docker("run", "--rm", "--network", "prospeo-analysis", "--entrypoint", "node", runtime, "--input-type=module", "-e", `const r = await fetch("http://${address}"); console.log(await r.text());`).trim(), "fixture");
  job = docker("create", ...CREATE_OPTIONS, testTag, "/app/probe.ts", address).trim();
  const proof = docker("start", "-a", job); assert.match(proof, /isolation-and-egress-pass/);
  assert.equal(JSON.parse(docker("inspect", job))[0].State.ExitCode, 0);
  docker("rm", "-f", job); job = undefined;
  // Runtime image, real TLS and real DNS through the exact production sandbox.
  for (const [url, success] of [["https://example.com", true], ["http://169.254.169.254", false], ["http://[::ffff:127.0.0.1]", false]]) {
    job = docker("create", ...CREATE_OPTIONS, runtime).trim();
    const result = spawnSync("docker", ["start", "-a", "-i", job], { input: JSON.stringify({ url }), encoding: "utf8", timeout: 25000 });
    assert.equal(result.status, 0, result.stderr); const body = JSON.parse(result.stdout);
    assert.equal(body.ok, success, body.code);
    if (success) { assert.equal(body.observation.status, 200); assert.equal(body.observation.https, true); assert.equal(body.observation.titlePresent, true); }
    docker("rm", "-f", job); job = undefined;
  }
  console.log("PASS: OS egress, private positive control, UID/capabilities, read-only, no secrets/socket, CPU/RAM/PIDs, public TLS, internal/mapped targets, cleanup.");
  console.log(`Verified runtime image: ${runtime}`);
} finally {
  if (job) docker("rm", "-f", job);
  docker("rm", "-f", fixture);
}
