FROM grafana/grafana:latest

# Disable authentication for demo purposes and allow embedding in iframes
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_AUTH_COOKIE_SAMESITE=none
ENV GF_AUTH_COOKIE_SECURE=true

# Copy provisioning configuration
COPY provisioning/dashboards/provider.yaml /etc/grafana/provisioning/dashboards/provider.yaml

# Copy dashboard JSON files (wildcard handles case where folder might be empty during dev)
COPY dashboards/*.json* /etc/grafana/provisioning/dashboards/json/

# Expose the default Grafana port
EXPOSE 3000
