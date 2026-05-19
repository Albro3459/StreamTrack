#!/bin/bash

# MUST BE RUN ON THE SERVER

# Use this to create the initial server application or uncomment the needed commands to update the API code, run migrations, and/or reload Caddy

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

# RESTORE ONLY ********************************************************************************************************
# docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < ./backups/streamtrack_2026-....sql
# Then keep the backup command commented, but uncomment the build migrate and run migrate commands 
# ****************************************************************************************************************

# Only need to run on a fresh db or when running new migrations! *************************************************
# MAKE A BACKUP FIRST WITH PGDUMP!!! AND MAKE SURE MIGRATIONS PRESERVE USER DATA
# echo "Backing up the DB before applying migrations..."
# mkdir -p backups
# export BACKUP_FILE="backups/streamtrack_$(date +%F_%H-%M-%S).sql"
# docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > $BACKUP_FILE
# echo "Backup saved to $(pwd)/$BACKUP_FILE"

# echo "Running database migrations..."
# docker compose build migrate # may need to add --no-cache if the build is stale and can't see new migrations
# docker compose run --rm migrate # Then Migrations (--rm means remove when done)
# *****************************************************************************************************************

echo "Starting API and Caddy reverse proxy..."
# If you made API (and/or changes to the Caddy file/config by adding the 'caddy' service), run this first:
# docker compose build api # may need to add --no-cache
docker compose up -d api caddy # Then start API and Caddy reverse proxy (background)

# To Stop with `docker compose stop` and Start with `docker compose start db api caddy`
# OR to Fully cleanup and stop containers (requires full rebuild) with `docker compose down`
# NEVER run `docker compose down -v`, this will literally delete the database!!!
