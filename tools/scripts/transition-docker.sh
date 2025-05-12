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

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Docker configuration transition..."

# Create new directory structure
log "Creating directory structure..."
mkdir -p docker/{development,production,monitoring}

# Backup existing files
log "Creating backup of existing files..."
BACKUP_DIR="docker_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Move files to their new locations with backup
move_file() {
    local src=$1
    local dest=$2
    if [ -f "$src" ]; then
        cp "$src" "$BACKUP_DIR/"
        mv "$src" "$dest"
        log "Moved $src to $dest (backup in $BACKUP_DIR)"
    fi
}

move_file "docker-compose.prod.yml" "docker/production/"
move_file "Dockerfile" "docker/development/"
move_file "docker-compose.yml" "docker/development/"
move_file "prometheus.yml" "docker/monitoring/"
move_file "alert.rules" "docker/monitoring/"

# Stop existing containers
log "Stopping existing containers..."
if [ -f "docker/production/docker-compose.prod.yml" ]; then
    docker-compose -f docker/production/docker-compose.prod.yml down || true
else
    docker-compose down || true
fi

# Clean up old containers and images
log "Cleaning up old containers and images..."
docker system prune -f

# Validate Docker compose file if it exists
if [ -f "docker/production/docker-compose.prod.yml" ]; then
    validate_compose_file "docker/production/docker-compose.prod.yml" || {
        log "Error: Failed to validate Docker compose file"
        exit 1
    }
fi

# Start containers with new configuration
log "Starting containers with new configuration..."
if [ -f "docker/production/docker-compose.prod.yml" ]; then
    docker-compose -f docker/production/docker-compose.prod.yml up -d
else
    log "Warning: Could not find production docker-compose file"
fi

log "Transition completed successfully!"
log "Backup of old files is in: $BACKUP_DIR"
log "Please update any custom scripts to use the new file paths:"
log "  - docker/production/docker-compose.prod.yml"
log "  - docker/development/docker-compose.yml"
log "  - docker/development/Dockerfile" 