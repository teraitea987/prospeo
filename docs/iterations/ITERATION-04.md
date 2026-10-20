# Itération 04 — Première source réelle

Date : 20 octobre 2026 (Europe/Paris).
Statut : DONE technique, validation humaine en attente.
03 validée, commit/push réalisés : d08553f sur codex/iteration-03.
04 sur codex/iteration-04 ; aucun commit/push autorisé pour cette itération.
Choix explicite : API publique Recherche d’entreprises, budget 0 €, sans stockage.

## Livré
Adaptateur serveur vers hôte HTTPS officiel constant, validation Zod, pagination bornée.
Recherche par nom avec code postal et NAF ; requête SIREN/SIRET seul refusée car le fournisseur ignore ses filtres.
Dix entrées brutes/page, jusqu’à 99 pages ; projection des sociétés 5xxx et statut O seulement.
Les catégories étrangères, associations et entrepreneurs individuels sont hors de ce périmètre minimal.
Une page peut devenir vide après exclusion ; total fournisseur et nombre exclu affichés explicitement.
Source, fiche officielle, collecte, confiance moyenne et absence de vérification indépendante.
Aucun dirigeant/contact/adresse complète, DB, sauvegarde de réponse, score ou analyse de site.

Interface /recherche/reelle distincte des fixtures, protégée avec l’API par contrôle local.
Opt-in développement et HTTP Basic, mot de passe aléatoire privé .env, setup sans écrasement.
Identifiant local prospeo ; authentification fermée hors développement même si activée.
Pas de session ou administration SaaS anticipée, ni d’accès aux workspaces privés.

## Limites et conditions fournisseur
Documentation officielle consultée le 20 octobre 2026 : 7 requêtes/s/IP et 30/s/ASN maximum,
priorité aux services publics, aucune disponibilité ou capacité garantie.
Le code applique une borne plus basse : 1 simultanée, 1/s, 20/min par processus local.
429 bloque selon Retry-After (secondes/date), aucun retry automatique ni contournement.
Timeout global 8 s, réponse décompressée bornée 512000 octets et redirections refusées.
Les limites mémoire conviennent uniquement au processus local unique.
Sirene diffusé sous Licence Ouverte 2.0 ; attribution conservée. Ce choix n’autorise pas
une réutilisation personnelle ou commerciale sans respecter les obligations applicables.
Pas de collecte de contacts ou de persistance à cette étape, conformément à l’arbitrage utilisateur.
Sources : https://recherche-entreprises.api.gouv.fr/docs/ et
https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret.

## Vérifications et incidents
17 tests unitaires : PASS (filtrage, minimisation, auth, bornes, concurrence, quota, timeout, 429 et réponses invalides).
10 parcours E2E production et 2 parcours E2E locaux authentifiés : PASS.
Un appel contractuel réel explicite : PASS, sans données conservées.
Premier typage/build échoué : signature ProcessEnv trop restrictive pour fixtures ; corrigée en Record.
Premier E2E local échoué : contexte censé anonyme héritait des credentials Playwright,
entraînant deux appels réels supplémentaires au lieu de 401. Contexte explicitement invalide corrigé ; relance PASS.
Premier E2E production non exécutable après build échoué ; build corrigé puis 10 tests PASS.
Test live séparé du test par défaut, aucune source réelle appelée par les tests unitaires.
Quota et test réel n’ont pas été contournés. Aucune donnée utilisateur écrasée.
Lint/typecheck finaux, build, audit complet et 7 tests PostgreSQL : PASS.
Revue sources et bundles client : aucun secret local détecté, conflits/espaces finaux absents.
Revue visuelle ordinateur/mobile sur fixtures simulées : aucune anomalie constatée.

## Suite
Validation de 04 puis arbitrage des règles de qualification avant 05.
Aucun déploiement ou intégration à main ; aucun skill Sites utilisé.

