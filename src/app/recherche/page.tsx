import Link from "next/link";
import { SearchPanel } from "./search-panel";
export default function SearchPage() {
  return <div className="shell"><header className="header"><Link href="/" className="brand" aria-label="Prospeo, accueil"><span className="brand-mark" aria-hidden="true">p</span>prospeo<span className="brand-dot">.</span></Link><span className="local">Démonstration locale</span></header><main id="contenu" tabIndex={-1} className="search-main"><p className="eyebrow">RECHERCHE D’ENTREPRISES</p><h1>Trouvez votre prochaine piste.</h1><p className="intro">Affinez votre cible, explorez les résultats et préparez votre prospection.</p><p className="demo-notice">Mode démonstration · Toutes les entreprises présentées sont fictives. Aucune source réelle ni qualification commerciale.</p><SearchPanel /></main><footer><Link href="/">Retour à l’accueil</Link><span>Prospeo · France</span></footer></div>;
}
