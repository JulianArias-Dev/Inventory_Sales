FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar todo
COPY . .

# Ir a la carpeta del proyecto
WORKDIR /src/API

# Restaurar y publicar
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app

# Copiar lo publicado
COPY --from=build /app/publish .

# ✅ Mejor práctica: Permitir que ECS/CloudFormation sobreescriba esto
# No hardcodees ASPNETCORE_URLS aquí si no es necesario
# ECS puede manejar esto automáticamente

# Opcional: Healthcheck para que ECS sepa si tu app está viva
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "API.dll"]