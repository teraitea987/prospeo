# Analyse technique locale — itération 06

## Utilisation
Dans la carte d’une société, ouvrir « Analyser un site », fournir son URL HTTP(S),
puis lancer l’analyse. Aucun appel n’est déclenché par la saisie ou la recherche d’entreprises.
Un seul GET par page, jusqu’à trois redirections ; pas de crawl, sous-ressources,
robots, scripts, cookies ou navigateur distant. Le résultat disparaît avec la recherche ou le rechargement.

Installation locale sur ce Mac, Docker Desktop démarré : `pnpm analysis:setup`.
La commande désactive d’abord l’option, construit l’image, exécute la preuve réseau,
puis inscrit dans `.env` privé `ANALYSIS_ENABLED=true` et l’identifiant immuable de l’image vérifiée.
Relancer `pnpm dev` si nécessaire. Pour désactiver : `ANALYSIS_ENABLED=false`.
`pnpm test:analysis` reconstruit et vérifie sans activer ; il effectue un appel public
explicite à https://example.com. Aucun fournisseur payant. Ne pas exécuter ces commandes en parallèle d’une analyse.
Le runner vise le socket Docker Desktop local `~/.docker/run/docker.sock` ; autre plateforme non prise en charge ici.
Ne pas remplacer l’identifiant par une image non vérifiée. Après changement du worker ou de sa politique, rejouer setup.

## Observations et portée
Statut HTTP, HTTPS sur la connexion finale, nombre de redirections, présence d’un titre
et d’une déclaration viewport dans le HTML statique reçu ; version et date de collecte.
La confiance porte uniquement sur cette réponse technique ponctuelle. Les marqueurs sont des
heuristiques, pas un audit de qualité, d’accessibilité ou de compatibilité mobile.
Une réponse non HTML ou en erreur n’évalue pas les marqueurs. Un échec réseau ne prouve
ni une absence de site ni un besoin commercial. L’appartenance du site à la société reste à vérifier.
Aucun score 0/40/80 n’est déduit ni modifié ; les règles manuelles v1.0 restent inchangées.
Pas de sauvegarde, d’export, d’authentification SaaS ou de collecte de contacts.

Google Maps/Places n’est pas intégré à 06 : aucun compte, clé, budget ou politique de
conservation Google autorisés. L’API Recherche d’entreprises ne fournit pas d’URL de site
utilisée ici. L’URL est donc fournie explicitement. Découvrir automatiquement le site reste un travail fournisseur distinct.

## Défenses réseau
URL canonique HTTP/HTTPS, ports 80/443 liés au schéma, sans credentials, fragment,
contrôles, espaces, backslash, formes numériques IPv4 alternatives ou noms internes.
Résolution A et AAAA : toute adresse spéciale refuse l’ensemble. Connexion IPv4 seulement :
les URLs IPv6 littérales et domaines IPv6 seuls sont refusés. Les AAAA sont néanmoins contrôlées.
Liste conservatrice des réseaux spéciaux et blocage de l’IP de plateforme Azure.
Chaque redirection repasse par les mêmes contrôles. Pas de retry ou de repli automatique.
La connexion utilise directement l’IPv4 validée ; Host et SNI conservent le nom d’origine,
TLS vérifie normalement le certificat, l’adresse/port effectifs sont contrôlés.
Aucune nouvelle résolution DNS par le transport : protection contre le rebinding.

Conteneur jetable, aucun volume, secret, socket Docker, variable applicative ou réseau DB.
Bridge dédié et pare-feu OUTPUT : réseaux spéciaux refusés, IPv6 entièrement bloqué,
seulement TCP public 80/443 et DNS embarqué Docker. L’exception DNS suit la destination
initiale 127.0.0.11:53 via conntrack pour couvrir sa traduction et sa réponse locale.
L’initialisation du pare-feu est privilégiée ; avant lecture de l’entrée, setpriv passe
à UID/GID 10001, supprime toutes les capabilities et active no-new-privileges.
Toute erreur d’installation du pare-feu arrête le job. Seccomp Docker par défaut, racine en lecture seule.
L’environnement du worker contient seulement PATH/NODE_ENV. Aucun HTML ni en-tête tiers renvoyé au navigateur.

## Budgets et accès
DNS 2 s, connexion/TLS 3 s, inactivité lecture 3 s, signal global 12 s ; watchdog processus 14 s.
La résolution DNS déjà en cours peut finir après le signal global, sous le watchdog de 14 s.
Runner : création 5 s, exécution attachée 20 s, suppression forcée 5 s ; sortie max 8 Ko.
Corps d’entrée API 4096 octets/3 s, URL 2048 caractères ; en-têtes distants max 16 Ko,
corps cumulé max 512000 octets. Compression refusée (même si le serveur ignore identity),
donc aucune décompression ni bombe de compression ; flux sans Content-Length également bornés.
128 Mo RAM/swap sans marge supplémentaire, 0,5 CPU, 32 processus et 64 descripteurs.
Un seul job via verrou mémoire + nom Docker fixe ; six tentatives/minute par processus.
Pas de quota distribué ni de queue persistante. Si nettoyage échoue, le nom réservé bloque la suite.
Ne pas supprimer manuellement un job actif. Diagnostiquer un nom orphelin avant intervention.

POST /api/analyse : accès Basic local de 04, refus hors développement, Host loopback,
Origin HTTP identique et Sec-Fetch-Site same-origin si présent, JSON strict, no-store.
Host est vérifié explicitement car Next peut normaliser request.url à localhost.
Aucune URL dans les arguments shell/CLI ou journaux métier ; stdin JSON et spawn sans shell.
Erreurs publiques génériques, stderr drainé sans journalisation ; journaux Docker du job désactivés.
Le compte local capable de contrôler Docker reste une frontière de confiance.

## Preuves et limites
Unitaires sur SSRF, DNS mixte/rebinding/redirections, transport épinglé, compression,
taille, délais, annulation, autorisation/CSRF, concurrence/quota et nettoyage.
Intégration Docker avec un serveur privé réellement joignable dans le contrôle positif,
puis tentatives directes de socket contournant le code applicatif : refus du privé,
loopback, métadonnées, DNS public et IPv6. Vérification UID/capabilities/cgroups,
lecture seule, absence de secrets/socket et impossibilité de modifier le pare-feu.
Appel DNS/TLS public réel sur l’image runtime. Les contrôles ne constituent pas un audit complet.
Image Node de base figée par digest, paquets Alpine au build ; l’image locale utilisée est figée
par ID après tests. Pas de scan CVE de l’image OS dans cette itération ; mises à jour à revoir explicitement.
Les règles réseau doivent être revues si nouvelles plages spéciales, plateforme ou topologie.
Avant hébergement : architecture Docker locale à remplacer/revalider, identité et quotas adaptés,
audit de l’image et politique réseau de l’hébergeur. Aucun déploiement autorisé.

Références de conception consultées : [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html),
[Node HTTP](https://nodejs.org/docs/latest-v24.x/api/http.html), [Node DNS](https://nodejs.org/docs/latest-v24.x/api/dns.html),
[Docker run](https://docs.docker.com/engine/containers/run/).
