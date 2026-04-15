# ---------- Build React ----------
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Nginx ----------
FROM nginx:alpine

# Instalar herramientas necesarias
RUN apk add --no-cache gettext curl

# Copiar build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx como plantilla
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copiar script de entrada
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Normalizar line endings para evitar errores en Alpine
RUN apk add --no-cache gettext curl dos2unix && dos2unix /entrypoint.sh

# Healthcheck para ECS
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["/entrypoint.sh"]