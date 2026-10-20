# Modèle de données — Itération 02

PostgreSQL 17, Prisma 7.10.1 ; migration SQL versionnée, aucune donnée métier réelle.
Les UUID sont générés par Prisma. Les dates sont stockées en timestamptz.

| Table | Rôle et invariants |
| --- | --- |
| Workspace | Racine de propriété, suppression restreinte tant que des données existent |
| Company | Clé workspace/id ; SIREN optionnel unique par workspace et format 9 chiffres |
| Search | Recherche rattachée au workspace, texte borné, date de création |
| SearchResult | Jointure recherche/entreprise ; les deux relations partagent le même workspace |
| Observation | Champ/valeur, source et URL obligatoires, identifiant source optionnel, collecte, vérification optionnelle, confiance et type |
| Prospect | Une ligne par entreprise/workspace ; statut initial NEW |

Les relations composites utilisent le workspace dans la clé étrangère : un identifiant
valide dans un autre workspace ne suffit pas à créer une relation.
Les suppressions sont RESTRICT, aucun effacement en cascade implicite.
La migration ajoute des CHECK sur SIREN, nom non vide et ordre des dates de vérification.
Il faut conserver ces CHECK dans les migrations futures : Prisma ne les exprime pas dans son schéma.
Le SIREN absent reste NULL, permettant plusieurs entreprises sans identifiant connu.

Le repository entreprise impose le workspace du contexte serveur sur toutes ses opérations.
Les listes sont bornées à 100 en attendant la pagination de l’interface.
Les données d’écriture sont validées par Zod et refusent les champs inconnus.
Les observations ne déclenchent aucune visite de sourceUrl : ce champ est une provenance.
Le client et le repository utilisent server-only, sans import dans les composants clients.
Aucune identité authentifiée ne peut encore être résolue : pas de route de données exposée.
Le contexte local est un outil serveur à opt-in, interdit hors NODE_ENV=development.
Les tests utilisent directement deux contextes synthétiques pour prouver les filtres.
Ce mécanisme ne remplace pas les futures vérifications d’appartenance authentifiées.

Les comptes et Membership ne sont pas nécessaires au stockage local synthétique.
Leur ajout et les règles de rôles seront livrés avant accès réel multi-utilisateur.
Les notes et leur auteur relèvent de l’itération 07 ; aucune interface commerciale n’est développée ici.
Le propriétaire applicatif ne doit pas être confondu avec le rôle PostgreSQL local d’administration.
Une séparation des rôles DB reste obligatoire avant exploitation.
