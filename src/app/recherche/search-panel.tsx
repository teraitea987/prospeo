"use client";
import { useRef, useState } from "react";
import { sectors, sizes } from "../../modules/search/filters";
import type { SearchResult } from "../../modules/search/demo-search";
const initial = { q: "", city: "", sector: "", size: "" };
export function SearchPanel() {
  const [filters, setFilters] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  async function search(values = filters, page = 1) {
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    setPending(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/recherche?${new URLSearchParams({ ...values, page: String(page) })}`, { signal: current.signal });
      if (!response.ok) throw new Error("Recherche indisponible. Vérifiez les filtres ou réessayez.");
      const data: SearchResult = await response.json();
      if (!current.signal.aborted) { setResult(data); setSubmitted(values); }
    } catch {
      if (!current.signal.aborted) setError("Recherche indisponible. Vérifiez les filtres ou réessayez.");
    } finally { if (!current.signal.aborted) setPending(false); }
  }
  function reset() { controller.current?.abort(); setFilters(initial); setSubmitted(initial); setResult(null); setError(""); setPending(false); }
  return <div className="search-layout">
    <form className="filter-panel" onSubmit={e => { e.preventDefault(); void search(); }}>
      <h2>Votre cible</h2><p>Entreprises en France</p>
      <label htmlFor="q">Mots-clés</label><input id="q" name="q" maxLength={100} value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} placeholder="Ex. atelier" />
      <label htmlFor="city">Ville</label><input id="city" name="city" maxLength={80} value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} placeholder="Ex. Lyon" />
      <label htmlFor="sector">Secteur d’activité</label><select id="sector" name="sector" value={filters.sector} onChange={e => setFilters({ ...filters, sector: e.target.value })}><option value="">Tous les secteurs</option>{sectors.map(v => <option key={v}>{v}</option>)}</select>
      <label htmlFor="size">Effectif</label><select id="size" name="size" value={filters.size} onChange={e => setFilters({ ...filters, size: e.target.value })}><option value="">Tous les effectifs</option>{sizes.map(v => <option key={v}>{v}</option>)}</select>
      <button type="submit" className="button" disabled={pending}>{pending ? "Recherche en cours…" : "Rechercher"}</button><button type="button" className="reset-button" onClick={reset}>Réinitialiser</button>
    </form>
    <section className="results" aria-labelledby="resultats" aria-busy={pending}>
      <h2 id="resultats">Résultats de recherche</h2>
      <p role="status" aria-live="polite">{pending ? "Recherche en cours…" : result ? `${result.total} entreprise${result.total > 1 ? "s" : ""} fictive${result.total > 1 ? "s" : ""} trouvée${result.total > 1 ? "s" : ""}` : "Choisissez vos critères et lancez une recherche."}</p>
      {error && <div className="search-error" role="alert"><p>{error}</p><button className="button" onClick={() => void search()}>Réessayer</button></div>}
      {!pending && result?.total === 0 && <div className="empty-state"><h3>Aucune entreprise fictive trouvée</h3><p>Essayez une autre ville ou élargissez vos critères.</p></div>}
      {result && <><div className="result-list">{result.items.map(c => <article className="result-card" key={c.id}><div className="result-top"><span className="sector-tag">{c.sector}</span><span className="future">Fictif</span></div><h3>{c.name}</h3><p>{c.city} · France</p><p>{c.size}</p><small>Source : jeu de démonstration · Informations non vérifiées</small></article>)}</div>
      {result.total > 0 && <nav className="pagination" aria-label="Pagination des résultats"><button disabled={pending || result.page === 1} onClick={() => void search(submitted, result.page - 1)}>Précédent</button><span>Page {result.page} sur {result.pages}</span><button disabled={pending || result.page === result.pages} onClick={() => void search(submitted, result.page + 1)}>Suivant</button></nav>}</>}
    </section>
  </div>;
}
