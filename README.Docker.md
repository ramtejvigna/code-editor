# DevSphere IDE - Docker Deployment Guide

## Overview

DevSphere IDE is a web-based code editor that supports multiple programming languages with secure containerized code execution. This guide covers Docker deployment for both development and production environments.

## Features

- **Multi-language Support**: Python, Java, JavaScript, TypeScript, C++
- **Secure Execution**: User code runs in isolated Docker containers
- **Real-time Compilation**: Instant feedback with syntax highlighting
- **Input/Output Support**: Interactive programming with custom inputs
- **Responsive Design**: Modern UI with Monaco Editor

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available for containers
- Port 5173 (client) and 5000 (server) available

## Quick Start

### Option 1: Using deployment scripts

**Windows:**
```cmd
.\deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Docker Compose

**Development Environment:**
```bash
# Build and start services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

**Production Environment:**
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up --build -d
```

## Service URLs

- **Client (Web Interface)**: http://localhost:5173
- **Server API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Web Client    │───▶│   Node.js API   │───▶│ Docker Execution │
│  (React + Vite) │    │     Server      │    │   Containers     │
│   Port: 5173    │    │   Port: 5000    │    │   (Isolated)     │
└─────────────────┘    └─────────────────┘    └──────────────────┘
```

### Components

1. **Client**: React application with Monaco Editor, served by Nginx
2. **Server**: Node.js Express API handling code execution requests
3. **Execution Layer**: Secure Docker containers for running user code

## Configuration

### Environment Variables

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000
```

**Server:**
```env
USE_DOCKER=true          # Enable Docker execution
NODE_ENV=production      # Production mode
```

### Security Features

- Code execution in isolated containers
- Memory and CPU limits (128MB, 0.5 CPU cores)
- 10-second execution timeout
- No network access for execution containers
- Read-only file systems with temporary directories

## Supported Languages

| Language   | Version     | Container Image      |
|------------|-------------|---------------------|
| Python     | 3.11        | python:3.11-alpine  |
| Java       | 11          | openjdk:11-alpine   |
| JavaScript | Node 18     | node:18-alpine      |
| TypeScript | Latest      | node:18-alpine      |
| C++        | GCC Latest  | gcc:latest          |

## Development

### Local Development Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd code-editor
   ```

2. **Start development environment:**
   ```bash
   # Start with hot reload
   docker-compose up --build
   ```

3. **Development URLs:**
   - Client: http://localhost:5173 (with hot reload)
   - Server: http://localhost:5000

### File Structure

```
code-editor/
├── client/                 # React frontend
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── Dockerfile
│   └── server.js
├── docker-compose.yml      # Development
├── docker-compose.prod.yml # Production
└── deploy.sh/deploy.bat   # Deployment scripts
```

## Deployment Commands

### Common Operations

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate

# Scale server instances (production)
docker-compose -f docker-compose.prod.yml up --scale server=3
```

### Health Monitoring

```bash
# Check server health
curl http://localhost:5000/health

# Check all containers
docker-compose ps

# View resource usage
docker stats
```

## Production Deployment

### Cloud Deployment

1. **Update environment variables** for your domain:
   ```env
   VITE_API_URL=https://your-domain.com/api
   ```

2. **Use production compose file:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configure reverse proxy** (Nginx/Apache) for SSL termination

### Performance Optimization

- **Resource Limits**: Configure appropriate memory/CPU limits
- **Scaling**: Use multiple server instances behind load balancer
- **Caching**: Enable Nginx caching for static assets
- **Monitoring**: Implement logging and monitoring solutions

## Troubleshooting

### Common Issues

1. **Docker Socket Permission Denied:**
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

2. **Port Already in Use:**
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "8080:80"    # Client
     - "8000:5000"  # Server
   ```

3. **Container Build Failures:**
   ```bash
   # Clear Docker cache
   docker system prune -a
   docker-compose build --no-cache
   ```

4. **Memory Issues:**
   ```bash
   # Increase Docker memory limit
   # Or reduce concurrent executions
   ```

### Logs and Debugging

```bash
# Detailed container logs
docker-compose logs --timestamps --follow

# Execute commands in running container
docker-compose exec server sh
docker-compose exec client sh

# Check Docker daemon logs
sudo journalctl -u docker.service
```

## Security Considerations

- User code runs in isolated containers with restricted permissions
- No network access during code execution
- Temporary file cleanup after execution
- Resource limits prevent DoS attacks
- Regular security updates for base images

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with Docker environment
4. Submit pull request

## License

This project is licensed under the MIT License.

---

For additional support, please check the main README.md or create an issue in the repository.