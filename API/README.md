# API

Swagger URL: http://localhost:5047/swagger/index.html

## Commands

cd StreamTrack/API

#### Use the Reset DB script
./resetDB.sh

#### Add new migration
dotnet ef migrations add MIGRATION_NAME -o Migrations

#### If NOT updated database yet
dotnet ef migration remove