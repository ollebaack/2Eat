FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY 2Eat.sln .
COPY src/2Eat.Domain/2Eat.Domain.csproj src/2Eat.Domain/
COPY src/2Eat.Application/2Eat.Application.csproj src/2Eat.Application/
COPY src/2Eat.Infrastructure/2Eat.Infrastructure.csproj src/2Eat.Infrastructure/
COPY src/2Eat.ServiceDefaults/2Eat.ServiceDefaults.csproj src/2Eat.ServiceDefaults/
COPY src/2Eat.Web.API/2Eat.Web.API.csproj src/2Eat.Web.API/
RUN dotnet restore src/2Eat.Web.API/2Eat.Web.API.csproj

COPY src/ src/
RUN dotnet publish src/2Eat.Web.API/2Eat.Web.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "2Eat.Web.API.dll"]
