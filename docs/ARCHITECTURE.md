# Architecture proposée — 20 octobre 2026

## Produit et MVP
Prospeo cible d'abord un utilisateur personnel en France, interface française.
Le MVP privé couvre une recherche d'entreprises via une source autorisée, des résultats paginés,
la provenance datée, une qualification explicable, puis fiches, notes, favoris, statuts et CSV.
Un score mesure une opportunité et ne garantit ni un besoin ni l'absence d'un site.
Une information non observée reste inconnue. Chaque observation porte source, collecte,
vérification éventuelle, confiance et distinction fait/hypothèse. Les signaux périmés restent identifiables.

Le MVP exploitable s'achève à l'itération 8, après authentification, autorisations,
sauvegarde/restauration et contrôles de sécurité. L'analyse technique de l'itération 6
reste désactivée si ses protections ne sont pas validées. Multi-tenant commercial,
facturation, envoi d'emails, CRM externe et collecte massive sont hors MVP.
Avant l'itération 8 : développement local uniquement, sans exposition publique ni données réelles persistées avant contrôle d'accès.

## Structure cible, non créée à l'itération 0
- `src/app/` : routes App Router, pages et adaptateurs serveur minces.
- `src/components/` : composants réutilisables ; shadcn/ui seulement selon les besoins.
- `src/modules/companies/` : recherche, entreprises et observations.
- `src/modules/qualification/` : règles pures versionnées et explications des scores.
- `src/modules/prospects/` : suivi commercial et exports.
- Dans chaque module : `domain/`, `application/`, puis adaptateurs `infrastructure/` si nécessaires.
- `src/server/db/` : client Prisma et accès serveur uniquement.
- `src/server/providers/` : contrats de fournisseurs, quotas, validation et normalisation.
- `src/server/auth/` : acteur, politiques d'accès et sessions.
- `src/server/observability/` : logs structurés avec suppression des secrets.
- `src/server/analysis/` : orchestration ; processus/conteneur isolé pour les requêtes réseau.
- `prisma/`, `tests/`, `docs/` : schéma/migrations, tests et décisions.

Flux : UI → adaptateur serveur (validation Zod et acteur) → cas d'usage → ports métier → adaptateurs DB/fournisseurs.
Le navigateur ne reçoit jamais de secret ni de client Prisma. Le domaine n'importe pas Next.js ou Prisma.
Les fournisseurs ne dictent pas le modèle métier. Les appels réseau ne se produisent pas dans le rendu UI.
L'analyse isolée reçoit un identifiant de travail et une destination contrôlée, avec concurrence bornée.
Pas de microservices, bus ou plateforme de jobs ajoutés avant besoin démontré.

## Données et identité
Prévoir Workspace, User, Membership, Company, Search, SearchResult, Observation,
Prospect et Note. C'est une proposition de modèle, à détailler à l'itération 2.
Workspace représente la propriété des données dès le départ ; aucune fonctionnalité d'administration SaaS anticipée.
Toutes les données métier sont rattachées à un workspace, y compris les observations et recherches.
Clés étrangères et unicités composites empêchent les références entre workspaces.
L'acteur et le workspace proviennent du contexte serveur authentifié ; jamais du seul corps de requête.
Avant authentification, contexte local de développement explicite ; il doit être impossible à activer en production.
Les requêtes filtrent le propriétaire. Tester deux workspaces dès les premiers accès aux données.
RLS reste une défense optionnelle à arbitrer ; elle ne remplace pas les politiques applicatives.

## Choix proposés
Next.js App Router, TypeScript strict, Tailwind, Zod, Vitest et Playwright à l'itération 1.
PostgreSQL, Prisma et Docker Compose à l'itération 2 ; base liée au loopback et volume local.
Node LTS compatible, versions exactes et gestionnaire choisis/vérifiés à l'itération 1 ; lockfile obligatoire.
Préférence pour pnpm, disponible via le runtime local, à confirmer par exécution avant usage.
Pas d'engagement sur une version de bibliothèque ou une offre commerciale à ce stade.
Tests unitaires métier, intégration PostgreSQL réelle, parcours navigateur et tests d'autorisation/SSRF selon périmètre.

## Arbitrages avant les étapes concernées
- Avant itération 1 : valider ce cadrage et confirmer la machine/runtime utilisable.
- Avant itération 4 : fournisseur officiel, couverture, licence, quotas, coût maximum et critères de collecte autorisée.
- Avant données personnelles réelles : finalité, base juridique, conservation, suppression et information/opposition à préciser.
- Avant itération 5 : poids de score, seuils de confiance et fraîcheur des observations.
- Avant itération 8 : hébergeur, région, fournisseur d'identité, budget et objectifs de restauration.
Ces choix futurs ne bloquent pas la préparation des fondations après validation de l'itération 0.
