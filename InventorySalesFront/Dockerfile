# ---------- Build React ----------
# Usamos Node
FROM node:20 AS build

# Carpeta de trabajo
WORKDIR /app

# Copiamos package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo
COPY . .

# Ejecutamos Vite
RUN npm run build


# ---------- Nginx ----------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]