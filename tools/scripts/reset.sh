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

# Check for required environment variables
if [ -z "$GRAFANA_PASSWORD" ]; then
    log "Warning: GRAFANA_PASSWORD not set, using default 'admin'"
    export GRAFANA_PASSWORD=admin
fi

# Stop all containers
log "Stopping all containers..."
docker-compose -f docker/production/docker-compose.prod.yml down || true

# Force remove any remaining containers
log "Force removing any remaining containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Clean up
log "Cleaning up Docker system..."
docker system prune -f

# Remove all images
log "Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

# Rebuild and start
log "Rebuilding and starting containers..."
docker-compose -f docker/production/docker-compose.prod.yml up -d --build

# Wait for containers to be healthy
log "Waiting for containers to be healthy..."
sleep 10

# Check container status
log "Checking container status..."
docker-compose -f docker/production/docker-compose.prod.yml ps

log "Reset completed successfully!"
log "You can check the logs with: docker-compose -f docker/production/docker-compose.prod.yml logs -f" 