# Prospeo

Plateforme de recherche et qualification B2B, développée une itération à la fois.
Itération 02 : accueil français et fondations de données PostgreSQL/Prisma.
Aucune recherche opérationnelle, API externe ou authentification.

## Développement local

Prérequis : Node.js 24 et pnpm 11.25.0 (champ `packageManager`).
Avec un gestionnaire de versions Node : `nvm use`, puis rendre pnpm disponible.
Dans Codex, si Node est absent du PATH :

```sh
export PATH="/Users/lanihei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir http://127.0.0.1:3000. La page d’accueil fonctionne sans DB ; `.env` est requis pour les commandes de données.
`pnpm start` démarre la version compilée après `pnpm build`.
Les serveurs sont liés au loopback : ne pas les exposer publiquement.

## Contrôles

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit
```

Les tests navigateur démarrent un serveur de production dédié au port 3100 :
le build doit être à jour et le port libre. Ordinateur et mobile utilisent Chromium.
Les navigateurs sont installés localement, sans service externe.
`pnpm typecheck` fonctionne avant build ; les types générés Next sont inclus lorsqu'ils existent.

## Organisation

- `src/app/` : page, layout et styles ; aucun appel réseau métier.
- `src/server/config/` : validation d'environnement et en-têtes de sécurité.
- `tests/unit/` : configuration et politique de sécurité.
- `tests/e2e/` : accueil, clavier, responsive et en-têtes HTTP réels.
- `docs/ARCHITECTURE.md` : frontières et structure cible ; les modules métier restent à créer.
- `PROJECT_STATE.md`, `ROADMAP.md`, `SECURITY.md` : reprise et exigences.

Pas de police distante, de télémétrie applicative ni de donnée réelle dans l'interface.
La CSP autorise encore les scripts inline pour l'hydratation Next ; un durcissement
avec nonces est requis avant exposition sensible. Le mode développement autorise
également eval et le WebSocket local pour Next. Ces réglages ne constituent pas un audit complet.
Aucun déploiement ni push sans accord explicite. Aucun usage du plugin Sites.

## PostgreSQL local — Itération 02

Docker Desktop doit être installé et son assistant initial terminé, puis le moteur démarré.
Sur cette machine, la CLI est dans ~/.local/bin : ajouter ce dossier au PATH si nécessaire.
Le schéma cible PostgreSQL 17.

```sh
pnpm db:setup
pnpm db:up
pnpm db:migrate
pnpm db:validate
pnpm db:generate
pnpm test:integration
```

`db:setup` crée `.env` privé avec un secret aléatoire et refuse d’écraser un fichier existant.
Ne jamais partager son contenu. Docker Compose charge ce fichier automatiquement ;
la CLI Prisma le charge explicitement pour les migrations. La génération ne requiert pas de DB.
`postinstall` génère le client ignoré par Git ; les scripts natifs Prisma seuls sont autorisés par pnpm.
Les migrations s’appliquent avec `migrate deploy`, sans reset destructeur.
Ne pas utiliser `docker compose down -v` sur des données à conserver.
`pnpm db:stop` arrête le service et préserve son volume.

PostgreSQL écoute uniquement sur 127.0.0.1:5432 ; le rôle local d’initialisation a des
privilèges étendus et reste réservé aux données synthétiques. Avant exploitation,
séparer rôle de migration et rôle applicatif au moindre privilège.
Les tests nécessitent la DB locale `prospeo`, créent deux workspaces aléatoires,
puis suppriment exclusivement leurs fixtures ; aucune base n’est vidée.
Les UUID fournis au repository proviennent du contexte serveur, jamais d’un formulaire.
Le contexte de développement exige NODE_ENV=development et opt-in explicite.
Aucune route ni action serveur de données n’est exposée à cette itération.
Le modèle ne crée pas encore de comptes, adhésions ou notes (itérations ultérieures).
Les URLs de provenance sont stockées et validées syntaxiquement, sans être visitées.

## Recherche de démonstration — Itération 03

Ouvrir `/recherche` ou le lien de démonstration depuis l’accueil.
Filtres : mots-clés, ville, secteur, effectif ; pagination de six résultats.
Les douze entreprises sont entièrement fictives, sans score ni information vérifiée.
La recherche n’utilise ni PostgreSQL, ni contexte local propriétaire, ni API externe.
La route GET `/api/recherche` est publique et ne retourne que ces fixtures statiques.
Les champs inconnus, filtres invalides, paramètres répétés et requêtes trop longues
sont refusés côté serveur. Ne pas raccorder cette route à des données privées
avant authentification, vérification du workspace et quotas adaptés.
Les états initial, chargement, erreur avec nouvelle tentative, vide et résultats sont prévus.
Les données ne sont pas persistées ; un rechargement réinitialise les filtres.

