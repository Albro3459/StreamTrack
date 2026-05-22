#!/usr/bin/env bash

# MUST BE RUN FROM THE DOCKER DIRECTORY!

# Use this to create the initial server application or uncomment the needed commands to update the API code, restore|backup DB, run migrations, and/or reload Caddy

set -euo pipefail

# Server Restore DB: `./DockerScript.sh RESTORE_FROM_BACKUP=./backups/streamtrack_2026-05-19_22-02-51.sql` to restore from a backup and start DB, API, and Caddy
# Local Restore DB: `./DockerScript.sh OCI_PROFILE=oracle RESTORE_FROM_BACKUP=./backups/streamtrack_2026-05-19_22-02-51.sql LOCAL_API=true` to restore from a backup and start DB, API, and IGNORE Caddy

# Server start app: `./DockerScript.sh` to starts DB, API, and Caddy
# Local start API only: `./DockerScript.sh OCI_PROFILE=oracle LOCAL_API=true` to use the oracle OCI profile and start DB, API, and IGNORE Caddy

# Server apply new API changes: `./DockerScript.sh REBUILD_API=true` to start DB, API, and Caddy and rebuild the API
# Local apply new API changes: `./DockerScript.sh OCI_PROFILE=oracle LOCAL_API=true REBUILD_API=true` to use the oracle OCI profile, start DB, API, and IGNORE Caddy, and rebuild the API

# Defaults
OCI_PROFILE="" # Only use locally (specifies the OCI profile to use. Server needs to use OCI instance creds instead)
LOCAL_API=false # Only use locally (sets custom API port and doesn't start Caddy)
REBUILD_API=false # Rebuilds the API for applying new API changes
RESTORE_FROM_BACKUP=""

for arg in "$@"; do
  case $arg in
    OCI_PROFILE=*)
      OCI_PROFILE="${arg#*=}"
      ;;
    LOCAL_API=*)
      LOCAL_API="${arg#*=}"
      ;;
    REBUILD_API=*)
      REBUILD_API="${arg#*=}"
      ;;
    RESTORE_FROM_BACKUP=*)
      RESTORE_FROM_BACKUP="${arg#*=}"
      ;;
    *)
      echo "Unknown parameter: $arg"
      exit 1
      ;;
  esac
done

# Normalize booleans
case "$LOCAL_API" in
  true|TRUE|True|1|yes|YES|Yes)
    LOCAL_API=true
    ;;
  *)
    LOCAL_API=false
    ;;
esac
case "$REBUILD_API" in
  true|TRUE|True|1|yes|YES|Yes)
    REBUILD_API=true
    ;;
  *)
    REBUILD_API=false
    ;;
esac

echo "OCI_PROFILE = $OCI_PROFILE"
echo "LOCAL_API = $LOCAL_API"
echo "REBUILD_API = $REBUILD_API"
echo "RESTORE_FROM_BACKUP = $RESTORE_FROM_BACKUP"

echo "Fetching DB credentials from OCI Vault..."

export OCI_REGION="us-sanjose-1"
export SECRET_OCID="$(rg '^SECRET_OCID=(.*)$' .env --replace '$1')"

get_streamtrack_secret_json() {
  local auth_args=()

  if [[ -n "$OCI_PROFILE" ]]; then
    auth_args+=(--profile "$OCI_PROFILE")
  else
    auth_args+=(--auth instance_principal)
  fi

  oci secrets secret-bundle get \
    "${auth_args[@]}" \
    --region "$OCI_REGION" \
    --secret-id "$SECRET_OCID" \
    --query 'data."secret-bundle-content".content' \
    --raw-output | base64 --decode
}

SECRET_JSON=$(get_streamtrack_secret_json | jq -c .)
if [[ -n "$OCI_PROFILE" ]]; then
  # Only for running the API locally. Server API will pull from OCI
  export STREAMTRACK_SECRET_JSON="$SECRET_JSON"
fi

export POSTGRES_USER=$(echo "$SECRET_JSON" | jq -r .PostgresUsername)
export POSTGRES_PASSWORD=$(echo "$SECRET_JSON" | jq -r .PostgresPassword)
export POSTGRES_DB="StreamTrack"
export POSTGRES_HOST="db"
export POSTGRES_PORT="5432"

# Run Docker Compose

echo "Starting only the database service..."
docker compose up -d db # DB first (background)
# Wait for DB to be ready
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 1
done

# RESTORE ONLY ***************************************************************************************************
# if [[ -n "$RESTORE_FROM_BACKUP" ]]; then
#   if [[ ! -f "$RESTORE_FROM_BACKUP" ]]; then
#     echo "Backup file does not exist: $RESTORE_FROM_BACKUP" >&2
#     exit 1
#   fi

#   echo "Restoring from backup file: $RESTORE_FROM_BACKUP" >&2
#   docker compose exec -T db psql -v ON_ERROR_STOP=1 --single-transaction \
#     -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$RESTORE_FROM_BACKUP"

#   # exit 0 # uncomment if you want restart only 
# fi
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

if [[ "$REBUILD_API" == "true" ]]; then
  # If you made API (and/or changes to the Caddy file/config by adding the 'caddy' service), run this first:
  docker compose build api # may need to add --no-cache. Add 'caddy' if needed
fi

if [[ "$LOCAL_API" == "true" ]]; then
  echo "LOCAL_API is true, starting the API only..."
  docker compose up -d api # Then start API (background)
else
  echo "Starting API and Caddy reverse proxy..."
  docker compose up -d api caddy # Then start API and Caddy reverse proxy (background)
  # docker compose up -d --force-recreate caddy # May need to run this (after starting the API) if Caddy still doesn't reload
fi

# To Stop with `docker compose stop` and Start with `docker compose start db api caddy`
# OR to Fully cleanup and stop containers (requires full rebuild) with `docker compose down`
# NEVER run `docker compose down -v`, this will literally delete the database!!!
