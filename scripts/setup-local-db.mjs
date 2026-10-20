import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
const password = randomBytes(32).toString("hex");
// wx refuse tout écrasement ; permissions privées et aucune valeur dans les logs.
writeFileSync(".env", `POSTGRES_PASSWORD=${password}\nDATABASE_URL=postgresql://prospeo:${password}@127.0.0.1:5432/prospeo\n`, { flag: "wx", mode: 0o600 });
console.log("Configuration locale créée dans .env (ignoré par Git).");
