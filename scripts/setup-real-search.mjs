import { randomBytes } from "node:crypto";
import { appendFileSync, chmodSync, existsSync, readFileSync } from "node:fs";
const existing = existsSync(".env") ? readFileSync(".env", "utf8") : "";
if (/^REAL_SEARCH_(PASSWORD|ENABLED)=/m.test(existing)) throw new Error("Accès réel déjà configuré ; aucun secret remplacé.");
appendFileSync(".env", `\nREAL_SEARCH_ENABLED=true\nREAL_SEARCH_PASSWORD=${randomBytes(32).toString("hex")}\n`, { mode: 0o600 });
chmodSync(".env", 0o600);
console.log("Accès local configuré : utilisateur prospeo, mot de passe privé dans .env.");
