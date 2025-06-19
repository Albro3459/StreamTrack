#!/bin/bash

ROOT_DIR=$(pwd)
MIGRATIONS="$ROOT_DIR/Migrations"
SQL_DB="$ROOT_DIR/SQL/StreamTrack.db"

echo "Removing existing migrations directory: $MIGRATIONS"
rm -rf "$MIGRATIONS"

echo "Removing existing database file: $SQL_DB"
rm -f "$SQL_DB"

echo "Adding new Entity Framework migration: Initial"
dotnet ef migrations add "Initial"

echo "Updating database to latest migration"
dotnet ef database update

echo "Done."
