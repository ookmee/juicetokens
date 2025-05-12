# Docker Configuration

This directory contains all Docker-related configuration files organized by environment and purpose.

## Directory Structure

### `development/`
- `Dockerfile` - Base image for development
- `docker-compose.yml` - Development environment configuration

### `production/`
- `docker-compose.prod.yml` - Production environment configuration

### `monitoring/`
- `prometheus.yml` - Prometheus configuration
- `alert.rules` - Prometheus alert rules

## Usage

### Development
```bash
docker-compose -f docker/development/docker-compose.yml up
```

### Production
```bash
docker-compose -f docker/production/docker-compose.prod.yml up -d
```

### Monitoring
The monitoring stack is automatically started with the production environment.

## Notes
- All Docker configurations are version controlled
- Production configurations include resource limits and security settings
- Development configurations include hot-reloading and debugging tools 