## Corrections demandées avant validation
L’utilisateur signale focus impossible dans la recherche réelle sous Chrome,
champs perçus comme tous obligatoires et absence d’autocomplétion postale.
Le nom était effectivement obligatoire en HTML et Zod : il est désormais facultatif,
comme postal et NAF. Au moins un critère reste requis ; les paramètres vides sont omis chez le fournisseur.
Autocomplétion locale par code ou commune, navigation fléchée/Entrée/Échap,
sélection souris préservant le focus, annulation des requêtes périmées.
6310 codes issus de geo.api.gouv.fr, sans appel réseau externe par frappe.
Validation côté serveur sur référentiel, suggestions authentifiées et bornées à huit.
Le blocage de focus n’est pas reproduit sur le serveur principal lors du premier diagnostic
(clic et saisie dans #real-q fonctionnels, sans erreur JavaScript détectée).
Ajout de tests clic/saisie/focus des trois champs, filtres postal/NAF seuls et suggestions.
Projet desktop local Playwright configuré avec channel=chrome pour utiliser Chrome installé.
Voir docs/POSTAL_REFERENCE.md pour provenance, limites et actualisation du référentiel.
Vérifications correctif : 20 unitaires, 10 E2E production, lint, TypeScript et build PASS.
Un appel live ciblé code postal seul PASS ; test nom seul ignoré dans cette exécution ciblée.
Lint initial du script postal : globals Node non déclarés ; imports/déclarations corrigés.
Serveur principal redémarré pour servir les corrections ; retour utilisateur positif sur le focus reçu après redémarrage.

Correctif E2E local : 4 PASS, Chrome installé sur desktop et Chromium sur mobile.
Le focus signalé n’a pas été reproduit ; utilisateur confirme ensuite « Oui, le focus fonctionne » après redémarrage.

## Correctif du filtre postal : siège et établissement
Signalement : impression de résultats identiques pour tous les codes postaux.
Reproduction réelle : 69003 et 20600 ont des totaux différents mais plusieurs SIREN communs.
Cause : grands groupes multi-établissements correctement filtrés par l’API, puis ville du siège
utilisée pour l’affichage. Le mode minimal excluait matching_etablissements de la réponse.
Correctif : inclure les établissements correspondants (max 10 par société), sélectionner
un établissement actif avec SIRET et code postal exact ; sinon exclure la société affichée.
Le siège actif peut servir de correspondance uniquement si son code postal est identique.
Afficher SIRET, commune et code de l’établissement, puis siège distinctement étiqueté.
Sans filtre postal, continuer à afficher le siège explicitement étiqueté.
Les sociétés communes aux deux lieux restent légitimes ; ne pas les supprimer artificiellement.
Les établissements non retournés dans les dix premières correspondances ne sont pas parcourus :
une société peut être exclue par prudence si aucune correspondance active n’est démontrée.
Source documentaire : https://recherche-entreprises.api.gouv.fr/docs/.
Correctif : lint, TypeScript, build et 22 unitaires PASS.
Contrat live Lyon/Bastia PASS (deux appels, même provider et délai respecté) ; deux autres tests live ignorés par ciblage.
10 E2E production PASS ; 6 E2E locaux PASS, dont changement de code dans Chrome et mobile.
Revue des fichiers et Git : aucun secret local, conflit ou espace final.

## Ajustement du ciblage : petites sociétés et artisans
Demande utilisateur : exclure les grandes sociétés et favoriser les petits artisans.
Par défaut, API filtrée PME et effectifs 00/01/02/03 ; pas de tri favorisant les grands réseaux.
Le serveur contrôle catégorie et effectif de la société entière, et exige 1–3 établissements ouverts.
Les petites agences d’une GE/ETI ou d’un réseau déclaré trop étendu restent exclues.
La taille inconnue est exclue : baisse de couverture assumée et visible dans le formulaire.
Les liens capitalistiques ne sont pas fournis/vérifiés : une filiale classée PME peut rester éligible.
Un code d’activité au registre des métiers déclaré sur le siège ou établissement affiché
produit un badge et un passage en tête dans la page courante, sans modifier la pagination fournisseur.
Ce ciblage ne démontre aucun besoin de site, aucun score de qualification n’est créé.
Le périmètre précédent de sociétés 5xxx diffusibles est conservé, sans entrepreneur individuel.
Les indépendants/personnes physiques nécessiteront un périmètre données adapté.
Références : https://recherche-entreprises.api.gouv.fr/docs/ et
https://www.insee.fr/fr/information/1896441.
Vérifications de clôture à consigner après exécution.

La première vérification live du seul filtre de taille a échoué sur deux tests (page vide) :
l’API continuait à placer des réseaux de plusieurs dizaines d’établissements en tête.
Ajout d’une présélection explicite NAF de métiers de proximité, activée par défaut dans
un sélecteur ; alternative « Toutes les petites sociétés », avec risque de pages exclues.
Un NAF précis remplace la présélection. Liste non exhaustive, pas de déduction d’artisanat
à partir du nom de société ; le badge reste fondé sur le registre des métiers déclaré.
Une priorité locale dans une page ne garantit pas que tous les artisans soient en première page.

Clôture ciblage : lint, TypeScript, build, 25 unitaires, 10 E2E production,
6 E2E locaux et 3 contrats live PASS. Pas de dépendance ou donnée personnelle ajoutée.
Revue Git/fichiers : aucun secret local, conflit ou espace final. Aucun commit/push.

Validation finale reçue : commit/push de 04 et démarrage de 05 autorisés.
