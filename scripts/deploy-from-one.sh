#!/bin/bash
set -e

ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACCOUNT" ] || [ "$ACCOUNT" = "(unset)" ]; then
    ACCOUNT=$(gcloud auth list --format="value(account)" | head -n 1)
fi

ACCOUNT_ARGS=()
if [ -n "$ACCOUNT" ]; then
    ACCOUNT_ARGS=(--account "$ACCOUNT")
fi

echo "Extracting us-central1 image URL..."
IMAGE=$(gcloud run services describe failover-site-us --region us-central1 "${ACCOUNT_ARGS[@]}" --format='value(spec.template.spec.containers[0].image)')

if [ -z "$IMAGE" ]; then
    echo "Failed to retrieve image URL from failover-site-us (us-central1). Exiting."
    exit 1
fi

echo "Using image: $IMAGE for other regions..."

gcloud run deploy failover-site-eu --image "$IMAGE" --region europe-west4 "${ACCOUNT_ARGS[@]}" --quiet &
PID_EU=$!

gcloud run deploy failover-site-as --image "$IMAGE" --region asia-east1 "${ACCOUNT_ARGS[@]}" --quiet &
PID_AS=$!

gcloud run deploy failover-site-au --image "$IMAGE" --region australia-southeast2 "${ACCOUNT_ARGS[@]}" --quiet &
PID_AU=$!

gcloud run deploy failover-site-af --image "$IMAGE" --region africa-south1 "${ACCOUNT_ARGS[@]}" --quiet &
PID_AF=$!

echo "Waiting for all regions to finish deploying..."
wait $PID_EU
wait $PID_AS
wait $PID_AU
wait $PID_AF

echo "GLOBAL DEPLOYMENT COMPLETE! All 5 nodes updated with the exact same image."
