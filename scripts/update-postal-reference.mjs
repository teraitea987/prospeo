/* global fetch, AbortSignal */
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import { z } from "zod";
const url = "https://geo.api.gouv.fr/communes?fields=nom,codesPostaux&format=json";
const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30000) });
if (!response.ok || !response.body) throw new Error("Référentiel indisponible.");
const reader = response.body.getReader(); const chunks = []; let size = 0;
try {
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 10000000) throw new Error("Référentiel trop volumineux."); chunks.push(value); }
} finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
const rows = z.array(z.object({ nom: z.string().min(1).max(200), codesPostaux: z.array(z.string().regex(/^\d{5}$/)) })).max(50000).parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
const mapping = new Map();
for (const row of rows) for (const code of row.codesPostaux) { if (!mapping.has(code)) mapping.set(code, new Set()); mapping.get(code).add(row.nom); }
if (mapping.size < 5000) throw new Error("Référentiel incomplet, fichier conservé.");
const codes = [...mapping].sort(([a], [b]) => a.localeCompare(b)).map(([code, names]) => ({ code, communes: [...names].sort() }));
writeFileSync("src/server/reference/postal-codes.json", JSON.stringify(codes) + "\n");
console.log(`Référentiel mis à jour : ${codes.length} codes. Vérifier le diff avant commit.`);
