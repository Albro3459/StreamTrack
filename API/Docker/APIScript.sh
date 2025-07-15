#!/bin/bash

echo "Waiting for Postgres..."
until nc -z db 5432; do # Wait on post 5432
  sleep 1
done

echo "Starting API..."
exec dotnet StreamTrack.dll