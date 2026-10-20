# Prospeo

Plateforme de recherche et qualification B2B, développée une itération à la fois.
Itération 02 : accueil français et fondations de données PostgreSQL/Prisma.
Aucune recherche opérationnelle, API externe ou authentification.

## Développement local

Prérequis : Node.js 24 et pnpm 11.25.0 (champ `packageManager`).
Avec un gestionnaire de versions Node : `nvm use`, puis rendre pnpm disponible.
Dans Codex, si Node est absent du PATH :

```sh
export PATH="/Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir http://127.0.0.1:3000. La page d’accueil fonctionne sans DB ; `.env` est requis pour les commandes de données.
`pnpm start` démarre la version compilée après `pnpm build`.
Les serveurs sont liés au loopback : ne pas les exposer publiquement.

## Contrôles

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit
```

Les tests navigateur démarrent un serveur de production dédié au port 3100 :
le build doit être à jour et le port libre. Ordinateur et mobile utilisent Chromium.
Les navigateurs sont installés localement, sans service externe.
`pnpm typecheck` fonctionne avant build ; les types générés Next sont inclus lorsqu'ils existent.

## Organisation

- `src/app/` : page, layout et styles ; aucun appel réseau métier.
- `src/server/config/` : validation d'environnement et en-têtes de sécurité.
- `tests/unit/` : configuration et politique de sécurité.
- `tests/e2e/` : accueil, clavier, responsive et en-têtes HTTP réels.
- `docs/ARCHITECTURE.md` : frontières et structure cible ; les modules métier restent à créer.
- `PROJECT_STATE.md`, `ROADMAP.md`, `SECURITY.md` : reprise et exigences.

Pas de police distante, de télémétrie applicative ni de donnée réelle dans l'interface.
La CSP autorise encore les scripts inline pour l'hydratation Next ; un durcissement
avec nonces est requis avant exposition sensible. Le mode développement autorise
également eval et le WebSocket local pour Next. Ces réglages ne constituent pas un audit complet.
Aucun déploiement ni push sans accord explicite. Aucun usage du plugin Sites.

## PostgreSQL local — Itération 02

Docker Desktop doit être installé et son assistant initial terminé, puis le moteur démarré.
Sur cette machine, la CLI est dans ~/.local/bin : ajouter ce dossier au PATH si nécessaire.
Le schéma cible PostgreSQL 17.

```sh
pnpm db:setup
pnpm db:up
pnpm db:migrate
pnpm db:validate
pnpm db:generate
pnpm test:integration
```

`db:setup` crée `.env` privé avec un secret aléatoire et refuse d’écraser un fichier existant.
Ne jamais partager son contenu. Docker Compose charge ce fichier automatiquement ;
la CLI Prisma le charge explicitement pour les migrations. La génération ne requiert pas de DB.
`postinstall` génère le client ignoré par Git ; les scripts natifs Prisma seuls sont autorisés par pnpm.
Les migrations s’appliquent avec `migrate deploy`, sans reset destructeur.
Ne pas utiliser `docker compose down -v` sur des données à conserver.
`pnpm db:stop` arrête le service et préserve son volume.

PostgreSQL écoute uniquement sur 127.0.0.1:5432 ; le rôle local d’initialisation a des
privilèges étendus et reste réservé aux données synthétiques. Avant exploitation,
séparer rôle de migration et rôle applicatif au moindre privilège.
Les tests nécessitent la DB locale `prospeo`, créent deux workspaces aléatoires,
puis suppriment exclusivement leurs fixtures ; aucune base n’est vidée.
Les UUID fournis au repository proviennent du contexte serveur, jamais d’un formulaire.
Le contexte de développement exige NODE_ENV=development et opt-in explicite.
Aucune route ni action serveur de données n’est exposée à cette itération.
Le modèle ne crée pas encore de comptes, adhésions ou notes (itérations ultérieures).
Les URLs de provenance sont stockées et validées syntaxiquement, sans être visitées.
