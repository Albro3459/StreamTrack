#!/bin/bash

# Probably don't run this directly, let the DockerScript call it indirectly when running the 'migrate' service

echo "Waiting for Postgres..."
until nc -z db 5432; do # Wait on post 5432
  sleep 1
done

echo "Running EF migrations..."
dotnet ef database update # || echo "EF failed or already applied"
