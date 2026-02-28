#!/bin/bash

# Use this to create the initial server application or uncomment the needed commands to update the API code, run migrations, and/or reload Caddy

# Run from the Docker directory!

echo "Fetching DB credentials from AWS Secrets Manager..."

# Replace with your actual secret name
SECRET_NAME="StreamTrack"
AWS_REGION="us-west-1"

# Fetch and parse the secret
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --region $AWS_REGION \
  --secret-id $SECRET_NAME \
  --query SecretString \
  --output text)

export POSTGRES_USER=$(echo $SECRET_JSON | jq -r .PostgresUsername)
export POSTGRES_PASSWORD=$(echo $SECRET_JSON | jq -r .PostgresPassword)
export POSTGRES_DB="StreamTrack"
export POSTGRES_HOST="db"
export POSTGRES_PORT="5432"

# Run Docker Compose
echo "Starting only the database service..."
docker compose up -d db # DB first (background)

# Only need to run on a fresh db or when running new migrations! *************************************************
# MAKE A BACKUP FIRST WITH PGDUMP!!! AND MAKE SURE MIGRATIONS PRESERVE USER DATA
# echo "Backing up the DB before applying migrations..."
# mkdir -p backups
# docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/streamtrack_$(date +%F_%H-%M-%S).sql

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