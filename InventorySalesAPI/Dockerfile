FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para cache de capas
COPY package*.json ./
RUN npm install --production

# Copiar el código fuente
COPY . .

# Exponer el puerto configurado en docker-compose (8080)
EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

# Healthcheck para contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "src/server.js"]