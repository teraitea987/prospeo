#!/bin/sh
set -eu
# Fail closed if any rule cannot be installed. Network namespace belongs to this disposable job.
iptables -P OUTPUT DROP
ip6tables -P OUTPUT DROP
iptables -F OUTPUT
ip6tables -F OUTPUT
# Docker's embedded resolver only (on the dedicated bridge). No other local connections.
iptables -A OUTPUT -p udp -m conntrack --ctorigdst 127.0.0.11 --ctorigdstport 53 -j ACCEPT
iptables -A OUTPUT -p tcp -m conntrack --ctorigdst 127.0.0.11 --ctorigdstport 53 -j ACCEPT
while read -r cidr; do iptables -A OUTPUT -d "$cidr" -j REJECT; done < /app/denied-v4.txt
iptables -A OUTPUT -p tcp -m multiport --dports 80,443 -j ACCEPT
# No privilege or capability survives initialization. No host environment is passed.
exec setpriv --reuid=10001 --regid=10001 --clear-groups --bounding-set=-all --inh-caps=-all --ambient-caps=-all --no-new-privs env -i PATH=/usr/local/bin:/usr/bin:/bin NODE_ENV=production node "$@"
