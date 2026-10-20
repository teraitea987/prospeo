import Link from "next/link";

const steps = [
  ["01", "Rechercher", "Cibler les entreprises selon leur activité et leur localisation."],
  ["02", "Qualifier", "Comprendre chaque opportunité à partir de critères explicables."],
  ["03", "Organiser", "Retrouver vos prospects et préparer vos prochaines actions."],
];
export default function Home() {
  return (
    <div className="shell">
      <header className="header"><Link href="/" className="brand" aria-label="Prospeo, accueil"><span className="brand-mark" aria-hidden="true">p</span>prospeo<span className="brand-dot">.</span></Link><span className="local"><span aria-hidden="true" />Espace local</span></header>
      <main id="contenu" tabIndex={-1}>
        <section className="hero" aria-labelledby="titre">
          <p className="eyebrow">LA PROSPECTION, AVEC MÉTHODE</p>
          <h1 id="titre">De meilleures pistes.<br /><span>Des opportunités concrètes.</span></h1>
          <p className="intro">Un espace pour rechercher des entreprises, comprendre leurs besoins numériques et construire une prospection plus pertinente.</p>
          <a className="button" href="#avancement">Découvrir le projet <span aria-hidden="true">↗</span></a>
          <p><Link href="/recherche" className="search-entry">Explorer la recherche de démonstration →</Link></p>
          <div className="hero-note"><span aria-hidden="true">◌</span> Projet en construction · Fondations techniques</div>
        </section>
        <section className="approach" aria-labelledby="approche"><div className="section-title"><p className="eyebrow">UNE DÉMARCHE CLAIRE</p><h2 id="approche">Du premier signal à la prochaine action.</h2></div><div className="cards">{steps.map(([number, title, text]) => <article className="card" key={number}><span className="number">{number}</span><h3>{title}</h3><p>{text}</p><span className="future">{number === "01" ? "Démo disponible" : "À venir"}</span></article>)}</div></section>
        <section className="progress" id="avancement" aria-labelledby="etat"><div><p className="eyebrow">AVANCEMENT DU PROJET</p><h2 id="etat">La recherche prend forme.</h2><p>Explorez les filtres et les résultats de démonstration. Les sources réelles et la gestion des prospects seront ajoutées progressivement.</p></div><span className="badge">Itération 03 · Recherche</span></section>
      </main>
      <footer><span>Prospeo © 2026</span><span>Recherche B2B · France</span></footer>
    </div>
  );
}
