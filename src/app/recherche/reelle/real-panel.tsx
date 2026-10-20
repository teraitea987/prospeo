"use client";
import { useState } from "react";
import { PostalAutocomplete } from "../../../components/postal-autocomplete";
import type { RealResult } from "../../../modules/search/real-filters";
export function RealPanel() {
  const [filters, setFilters] = useState({ q: "", postal: "", naf: "", target: "local" });
  const [submitted, setSubmitted] = useState(filters);
  const [result, setResult] = useState<RealResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  async function search(values = filters, page = 1) {
    if (!values.q.trim() && !values.postal.trim() && !values.naf.trim()) { setError("Renseignez au moins un critère : nom, code postal ou code NAF."); return; }
    if (values.postal && !/^\d{5}$/.test(values.postal)) { setError("Choisissez un code postal complet dans les suggestions."); return; }
    if (Date.now() < retryAt) { setError("Patientez jusqu’à la fin du délai indiqué."); return; }
    setPending(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/entreprises?${new URLSearchParams({ ...values, page: String(page) })}`, { signal: AbortSignal.timeout(12000) });
      if (response.status === 429) {
        const delay = Number(response.headers.get("Retry-After")) || 60;
        setRetryAt(Date.now() + delay * 1000); setError(`Quota atteint. Réessayez dans ${delay} secondes.`); return;
      }
      if (!response.ok) { setError(response.status === 401 ? "Authentification requise : rechargez la page." : "Source indisponible ou critères invalides. Réessayez plus tard."); return; }
      setResult(await response.json()); setSubmitted(values);
    } catch { setError("La source ne répond pas. Réessayez plus tard."); }
    finally { setPending(false); }
  }
  return <div className="search-layout"><form className="filter-panel" onSubmit={e => { e.preventDefault(); void search(); }}><h2>Vos critères</h2><p>Petites sociétés : PME de 0 à 9 salariés, au plus 3 établissements ouverts. Activités artisanales déclarées en premier sur chaque page. Taille inconnue exclue.</p><p>Un seul critère suffit. Les autres champs sont facultatifs.</p>
    <label htmlFor="target">Métiers ciblés</label><select id="target" value={filters.target} onChange={e => setFilters({ ...filters, target: e.target.value })}><option value="local">Artisans et métiers de proximité</option><option value="small">Toutes les petites sociétés</option></select><p>Présélection : bâtiment, coiffure/beauté, boulangerie, garage et réparation. Un code NAF précis remplace cette présélection.</p>
    <label htmlFor="real-q">Nom ou mots-clés (facultatif)</label><input id="real-q" minLength={2} maxLength={100} value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} />
    <label htmlFor="postal">Code postal (facultatif)</label><PostalAutocomplete value={filters.postal} onChange={postal => setFilters(current => ({ ...current, postal }))} />
    <label htmlFor="naf">Code NAF (facultatif)</label><input id="naf" maxLength={6} pattern={"[0-9]{2}\\.[0-9]{2}[A-Z]"} placeholder="Ex. 62.01Z" value={filters.naf} onChange={e => setFilters({ ...filters, naf: e.target.value.toUpperCase() })} />
    <button className="button" disabled={pending}>{pending ? "Recherche en cours…" : "Rechercher"}</button></form>
    <section className="results" aria-busy={pending}><h2>Sociétés trouvées</h2><p>Une même société peut être présente dans plusieurs communes. Avec un code postal, la carte montre un établissement actif correspondant ; sans filtre postal, elle montre le siège.</p><p role="status">{pending ? "Recherche en cours…" : "Résultats externes, sans vérification indépendante."}</p>
    {error && <p role="alert">{error}</p>}
    {result && <><p>{result.items.length} sociétés affichées sur cette page · {result.excluded} entrées exclues. Total fournisseur avant exclusion : {result.total}.</p><p>Collecte : {new Date(result.collectedAt).toLocaleString("fr-FR")} · Confiance moyenne · Non vérifié indépendamment</p>
    {!result.items.length && <p>Aucune société éligible sur cette page. Essayez une autre page ou d’autres critères.</p>}
    <div className="result-list">{result.items.map(c => <article className="result-card" key={c.siren}><h3>{c.name}</h3><p>SIREN {c.siren}</p>
      {c.employeeBand && <p>{c.employeeBand}{c.employeeYear ? ` (donnée ${c.employeeYear})` : " (année inconnue)"} · {c.openEstablishments} établissement(s) ouvert(s)</p>}
      {c.artisanActivity && <p className="sector-tag">Activité artisanale déclarée</p>}<p>{c.locationKind === "ESTABLISHMENT" ? "Établissement correspondant" : "Siège social"} : {c.postal ?? "Code postal inconnu"} {c.city ?? "Ville inconnue"}</p>
      {c.siret && <p>SIRET {c.siret}</p>}
      {c.locationKind === "ESTABLISHMENT" && c.headquartersCity && <p>Siège de la société : {c.headquartersCity}</p>}
      <p>NAF de la société : {c.naf ?? "inconnu"}</p><a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">Consulter la source officielle</a></article>)}</div>
    {result.pages > 0 && <nav className="pagination" aria-label="Pagination réelle"><button disabled={pending || result.page <= 1} onClick={() => void search(submitted, result.page - 1)}>Précédent</button><span>Page {result.page} sur {result.pages}</span><button disabled={pending || result.page >= result.pages} onClick={() => void search(submitted, result.page + 1)}>Suivant</button></nav>}</>}
    </section></div>;
}
