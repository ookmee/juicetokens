# JuiceTokens Installation Guide

This guide provides detailed instructions for setting up and running the JuiceTokens system in different environments.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- Docker (v20 or later)
- Docker Compose (v2 or later)

## Installation Options

JuiceTokens can be deployed in several ways:

1. **Docker Installation** (Recommended for most users)
2. **Local Development Setup**
3. **Production Deployment**

## 1. Docker Installation

The simplest way to get started with JuiceTokens is using Docker.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/juicetokens.git
cd juicetokens

# Start the containers
docker-compose up
```

This will start the basic JuiceTokens system with default configuration. The system will be available at http://localhost:4242.

### With Monitoring

To include monitoring tools (Prometheus and Grafana):

```bash
# Start with monitoring
npm run monitor
```

This will start the JuiceTokens system with monitoring services. Dashboards will be available at:

- JuiceTokens: http://localhost:4242
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (default login: admin/admin)

### Docker Configuration

The default Docker setup includes:

- JuiceTokens service
- Network for communication
- Persistent volume for data storage

To customize the Docker environment, edit the `docker-compose.yml` file:

```yaml
# Example custom configuration
version: '3.8'

services:
  web:
    build: .
    ports:
      - "4242:4242"
    volumes:
      - .:/app
      - juicetokens-data:/app/data
    environment:
      - NODE_ENV=production
      - TOKEN_EXPIRY=3600000
      - TRUST_LEVEL_DEFAULT=medium
    networks:
      - juicetokens-net

  # Add custom services here
  
networks:
  juicetokens-net:
    driver: bridge

volumes:
  juicetokens-data:
```

## 2. Local Development Setup

For development or contributing to JuiceTokens, follow these steps for a local setup:

```bash
# Clone the repository
git clone https://github.com/your-org/juicetokens.git
cd juicetokens

# Install dependencies
npm install

# Build the protocol buffers
npm run build:proto

# Build the TypeScript code
npm run build:ts

# Run the development server
npm start
```

### Development Configuration

Configure the development environment by creating a `.env` file in the root directory:

```
# Example .env configuration
NODE_ENV=development
LOG_LEVEL=debug
TOKEN_EXPIRY=3600000
TRUST_LEVEL_DEFAULT=medium
STORAGE_PATH=./dev-data
```

### Running Tests

To run the test suite:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/unit
npm test -- tests/integration

# Run with coverage report
npm test -- --coverage
```

### Running Integration Tests in Docker

```bash
# Run integration tests in Docker
bash tests/integration/run-integration-tests.sh
```

## 3. Production Deployment

For production deployments, additional configuration and security measures are recommended.

### Server Requirements

- 2+ CPU cores
- 4+ GB RAM
- 20+ GB storage
- Linux-based OS (Ubuntu 20.04+ recommended)

### Production Setup

```bash
# Clone the repository
git clone https://github.com/your-org/juicetokens.git
cd juicetokens

# Install production dependencies
npm install --production

# Build the production version
npm run build

# Set environment variables
export NODE_ENV=production
export LOG_LEVEL=info
export TOKEN_EXPIRY=86400000  # 24 hours

# Start the production server
node dist/packages/app/index.js
```

### Using PM2 for Process Management

For production environments, we recommend using PM2:

```bash
# Install PM2
npm install -g pm2

# Start the application with PM2
pm2 start dist/packages/app/index.js --name juicetokens

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy Configuration

For production deployments, we recommend using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name juicetokens.yourdomain.com;

    location / {
        proxy_pass http://localhost:4242;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuration Options

JuiceTokens can be configured through environment variables or a configuration file.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, test, production) | development |
| `PORT` | HTTP server port | 4242 |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | info |
| `TOKEN_EXPIRY` | Default token expiry in milliseconds | 86400000 |
| `TRUST_LEVEL_DEFAULT` | Default trust level for new nodes | low |
| `STORAGE_PATH` | Path for persistent storage | ./data |

### Configuration File

For more complex configurations, create a `config.json` file in the root directory:

```json
{
  "server": {
    "port": 4242,
    "corsOrigins": ["https://yourdomain.com"]
  },
  "token": {
    "defaultExpiry": 86400000,
    "batchSize": 100,
    "maxTokensPerTransaction": 1000
  },
  "transport": {
    "qrKiss": {
      "enabled": true,
      "chunkSize": 256
    },
    "nfc": {
      "enabled": true
    },
    "ble": {
      "enabled": true,
      "scanDuration": 5000
    }
  },
  "trust": {
    "defaultLevel": "low",
    "attestationExpiry": 2592000000,
    "maxTrustPathLength": 3
  },
  "monitoring": {
    "enabled": true,
    "metricsInterval": 60000
  }
}
```

## Troubleshooting

### Common Issues

#### Docker Container Won't Start

```bash
# Check container logs
docker logs juicetokens-web-1

# Verify network configuration
docker network inspect juicetokens-test
```

#### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Rebuild protocol buffers
npm run build:proto

# Rebuild TypeScript
npm run build:ts
```

#### Connection Issues

If nodes can't connect:

1. Check if the transport layer is properly configured
2. Verify firewall settings allow the required ports
3. Check network connectivity between nodes

```bash
# Test connectivity
curl http://localhost:4242/api/health

# Check network status
docker network inspect juicetokens-test
```

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/your-org/juicetokens/issues)
2. Review logs: `docker logs juicetokens-web-1`
3. Join our [Discord Community](https://discord.gg/your-invite)

## Next Steps

Once you have JuiceTokens installed, you can:

1. Create tokens using the Lifecycle layer
2. Set up trust relationships between nodes
3. Execute token transactions
4. Monitor system health through the Governance layer

See the [User Guide](../usage/getting-started.md) for more information. 