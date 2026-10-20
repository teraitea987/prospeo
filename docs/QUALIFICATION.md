# Qualification — Règles v1.0

Règles approuvées explicitement par l’utilisateur le 20 octobre 2026.
Périmètre : constat manuel temporaire, sans stockage ni visite automatique de site.

| Constat manuel | Score d’opportunité | Interprétation |
| --- | --- | --- |
| Inconnu / non examiné | Inconnu (null) | Aucun besoin ne peut être déduit |
| Aucun site identifié | 80/100 | Piste de création, absence non démontrée |
| Site existant avec besoin de refonte constaté | 40/100 | Hypothèse de refonte à confirmer |
| Site existant sans besoin constaté | 0/100 | Aucun signal identifié lors de cet examen |
| Constat de plus de 90 jours | Inconnu (null) | Revérification nécessaire |

Un score de zéro n’est pas un statut inconnu. Tous les scores sont des hypothèses
commerciales, jamais une preuve de besoin ni une prédiction de vente.
Le ciblage petites sociétés/artisans de 04 ne donne aucun point automatiquement.
Les données actuellement collectées par l’adaptateur ne renseignent pas de site :
chaque société commence avec une présence inconnue et aucun score.

Un constat exige une URL HTTP(S) de source sans identifiants et une date valide non future.
Pour un site existant, URL du site et commentaire de 10–500 caractères obligatoires.
L’absence d’identification d’un site est une observation limitée à la recherche manuelle déclarée,
pas une preuve que le site n’existe pas ; la formulation dans l’interface conserve cette nuance.
Le niveau de confiance vaut faible si inconnu/périmé, moyen si constat manuel récent,
sans vérification indépendante. Aucun constat manuel n’est présenté comme fait vérifié par Prospeo.

Fraîcheur calculée en jours calendaires UTC : 90 jours admis, 91 jours périmé.
Le moteur est une fonction pure avec une date injectable pour tests déterministes.
Les URLs sont validées et affichées comme liens sur clic explicite, jamais visitées par le moteur.
Aucun HTML utilisateur interprété. Aucun compte, fournisseur ou dépendance ajouté.

Les données manuelles restent en mémoire de composant dans la page ; nouvelle recherche,
pagination ou rechargement les suppriment. Aucune écriture DB, API de mutation, localStorage
ou journalisation des sources/commentaires n’est ajoutée à cette itération.
Les futures sauvegardes devront valider côté serveur, autoriser l’acteur/workspace et conserver
provenance, version de règle et dates ; les résultats du navigateur ne sont pas fiables pour le serveur.
L’analyse technique et les visites de sites restent réservées à 06 après protections SSRF.
