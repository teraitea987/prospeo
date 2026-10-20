# Itération 05 — Qualification

Date : 20 octobre 2026 (Europe/Paris).
Statut : DONE, validée par l’utilisateur le 20 octobre 2026.
04 validée et poussée : 6d3f0ab sur codex/iteration-04.
05 sur branche codex/iteration-05 ; commit/push et démarrage de 06 autorisés explicitement.

## Règles et périmètre autorisés
Validation explicite utilisateur : inconnu sans constat ; 80 si aucun site identifié,
40 si site avec refonte constatée, 0 si aucun besoin constaté ; source/date obligatoires,
revérification après 90 jours, score présenté comme hypothèse commerciale.
Le libellé « aucun site identifié » évite d’affirmer une absence absolue sans preuve.
L’adaptateur actuel ne renseigne pas le site : aucun score automatique fabriqué.
Aucun score de besoin déduit du code NAF, de la taille ou du ciblage artisanal.

Moteur pur Zod versionné 1.0, date injectable, bornes et fraîcheur explicites.
Module UI par société : état inconnu, formulaire manuel, score, explication, confiance et source/date.
Présence d’un site déclarée via URL pour les cas de refonte ou d’absence de besoin.
Validation des dates, source HTTP(S) sans credentials, commentaire borné.
Aucune visite automatique, persistance, mutation serveur ou nouvelle dépendance.
La qualification temporaire disparaît au rechargement, pagination ou nouvelle recherche.
Les futures analyses/sauvegardes relèvent de 06/07 avec leurs contrôles indispensables.

## Vérifications prévues
Unitaires : inconnus, 0/40/80, bornes, déterminisme, provenance, dates 90/91 jours,
dates impossibles/futures, URLs dangereuses et contradictions (absence + site déclaré).
E2E local : carte inconnue, déclaration source/date, score 80 puis 0, expiration,
aucune visite de source/site, aucune persistance après rechargement.
Lint, TypeScript, build, suites navigateur, non-régression DB et audit selon périmètre.
Voir docs/QUALIFICATION.md pour règles, limites et distinction observation/hypothèse.

## Suite
Validation reçue : poursuivre avec 06 sur une branche dédiée. Aucun déploiement autorisé.

## Résultats
Lint, TypeScript et build production : PASS.
30 tests unitaires (dont 5 dédiés au moteur) : PASS.
10 E2E production et 8 E2E locaux (Chrome desktop et mobile) : PASS.
Le scénario qualification prouve inconnu → 80 → 0 → périmé, avec source/date,
absence de visite automatique et perte des données au rechargement.
Revue visuelle de la carte initiale, contrôle Git et nouveaux fichiers : PASS.
Aucun secret local détecté dans les sources, aucune dépendance ajoutée.
Suites DB/live et audit non rejoués : pas de modification DB, fournisseur ou dépendance.
Aucun échec rencontré dans ces contrôles. Validation humaine et autorisation Git reçues après ces résultats.
