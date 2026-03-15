FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props global.json HotelBookingPlatform.slnx ./
COPY src/Application/Application.csproj src/Application/
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
COPY src/Hangfire/Hangfire.csproj src/Hangfire/

RUN dotnet restore src/Hangfire/Hangfire.csproj

COPY src/Application src/Application
COPY src/Domain src/Domain
COPY src/Infrastructure src/Infrastructure
COPY src/Hangfire src/Hangfire

RUN dotnet publish src/Hangfire/Hangfire.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HotelBookingPlatform.Hangfire.dll"]
