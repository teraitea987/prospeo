# Règles permanentes — Prospeo

## Reprise obligatoire
1. Lire ce fichier puis PROJECT_STATE.md en priorité.
2. Lire ROADMAP.md et les sections pertinentes de SECURITY.md.
3. Vérifier la branche, `git status` et les fichiers utiles à l'itération.
4. Présenter un plan court avant modification. Vérifier le code réel : la mémoire ne prouve pas son fonctionnement.

## Travail par itération
- Respecter la roadmap ; une seule itération IN_PROGRESS à la fois.
- Ne jamais commencer la suivante sans validation humaine explicite.
- Construire uniquement le périmètre autorisé, sans dépendances inutiles.
- Ne pas utiliser le skill ou plugin Sites pour ce projet (préférence explicite utilisateur).
- Appliquer la sécurité dès la fonctionnalité concernée ; ne pas reporter ses contrôles.
- Préserver les modifications existantes. Aucun changement destructeur non autorisé.
- Respecter les frontières interface, métier, données, fournisseurs, analyse, identité et supervision.
- Vérifier les entrées serveur, les autorisations et la propriété des données.
- Ne jamais journaliser ni versionner des secrets ou des données personnelles superflues.

## Git
- Dépôt officiel unique : https://github.com/teraitea987/prospeo ; privé, sans changement de visibilité.
- `main` est stable. Branche dédiée par itération, préfixe `codex/` par défaut.
- Ne jamais pousser directement sur `main`.
- Aucun push, merge ou force-push sans autorisation explicite ; aucun effacement de branche ou de données sans autorisation.
- Préparer des changements revoyables et des commits descriptifs ; inspecter leur contenu avant commit.
- Ne pas commiter de `.env` secret. Un exemple ne contient que des valeurs factices.

## Clôture obligatoire
- Exécuter les tests pertinents, TypeScript et lint lorsqu'ils existent ; signaler tout échec ou contrôle indisponible.
- Inspecter les risques de sécurité concernés et le diff Git.
- Mettre à jour PROJECT_STATE.md et ROADMAP.md, même en cas d'échec ; SECURITY.md si nécessaire.
- Archiver les détails utiles dans docs/iterations/ sans perdre d'information importante.
- DONE signifie que les critères techniques sont remplis ; consigner séparément la validation humaine en attente.
- Ne jamais annoncer une sécurité totale ni masquer un test échoué.
- Présenter le bilan puis s'arrêter explicitement pour demander la validation humaine.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
