import { z } from "zod";
export const sectors = ["Artisanat", "Restauration", "Services"] as const;
export const sizes = ["1–9 salariés", "10–49 salariés"] as const;
export const filtersSchema = z.object({
  q: z.string().trim().max(100).default(""),
  city: z.string().trim().max(80).default(""),
  sector: z.enum(["", ...sectors]).default(""),
  size: z.enum(["", ...sizes]).default(""),
  page: z.string().regex(/^[1-9]\d{0,2}$/).default("1").transform(Number),
}).strict();
export type SearchFilters = z.output<typeof filtersSchema>;
