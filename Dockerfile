FROM node:22-alpine

WORKDIR /app

# Dependências necessárias para Next.js
RUN apk add --no-cache openssl ca-certificates wget

# Copiar package files e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar resto do código (excluindonode_modules e .next)
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Expor porta
EXPOSE 3000

# Porta de ambiente
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

# Comando para iniciar
CMD ["npm", "start"]
