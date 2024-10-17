FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias y generar el package-lock.json
RUN npm install cors rate-limiter-flexible

# Copiar el resto de la aplicación
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
