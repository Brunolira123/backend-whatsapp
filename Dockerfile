FROM node:18-slim

# Apenas o essencial para o Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copiar apenas o necessário
COPY package*.json ./
RUN npm install

# Instalar puppeteer sem baixar Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Criar diretório de sessões com permissões corretas
RUN mkdir -p sessions && chmod 777 sessions

# Copiar código (excluindo sessions pelo .dockerignore)
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]