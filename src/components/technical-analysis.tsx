"use client";
import { useId, useState } from "react";
import { observationSchema } from "../modules/analysis/contract";
import type { TechnicalObservation } from "../modules/analysis/contract";
export function TechnicalAnalysis() {
  const id = useId();
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<TechnicalObservation | null>(null);
  const [error, setError] = useState("");
  async function submit() {
    if (pending) return;
    setPending(true); setResult(null); setError("");
    try {
      const response = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }), signal: AbortSignal.timeout(35000) });
      const body = await response.json();
      if (!response.ok) { setError(typeof body.error === "string" ? body.error : "Analyse indisponible."); return; }
      setResult(observationSchema.parse(body.observation));
    } catch { setError("Analyse indisponible. Aucune conclusion sur l’existence ou la qualité du site."); }
    finally { setPending(false); }
  }
  return <details className="technical-analysis"><summary>Analyser un site</summary>
    <p>Renseignez le site public de cette entreprise. Une analyse à la demande vérifie la page reçue, sans exécuter ses scripts. Aucun score commercial n’est modifié. Résultat temporaire.</p>
    <form onSubmit={e => { e.preventDefault(); void submit(); }}>
      <label htmlFor={id}>URL du site à analyser</label>
      <input id={id} type="url" required maxLength={2048} placeholder="https://…" value={url} disabled={pending} onChange={e => { setUrl(e.target.value); setResult(null); setError(""); }} />
      <button className="button" disabled={pending} type="submit">{pending ? "Analyse en cours…" : "Lancer l’analyse"}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {result && <div role="status">
      <p>Page observée le {new Date(result.observedAt).toLocaleString("fr-FR")} · HTTP {result.status}</p>
      <a href={result.finalUrl} target="_blank" rel="noopener noreferrer">Page finale observée</a>
      <ul><li>Connexion finale : {result.https ? "HTTPS" : "HTTP sans chiffrement"}</li>
        <li>Redirections : {result.redirects}</li>
        <li>Titre dans le HTML : {result.titlePresent === null ? "non évalué" : result.titlePresent ? "détecté" : "non détecté"}</li>
        <li>Déclaration viewport : {result.viewportPresent === null ? "non évaluée" : result.viewportPresent ? "détectée" : "non détectée"}</li></ul>
      <p>Signaux techniques indicatifs sur une seule page. Une absence dans le HTML reçu ne prouve pas un défaut : le site peut utiliser JavaScript. Ni audit mobile, ni preuve de besoin de refonte. Vérifiez aussi que le site appartient à cette entreprise.</p>
    </div>}
  </details>;
}
