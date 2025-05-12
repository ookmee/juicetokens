#!/bin/bash

# Exit on error
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Get the current user's home directory
DEPLOY_DIR="$HOME/juicetokens"

# Backup current state
log "Creating backup of current state..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r docker/production/docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || true
cp -r .env "$BACKUP_DIR/" 2>/dev/null || true

# Stop all containers and clean up
log "Stopping all containers..."
docker-compose -f docker/production/docker-compose.prod.yml down || true

# Force remove any remaining containers
log "Force removing any remaining containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Clean up Docker system
log "Cleaning up Docker system..."
docker system prune -f

# Remove all images
log "Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

# Pull latest changes
log "Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Rebuild and restart containers
log "Rebuilding and restarting containers..."
docker-compose -f docker/production/docker-compose.prod.yml up -d --build

# Wait for containers to be healthy
log "Waiting for containers to be healthy..."
sleep 10

# Check container status
log "Checking container status..."
docker-compose -f docker/production/docker-compose.prod.yml ps

log "Update completed successfully!"
log "Backup of previous state is in: $BACKUP_DIR"
log "You can check the logs with: docker-compose -f docker/production/docker-compose.prod.yml logs -f" 