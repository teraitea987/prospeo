# Référentiel postal local

Source : API Découpage administratif de l’État, champs nom et codesPostaux.
URL : https://geo.api.gouv.fr/communes?fields=nom,codesPostaux&format=json
Documentation : https://geo.api.gouv.fr/decoupage-administratif/communes
Récupération initiale : 20 octobre 2026 ; 6310 codes distincts.
Fichier : src/server/reference/postal-codes.json, regroupement des communes par code.
Plusieurs communes peuvent partager un code, et une commune avoir plusieurs codes.
Il s’agit des codes des communes du référentiel, pas d’un annuaire exhaustif CEDEX.

Mise à jour manuelle : `node scripts/update-postal-reference.mjs`.
Le script valide la réponse et sa taille avant écriture ; examiner le diff avant commit.
Aucun appel externe pendant la saisie utilisateur. L’API locale renvoie au plus huit
suggestions à partir de deux caractères ; recherche par préfixe postal ou nom de commune.
Les suggestions sont limitées : continuer à saisir pour affiner, une commune peut avoir
plus de huit codes. La saisie d’un code complet valide reste possible sans sélection.
La route locale utilise les mêmes restrictions d’accès que la recherche réelle.
Une valeur non vide doit être un code connu avant toute recherche fournisseur.
Un référentiel peut vieillir : actualiser le fichier si un code récent n’est pas reconnu.
