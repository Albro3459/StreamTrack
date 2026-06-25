# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project and restore
COPY ./StreamTrack.csproj ./
RUN dotnet restore ./StreamTrack.csproj

# Copy full API source
COPY ./ ./

RUN dotnet publish ./StreamTrack.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

RUN apt-get update && apt-get install -y netcat-openbsd

# APIScript.sh is bind-mounted at runtime via docker-compose (it's orchestration,
# not part of the API build), so the build context stays API-only.

EXPOSE 6969
ENTRYPOINT ["bash", "./APIScript.sh"]
