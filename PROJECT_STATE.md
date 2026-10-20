# Mémoire opérationnelle — Prospeo

Dernière mise à jour : 21 octobre 2026 (Europe/Paris).

## Progression et autorisations
Prospection B2B France, interface française, usage personnel avant SaaS.
Dépôt officiel privé : https://github.com/teraitea987/prospeo. Ne pas utiliser Sites.
00 à 06 validées. 05 commitée/poussée sur accord : b20b86f, codex/iteration-05.
06 validée ; commit/push et poursuite autorisés explicitement le 21 octobre 2026.
Branche courante codex/iteration-06, commit/push autorisés, en préparation.
07 non commencée. Aucun merge, changement de branche GitHub par défaut ou déploiement autorisé.
Historique détaillé de 00–05 archivé dans docs/iterations/STATE-AFTER-05.md et archives précédentes.

## Produit actuel
Accueil et démonstration /recherche avec douze sociétés fictives indépendantes de la DB.
/recherche/reelle : API publique Recherche d’entreprises, budget validé 0 €, lecture sans stockage.
Sociétés 5xxx diffusibles ; PME 0–9 salariés et 1–3 établissements ouverts ; taille inconnue exclue.
Présélection NAF métiers de proximité, priorité artisanale limitée à chaque page ; NAF précis remplace la présélection.
Nom/postal/NAF facultatifs individuellement ; au moins un filtre requis, SIREN/SIRET comme mots-clés refusés.
Postal : autocomplétion locale 6310 codes officiels, correspondance établissement actif/SIRET exact,
siège indiqué séparément. Utilisateur a confirmé résolution du focus Chrome après redémarrage.
Constats manuels temporaires par carte, source/date, règles v1.0 approuvées : inconnu/null,
aucun site identifié 80, refonte 40, aucun besoin 0 ; après 90 jours score retiré.
Hypothèse commerciale, pas de score déduit de taille/artisanat ou d’une absence de champ.
06 : bouton « Analyser un site », URL fournie explicitement, HTTP/HTTPS/titre/viewport ponctuels,
aucun script distant, score commercial inchangé, pas de découverte automatique de site ni de sauvegarde.
Google Maps/Places non intégré : clé/facturation/conditions de conservation non arbitrées.

## Architecture et données
Next 16.4.2, React 19.3.1, TypeScript strict 5.9.3, Tailwind 4.3.3, Zod 4.6.7.
Vitest 5.0.5, Playwright 1.64.1, ESLint 10 + typescript-eslint/React Hooks ; pnpm 11.25.0, Node 24.
Prisma/client/adapter-pg 7.10.1, pg 8.23.1, PostgreSQL 17.11 via Docker Compose.
Workspace/Company/Search/SearchResult/Observation/Prospect, FK composites de propriété,
contraintes SQL et repository server-only validés ; aucune donnée réelle persistée.
Contexte DB local explicite, impossible hors développement ; User/Membership/Note/rôles/RLS différés.
Source réelle : adaptateur serveur hôte fixe, Zod, réponses minimales, quotas 20/min, 1/s,
concurrence 1, timeout 8 s, corps 512000 octets, redirections refusées, pas de retry.
Accès page/API réel : Basic local username prospeo, secret privé dans .env, opt-in, refus hors dev.

