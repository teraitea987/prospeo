# Sécurité — Prospeo

Statut : exigences de conception au 20 octobre 2026. Contrôles de fondation implémentés à 01 ; contrôles métier encore à construire.
Référentiels visés : OWASP ASVS et Top 10 ; choisir la version et une matrice de contrôles
au moment de l'implémentation. Ce document n'est pas une attestation de conformité ou un avis juridique.

## Modèle de menaces
Actifs : secrets fournisseurs, sessions, données prospects, notes, provenance, base et disponibilité.
Acteurs : utilisateur légitime, utilisateur malveillant futur, site analysé hostile, fournisseur compromis,
dépendance compromise et personne accédant à la machine locale.
Frontières : navigateur/serveur, serveur/PostgreSQL, serveur/fournisseurs et analyseur/réseau externe.
Surfaces : formulaires, routes et actions serveur, cookies, URL, redirections, DNS, exports, logs et dépendances.

| Menace | Mesure exigée et preuve attendue |
| --- | --- |
| Injection et entrées invalides | Schémas Zod serveur bornés, requêtes Prisma paramétrées, aucun SQL construit par concaténation ; tests négatifs |
| XSS et contenu tiers | Échappement React, aucun HTML tiers brut, CSP adaptée ; tests de chaînes hostiles |
| IDOR et mélange de propriétaires | Acteur serveur fiable, filtre workspace, contraintes composites ; tests croisés dès itération 2 |
| Vol de session et CSRF | Identité éprouvée, cookies Secure/HttpOnly/SameSite, expiration/révocation, contrôle origine et CSRF selon mécanisme ; tests avant exposition |
| Abus et coût fournisseur | Quotas utilisateur/workspace, limitation par opération, timeouts et concurrence bornée ; tests avant intégration réelle |
| Dépendance compromise | Versions verrouillées, revue des ajouts, audit et traitement documenté des alertes |
| Fuite de données | DTO minimaux, logs expurgés, erreurs publiques génériques et identifiant de corrélation |

## Secrets et accès
Secrets côté serveur, hors Git et bundle client ; `.env` ignoré dès l'itération 1,
`.env.example` factice. Aucun préfixe public pour une clé privée. Rotation après exposition,
révocation immédiate et examen de l'historique, sans réécriture destructive non autorisée.
Comptes DB et fournisseurs au moindre privilège ; rôle migrations séparé en exploitation.
Journaliser connexions, refus d'accès, exports et opérations sensibles avec identifiants techniques,
sans tokens ni contenu personnel inutile. Protéger l'accès aux journaux et fixer leur conservation.
Aucun endpoint réel sensible avant son contrôle d'accès ; local ne signifie pas absence de validation.
Ne pas exposer serveur ou DB sur toutes les interfaces pour le développement.

## Analyse d'URL : condition d'activation à l'itération 6
- Autoriser seulement HTTP/HTTPS et les ports explicitement approuvés, par défaut 80/443 ; refuser credentials et formats ambigus.
- Canonicaliser puis résoudre toutes les adresses A/AAAA ; refuser IP privées, loopback,
  link-local, réservées, multicast, métadonnées cloud et variantes IPv4 mappées IPv6.
- Vérifier la destination effective à la connexion, verrouiller l'IP validée sans casser Host/TLS
  et empêcher le rebinding DNS. La validation syntaxique ou une résolution initiale seules ne suffisent pas.
- Désactiver les redirections automatiques ; revérifier chaque saut et borner leur nombre.
- Délais DNS/connexion/lecture/globaux, taille reçue et décompressée bornée, concurrence et retries bornés.
- Processus isolé sans secrets ni accès DB/réseau interne, permissions minimales, politique réseau sortante et nettoyage des ressources.
- Aucun navigateur exécutant des scripts tiers dans le MVP sans nouveau modèle de menaces.
- Tester URL locales/réservées, IPv6, encodages, DNS changeant, redirections internes, timeouts,
  flux trop gros, compression et annulation. Vérifier aussi le pare-feu/egress en intégration.
- Si ces garanties ne sont pas démontrées, garder l'analyse désactivée.

## Fournisseurs et données
Privilégier API officielles et usages autorisés ; ne pas contourner restrictions ou quotas.
Valider les réponses tierces comme des entrées non fiables ; borner pagination, retries et tailles.
Conserver source, identifiant fournisseur, date de collecte/vérification et confiance par observation.
Avant collecte réelle, documenter finalités, base juridique, minimisation, conservation,
droits d'accès/effacement/opposition et obligations de prospection avec sources réglementaires à jour.
Éviter les données de contacts personnels dans le premier périmètre de recherche d'entreprises.
Séparer fait, hypothèse, absence observée et inconnu ; ne jamais présenter un score comme certitude.
Export CSV : échapper les cellules, neutraliser les formules (`=`, `+`, `-`, `@` et contrôles),
tester avec un tableur et appliquer autorisation/quotas à l'export.

