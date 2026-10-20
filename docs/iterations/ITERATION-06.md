# Itération 06 — Analyse technique

Démarrage : 20 octobre 2026 ; clôture technique : 21 octobre 2026 (Europe/Paris).
Statut : DONE, validée par l’utilisateur le 21 octobre 2026.
05 validée, commitée et poussée sur accord explicite : b20b86f sur codex/iteration-05.
06 démarrée sur autorisation « commit et push et on avance », branche codex/iteration-06.
Commit/push de 06 et poursuite autorisés explicitement le 21 octobre ; aucun début de 07 ni déploiement.

## Réalisation
Analyse d’une URL explicitement fournie, au clic sur chaque carte réelle.
Statut HTTP, HTTPS final, redirections, titre/viewport HTML statiques, source/date/version.
Qualification commerciale v1.0 inchangée ; aucune déduction absence/besoin à partir d’un échec.
Pas de scripts, sous-ressources, contenu brut, sauvegarde ou collecte automatique de contacts.
Google Places reste un fournisseur distinct sans clé/budget/conditions validés ; aucune intégration Google.

Worker Docker jetable, pare-feu OUTPUT initialisé avant suppression des privilèges,
UID 10001/capabilities nulles, filesystem readonly, aucun montage, secret ou accès interne.
A/AAAA contrôlés, IPv4 épinglée, Host/SNI et TLS, adresse effective vérifiée, redirections bornées.
Réseaux spéciaux et plateforme Azure refusés, IPv6 entièrement bloqué par le pare-feu.
DNS Docker via conntrack d’origine 127.0.0.11:53, TCP public 80/443 seulement.
Temps/volume/compression/RAM/CPU/PIDs/descripteurs/concurrence/quota bornés.
API POST authentifiée, CSRF Origin/Host loopback/Sec-Fetch-Site, JSON strict et borné.
Aucune dépendance npm ajoutée. Docker ajoute iptables/ip6tables/setpriv, base Node figée par digest.
Image locale figée par identifiant après preuve egress ; setup désactive avant test puis active si succès.
Contrôles, utilisation et limites détaillés dans docs/TECHNICAL_ANALYSIS.md.

## Résultats
- Lint, TypeScript et build production : PASS.
- 97 unitaires : PASS, dont sécurité réseau/transport, autorisation/CSRF et orchestration.
- 10 E2E production et 10 E2E locaux Chrome desktop/mobile : PASS.
- Preuve Docker : serveur privé joignable sans pare-feu, refus de sockets directs sous pare-feu,
  métadonnées/IPv6/port DNS externe refusés, UID/capabilities, lecture seule,
  environnement minimal, absence de socket/secrets et limites cgroups : PASS.
- Image runtime : vraie résolution DNS + HTTPS public example.com, cibles internes/mappées refusées : PASS.
- Setup activant l’option seulement après réussite : PASS ; .env reste privé 0600.
- Parcours navigateur réel desktop/mobile via API → conteneur → example.com : PASS,
  score inconnu conservé, conteneurs supprimés ; screenshots locaux test-results/analysis-review/.
- Revue visuelle desktop/mobile sans anomalie ni débordement ; audit JS sans alerte connue.
- DB/live fournisseur non rejoués : aucune modification de leur périmètre, aucun stockage réel.

## Incidents rencontrés et corrigés
1. Syntaxe TypeScript initiale (parenthèse manquante) : build image/lint/typecheck échoués,
   corrigés puis relancés avec succès. Types d’environnement child_process et fixtures tests corrigés également.
2. Premier pare-feu : DNS Docker bloqué par translation du port puis réponse loopback.
   Deux preuves réseau ont échoué sur DNS ; aucune activation. Exception limitée au tuple
   conntrack d’origine DNS Docker, preuve complète ensuite réussie, sans ouverture générale loopback.
3. Deux E2E locaux initiaux attendaient 400 mais recevaient 403 : Next normalise request.url.
   Contrôle CSRF fondé sur Host explicitement borné au loopback et Origin identique,
   sans confiance dans X-Forwarded-Host. Relance des dix parcours : PASS.
4. Un build lancé avant correction du typage du test CSRF a échoué ; rebuild final réussi.
Messages NO_COLOR/FORCE_COLOR Playwright sans impact sur les résultats.
next-env.d.ts régénéré avec les références du serveur principal plutôt que celles du dist de test.

## Risques et arrêt
Usage local Docker Desktop uniquement, IPv6 seul non supporté, marqueurs HTML indicatifs.
Pas de scan CVE de l’image OS ni d’audit indépendant ; environnement local/daemon de confiance.
Liste réseau et politique à revalider avant hébergement ; quotas locaux non distribués.
Pas de découverte automatique d’URLs ni d’automatisation de la note commerciale.
Validation humaine reçue pour commit/push et poursuite. Priorité utilisateur corrigée :
complément 06bis de découverte automatique et préqualification avant gestion des prospects.
