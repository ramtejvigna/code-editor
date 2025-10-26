#!/bin/sh

# Wait for Docker daemon to be available
echo "Waiting for Docker daemon..."
until docker info > /dev/null 2>&1; do
    echo "Docker daemon not ready, waiting..."
    sleep 2
done

echo "Docker daemon is ready!"

# Pull required Docker images for code execution
echo "Pulling required Docker images..."
docker pull python:3.11-alpine || echo "Warning: Failed to pull python image"
docker pull openjdk:11-alpine || echo "Warning: Failed to pull java image"
docker pull node:18-alpine || echo "Warning: Failed to pull node image"
docker pull gcc:latest || echo "Warning: Failed to pull gcc image"

echo "Starting Node.js server..."
exec npm start