## Avant déploiement privé
Authentification et autorisations sur chaque lecture/écriture ; aucun bypass local en production.
Tests d'isolation, XSS/CSRF selon architecture, contrôle des dépendances et secrets.
HTTPS, en-têtes adaptés, stockage/logs à accès restreint, DB non publique et secrets d'environnement.
Migrations revues, sauvegardes chiffrées et restauration réellement testée ; objectifs RPO/RTO décidés.
Supervision, alertes, limitations des abus, inventaire des traitements et durées de conservation.
Aucune mise en production si un contrôle nécessaire échoue ; le déploiement requiert accord explicite.

## Correction et risques résiduels
Signaler une vulnérabilité en privé au propriétaire via le canal privé convenu ; ne pas déposer de secret dans une issue.
Qualifier l'impact, couper la fonctionnalité si nécessaire, révoquer les clés exposées,
corriger avec test de non-régression, vérifier et documenter l'incident et les notifications applicables.
Aucun délai de correction garanti avant définition d'une exploitation.
Risques ouverts : aucun mécanisme encore implémenté, provenance parfois incomplète,
faux positifs de qualification, dépendances/fournisseurs, SSRF et future isolation multi-tenant.
La machine locale et ses sauvegardes restent une frontière de confiance à protéger.

## État vérifié — Itération 01
Serveurs dev/start sur 127.0.0.1 ; aucun endpoint métier, appel fournisseur ou donnée réelle.
En-têtes nosniff, DENY, no-referrer, Permissions-Policy et CSP appliqués aux routes.
CSP : unsafe-inline conservé pour scripts/styles Next ; unsafe-eval seulement en dev.
Avant exposition sensible, prévoir nonces et tests de durcissement ; aucun HSTS sur HTTP local.
Zod borne les valeurs NODE_ENV et exclut les variables inconnues ; erreurs sans valeur reçue.
.env* et sorties outils ignorés, .env.example factice ; versions exactes et lockfile.
Tests unitaires et navigateur vérifient la configuration et les en-têtes HTTP réels.
Audit initial : GHSA-vfj7-8cjw-p6xm, braces <=3.0.3, high, sans correctif annoncé.
Chaîne eslint-config-next → fast-glob → micromatch → braces supprimée en remplaçant
la configuration Next par ESLint 10, typescript-eslint et React Hooks.
Aucune alerte ignorée et aucun override vers une version arbitraire.
Source : https://github.com/advisories/GHSA-vfj7-8cjw-p6xm.

Audit final complet : aucune vulnérabilité connue signalée ; pnpm peers check sans conflit.
Ces résultats ne garantissent pas l’absence de vulnérabilités non détectées.

## Modèle de données — Itération 02
Clés et relations composites avec workspace ; écritures filtrées et validées Zod.
Module client et repository protégés par server-only ; aucune route d’accès aux données.
Contexte local interdit en production et test, opt-in explicite en développement.
PostgreSQL lié au loopback ; secret aléatoire dans .env ignoré (0600), jamais journalisé.
Rôle DB local d’administration réservé aux fixtures ; séparation des rôles avant exploitation.
Données de sources : source, URL, collecte, vérification facultative, confiance et type obligatoires.
Pas de visite d’URL ; aucune protection SSRF revendiquée avant 06.
Scripts Prisma/engines autorisés explicitement dans pnpm après inspection.
Migration réelle sur base neuve et 7 tests PostgreSQL : PASS (lectures, FK, provenance, unicité, CHECK).
Image PostgreSQL 17.11 figée par digest ; mises à jour à appliquer avec revue explicite.
Audit JS complet sans alerte connue ; ce contrôle ne scanne pas l’image conteneur.

## Interface de démonstration — Itération 03
GET /api/recherche lit exclusivement douze fixtures fictives publiques, aucune DB ou donnée privée.
Pas de workspace reçu du client ; tout champ inconnu (y compris workspaceId) est refusé.
Aucun bypass d’autorisation : la route ne fournit aucun accès au repository de 02.
Zod serveur : tailles de texte, enums, page entière 1–999 ; URL limitée à 2048 caractères.
Paramètres répétés refusés, résultats bornés à 6, réponse no-store et erreurs génériques.
Lecture seule sans effet de bord ; aucune mutation nécessitant protection CSRF.
Affichage React échappé, pas de HTML tiers ou URL visitée. Aucun score de qualification.
Avant source réelle : identité, propriété et quotas obligatoires ; cette route démo ne suffit pas.

