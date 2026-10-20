import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { Socket } from "node:net";
// Deliberately bypass all application URL/DNS guards and call the OS directly.
const fixture = process.argv[2]; assert.match(fixture, /^172\./);
const status = readFileSync("/proc/self/status", "utf8");
assert.equal(process.getuid?.(), 10001);
for (const cap of ["CapEff", "CapPrm", "CapBnd", "CapAmb"]) assert.match(status, new RegExp(`${cap}:\\s+0+\\n`));
assert.match(status, /NoNewPrivs:\s+1/); assert.match(status, /Seccomp:\s+2/);
assert.equal(readFileSync("/sys/fs/cgroup/memory.max", "utf8").trim(), "134217728");
assert.equal(readFileSync("/sys/fs/cgroup/pids.max", "utf8").trim(), "32");
assert.match(readFileSync("/sys/fs/cgroup/cpu.max", "utf8"), /^50000 100000/);
assert.throws(() => writeFileSync("/app/unauthorized", "x"));
assert.equal(existsSync("/var/run/docker.sock"), false); assert.equal(existsSync("/app/.env"), false);
assert.equal(Object.keys(process.env).sort().join(), "NODE_ENV,PATH");
assert.notEqual(spawnSync("iptables", ["-P", "OUTPUT", "ACCEPT"]).status, 0);
async function blocked(host: string, port: number) {
  await new Promise<void>((resolve, reject) => {
    const socket = new Socket();
    socket.setTimeout(800, () => { socket.destroy(); resolve(); });
    socket.once("error", () => { socket.destroy(); resolve(); });
    socket.once("connect", () => { socket.destroy(); reject(new Error("Egress bypass")); });
    socket.connect({ host, port });
  });
}
for (const [host, port] of [[fixture, 80], [fixture, 5432], ["127.0.0.1", 80], ["169.254.169.254", 80], ["168.63.129.16", 80], ["8.8.8.8", 53], ["::1", 80], ["2606:4700:4700::1111", 443]] as const) await blocked(host, port);
process.stdout.write("isolation-and-egress-pass\n");
