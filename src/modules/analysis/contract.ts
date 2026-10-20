import { z } from "zod";
export const analysisInput = z.strictObject({ url: z.string().min(10).max(2048) });
const webUrl = z.url().max(2048).refine(value => { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password; });
export const observationSchema = z.strictObject({
  version: z.literal("1.0"), requestedUrl: webUrl, finalUrl: webUrl,
  observedAt: z.iso.datetime(), status: z.number().int().min(100).max(599),
  https: z.boolean(), redirects: z.number().int().min(0).max(3), bytes: z.number().int().min(0).max(512000),
  html: z.boolean(), titlePresent: z.boolean().nullable(), viewportPresent: z.boolean().nullable(),
});
export type TechnicalObservation = z.infer<typeof observationSchema>;
