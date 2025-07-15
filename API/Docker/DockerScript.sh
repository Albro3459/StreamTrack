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
docker compose up --build -d
