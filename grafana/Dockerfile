FROM grafana/grafana:latest

USER root

RUN if [ -x "$(command -v apk)" ]; then \
        apk add --no-cache nodejs npm prometheus supervisor; \
    else \
        apt-get update && apt-get install -y nodejs npm prometheus supervisor; \
    fi

RUN mkdir -p /tmp/prometheus && chown -R 472:0 /tmp/prometheus && \
    mkdir -p /var/log && chown -R 472:0 /var/log && \
    mkdir -p /etc/prometheus && chown -R 472:0 /etc/prometheus

COPY supervisord.conf /etc/supervisord.conf

COPY prometheus.yml /etc/prometheus/prometheus.yml

WORKDIR /app
COPY metrics-server.js /app/metrics-server.js

ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_SERVER_COOKIE_SAMESITE=none
ENV GF_SERVER_COOKIE_SECURE=true
ENV GF_SECURITY_DISABLE_INITIAL_ADMIN_PASSWORD_CHANGE=true

ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/etc/grafana/provisioning/dashboards/json/absurdist.json

COPY provisioning/dashboards/provider.yaml /etc/grafana/provisioning/dashboards/provider.yaml
COPY provisioning/datasources/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml

RUN mkdir -p /etc/grafana/provisioning/dashboards/json
COPY dashboards/*.json /etc/grafana/provisioning/dashboards/json/

EXPOSE 3000 9090 8081

ENTRYPOINT []
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
