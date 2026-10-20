# Itération 01 — Fondations

Date : 20 octobre 2026 (Europe/Paris).
Statut : DONE technique, validation humaine en attente. 02 non commencée.
Autorisation : « validé » sur le cadrage 00. Préférence reçue : aucun skill Sites.
Le skill Sites a été lu initialement, puis abandonné à la demande utilisateur ;
aucun outil/service Sites, enregistrement ou publication n’a été utilisé.

## Livré
Next.js App Router français, accueil responsive, Tailwind, TypeScript strict,
Zod pour la configuration serveur, ESLint TypeScript/React Hooks, Vitest et Playwright.
Versions directes exactes, lockfile pnpm, README, .env.example sans secret,
ignore des secrets et sorties locales. Serveurs limités au loopback.
En-têtes HTTP : CSP, nosniff, DENY, no-referrer et permissions restreintes.
Pas de recherche, donnée réelle, DB, fournisseur, identité ou déploiement.
shadcn/ui n’est pas ajouté en l’absence de besoin de composant interactif.

## Vérifications finales
- pnpm install --frozen-lockfile : PASS.
- pnpm peers check : PASS, aucun conflit.
- pnpm lint : PASS, zéro avertissement.
- pnpm typecheck : PASS.
- pnpm test : PASS, 4 tests dans 2 fichiers.
- pnpm audit : PASS, aucune vulnérabilité connue, dépendances dev comprises.
- pnpm build : PASS, accueil pré-rendu statique.
- pnpm test:e2e : PASS, 2 parcours Chromium (ordinateur et Pixel 7 émulé).
- Parcours : langue, H1, clavier/lien d’évitement, ancre, absence de débordement horizontal,
  erreurs JS et en-têtes HTTP réels ; captures générées dans test-results/ (ignoré).
- Revue visuelle des deux captures : disposition lisible sans anomalie constatée.
- pnpm dev : réponse HTTP 200 sur 127.0.0.1:3000 ; serveur de vérification arrêté ensuite.
- git check-ignore : secrets et sorties exclus ; exemple conservé.
- Vérification du contenu des fichiers non suivis et git diff --check à la clôture.

## Incidents et corrections
Première installation : scripts unrs-resolver bloqués par pnpm. Leur exécution n’a pas été autorisée ;
la dépendance a ensuite disparu avec le remplacement de la configuration ESLint.
Premier lint : lien accueil HTML remplacé par next/link et export PostCSS nommé.
Premier audit : 1 high braces sans correctif (GHSA-vfj7-8cjw-p6xm), uniquement outillage.
La suppression de eslint-config-next a retiré la chaîne vulnérable ; aucune alerte ignorée.
ESLint 10 initialement incompatible avec plugins Next ; configuration ciblée actuelle compatible.
TypeScript 7 résolu initialement remplacé par 5.9.3, supporté par typescript-eslint.
Avertissement Vite sur module CommonJS corrigé avec type=module.
Avertissements NO_COLOR/FORCE_COLOR de l’environnement pendant Playwright : non bloquants.

## Risques et suite
CSP permissive pour inline Next ; durcissement à prévoir avant exposition sensible.
Aucune authentification : usage strictement local, sans données réelles.
Validation humaine requise avant 02 (PostgreSQL/Prisma et tests de propriété).
Docker est un prérequis de 02, pas installé ici.
Dépôt officiel consulté par ls-remote : succès, toujours sans référence distante.
Branche codex/iteration-01 ; documents existants préservés ; mémoire précédente archivée.
Aucun commit, push, merge, changement de visibilité ou service payant.

## Livraison Git autorisée
Après le bilan, l’utilisateur a demandé « commit et push ».
Le commit initial inclut les documents 00 et les fondations 01 sur codex/iteration-01.
Identité locale issue du compte GitHub connecté, avec adresse noreply GitHub.
Aucune intégration à main ni poursuite de 02 n’est incluse dans cette autorisation.
