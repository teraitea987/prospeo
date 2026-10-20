import { z } from "zod";
import { isKnownPostalCode } from "../../server/reference/postal-reference";
export const realFiltersSchema = z.object({
  q: z.string().trim().max(100).refine(v => !v || v.length >= 2, "Saisissez au moins deux caractères.").refine(v => !/^\d{9}(\d{5})?$/.test(v), "Recherche par identifiant hors périmètre.").default(""),
  postal: z.string().regex(/^(\d{5})?$/).refine(v => !v || isKnownPostalCode(v), "Code postal inconnu.").default(""),
  naf: z.string().regex(/^(\d{2}\.\d{2}[A-Z])?$/).default(""),
  target: z.enum(["local", "small"]).default("local"),
  page: z.string().regex(/^[1-9]\d?$/).default("1").transform(Number),
}).strict().refine(v => Boolean(v.q || v.postal || v.naf), "Renseignez au moins un critère.");
export type RealFilters = z.output<typeof realFiltersSchema>;
export type RealResult = {
  items: { siren: string; name: string; employeeBand: string; employeeYear: string | null; openEstablishments: number; artisanActivity: boolean; city: string | null; postal: string | null; siret: string | null; locationKind: "ESTABLISHMENT" | "HEADQUARTERS"; headquartersCity: string | null; naf: string | null; sourceUrl: string }[];
  page: number; pages: number; total: number; excluded: number;
  source: string; collectedAt: string; confidence: "MEDIUM"; verifiedAt: null;
};
