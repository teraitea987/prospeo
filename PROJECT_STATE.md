# Mémoire opérationnelle — Prospeo

Dernière mise à jour : 20 octobre 2026 (Europe/Paris).

## Projet et progression
Prospection B2B, France, français. Usage personnel, SaaS ultérieur.
Dépôt officiel privé : https://github.com/teraitea987/prospeo.
00 à 03 validées. 04 validée, commit/push et démarrage de 05 autorisés.
Aucune itération active ; 05 non commencée. Ne pas utiliser Sites.

## Terminé
Accueil français responsive et fondations Next/TypeScript strict/Tailwind/Zod.
PostgreSQL local Docker Compose, Prisma, migration initiale et client généré.
Workspace, Company, Search, SearchResult, Observation et Prospect.
Propriété composite workspace/id et relations empêchant les références entre propriétaires.
Repository entreprise borné et validé ; stockage de la provenance et confiance.
Contexte local explicite et interdit hors développement. Aucun endpoint de données privées exposé.

## Incomplet volontairement
Qualification, analyse réseau, gestion commerciale.
Authentification, User/Membership, notes, rôles, RLS et déploiement.
Aucune donnée réelle persistée ; source officielle en lecture minimale sur opt-in local.

## Architecture actuelle
UI de démonstration indépendante de la DB. Module DB server-only, adaptateur PrismaPg.
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
02 commitée/poussée sur accord : 58bb449, branche codex/iteration-02.
03 commitée/poussée sur accord : d08553f, codex/iteration-03.
Branche de livraison : codex/iteration-04 ; commit/push autorisés.
Aucun merge ni changement GitHub demandé.
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
Attendre validation de 04 avant 05 ; règles de qualification à arbitrer.
Aucun push ni merge de cette itération sans accord explicite.

## Ajouts de 03
- /recherche : formulaire mots-clés/ville/secteur/effectif, états et pagination.
- src/modules/search/ : contrat Zod et recherche déterministe sur douze fixtures.
- /api/recherche : lecture seule, validation serveur, aucun accès privé ni DB.
- tests/unit/search.test.ts : critères, bornes, sécurité des paramètres et pagination.
- tests/e2e/search.spec.ts : parcours filtres, vide, chargement, erreur/retry et clavier.
- Lint, TypeScript, 10 unitaires, 7 intégration DB, build et 8 E2E : PASS.
- Audit sans vulnérabilité connue ; revue visuelle ordinateur/mobile sans anomalie.
- Premier E2E : 2 échecs de sélecteur ambigu role=alert, corrigés ; relance réussie.
- docs/iterations/ITERATION-03.md détaille le bilan.

## Ajouts de 04
- Source choisie et budget validés : API publique Recherche d’entreprises, 0 €, sans stockage.
- /recherche/reelle : nom/code postal/NAF, résultats avec provenance et collecte, société diffusible uniquement.
- /api/entreprises : contrôle Basic local, opt-in et refus hors développement ; aucune DB.
- src/server/providers/company-search.ts : hôte fixe, redirections refusées, Zod, projection minimale.
- src/server/auth/real-search-access.ts et src/proxy.ts : accès local pour page/API, fermé par défaut.
- Quotas par processus : 20/min, 1/s, concurrence 1 ; timeout 8 s, corps max 512000 octets.
- Confiance moyenne et absence de vérification affichées ; aucun dirigeant/contact exporté.
- .env privé contient REAL_SEARCH_ENABLED/REAL_SEARCH_PASSWORD ; jamais de secret client.
- pnpm search:setup : génère le secret local sans écraser de configuration existante.
- Login local prospeo, mot de passe à lire dans .env ; aucun secret journalisé.
- Tests : 17 unitaires, 7 PostgreSQL, 10 E2E production, 2 E2E locaux et 1 contrat live réussis.
- Les tests locaux utilisent .next-local-e2e, des réponses simulées et un port dédié 3101.
- pnpm test:live fait un appel réel explicite ; ne pas intégrer aux tests ordinaires/CI.
- Lint/typecheck, build/audit et revue des secrets sources/bundles client : PASS.
- Revue visuelle ordinateur/mobile : aucune anomalie constatée.
- docs/iterations/ITERATION-04.md et STATE-AFTER-03.md conservent bilan et mémoire précédente.
- Risques : auth Basic HTTP réservée loopback, quota mémoire non distribué, aucune session SaaS.

## Correctif formulaire — 04
- Signalement utilisateur : recherche réelle sous Chrome, focus, filtres obligatoires, codes postaux.
- Nom désormais facultatif ; un seul filtre postal ou NAF suffit, au moins un critère côté serveur.
- Autocomplétion locale code/commune : src/components/postal-autocomplete.tsx et /api/codes-postaux.
- Référentiel officiel local : 6310 codes, src/server/reference/postal-codes.json.
- Source et procédure manuelle : docs/POSTAL_REFERENCE.md, scripts/update-postal-reference.mjs.
- Validation des codes connus serveur ; pas d’appel externe pendant la saisie.
- Focus non reproduit au diagnostic sur serveur principal ; contrôles explicites des trois champs ajoutés.
- Tests locaux desktop utilisent Chrome installé ; contrôle mobile conservé.
- Test live ciblé code postal seul : PASS ; test nom seul non rejoué dans cette commande.
- Correctif : lint/typecheck/build, 20 unitaires, 10 E2E production, 4 E2E locaux PASS.
- Chrome installé : clic/saisie des trois champs et sélection des suggestions vérifiés.
- Serveur principal redémarré ; utilisateur confirme « Oui, le focus fonctionne ».
- Aucun commit/push de 04 ; 05 non commencée.

## Correctif établissement local — 04
- Cause confirmée : le filtre postal porte sur les établissements, mais l’UI affichait le siège.
- matching_etablissements demandé ; sélection d’un établissement actif avec code postal exact et SIRET.
- Sans preuve de correspondance active, la société est exclue de la page affichée.
- Carte : localisation et SIRET de l’établissement ; siège indiqué séparément.
- Sans filtre postal : localisation du siège, explicitement étiquetée.
- Un même SIREN peut rester présent dans deux codes avec des établissements/SIRET différents.
- Tests ajoutés : même société/deux codes, non-correspondance, établissement fermé, parcours navigateur.
- Correctif : lint/typecheck/build, 22 unitaires, 10 E2E production, 6 E2E locaux PASS.
- Comparaison live Lyon/Bastia : PASS, codes/SIRET locaux distincts même si SIREN commun.
- Aucun commit/push et aucune itération 05.

## Ciblage petites sociétés — 04
- Par défaut : categorie_entreprise=PME, tranches 00/01/02/03 (0–9 salariés).
- Contrôle serveur identique ; 1 à 3 établissements ouverts maximum, taille inconnue exclue.
- Activité déclarée au registre des métiers : priorité sur chaque page et badge explicite.
- Taille au niveau de la société, jamais celle d’une petite agence d’un grand groupe.
- Tranche d’effectif, année disponible et nombre d’établissements affichés.
- Societés diffusibles 5xxx conservées ; entrepreneurs individuels non inclus.
- Pas de score ni de conclusion sur la nécessité d’un site ; aucun démarrage de 05.
- Résultats : lint/typecheck/build, 25 unitaires, 16 parcours navigateur, 3 live PASS.
- Aucun commit/push pour 04.

- Présélection NAF métiers de proximité activée par défaut ; option toutes petites sociétés.
- NAF précis remplace la présélection ; liste non exhaustive, ordre artisanal limité à la page.
- Premier live taille seule : 2 échecs (pages vides de réseaux exclus), présélection ajoutée.