## Source réelle locale — Itération 04

Choix validé : API publique Recherche d’entreprises, budget 0 €, sans persistance.
La démonstration `/recherche` reste indépendante et ne contacte pas la source réelle.

```sh
pnpm search:setup
pnpm dev
```

Ouvrir `/recherche/reelle`. Identifiant : `prospeo`. Lire le mot de passe dans le
fichier local `.env` (REAL_SEARCH_PASSWORD), sans le copier dans Git ou une URL.
La configuration est déjà créée sur cette machine ; le script refuse de l’écraser.
Le navigateur demande une authentification HTTP Basic. L’usage reste sur loopback
HTTP local uniquement ; cette protection ne remplace pas la future identité SaaS.
REAL_SEARCH_ENABLED=false coupe l’accès. Hors NODE_ENV=development, les deux routes
réelles renvoient 404 même avec le bon mot de passe. Aucun accès réel public autorisé.

Recherche par nom, code postal et code NAF (pas de correspondance approximative
entre les secteurs fictifs de la démonstration et les codes NAF).
Les SIREN/SIRET saisis seuls sont refusés car l’API ignorerait alors les autres filtres.
Dix entrées fournisseur par page, jusqu’à 99 pages ; seules les sociétés 5xxx
diffusibles sont conservées. Une page peut être vide après exclusion : la pagination
reste celle du fournisseur, pas celle du sous-ensemble éligible.
Aucun dirigeant, contact, adresse complète, site ou donnée brute conservé.
Source, date de collecte et confiance moyenne affichées ; aucune vérification indépendante.

Hôte HTTPS fixe, redirections refusées, délai global 8 s, corps décompressé limité à
512 ko, une requête simultanée, une par seconde et 20 par minute par processus local.
429 respecte Retry-After sans retry automatique. Aucune garantie de débit fournisseur.
Cette limite en mémoire convient uniquement à l’instance locale unique ; un déploiement
distribué nécessiterait une limitation partagée, une identité et des quotas par propriétaire.

```sh
pnpm test:e2e:local  # serveur dev isolé au port 3101, utilise .env ; réponses métier simulées
pnpm test:live       # un appel réseau réel, aucun enregistrement
```

`test:e2e` vérifie aussi la fermeture des routes réelles en production.
Les tests locaux utilisent `.next-local-e2e/` pour préserver le serveur dev principal.
Les identifiants ne doivent pas figurer dans captures, traces, sorties de test ou logs.

Références : [documentation API](https://recherche-entreprises.api.gouv.fr/docs/),
[licence des données Sirene](https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret).
Les données ne constituent pas une autorisation générale de prospection : aucune prise
 de contact, export ou réutilisation commerciale automatisée n’est ajoutée ici.

Correctif du formulaire réel : les trois filtres sont facultatifs individuellement,
mais au moins un doit être renseigné. Nom vide autorisé pour une recherche postale ou NAF.
Le champ postal propose des codes et communes dès deux caractères : flèches/Entrée
ou clic pour choisir. Un code complet connu peut aussi être saisi directement.
Les codes inconnus sont rejetés côté serveur. Aucun appel externe pendant la saisie.
Provenance et actualisation : docs/POSTAL_REFERENCE.md.

Avec un code postal, les cartes affichent un établissement actif correspondant et son SIRET.
Le siège est indiqué séparément ; un grand groupe peut apparaître dans plusieurs communes.
Sans filtre postal, la localisation affichée est explicitement celle du siège.

Ciblage par défaut : petites sociétés PME de 0 à 9 salariés et 1 à 3 établissements ouverts.
Les tailles inconnues sont exclues. Les artisans en société avec activité déclarée au
registre des métiers sont placés avant les autres résultats de la même page.
Les entrepreneurs individuels restent hors périmètre ; ce tri n’est pas un score de besoin numérique.
L’effectif concerne la société entière, pas seulement l’établissement local.

Le sélecteur « Métiers ciblés » présélectionne des métiers de proximité (liste NAF non exhaustive).
« Toutes les petites sociétés » supprime cette présélection ; un NAF précis la remplace.
Des pages peuvent être vides après exclusion des réseaux multi-sites.
