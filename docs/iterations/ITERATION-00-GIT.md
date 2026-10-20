# Complément de l’itération 00 — Accès Git HTTPS

Date : 20 octobre 2026, Europe/Paris.
Statut : DONE technique ; validation humaine en attente ; itération 01 non commencée.

## Demande et état préservé
Configurer l’accès HTTPS local pour vérifier le dépôt officiel avant intégration.
Branche conservée : codex/iteration-00, sans commit. Documents existants non suivis conservés.
Aucun push, merge, commit, changement de visibilité ni choix de fournisseur/identité/hébergement.

## Actions et preuves
- Lecture AGENTS.md, PROJECT_STATE.md, ROADMAP.md et SECURITY.md.
- Trousseau Git macOS osxkeychain déjà configuré ; gh initialement absent.
- Ajout du remote origin : https://github.com/teraitea987/prospeo.git.
- Lecture HTTPS sans invite : échec 128, identifiants indisponibles.
- Tentative Homebrew interrompue : compilation Go requise sur Intel. La mise à jour automatique
  Homebrew et le téléchargement de son runtime Ruby et de sources ont eu lieu ; aucun nettoyage destructeur.
- Installation utilisateur du binaire officiel gh 2.102.1 macOS amd64 dans ~/.local/opt/gh/v2.102.1,
  lien ~/.local/bin/gh. Empreinte SHA-256 vérifiée contre les métadonnées de publication GitHub.
- Connexion gh auth login --hostname github.com --git-protocol https --web lancée.
- Autorisation navigateur confirmée par le propriétaire ; connexion réussie avec teraitea987.
- gh auth status : compte actif, HTTPS, stockage keyring. Aucun secret OAuth dans hosts.yml.
- Helper local github.com dans .git/config : remise à zéro des helpers hérités pour cet hôte,
  puis !/Users/lanihei/.local/bin/gh auth git-credential. Aucun helper global modifié.
- GIT_TERMINAL_PROMPT=0 git ls-remote --symref origin : code 0, aucune référence.
- GIT_TERMINAL_PROMPT=0 git fetch origin : code 0, aucune référence récupérée.
- gh repo view : nameWithOwner=teraitea987/prospeo, isPrivate=true, isEmpty=true ;
  defaultBranchRef.name vide, cohérent avec un dépôt vide.
- Aucune branche distante ni commit de branche local à comparer. Les références internes Codex
  éventuellement présentes ne sont pas un historique de branche du projet.
- Aucun code temporaire ni secret archivé ici.

## Sécurité et limites
Aucun jeton lu ou exposé dans les documents ; URL distante sans identifiant embarqué.
La connexion du connecteur GitHub ne configure pas les identifiants Git locaux.
Stockage dans le trousseau confirmé. Les portées OAuth accordées par gh sont repo, read:org,
gist et workflow ; elles dépassent la seule lecture de Prospeo. Aucun droit du dépôt modifié.
Dépôt distant vide confirmé par Git et API ; absence d’historique à intégrer à cet instant.

## Contrôles et suite
Contrôle des sept documents : UTF-8, liens locaux, absence d’espaces finaux,
marqueurs de conflit et motifs de jetons GitHub : réussi. git diff --check réussi ;
fichiers non suivis contrôlés séparément. Statut Git confirmé sans commit sur codex/iteration-00.
Revue de configuration terminée : URL sans secret, helper local, keyring confirmé ;
aucun push ni merge. git diff --check réussi ; fichiers non suivis revus séparément. Aucun package.json :
tests applicatifs, TypeScript, lint et build indisponibles.
Configuration terminée. Une synchronisation ultérieure devra revérifier les références distantes
avant toute intégration ; aucun push n’est autorisé par cette demande.
Validation humaine de l’itération 00 toujours attendue avant 01.

Documentation officielle utilisée : https://cli.github.com/manual/gh_auth_login
Publication du binaire : https://github.com/cli/cli/releases/tag/v2.102.1
