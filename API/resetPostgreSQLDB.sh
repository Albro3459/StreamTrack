#!/bin/bash

# Resets the PostgreSQL DB

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS="$ROOT_DIR/Migrations"
PGSQL_USER=$(grep 'public const string Username' "$ROOT_DIR/secrets/PostgreSQL.cs" | sed 's/.*"\(.*\)".*/\1/')

echo "Removing existing migrations directory: $MIGRATIONS"
rm -rf "$MIGRATIONS"

echo "Dropping database StreamTrack (if it exists)..."
psql -d postgres -c 'DROP DATABASE IF EXISTS "StreamTrack";'

echo "Recreating database StreamTrack with owner $PGSQL_USER..."
psql -d postgres -c "CREATE DATABASE \"StreamTrack\" OWNER \"$PGSQL_USER\";"

echo "Adding new Entity Framework migration: Initial"
dotnet ef migrations add "Initial" --project "$ROOT_DIR"

echo "Updating database to latest migration"
dotnet ef database update --project "$ROOT_DIR"

echo "Done."
