#!/bin/bash

echo "Initiating Global Deployment Matrix..."

# Deploy to primary region from source to build the latest image
echo "Deploying from source to us-central1 (failover-site-us)..."
gcloud run deploy failover-site-us --source . --region us-central1 --quiet

# Get the newly built image URL
echo "Extracting deployed image URL..."
IMAGE=$(gcloud run services describe failover-site-us --region us-central1 --format='value(spec.template.spec.containers[0].image)')

if [ -z "$IMAGE" ]; then
    echo "Failed to retrieve image URL. Exiting."
    exit 1
fi

echo "Using image: $IMAGE for other regions..."

# Deploy the exact same image to all other regions in parallel
gcloud run deploy failover-site-eu --image "$IMAGE" --region europe-west4 --quiet &
PID_EU=$!

gcloud run deploy failover-site-as --image "$IMAGE" --region asia-east1 --quiet &
PID_AS=$!

gcloud run deploy failover-site-au --image "$IMAGE" --region australia-southeast2 --quiet &
PID_AU=$!

gcloud run deploy failover-site-af --image "$IMAGE" --region africa-south1 --quiet &
PID_AF=$!

echo "Waiting for all regions to finish deploying..."
wait $PID_EU
wait $PID_AS
wait $PID_AU
wait $PID_AF

echo "GLOBAL DEPLOYMENT COMPLETE! All 5 nodes updated with the exact same image."
