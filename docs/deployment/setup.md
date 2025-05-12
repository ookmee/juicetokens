# Deployment Setup Guide

## Prerequisites

1. **VPS Requirements**:
   - Ubuntu 20.04 or later
   - Docker and Docker Compose installed
   - Git installed
   - At least 2GB RAM
   - At least 20GB storage

2. **Domain Setup**:
   - Domain name (e.g., test.juicetokens.com)
   - SSL certificate (Let's Encrypt recommended)

## Initial Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/ookmee/juicetokens.git
   cd juicetokens
   ```

2. **Environment Configuration**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   nano .env
   ```

3. **Build and Start Services**:
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml up -d --build
   ```

## Container Management

### User Containers
- Spawned on user login
- Named: `juicetokens-user-{username}`
- Port: Dynamically assigned
- Resources: Limited to 0.5 CPU, 512MB RAM

### Trading Bot Containers
- Pre-spawned for passive trading
- Named: `juicetokens-bot-{botId}`
- Port: Dynamically assigned
- Resources: Limited to 0.25 CPU, 256MB RAM

## Monitoring Setup

1. **Prometheus**:
   - Port: 9090
   - Metrics collection
   - Alert rules configured

2. **Grafana**:
   - Port: 3001
   - Dashboards pre-configured
   - Admin password set in .env

## Backup Strategy

1. **MongoDB Backup**:
   ```bash
   # Daily backup
   docker exec mongodb mongodump --out /backup/$(date +%Y%m%d)
   ```

2. **Container State**:
   - Container states tracked in MongoDB
   - Automatic cleanup of inactive containers

## Security Measures

1. **Network Security**:
   - TLS encryption
   - Firewall rules
   - Rate limiting

2. **Container Security**:
   - Resource limits
   - Network isolation
   - Read-only filesystem where possible

## Maintenance

1. **Regular Updates**:
   ```bash
   # Pull latest changes
   git pull origin main
   # Rebuild and restart
   docker-compose -f docker/production/docker-compose.prod.yml up -d --build
   ```

2. **Log Rotation**:
   - Docker log rotation configured
   - Application logs in MongoDB

3. **Resource Monitoring**:
   - Grafana dashboards
   - Alert notifications
   - Resource usage tracking

## Management Scripts

The repository includes several scripts to help manage the deployment:

### Initial Setup
```bash
# On the VPS
./tools/scripts/setup-vps.sh
```

### Transition to New Structure
If you're updating from an older version:
```bash
# On the VPS
./tools/scripts/transition-docker.sh
```

### Reset Environment
To completely reset and rebuild the environment:
```bash
# On the VPS
./tools/scripts/reset.sh
```

### Script Locations
- `tools/scripts/setup-vps.sh` - Initial VPS setup
- `tools/scripts/transition-docker.sh` - Update to new Docker structure
- `tools/scripts/reset.sh` - Reset and rebuild environment

### Script Features
- Automatic backup of existing files
- Proper error handling
- Detailed logging
- Container status checking
- System cleanup 