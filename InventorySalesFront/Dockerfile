# Usamos Node
FROM node:18

# Carpeta de trabajo
WORKDIR /app

# Copiamos package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo
COPY . .

# Exponemos puerto de Vite
EXPOSE 5173

# Ejecutamos Vite
CMD ["npm", "run", "dev", "--", "--host"]