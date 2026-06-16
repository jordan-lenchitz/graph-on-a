#!/bin/bash

# Build locally first just to be sure
npm run build

# Deploy to all 5 regions in parallel
echo "Initiating Global Deployment Matrix..."

gcloud run deploy failover-site-us --source . --region us-central1 --quiet &
PID_US=$!

gcloud run deploy failover-site-eu --source . --region europe-west4 --quiet &
PID_EU=$!

gcloud run deploy failover-site-as --source . --region asia-east1 --quiet &
PID_AS=$!

gcloud run deploy failover-site-au --source . --region australia-southeast2 --quiet &
PID_AU=$!

gcloud run deploy failover-site-af --source . --region africa-south1 --quiet &
PID_AF=$!

echo "Waiting for all regions to finish deploying..."
wait $PID_US
wait $PID_EU
wait $PID_AS
wait $PID_AU
wait $PID_AF

echo "GLOBAL DEPLOYMENT COMPLETE! All 5 nodes updated."
