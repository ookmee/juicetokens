# Deployment Scripts

This directory contains scripts for managing the JuiceTokens deployment on the VPS.

## Available Scripts

### update-vps.sh
The main script for updating the deployment. It:
- Creates a backup of current state
- Stops and cleans up all containers
- Pulls latest changes from the repository
- Rebuilds and restarts containers
- Provides status updates throughout the process

Usage:
```bash
./tools/scripts/update-vps.sh
```

### transition-docker.sh
Helps transition Docker configuration to the new directory structure. It:
- Creates the new directory structure
- Moves Docker configuration files to their new locations
- Creates backups of all moved files
- Updates container configuration

Usage:
```bash
./tools/scripts/transition-docker.sh
```

## Typical Workflow

1. Initial Setup:
   ```bash
   # Clone the repository
   git clone https://github.com/ookmee/juicetokens.git
   cd juicetokens
   
   # Make scripts executable
   chmod +x tools/scripts/*.sh
   ```

2. Regular Updates:
   ```bash
   # Pull and apply updates
   ./tools/scripts/update-vps.sh
   ```

## Backup and Recovery

- Each update creates a backup in a timestamped directory
- Backups include:
  - Docker compose configuration
  - Environment files
- To restore from backup:
  ```bash
  # Copy files from backup directory
  cp backup_YYYYMMDD_HHMMSS/* .
  # Rebuild containers
  docker-compose -f docker/production/docker-compose.prod.yml up -d --build
  ```

## Troubleshooting

If you encounter issues:

1. Check container status:
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml ps
   ```

2. View container logs:
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml logs -f
   ```

3. Force cleanup and rebuild:
   ```bash
   # Stop all containers
   docker-compose -f docker/production/docker-compose.prod.yml down
   # Remove all containers
   docker rm -f $(docker ps -aq)
   # Clean up system
   docker system prune -f
   # Rebuild and start
   docker-compose -f docker/production/docker-compose.prod.yml up -d --build
   ``` 