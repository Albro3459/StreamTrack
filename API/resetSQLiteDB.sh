# #!/bin/bash

# # Resets the SQLite DB

# ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# MIGRATIONS="$ROOT_DIR/Migrations"
# SQL_DB="$ROOT_DIR/SQL/StreamTrack.db"

# echo "Removing existing migrations directory: $MIGRATIONS"
# rm -rf "$MIGRATIONS"

# echo "Removing existing database file: $SQL_DB"
# rm -f "$SQL_DB" "$SQL_DB-shm" "$SQL_DB-wal"

# echo "Adding new Entity Framework migration: Initial"
# dotnet ef migrations add "Initial" --project "$ROOT_DIR"

# echo "Updating database to latest migration"
# dotnet ef database update --project "$ROOT_DIR"

# echo "Done."
