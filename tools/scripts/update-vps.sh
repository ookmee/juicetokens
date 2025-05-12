#!/bin/bash

# Exit on error
set -e

# Source validation functions
source "$(dirname "$0")/validate.sh"

# Get the current user's home directory
DEPLOY_DIR="$HOME/juicetokens"

# Validate we're not running as root
check_root || exit 1

# Validate we're in the correct directory
validate_current_dir "$DEPLOY_DIR" || exit 1

# Validate Docker installation
validate_docker || exit 1

# Validate environment variables
validate_env

# Validate Docker compose file
validate_compose_file "docker/production/docker-compose.prod.yml" || exit 1

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Backup current state
log "Creating backup of current state..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r docker/production/docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || true
cp -r .env "$BACKUP_DIR/" 2>/dev/null || true

# Pull latest changes
log "Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Validate the deployment directory after update
validate_deploy_dir "$DEPLOY_DIR" || {
    log "Error: Failed to validate deployment directory after update"
    exit 1
}

# Rebuild and restart containers
log "Rebuilding and restarting containers..."
docker-compose -f docker/production/docker-compose.prod.yml down
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