FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS runtime
RUN apk add --no-cache iptables ip6tables setpriv
WORKDIR /app
COPY core.ts main.ts entrypoint.sh ./
RUN node --input-type=module -e 'import {DENIED_V4} from "./core.ts"; process.stdout.write(DENIED_V4.join("\n")+"\n")' > denied-v4.txt && chmod 0555 entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/app/main.ts"]
FROM runtime AS integration
COPY probe.ts ./
CMD ["/app/probe.ts"]
