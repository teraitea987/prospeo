# Mémoire opérationnelle — Prospeo

Dernière mise à jour : 20 octobre 2026, Europe/Paris.

## Résumé
SaaS B2B de recherche et qualification d'entreprises, France, français.
Usage personnel initial ; évolution commerciale multi-utilisateur ultérieure.
Dépôt officiel unique : https://github.com/teraitea987/prospeo.

## Itération et avancement
- Itération 00 : DONE techniquement ; validation humaine en attente.
- Aucune itération IN_PROGRESS. Itération 01 non commencée.
- Terminé : architecture proposée, MVP, roadmap détaillée, menaces, règles permanentes et audit initial.
- Incomplet volontairement : toute application, DB, intégration, authentification, analyse, déploiement.
- Aucun commit, push, merge ou service créé. GitHub CLI local installé lors du complément Git.

## État Git vérifié
- Dossier initial : dépôt sans commit, branche main, aucun remote et aucun fichier projet.
- Branche de travail créée : codex/iteration-00, sans commit initial.
- GitHub get_repo confirme le dépôt officiel, visibility=private, default_branch=main, size=0.
- Remote origin ajouté : https://github.com/teraitea987/prospeo.git.
- `GIT_TERMINAL_PROMPT=0 git ls-remote --symref origin` : échec 128 avant connexion (identifiants indisponibles).
- GitHub CLI 2.102.1 installé dans ~/.local/bin/gh ; binaire officiel macOS Intel, empreinte SHA-256 vérifiée.
- Connexion HTTPS réussie avec teraitea987 ; gh auth status confirme le stockage keyring.
- Helper gh configuré uniquement dans .git/config pour github.com ; aucun jeton enregistré dans le projet.
- `git ls-remote --symref origin` et `git fetch origin` réussis (code 0), aucune référence distante.
- API gh repo view : isPrivate=true, isEmpty=true ; aucune branche distante à comparer.
- Aucun commit sur la branche locale ; les références techniques internes Codex ne sont pas des branches distantes.
- Aucun paramètre du dépôt GitHub modifié.

## Architecture proposée
Monolithe modulaire Next.js App Router, TypeScript strict, Tailwind, Zod.
Vitest et Playwright dès les fondations ; PostgreSQL/Prisma/Docker Compose à 02.
UI → adaptateurs serveur validés → cas d'usage → ports → données/fournisseurs.
Propriété workspace dès le modèle ; isolation testée dès les accès DB.
Analyse réseau isolée à 06, désactivée tant que SSRF/egress/limites non démontrés.
Versions exactes à sélectionner et vérifier à 01 ; aucune dépendance installée.

## Carte des fichiers
- AGENTS.md : règles de reprise, sécurité, Git et arrêt entre itérations.
- PROJECT_STATE.md : mémoire opérationnelle courte.
- ROADMAP.md : 00–09, critères, tests, sécurité et dépendances.
- SECURITY.md : menaces et exigences par surface.
- docs/ARCHITECTURE.md : MVP, structure cible, propriété, décisions et arbitrages.
- docs/iterations/ITERATION-00.md : preuves et bilan de cadrage.
- docs/iterations/ITERATION-00-GIT.md : complément de configuration Git HTTPS.

## Outils et commandes
- Git système : 2.39.5 ; Python système : 3.13.2.
- Node absent du PATH ; runtime fourni disponible, version v24.19.0 :
  `/Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
- pnpm détecté via fallback du runtime ; exécution/compatibilité à vérifier à 01.
- npm, Docker et gh absents du PATH lors de l'audit initial ; gh est désormais disponible par /Users/lanihei/.local/bin/gh.
- Connecteur GitHub disponible et lecture des métadonnées réussie.
- Reprise : `git status --short --branch`, `git diff --check`, lecture des documents prioritaires.
- Aucune commande dev/build/lint/typecheck/test applicative disponible : aucun package.json.
- Définir et exécuter ces scripts à 01 ; aucune réussite applicative revendiquée ici.

## Dernières vérifications
- Audit documentaire : fichiers requis et critères roadmap vérifiés par script Python.
- Liens locaux et encodage UTF-8 : vérifiés.
- Espaces de fin, marqueurs de conflit et diff Git : contrôlés.
- Tests applicatifs, TypeScript, lint, build : non applicables à cette itération documentaire.
- Aucun code, dépendance applicative, secret d'environnement ou base ajouté.
- Complément Git : connexion keyring, ls-remote et fetch réussis ; dépôt privé vide confirmé.

## Problèmes et risques ouverts
- Accès Git HTTPS et dépôt distant vide vérifiés ; premier commit/push non réalisé.
- Docker indisponible dans le PATH : prérequis à résoudre avant 02.
- Tous les contrôles applicatifs sont des exigences futures, pas des protections opérationnelles.
- API/conditions/coût et gouvernance des données à arbitrer avant collecte réelle.
- Authentification à avancer avant toute exposition ou persistance sensible réelle, même si prévue au complet à 08.
- Risques SSRF, fuite de secrets, mélange de propriétaires et faux positifs de scoring documentés.

## Prochaine action
Attendre la validation explicite de l'itération 00 par l'utilisateur.
Demande de configuration Git HTTPS terminée ; validation humaine du complément et de 00 attendue.
Après validation de 00 seulement : commencer 01 sur une branche dédiée.
Aucune question technique ne bloque le cadrage ; fournisseur, identité et hébergement restent des arbitrages futurs.
