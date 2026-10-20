import "server-only";
import { z } from "zod";
import { localTradeCodes } from "../../modules/search/targeting";
import type { RealFilters, RealResult } from "../../modules/search/real-filters";
const endpoint = "https://recherche-entreprises.api.gouv.fr/search";
const locationSchema = z.object({
  activite_principale_registre_metier: z.string().max(10).nullable().optional(),
  libelle_commune: z.string().max(200).nullable().optional(),
  code_postal: z.string().regex(/^\d{5}$/).nullable().optional(),
  siret: z.string().regex(/^\d{14}$/).nullable().optional(),
  etat_administratif: z.string().optional(),
});
const companySchema = z.object({
  siren: z.string().regex(/^\d{9}$/), nom_complet: z.string().min(1).max(300),
  statut_diffusion: z.string(), nature_juridique: z.string(),
  categorie_entreprise: z.string().nullable().optional(),
  tranche_effectif_salarie: z.string().nullable().optional(),
  annee_tranche_effectif_salarie: z.string().nullable().optional(),
  nombre_etablissements_ouverts: z.number().int().nonnegative().nullable().optional(),
  activite_principale: z.string().max(10).nullable().optional(),
  siege: locationSchema.nullable().optional(),
  matching_etablissements: z.array(z.unknown()).max(10).optional(),
});
const payloadSchema = z.object({
  results: z.array(z.unknown()).max(10), page: z.number().int().min(1),
  total_pages: z.number().int().min(0), total_results: z.number().int().min(0),
});
export class ProviderError extends Error {
  constructor(public code: "RATE_LIMIT" | "UNAVAILABLE" | "INVALID_RESPONSE", public retryAfter = 60) { super(code); }
}
// Garde globale bornée pour l’instance locale unique ; aucun identifiant IP client stocké.
export function createCompanyProvider(fetcher: typeof fetch = fetch, now = Date.now) {
  let busy = false; let nextAllowed = 0; let windowStart = 0; let count = 0;
  return async function search(filters: RealFilters): Promise<RealResult> {
    const current = now();
    if (current - windowStart >= 60000) { windowStart = current; count = 0; }
    if (busy || current < nextAllowed || count >= 20) throw new ProviderError("RATE_LIMIT", Math.max(1, Math.ceil((Math.max(nextAllowed, count >= 20 ? windowStart + 60000 : current + 1000) - current) / 1000)));
    busy = true; count++; nextAllowed = current + 1000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const url = new URL(endpoint);
      url.search = new URLSearchParams({ ...(filters.q ? { q: filters.q } : {}), page: String(filters.page), per_page: "10", minimal: "true", include: "siege,matching_etablissements", limite_matching_etablissements: "10", etat_administratif: "A", categorie_entreprise: "PME", tranche_effectif_salarie: "00,01,02,03", sort_by_size: "false", ...(filters.postal ? { code_postal: filters.postal } : {}), ...(filters.naf || filters.target === "local" ? { activite_principale: filters.naf || localTradeCodes.join(",") } : {}) }).toString();
      const response = await fetcher(url, { signal: controller.signal, redirect: "error", cache: "no-store", headers: { Accept: "application/json", "User-Agent": "Prospeo/0.1 (local company research; no bulk collection)" } });
      if (response.status === 429) {
        const raw = response.headers.get("retry-after") ?? "60";
        const delay = /^\d+$/.test(raw) ? Number(raw) : Math.ceil((Date.parse(raw) - now()) / 1000);
        const retry = Number.isFinite(delay) ? Math.max(1, delay) : 60;
        nextAllowed = now() + retry * 1000;
        throw new ProviderError("RATE_LIMIT", retry);
      }
      if (!response.ok) throw new ProviderError("UNAVAILABLE");
      if (!response.headers.get("content-type")?.includes("application/json") || !response.body) throw new ProviderError("INVALID_RESPONSE");
      const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
      try {
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          bytes += value.byteLength;
          if (bytes > 512000) { controller.abort(); throw new ProviderError("INVALID_RESPONSE"); }
          chunks.push(value);
        }
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      const payload = payloadSchema.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      if (!payload.success || payload.data.page !== filters.page) throw new ProviderError("INVALID_RESPONSE");
      const items: RealResult["items"] = [];
      for (const row of payload.data.results) {
        const parsed = companySchema.safeParse(row);
        if (!parsed.success) continue;
        const c = parsed.data;
        // Uniquement sociétés (catégories 5xxx), diffusibles. Exclut les personnes physiques.
        if (c.statut_diffusion !== "O" || !/^5\d{3}$/.test(c.nature_juridique)) continue;
        if (c.categorie_entreprise !== "PME" || !["00", "01", "02", "03"].includes(c.tranche_effectif_salarie ?? "") || c.nombre_etablissements_ouverts == null || c.nombre_etablissements_ouverts < 1 || c.nombre_etablissements_ouverts > 3) continue;
        const matching = (c.matching_etablissements ?? []).flatMap(value => {
          const location = locationSchema.safeParse(value);
          return location.success ? [location.data] : [];
        });
        // Ne jamais substituer le siège d’une autre ville à un établissement local.
        const local = filters.postal ? matching.find(e => e.code_postal === filters.postal && e.siret && e.etat_administratif === "A") : undefined;
        const headquartersMatches = filters.postal && c.siege?.code_postal === filters.postal && c.siege.siret && c.siege.etat_administratif === "A";
        const location = filters.postal ? local ?? (headquartersMatches ? c.siege : undefined) : c.siege;
        if (filters.postal && !location) continue;
        items.push({ siren: c.siren, name: c.nom_complet,
          employeeBand: ({ "00": "0 salarié", "01": "1 à 2 salariés", "02": "3 à 5 salariés", "03": "6 à 9 salariés" } as Record<string, string>)[c.tranche_effectif_salarie!],
          employeeYear: c.annee_tranche_effectif_salarie ?? null,
          openEstablishments: c.nombre_etablissements_ouverts,
          artisanActivity: Boolean(location?.activite_principale_registre_metier || c.siege?.activite_principale_registre_metier),
          city: location?.libelle_commune ?? null,
          postal: location?.code_postal ?? null, siret: location?.siret ?? null,
          locationKind: filters.postal ? "ESTABLISHMENT" : "HEADQUARTERS", headquartersCity: c.siege?.libelle_commune ?? null,
          naf: c.activite_principale ?? null, sourceUrl: `https://annuaire-entreprises.data.gouv.fr/entreprise/${c.siren}` });
      }
      items.sort((a, b) => Number(b.artisanActivity) - Number(a.artisanActivity));
      return { items, excluded: payload.data.results.length - items.length, page: payload.data.page, pages: Math.min(99, payload.data.total_pages), total: payload.data.total_results, source: "API Recherche d’entreprises · DINUM / Sirene", collectedAt: new Date(now()).toISOString(), confidence: "MEDIUM", verifiedAt: null };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError("UNAVAILABLE");
    } finally { clearTimeout(timeout); busy = false; }
  };
}
export const searchCompanies = createCompanyProvider();