## Source réelle — Itération 04
Source et budget 0 € confirmés par l’utilisateur : API Recherche d’entreprises.
Lecture limitée aux sociétés 5xxx diffusibles, sans stockage, export ni prospection automatisée.
Aucun dirigeant, contact, adresse complète ou réponse brute conservé/exposé.
Provenance et collecte horodatées ; confiance moyenne, vérification indépendante absente.
/recherche/reelle et /api/entreprises sont fermées hors développement ou sans opt-in.
HTTP Basic local, mot de passe aléatoire de 256 bits dans .env privé, comparaison timingSafeEqual.
Ne pas exposer HTTP Basic sur un réseau ou le substituer aux futures sessions SaaS.
Mot de passe absent/trop court : accès refusé ; aucune donnée privée DB accessible.
Désactiver REAL_SEARCH_ENABLED ou changer le secret pour révoquer l’accès local ; le navigateur
peut conserver les identifiants Basic jusqu’à fermeture de sa session.
Hôte HTTPS constant, aucun URL client utilisé ; redirections refusées et aucun site visité.
Timeout global 8 s, réponse décompressée max 512000 octets, JSON validé et projection minimale.
Quota global d’instance : 20/min, 1/s, concurrence 1 ; Retry-After respecté sans retries automatiques.
Quota en mémoire : redémarrage le réinitialise, instances multiples non couvertes ; pas de déploiement permis.
GET sans mutation ni persistance ; réponses no-store, aucun secret ou paramètre de recherche journalisé par le code métier.
Les journaux standards Next peuvent contenir le chemin et les critères : utiliser uniquement des recherches de sociétés et conserver ces logs localement.
Quota, authentification, statut de diffusion, schéma, volume, erreurs et timeout testés.
Contrôle live limité, sans journalisation de réponse ni fixture issue de personnes réelles.
Avant persistance réelle, activer identité/workspace fiable et politique de conservation/suppression.
Références : https://recherche-entreprises.api.gouv.fr/docs/ et
https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret.

### Correctif formulaire et codes postaux — 04
Nom, postal et NAF facultatifs individuellement ; au moins un critère obligatoire côté serveur.
Postal non vide vérifié sur un référentiel local officiel, en plus du format.
GET /api/codes-postaux : même contrôle Basic/opt-in/développement, aucune connexion externe,
requête bornée à 80 caractères et 512 caractères d’URL, huit suggestions maximum.
Référentiel de codes/communes publics sans données personnelles, versionné et servi côté serveur.
Script d’actualisation manuelle : hôte fixe, redirections refusées, timeout 30 s,
réponse max 10 Mo et validation Zod avant remplacement du fichier.
Une valeur récente absente peut être refusée jusqu’à mise à jour du référentiel.

Filtre postal : établissement actif/SIRET et code exact validés côté serveur ; absence
de correspondance démontrée entraîne exclusion. Aucune adresse complète collectée ou affichée.
Le SIREN identifie la société ; le SIRET identifie son établissement local.

Ciblage petites sociétés : catégorie PME et tranche d’effectif de la société contrôlées
côté fournisseur et côté serveur ; établissements ouverts bornés à trois, valeurs manquantes exclues.
Priorité artisanale fondée sur une activité déclarée ; pas d’inférence de besoin de site.
Pas d’élargissement aux personnes physiques et aucun contact personnel ajouté.

## Qualification manuelle — Itération 05
Constats validés par Zod côté navigateur, fonction pure sans appel réseau ni écriture.
Aucune entrée de qualification reçue par le serveur : aucune nouvelle API de mutation.
La page et son accès réel restent protégés par les contrôles de 04.
Sources limitées à HTTP(S), credentials URL refusés, liens avec noopener/noreferrer.
Aucun crawl, fetch ou vérification technique de ces URLs ; SSRF toujours reporté à 06.
Aucun secret ajouté et aucun commentaire/source manuel journalisé ou persisté.
Confiance manuelle récente moyenne ; inconnu/périmé faible ; pas d’assertion de vérification indépendante.
Une date future/impossible est refusée, une absence de donnée ne vaut pas absence de site.
Le score navigateur est une aide locale non fiable pour toute future écriture serveur.
Avant persistance : validation serveur, autorisation workspace et règles de conservation obligatoires.
