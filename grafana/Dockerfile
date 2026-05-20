FROM grafana/grafana:latest

ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_AUTH_COOKIE_SAMESITE=none
ENV GF_AUTH_COOKIE_SECURE=true

ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/etc/grafana/provisioning/dashboards/json/absurdist.json

COPY provisioning/dashboards/provider.yaml /etc/grafana/provisioning/dashboards/provider.yaml
COPY provisioning/datasources/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml

RUN mkdir -p /etc/grafana/provisioning/dashboards/json
COPY dashboards/*.json /etc/grafana/provisioning/dashboards/json/

EXPOSE 3000
