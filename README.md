# Prospeo

Plateforme de recherche et qualification B2B, développée une itération à la fois.
Itération 01 : accueil français et fondations techniques uniquement.
Aucune recherche opérationnelle, base, API externe ou authentification.

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

Ouvrir http://127.0.0.1:3000. Aucun `.env` requis ; `.env.example` décrit cet état.
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
