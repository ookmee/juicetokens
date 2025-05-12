#!/bin/bash

# Exit on error
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if we're in the juicetokens directory
if [ ! -f "package.json" ]; then
    log "Error: This script must be run from the juicetokens root directory"
    exit 1
fi

# Stash any local changes
log "Stashing any local changes..."
git stash || true

# Pull latest changes
log "Pulling latest changes from main branch..."
git pull origin main

# If there were stashed changes, try to apply them
if git stash list | grep -q "stash@{0}"; then
    log "Applying stashed changes..."
    git stash pop || {
        log "Warning: Could not apply stashed changes. They are saved in the stash."
        log "You can view them with: git stash show -p"
    }
fi

# Make scripts executable
log "Making scripts executable..."
chmod +x tools/scripts/*.sh

# Run the transition script if needed
if [ -f "docker-compose.prod.yml" ] || [ -f "Dockerfile" ]; then
    log "Running transition script..."
    ./tools/scripts/transition-docker.sh
fi

# Run the reset script
log "Running reset script..."
./tools/scripts/reset.sh

log "Update completed successfully!"
log "You can check the logs with: docker-compose -f docker/production/docker-compose.prod.yml logs -f" 