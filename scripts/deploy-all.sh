#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACCOUNT" ] || [ "$ACCOUNT" = "(unset)" ]; then
    ACCOUNT=$(gcloud auth list --format="value(account)" | head -n 1)
fi

ACCOUNT_ARGS=()
if [ -n "$ACCOUNT" ]; then
    ACCOUNT_ARGS=(--account "$ACCOUNT")
fi

echo "Initiating Global Deployment Matrix..."

echo "Deploying from source to us-central1 (failover-site-us)..."
gcloud run deploy failover-site-us --source . --region us-central1 "${ACCOUNT_ARGS[@]}" --quiet

"$SCRIPT_DIR/deploy-from-one.sh"
