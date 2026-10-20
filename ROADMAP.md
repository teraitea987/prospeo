# Roadmap — Prospeo

Une seule itération IN_PROGRESS ; aucune suivante ne démarre sans validation humaine.
DONE indique des critères techniques satisfaits, indépendamment de l’accord de poursuite.
Itérations 00 et 01 validées. Itération 02 réalisée, validation humaine en attente.
Aucune itération active.
Complément Git autorisé le 20 octobre 2026 : origin configuré, GitHub CLI installé,
connexion HTTPS et fetch réussis ; dépôt privé vide confirmé. Validation humaine reçue
(docs/iterations/ITERATION-00-GIT.md).
Tous les contrôles nécessaires arrivent avec leur fonctionnalité.
Toute itération avec code doit également vérifier build, TypeScript et lint et actualiser la mémoire.

## 00 — Cadrage

- Statut : DONE
- Objectif : Cadrage de Prospeo.
- Périmètre : Architecture, MVP, règles de travail, roadmap, menaces et audit initial.
- Dépendances : Aucune
- Acceptation : Documents requis présents et cohérents ; architecture et MVP bornés ; outils/état Git vérifiés ; arbitrages listés.
- Tests obligatoires : Vérification structure documentaire, liens locaux, absence de code/dépendances, diff et statut Git.
- Sécurité : Modèle de menaces, secrets, SSRF et propriété documentés.

## 01 — Fondations

- Statut : DONE
- Objectif : Fondations de Prospeo.
- Périmètre : Next.js App Router français, TypeScript strict, Tailwind, Zod, Vitest, Playwright, scripts qualité et README local. Composants shadcn/ui uniquement si utiles. Aucun fournisseur ni DB.
- Dépendances : Validation humaine de 00
- Acceptation : Installation reproductible par lockfile ; page minimale responsive ; scripts dev/build/lint/typecheck/test/test:e2e opérationnels ; strict activé ; build production réussi ; README et exemple environnement factice ; tous les contrôles passent.
- Tests obligatoires : Unitaires significatifs sur la validation ajoutée ; smoke navigateur page française et navigation clavier ; typecheck, lint, build, audit dépendances avec traitement des alertes.
- Sécurité : Secrets ignorés, aucun secret client ; configuration serveur locale ; en-têtes pertinents testés, aucune route réseau arbitraire ni donnée réelle.

## 02 — Modèle de données

- Statut : DONE
- Objectif : Modèle de données de Prospeo.
- Périmètre : PostgreSQL local via Docker Compose, Prisma, entreprises, recherches, observations, prospects et propriétaire workspace ; migrations et adaptateurs.
- Dépendances : 01 validée ; Docker disponible
- Acceptation : Migration depuis base vide, provenance et contraintes de propriété ; contexte local strictement borné au développement ; commandes documentées.
- Tests obligatoires : Intégration PostgreSQL, contraintes, tentatives accès/références entre deux workspaces, migrations, typecheck et lint.
- Sécurité : DB loopback, secrets hors Git, requêtes paramétrées, contrôle de propriété dès le premier accès.

## 03 — Interface de recherche

- Statut : TODO
- Objectif : Interface de recherche de Prospeo.
- Périmètre : Filtres, résultats fictifs explicitement étiquetés, pagination, chargement/vide/erreur et responsive.
- Dépendances : 02 validée
- Acceptation : Parcours formulaire accessible, entrées invalides refusées côté serveur, résultats déterministes et états visibles.
- Tests obligatoires : Validation filtres et parcours Playwright clavier/mobile, typecheck et lint.
- Sécurité : Bornes des filtres/pagination, échappement des chaînes et vérification du contexte propriétaire.

## 04 — Première source réelle

