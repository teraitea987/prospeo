# Itération 02 — Modèle de données

Date : 20 octobre 2026, Europe/Paris.
Statut : DONE technique ; validation humaine en attente.
Autorisation : 01 validée, passage à 02 et installation Docker explicitement demandés.
Branche : codex/iteration-02 depuis d4be92f ; aucun commit/push pour 02.

## Réalisé
PostgreSQL Compose avec volume et exposition loopback, mot de passe généré dans .env privé,
Prisma 7.10.1 avec adapter-pg, génération du client, schéma et migration SQL initiale.
Workspace, entreprises, recherches, résultats, observations et prospects.
Clés et relations composites pour empêcher les références entre propriétaires.
CHECK PostgreSQL pour SIREN, nom non vide et ordre des dates.
Repository entreprise server-only, validation Zod stricte et listes bornées.
Contexte local avec opt-in explicite, refus en production et test ; aucune route exposée.
Provenance, collecte/vérification, confiance et distinction fait/hypothèse/inconnu.
Documentation : README, modèle, architecture, sécurité, mémoire et roadmap.

## Vérifications
- Prisma generate/validate et génération SQL depuis schéma vide : PASS.
- Deuxième migrate deploy : PASS, aucune migration en attente.
- Installation frozen et peers : PASS.
- Lint, TypeScript, 6 unitaires : PASS.
- Build production, 2 E2E ordinateur/mobile : PASS.
- Audit complet : aucune vulnérabilité connue signalée.
- Migration réelle sur base neuve et 7 tests d’intégration PostgreSQL : PASS.
- Les fixtures d’intégration sont uniques et le nettoyage ne vise que leurs deux workspaces.
- Aucun reset, truncate ou effacement de volume effectué.
- Revue Git et fichiers nouveaux : aucun secret local, conflit ou espace final ; .env en 0600.

## Installation Docker
Première tentative Homebrew annulée faute de sudo pour /usr/local/cli-plugins.
Deuxième tentative --no-binaries réussie : Docker Desktop 4.96.0 dans /Applications/Docker.app.
Liens CLI dans le dossier utilisateur, sans élévation : Docker 29.9.1, Compose 5.6.0.
Application ouverte ; premier docker info échoue sur socket absente ; desktop status indique stopping.
Le moteur est ensuite passé à running sans intervention supplémentaire.
Un lien utilisateur docker-credential-desktop a corrigé le PATH du helper.
Aucune acceptation automatique de conditions ni contournement de sécurité macOS.

## Limites et suite
Pas d’identité authentifiée, RLS ni accès à des données réelles.
Compte DB local à privilèges étendus ; séparation des rôles avant exploitation.
User/Membership/Note reportés à leurs itérations utiles, sans administration SaaS anticipée.
SourceUrl stockée uniquement : aucune visite réseau.
CSP de 01 inchangée ; aucun déploiement ou service payant.
PostgreSQL 17.11 démarré sur loopback, image épinglée par digest.
Migration appliquée sur volume neuf ; fixtures nettoyées après les tests.
Attendre validation humaine avant 03. Aucun commit/push de 02.

Validation reçue : commit et push de 02 autorisés, puis démarrage de 03.