## Analyse isolée — 06
src/server/analysis/ : orchestration server-only Docker Desktop, jamais de fetch arbitraire dans Next.
analyzer/ : worker TypeScript exécuté nativement par Node 24, aucune dépendance npm ajoutée.
Image de base figée par digest, contexte Docker allowlist limité à analyzer/, ID runtime immuable dans .env.
Pare-feu OUTPUT bloquant réseaux spéciaux, Azure, IPv6 ; seuls TCP public 80/443 et DNS Docker autorisés.
Initialisation root puis UID/GID 10001, zéro capability, no-new-privileges, seccomp, FS lecture seule.
Aucun montage/socket Docker/secret/DB/variable applicative dans le worker.
A/AAAA tous contrôlés, connexion IPv4 directement épinglée, Host/SNI/TLS et adresse effective vérifiés.
Chaque redirection revalidée, max trois ; IPv6 littéral ou IPv6 seul non pris en charge.
DNS 2 s, connexion/lecture 3 s, signal global 12 s, watchdog 14 s ; corps 512000 octets,
compression refusée, headers 16 Ko ; 128 Mo RAM, 0,5 CPU, 32 PIDs, 64 descripteurs.
Un job via verrou mémoire + nom Docker, six tentatives/minute ; nettoyage forcé, pas de queue/retry.
API POST /api/analyse : Basic local, Origin/Host loopback identiques, Sec-Fetch-Site,
JSON strict 4096 octets/3 s ; no-store, erreurs génériques, entrée stdin sans shell.
Résultat minimal horodaté, aucun HTML brut/log de destination/score/persistance.
analysis:setup désactive puis construit/teste le sandbox avant activation ; test:analysis ne l’active pas.
Analyse activée localement après réussite des contrôles, serveur dev redémarré sur 127.0.0.1:3000.
Détails et limites : docs/TECHNICAL_ANALYSIS.md et docs/iterations/ITERATION-06.md.

## Environnement et commandes
Runtime Node : /Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin.
Ajouter ce dossier et ~/.local/bin au PATH. Docker Desktop installé sur autorisation explicite,
CLI ~/.local/bin, plugin compose ~/.docker/cli-plugins ; socket ~/.docker/run/docker.sock.
DB saine loopback 5432, volume prospeo_postgres_data préservé ; bridge prospeo-analysis dédié.
.env privé 0600 ignoré ; secrets jamais affichés. Images runtime/test conservées localement.
Serveur dev courant lancé par agent (session 34410), loopback 3000.
GitHub privé origin HTTPS ; codex/iteration-01 reste la branche par défaut créée automatiquement au premier push.
Historique commits : d4be92f fondations, 58bb449 DB, d08553f démo, 6d3f0ab source réelle, b20b86f qualification.
- pnpm dev / build / start ; pnpm lint / typecheck / test / test:e2e.
- pnpm test:e2e:local : Chrome installé desktop + Chromium mobile, port 3101 et dist .next-local-e2e.
- pnpm db:setup / db:up / db:migrate / db:validate / db:generate / test:integration / db:stop.
- pnpm search:setup ; pnpm test:live (source officielle réelle, uniquement explicite).
- pnpm analysis:setup ; pnpm test:analysis (preuve egress et appel example.com explicites).
- pnpm audit / peers check ; installation frozen avec postinstall Prisma.
Ne pas lancer reset/truncate/down -v ni supprimer un job actif ou volume existant.

## Vérifications finales de 06
Lint, TypeScript et build production : PASS ; audit JS sans vulnérabilité connue signalée.
97 tests unitaires : PASS ; 10 E2E production + 10 E2E locaux : PASS.
Intégration réseau Docker : contrôle positif privé puis refus sockets privés/métadonnées/IPv6,
UID/capabilities/cgroups/FS/env/socket/pare-feu, DNS/TLS public et nettoyage : PASS.
Setup réel : analyse désactivée pendant préparation, activation sur image vérifiée : PASS.
Parcours complet navigateur → API authentifiée → conteneur → HTTPS public, desktop/mobile : PASS.
Revue visuelle et absence de débordement desktop/mobile : PASS.
DB et live entreprise non rejoués : schéma/repository/adaptateur inchangés ; fixtures navigateur uniquement.
Incidents corrigés et relances consignés dans ITERATION-06.md ; aucun échec laissé ouvert.

## Limites et suite
Suite prioritaire autorisée : découverte de site et préqualification automatiques à 0 €.
Prévoir un complément 06bis avant 07, conformément à la correction de priorité utilisateur.
Scores manuels et observations restent temporaires, pas d’identité SaaS, d’export ou d’hébergement.
SSRF : preuves locales, pas d’audit complet ; liste réseau/topologie à revoir en cas de changement.
Image OS non scannée pour CVE ; quota mémoire non distribué, dépendance au daemon Docker et Mac de confiance.
SaaS exige identité/autorisation et politique egress d’hébergement revalidées, secrets/DB au moindre privilège,
CSP renforcée et sauvegardes/restauration à 08. Aucune garantie de sécurité totale.
