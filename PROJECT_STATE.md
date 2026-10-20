# Mémoire opérationnelle — Prospeo

Dernière mise à jour : 20 octobre 2026 (Europe/Paris).

## Projet et progression
Prospection B2B, France, français. Usage personnel, SaaS ultérieur.
Dépôt officiel privé : https://github.com/teraitea987/prospeo.
00 et 01 validées. 02 validée par l’utilisateur.
Aucune itération active. 03 non commencée. Ne pas utiliser Sites.

## Terminé
Accueil français responsive et fondations Next/TypeScript strict/Tailwind/Zod.
PostgreSQL local Docker Compose, Prisma, migration initiale et client généré.
Workspace, Company, Search, SearchResult, Observation et Prospect.
Propriété composite workspace/id et relations empêchant les références entre propriétaires.
Repository entreprise borné et validé ; stockage de la provenance et confiance.
Contexte local explicite et interdit hors développement. Aucun endpoint de données exposé.

## Incomplet volontairement
Interface de recherche, source réelle, qualification, analyse réseau, gestion commerciale.
Authentification, User/Membership, notes, rôles, RLS et déploiement.
Aucune donnée réelle persistée et aucune API externe raccordée.

## Architecture actuelle
UI statique indépendante de la DB. Module DB server-only, adaptateur PrismaPg.
Repository reçoit un contexte serveur ; le workspace ne vient pas du corps d’une requête.
Zod valide les entrées et refuse les champs inconnus ; listes limitées à 100.
Relations SQL composites et suppressions RESTRICT ; CHECK SIREN/nom/dates.
URL de provenance stockée, jamais visitée. Pas de garantie SSRF avant 06.
Structure cible : docs/ARCHITECTURE.md ; invariants : docs/DATA_MODEL.md.

## Carte des fichiers
- AGENTS.md : reprise et règles permanentes ; ROADMAP.md : périmètres et validation.
- SECURITY.md : menaces, contrôles actuels et limites.
- README.md : installation, commandes et restrictions locales.
- src/app/ : accueil, layout et CSS ; src/server/config/ : environnement/en-têtes.
- compose.yaml : PostgreSQL loopback avec volume persistant, image figée par digest.
- prisma/schema.prisma et prisma/migrations/ : schéma et migration versionnée.
- prisma.config.ts : URL DB côté serveur, sans chargement implicite de secrets.
- src/server/db/ : client et repository entreprise server-only.
- src/server/auth/local-context.ts : opt-in développement, aucun bypass production.
- scripts/setup-local-db.mjs : .env aléatoire 0600, refus d’écrasement.
- tests/unit/, tests/integration/, tests/e2e/ : configuration, DB réelle et navigateur.
- docs/iterations/ITERATION-02.md : bilan et incidents.
- docs/iterations/STATE-AFTER-00.md et STATE-AFTER-01.md : mémoires archivées.

## Versions et décisions
Node 24, pnpm 11.25.0, Next 16.4.2, React 19.3.1, TypeScript 5.9.3.
Tailwind 4.3.3, Zod 4.6.7, Vitest 5.0.5, Playwright 1.64.1.
ESLint 10 + typescript-eslint + React Hooks (sans chaîne braces de eslint-config-next).
Prisma/client/adapter-pg 7.10.1, pg 8.23.1, PostgreSQL 17.11.
Compte PostgreSQL local d’initialisation à privilèges étendus, uniquement fixtures.
User/Membership/Note reportés à leurs périmètres ; pas d’administration SaaS anticipée.
shadcn/ui toujours inutile à ce stade, aucune dépendance ajoutée pour l’interface.

## Environnement et Git
Branche codex/iteration-02 issue de d4be92f (01, commité/poussé sur accord antérieur).
Commit et push de 02 autorisés ; aucun merge ni changement GitHub demandé.
GitHub a automatiquement choisi codex/iteration-01 comme branche par défaut au premier push.
Docker Desktop 4.96.0 installé sur autorisation explicite, moteur opérationnel.
Installation Homebrew --no-binaries ; Docker 29.9.1, Compose 5.6.0.
Liens CLI dans ~/.local/bin et plugin dans ~/.docker/cli-plugins, sans sudo.
Node fourni hors PATH : /Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin.
Ajouter ce dossier et ~/.local/bin au PATH dans ce runtime.
PostgreSQL local actif sur 127.0.0.1:5432, volume prospeo_postgres_data conservé.
.env privé local ignoré ; aucune valeur de secret publiée. Client généré ignoré.

## Commandes
- pnpm install --frozen-lockfile (génère le client Prisma via postinstall).
- pnpm dev ; pnpm build ; pnpm start (loopback).
- pnpm lint ; pnpm typecheck ; pnpm test ; pnpm test:e2e (build préalable).
- pnpm db:setup (une seule fois, refuse d’écraser .env).
- pnpm db:up ; pnpm db:migrate ; pnpm db:validate ; pnpm db:generate.
- pnpm test:integration (DB locale prospeo uniquement, nettoyage limité aux fixtures).
- pnpm db:stop (préserve le volume) ; pnpm audit ; pnpm peers check.
Ne pas lancer reset, truncate ou down -v sur des données à conserver.

## Derniers résultats
Prisma validate/generate et migration depuis base neuve : PASS.
Lint, TypeScript, installation frozen et peers : PASS.
6 unitaires, 7 intégration PostgreSQL, 2 E2E ordinateur/mobile : PASS.
Build production : PASS ; audit JS complet : aucune vulnérabilité connue signalée.
Tests DB : isolation lectures, surcharges refusées, provenance, FK croisées, unicité et CHECK.
Les résultats ne constituent pas un audit de sécurité complet.

## Risques ouverts et suite
CSP autorise inline Next et eval uniquement en dev ; durcissement avant exposition sensible.
Pas d’identité authentifiée ni RLS ; ne pas exposer d’accès réel aux données.
Séparer rôles applicatif/migration PostgreSQL avant exploitation ; sauvegardes à 08.
03 autorisée après livraison Git de 02 (formulaire et résultats fictifs).
Aucun push ni merge de cette itération sans accord explicite.
