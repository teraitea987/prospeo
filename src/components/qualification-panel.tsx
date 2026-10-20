"use client";
import { TechnicalAnalysis } from "./technical-analysis";
import { useId, useState } from "react";
import { qualify } from "../modules/qualification/rules";
import type { Qualification } from "../modules/qualification/rules";
export function QualificationPanel({ companyName }: { companyName: string }) {
  const id = useId();
  const [status, setStatus] = useState("UNKNOWN");
  const [sourceUrl, setSourceUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [observedOn, setObservedOn] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<Qualification>(() => qualify({ status: "UNKNOWN" }));
  const [error, setError] = useState("");
  function assess() {
    try {
      const input = status === "UNKNOWN" ? { status } : { status, sourceUrl, observedOn, websiteUrl: status === "NOT_FOUND" ? "" : websiteUrl, note };
      setResult(qualify(input)); setError("");
    } catch { setError("Vérifiez la source HTTP(S), la date passée ou actuelle, le site et le commentaire du constat."); }
  }
  return <section className="qualification" aria-label={`Qualification de ${companyName}`}>
    <p className="qualification-score">Opportunité : {result.score === null ? "Inconnue" : `${result.score}/100`}</p>
    <p>{result.explanation}</p>
    <small>Hypothèse commerciale · Confiance {result.confidence === "LOW" ? "faible" : "moyenne"} · Règles v{result.version}</small>
    {result.observedOn && <small>Constat manuel déclaré : {result.observedOn} · {result.state === "OUTDATED" ? "À revérifier" : "Non vérifié indépendamment"}</small>}
    {result.sourceUrl && <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">Source du constat manuel</a>}
    <details><summary>Qualifier manuellement</summary><p>Ces informations restent dans cette page et sont perdues à la prochaine recherche ou au rechargement. Aucun site n’est visité automatiquement.</p>
      <form onSubmit={e => { e.preventDefault(); assess(); }}>
        <label htmlFor={`${id}-status`}>Constat</label><select id={`${id}-status`} value={status} onChange={e => { setStatus(e.target.value); setResult(qualify({ status: "UNKNOWN" })); setError(""); }}>
          <option value="UNKNOWN">Non vérifié / inconnu</option><option value="NOT_FOUND">Aucun site identifié lors de ma recherche</option><option value="REFRESH_NEEDED">Site existant : besoin de refonte constaté</option><option value="NO_NEED">Site existant : aucun besoin constaté</option>
        </select>
        {status !== "UNKNOWN" && <>
          <label htmlFor={`${id}-source`}>Source du constat (URL)</label><input id={`${id}-source`} type="url" required maxLength={2048} value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://…" />
          <label htmlFor={`${id}-date`}>Date du constat</label><input id={`${id}-date`} type="date" required value={observedOn} onChange={e => setObservedOn(e.target.value)} />
          {status !== "NOT_FOUND" && <><label htmlFor={`${id}-website`}>Site de l’entreprise</label><input id={`${id}-website`} type="url" required maxLength={2048} value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} /></>}
          <label htmlFor={`${id}-note`}>Détail du constat</label><textarea id={`${id}-note`} required={status !== "NOT_FOUND"} minLength={status !== "NOT_FOUND" ? 10 : undefined} maxLength={500} value={note} onChange={e => setNote(e.target.value)} />
        </>}
        <button className="button" type="submit">Évaluer le constat</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </details>
    <TechnicalAnalysis />
  </section>;
}
