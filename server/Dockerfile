FROM node:18-alpine

WORKDIR /app

# Install dependencies for code execution
RUN apk add --no-cache python3 g++ openjdk17 bash

# Install TypeScript globally for ts-node
RUN npm install -g typescript ts-node

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install --production

# Copy the rest of the files
COPY . .

# Create directory for code execution
RUN mkdir -p /app/code
RUN chmod 777 /app/code

# Ensure proper permissions
RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["node", "server.js"]