- Statut : TODO
- Objectif : Première source réelle de Prospeo.
- Périmètre : Choix API autorisée, adaptateur, normalisation, pagination, quotas, erreurs, collecte et provenance.
- Dépendances : 03 validée ; fournisseur/conditions/budget arbitrés ; accès contrôlé pour persistance réelle
- Acceptation : Source et dates traçables ; quotas et erreurs gérés ; limites contractuelles documentées ; données réelles accessibles uniquement à un acteur autorisé.
- Tests obligatoires : Contrats avec fixtures, réponses invalides, 429, timeout, retries, pagination bornée, tests autorisation ; appel réel seulement avec configuration autorisée.
- Sécurité : Secrets serveur, validation des réponses, hôte fournisseur fixe, quotas ; collecte réelle bloquée sans contrôle d’accès, à avancer ici si nécessaire.

## 05 — Qualification

- Statut : TODO
- Objectif : Qualification de Prospeo.
- Périmètre : Présence de site issue des sources, score explicable versionné, confiance et fraîcheur ; aucun crawl arbitraire.
- Dépendances : 04 validée ; règles de notation approuvées
- Acceptation : Score 0–100 déterministe ; critères détaillés ; inconnu distinct de absent ; hypothèses identifiées.
- Tests obligatoires : Bornes, données manquantes/contradictoires/périmées et explications, typecheck et lint.
- Sécurité : Ne pas assimiler absence de champ à absence de site ; toute visite d’URL attend 06.

## 06 — Analyse technique

- Statut : TODO
- Objectif : Analyse technique de Prospeo.
- Périmètre : Analyseur isolé, contrôles techniques bornés, protections réseau et ressources.
- Dépendances : 05 validée ; isolation et politique egress disponibles
- Acceptation : Destination effective et chaque redirection contrôlées ; refus réseaux interdits ; aucune fuite de secrets ; budgets ressources démontrés.
- Tests obligatoires : Suite SSRF IPv4/IPv6/rebinding/redirections, timeouts, tailles et concurrence ; intégration réseau isolée, typecheck et lint.
- Sécurité : Appliquer intégralement la section analyse URL de SECURITY.md ; maintenir désactivé si garanties insuffisantes.

## 07 — Gestion des prospects

- Statut : TODO
- Objectif : Gestion des prospects de Prospeo.
- Périmètre : Fiches, notes, favoris, statuts, export CSV et historique commercial.
- Dépendances : 06 validée
- Acceptation : Opérations persistées avec propriétaire ; notes échappées et export autorisé neutralisant les formules.
- Tests obligatoires : CRUD, autorisations croisés, XSS notes, CSV malveillant, parcours navigateur, typecheck et lint.
- Sécurité : Protection des mutations et CSRF selon session, minimisation et politique de suppression.

## 08 — Déploiement privé

- Statut : TODO
- Objectif : Déploiement privé de Prospeo.
- Périmètre : Identité complète, audit des autorisations, sauvegardes/restauration, supervision, hébergement privé.
- Dépendances : 07 validée ; hébergeur/identité/budget/RPO/RTO décidés ; accord de déploiement explicite
- Acceptation : Accès anonyme refusé ; aucun bypass local ; restauration démontrée ; audit et contrôles pré-déploiement satisfaits ; déploiement autorisé.
- Tests obligatoires : Sessions, CSRF, toutes autorisations, restauration, smoke environnement cible, audit dépendances, build/typecheck/lint.
- Sécurité : Checklist SECURITY.md exécutée, TLS, secrets, DB privée et alertes ; aucune fonctionnalité antérieure ne peut différer ici ses contrôles indispensables.

## 09 — Préparation SaaS

- Statut : TODO
- Objectif : Préparation SaaS de Prospeo.
- Périmètre : Comptes multiples, rôles, gestion workspace, quotas, isolation renforcée et audit approfondi ; pas de facturation implicite.
- Dépendances : 08 validée ; périmètre commercial approuvé
- Acceptation : Isolation systématique sur données, caches, exports et jobs ; rôles et quotas vérifiables.
- Tests obligatoires : Matrice multi-tenant et rôles, tests de concurrence/quotas et audit approfondi.
- Sécurité : Refus par défaut ; aucune ressource traversant les tenants ; traitement incidents et données documenté.
