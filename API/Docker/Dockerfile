# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project and restore
COPY ./StreamTrack/API/StreamTrack.csproj ./StreamTrack/API/
RUN dotnet restore ./StreamTrack/API/StreamTrack.csproj

# Copy full API source
COPY ./StreamTrack/API/ ./StreamTrack/API/
WORKDIR /src/StreamTrack/API

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

# Copy entrypoint script from context
COPY ./StreamTrack/API/Docker/APIScript.sh .
RUN chmod +x /app/APIScript.sh

EXPOSE 5000
ENTRYPOINT ["./APIScript.sh"]
