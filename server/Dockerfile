# Dockerfile para el servidor de Poker
FROM node:18-alpine

# Instalar dependencias del sistema para PostgreSQL
RUN apk add --no-cache postgresql-client

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY config.env ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 4000

# Comando de inicio
CMD ["npm", "start"]
