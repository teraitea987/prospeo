# Itération 03 — Interface de recherche

Date : 20 octobre 2026 (Europe/Paris).
Statut : DONE technique, validation humaine en attente.
Autorisation : validation de 02, commit/push de 02 puis passage à 03.
02 livrée : 58bb449 sur origin/codex/iteration-02.
03 : branche codex/iteration-03, aucun commit/push autorisé après réalisation.

## Périmètre
Route /recherche, formulaire français accessible, mots-clés, ville, secteur et effectif.
Douze entreprises fictives, six résultats par page, filtre insensible aux accents/casse.
Pagination déterministe, remise à zéro, états initial/chargement/erreur/retry/vide/résultats.
Annulation de la requête précédente et lors de la réinitialisation pour éviter les réponses périmées.
Accueil actualisé avec lien de démonstration et avancement cohérent.
Aucune nouvelle dépendance, modification DB, identité, collecte ou source réelle.
Filtres géographiques avancés, rayon, ancienneté et statut restent hors de cette interface minimale.

## Sécurité et architecture
Contrat Zod commun, validation obligatoire par route GET /api/recherche.
Paramètres inconnus/répétés, valeurs hors contrat et URL >2048 caractères rejetés.
Page 1–999, résultats bornés à six ; page supérieure ramenée à la dernière page existante.
Route publique sur fixtures statiques non sensibles, aucune propriété issue du client.
Aucun accès repository/DB, aucun contexte local de 02 utilisé ou contourné.
Avant raccordement réel, ajouter identité, workspace fiable, quotas et contrôles nécessaires.
Contenu échappé React, erreurs génériques, réponse no-store, aucune mutation ou URL visitée.

## Vérifications
Lint, TypeScript, 10 tests unitaires et build : PASS.
7 tests PostgreSQL de non-régression : PASS.
Audit : aucune vulnérabilité connue signalée.
Revue visuelle des captures ordinateur/mobile : aucun débordement constaté.
Premier E2E : 6 réussis, 2 échoués sur sélection ambiguë role=alert.
L’annonceur Next et l’alerte métier avaient le même rôle ; filtre par contenu ajouté au test.
Relance finale : 8 E2E réussis, ordinateur et mobile, aucun échec.
Tests navigateur : filtres, pagination, vide/reset, chargement, erreur/retry, clavier, validation directe serveur.

## Suite
Attendre validation de 03 avant 04. Choisir fournisseur, droits d’usage, quotas et budget,
et assurer le contrôle d’accès avant toute persistance de données réelles.
Ne pas pousser 03 ou commencer 04 automatiquement. Aucun service payant ou déploiement.

Validation reçue : commit/push de 03 puis passage à 04 autorisés.
