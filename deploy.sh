#!/bin/bash

# Build and Deploy Script for Code Editor

echo "🚀 Building and deploying Code Editor..."

# Determine which docker-compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "📝 Using development configuration (local code execution)"
elif [ "$1" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🏭 Using production configuration"
else
    echo "🐳 Using default configuration (Docker-in-Docker code execution)"
fi

# Build and start containers
echo "📦 Building Docker images..."
docker compose -f $COMPOSE_FILE build

echo "🔄 Starting services..."
docker compose -f $COMPOSE_FILE up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."

# Check server health
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$SERVER_STATUS" = "200" ]; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed (Status: $SERVER_STATUS)"
fi

# Check client 
CLIENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$CLIENT_STATUS" = "200" ]; then
    echo "✅ Client is healthy"
else
    echo "❌ Client health check failed (Status: $CLIENT_STATUS)"
fi

echo "🎉 Deployment complete!"
echo "📱 Client available at: http://localhost:5173"
echo "🔧 Server API available at: http://localhost:5000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  - Stop services: docker compose -f $COMPOSE_FILE down"
echo "  - Restart services: docker compose -f $COMPOSE_FILE restart"
echo ""
echo "💡 Usage:"
echo "  - For development: ./deploy.sh dev"
echo "  - For production: ./deploy.sh prod"
echo "  - For default (Docker-in-Docker): ./deploy.sh"