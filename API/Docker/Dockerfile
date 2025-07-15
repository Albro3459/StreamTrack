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

RUN apt-get update && apt-get install -y netcat

# Copy entrypoint script from context
COPY ./Docker/APIScript.sh .
RUN chmod +x /app/APIScript.sh

EXPOSE 5000
ENTRYPOINT ["./APIScript.sh"]
