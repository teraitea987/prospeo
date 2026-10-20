import { z } from "zod";
export const RULE_VERSION = "1.0";
export const MAX_AGE_DAYS = 90;
const httpUrl = z.string().max(2048).refine(value => {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}, "Indiquez une URL HTTP(S) sans identifiants.");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Date invalide.");
export const observationSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("UNKNOWN") }).strict(),
  z.object({ status: z.literal("NOT_FOUND"), sourceUrl: httpUrl, observedOn: dateSchema, websiteUrl: z.literal("").default(""), note: z.string().trim().max(500).default("") }).strict(),
  z.object({ status: z.enum(["REFRESH_NEEDED", "NO_NEED"]), sourceUrl: httpUrl, observedOn: dateSchema, websiteUrl: httpUrl, note: z.string().trim().min(10, "Décrivez le constat (10 caractères minimum).").max(500) }).strict(),
]);
export type Observation = z.infer<typeof observationSchema>;
export type Qualification = ReturnType<typeof qualify>;
export function qualify(input: unknown, now: Date = new Date()) {
  const observation = observationSchema.parse(input);
  const base = { version: RULE_VERSION, kind: "COMMERCIAL_HYPOTHESIS" as const };
  if (observation.status === "UNKNOWN") return { ...base, score: null, state: "UNKNOWN" as const, confidence: "LOW" as const, explanation: "Présence de site inconnue. Les données de recherche collectées ne permettent pas de conclure.", sourceUrl: null, observedOn: null };
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const age = (today - new Date(`${observation.observedOn}T00:00:00Z`).getTime()) / 86400000;
  if (!Number.isFinite(age) || age < 0) throw new Error("La date du constat ne peut pas être future.");
  const evidence = { sourceUrl: observation.sourceUrl, observedOn: observation.observedOn };
  if (age > MAX_AGE_DAYS) return { ...base, ...evidence, score: null, state: "OUTDATED" as const, confidence: "LOW" as const, explanation: "Constat de plus de 90 jours : à revérifier avant qualification." };
  const rules = {
    NOT_FOUND: { score: 80, explanation: "Aucun site identifié lors de la recherche manuelle déclarée. Piste de création à confirmer ; cela ne prouve pas l’absence d’un site." },
    REFRESH_NEEDED: { score: 40, explanation: "Site existant avec besoin de refonte déclaré manuellement. Piste commerciale à confirmer avec l’entreprise." },
    NO_NEED: { score: 0, explanation: "Aucun besoin numérique constaté dans l’examen manuel déclaré. Ce résultat ne garantit pas l’absence de besoin." },
  };
  return { ...base, ...evidence, ...rules[observation.status], state: "ASSESSED" as const, confidence: "MEDIUM" as const };
}
