import Link from "next/link";
import { RealPanel } from "./real-panel";
export default function RealSearchPage() {
  return <div className="shell"><header className="header"><Link href="/" className="brand">prospeo.</Link><span className="local">Source officielle · Accès local</span></header><main id="contenu" tabIndex={-1} className="search-main"><p className="eyebrow">RECHERCHE RÉELLE</p><h1>Explorez les sociétés françaises.</h1><p className="demo-notice">Source : API Recherche d’entreprises. Sociétés diffusibles uniquement. Aucun enregistrement. Qualification manuelle et analyse technique sur URL fournie, à la demande. Résultats temporaires, sans prise de contact.</p><RealPanel /></main><footer><Link href="/recherche">Retour à la démonstration</Link></footer></div>;
}
