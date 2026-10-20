# Mémoire opérationnelle — Prospeo

Dernière mise à jour : 20 octobre 2026, Europe/Paris.

## Projet
Recherche et qualification B2B, France, français ; usage personnel puis SaaS.
Dépôt officiel unique et privé : https://github.com/teraitea987/prospeo.

## Itération
00 validée par l’utilisateur. 01 DONE techniquement ; validation humaine en attente.
Aucune autorisation de commencer 02. Préférence explicite : ne pas utiliser Sites.
Terminé : accueil français responsive, Next.js App Router, TypeScript strict,
Tailwind, Zod, configuration ESLint et tests Vitest/Playwright.
Incomplet volontairement : DB, recherche, fournisseurs, qualification, identité et déploiement.

## Architecture actuelle
Accueil statique sans données ni interaction métier ; liens de navigation internes.
Configuration serveur validée par Zod, champs inconnus exclus, erreur sans valeur sensible.
En-têtes HTTP dans next.config.ts ; configuration locale loopback.
Versions exactes et pnpm-lock.yaml ; aucune police ni image distante.
La structure métier cible reste décrite dans docs/ARCHITECTURE.md et n’est pas encore créée.

## Carte des fichiers
- AGENTS.md : reprise, sécurité, Git, arrêt, préférence sans Sites.
- ROADMAP.md / SECURITY.md : progression et exigences de sécurité.
- README.md : installation locale et commandes de vérification.
- package.json / pnpm-lock.yaml / pnpm-workspace.yaml : outils et versions.
- tsconfig.json / eslint.config.mjs : TypeScript strict et lint TypeScript/React Hooks.
- src/app/ : layout français, page et styles Tailwind/CSS responsive.
- src/server/config/ : environnement et en-têtes de sécurité.
- tests/unit/ : configuration et politique des en-têtes.
- tests/e2e/ : parcours clavier, mobile/ordinateur, erreurs navigateur et HTTP réel.
- playwright.config.ts / vitest.config.ts : configurations de tests.
- docs/iterations/ITERATION-00*.md : historique du cadrage et de Git.
- docs/iterations/STATE-AFTER-00.md : mémoire antérieure archivée sans perte.
- docs/iterations/ITERATION-01.md : bilan et incidents de l’itération actuelle.

## Décisions techniques
Node 24, pnpm 11.25.0, Next 16.4.2, React 19.3.1, TypeScript 5.9.3,
Tailwind 4.3.3, Zod 4.6.7, Vitest 5.0.5, Playwright 1.64.1.
ESLint 10 + typescript-eslint + React Hooks : évite la dépendance braces vulnérable
apportée par eslint-config-next ; aucune suppression d’alerte d’audit.
TypeScript 7 initialement résolu a été remplacé par 5.9 compatible avec typescript-eslint.
shadcn/ui non ajouté : aucun composant interactif ne le nécessite à ce stade.
Pas de Docker/Prisma avant 02 ni d’authentification prématurée.

## Git et outils
Branche de livraison : codex/iteration-01.
Le commit initial regroupe le cadrage 00, le complément Git et les fondations 01.
Origin officiel ; ls-remote réussi sans référence distante à la reprise de 01.
Commit et push de cette branche explicitement autorisés par l’utilisateur après 01.
Aucun merge ni changement de visibilité autorisé.
Git 2.39.5 ; gh 2.102.1 dans ~/.local/bin, accès keyring configuré précédemment.
Node fourni hors PATH : /Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.
pnpm fourni par le runtime ; Docker toujours non vérifié et requis à 02.
Chromium Playwright installé dans le cache utilisateur pour les tests locaux.

## Commandes
Avec Node et pnpm dans PATH :
- pnpm install --frozen-lockfile
- pnpm dev : http://127.0.0.1:3000
- pnpm lint ; pnpm typecheck ; pnpm test
- pnpm build ; pnpm start
- pnpm exec playwright install chromium ; pnpm test:e2e (nécessite build à jour, port 3100 libre)
- pnpm audit ; pnpm peers check
Aucune variable d’environnement requise ; .env.example sans secret.

## Derniers contrôles
Premiers tests : 4 unitaires et 2 parcours navigateur réussis ; build réussi.
Premier lint : 1 erreur Link et 1 avertissement export ; corrigés.
Premier audit : 1 high braces (outillage), production sans alerte ; chaîne supprimée.
Vérifications finales : installation frozen, peers, lint, TypeScript, 4 tests unitaires,
build et 2 parcours navigateur PASS ; audit complet sans vulnérabilité connue.
Revue visuelle des captures ordinateur/mobile : aucune anomalie constatée.
Serveur dev : HTTP 200 ; serveur de vérification arrêté après le contrôle.

## Risques ouverts
CSP autorise unsafe-inline pour Next ; unsafe-eval seulement en développement.
CSP à durcir avant exposition sensible ; aucune identité ou autorisation applicative encore présente.
Ne pas exposer cette version locale ni y introduire de données réelles.
Futurs risques SSRF, propriété, licences/API et données personnelles : SECURITY.md.
Accord explicite reçu pour le commit et le push de codex/iteration-01 ; pas de poursuite de 02.

## Prochaine action
Attendre la validation humaine de 01. Prochaine itération proposée : 02, modèle de données.
Ne pas commencer 02 automatiquement.
