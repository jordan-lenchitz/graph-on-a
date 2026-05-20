FROM grafana/grafana:latest

# Disable authentication for demo purposes and allow embedding in iframes
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_SERVER_COOKIE_SAMESITE=none
ENV GF_SERVER_COOKIE_SECURE=true
ENV GF_SECURITY_DISABLE_INITIAL_ADMIN_PASSWORD_CHANGE=true

# Set the default home dashboard
ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/etc/grafana/provisioning/dashboards/json/absurdist.json

# Copy provisioning configurations
COPY provisioning/dashboards/provider.yaml /etc/grafana/provisioning/dashboards/provider.yaml
COPY provisioning/datasources/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml

# Copy dashboard JSON files
RUN mkdir -p /etc/grafana/provisioning/dashboards/json
COPY dashboards/*.json /etc/grafana/provisioning/dashboards/json/

# Expose the default Grafana port
EXPOSE 3000
