#!/bin/bash

# MUST BE RUN ON THE SERVER

# Use this to backup the database

# Run from the Docker directory!

set -euo pipefail

echo "Fetching DB credentials from OCI Vault..."

export OCI_REGION="us-sanjose-1"
export SECRET_OCID="$(rg '^SECRET_OCID=(.*)$' .env --replace '$1')"

get_streamtrack_secret_json() {
  oci secrets secret-bundle get \
    --auth instance_principal \
    --region "$OCI_REGION" \
    --secret-id "$SECRET_OCID" \
    --query 'data."secret-bundle-content".content' \
    --raw-output | base64 --decode
}

SECRET_JSON=$(get_streamtrack_secret_json)

export POSTGRES_USER=$(echo "$SECRET_JSON" | jq -r .PostgresUsername)
export POSTGRES_PASSWORD=$(echo "$SECRET_JSON" | jq -r .PostgresPassword)
export POSTGRES_DB="StreamTrack"
export POSTGRES_HOST="db"
export POSTGRES_PORT="5432"

# Run Docker Compose
echo "Starting only the database service..."
docker compose up -d db # DB first (background)

echo "Backing up the DB before applying migrations..."
mkdir -p backups
export BACKUP_FILE="backups/streamtrack_$(date +%F_%H-%M-%S).sql"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > $BACKUP_FILE
echo "Backup saved to $(pwd)/$BACKUP_FILE"
