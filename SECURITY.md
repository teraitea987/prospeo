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
