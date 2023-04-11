FROM devopsfaith/krakend:2.2.1 as builder
ARG ENV=prod

COPY krakend.json /tmp/krakend.json
COPY cert.pem /tmp/cert.pem
COPY key.pem /tmp/key.pem
# COPY config .

## Save temporary file to /tmp to avoid permission errors
# RUN FC_ENABLE=1 \
#     FC_OUT=/tmp/krakend.json \
#     FC_PARTIALS="/etc/krakend/partials" \
#     FC_SETTINGS="/etc/krakend/settings/$ENV" \
#     FC_TEMPLATES="/etc/krakend/templates" \
#     krakend check -d -t -c krakend.tmpl

# The linting needs the final krakend.json file
RUN krakend check -c /tmp/krakend.json --lint

FROM devopsfaith/krakend:2.2.1
COPY --from=builder --chown=krakend:nogroup /tmp/krakend.json .
COPY --from=builder --chown=krakend:nogroup /tmp/cert.pem .
COPY --from=builder --chown=krakend:nogroup /tmp/key.pem .
# Uncomment with Enterprise image:
# COPY LICENSE /etc/krakend/LICENSE
