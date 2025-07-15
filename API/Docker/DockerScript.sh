#!/bin/bash

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

echo "Running database migrations..."
docker compose run --rm migrate # Then Migrations (--rm means remove when done)

echo "Starting API and Caddy reverse proxy..."
docker compose up -d api caddy # Then start API and Caddy reverse proxy (background)

# Stop docker with `docker compose down`