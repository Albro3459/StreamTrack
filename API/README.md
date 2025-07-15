# API

Swagger URL: http://localhost:5000/swagger/index.html

## Commands

cd StreamTrack/API

#### Use the Reset DB script
./resetDB.sh

#### Add new migration
dotnet ef migrations add MIGRATION_NAME -o Migrations

#### If NOT updated database yet
dotnet ef migration remove

#### How to print the migrations schema
dotnet ef migrations script


## PostgreSQL

#### Start background service
brew services start postgresql@14

#### Open postgres shell
psql postgres

CREATE USER username WITH PASSWORD '...';
CREATE DATABASE "StreamTrack" OWNER username;
GRANT ALL PRIVILEGES ON DATABASE "StreamTrack" TO username;
\q

## Docker
DockerScript.sh is the main script, which when called in the EC2 instance will run everything else.

RUN FROM INSIDE THE Docker/ DIRECTORY!

To stop docker:
docker compose down

#### Debugging
Check if API is running
docker compose ps

Check logs
docker compose logs caddy

docker compose logs api
or to stream
docker compose logs -f api
