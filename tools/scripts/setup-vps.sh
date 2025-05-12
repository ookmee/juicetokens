#!/bin/bash

# Exit on error
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Get the current user's home directory
DEPLOY_DIR="$HOME/juicetokens"

# Create necessary directories
log "Creating directory structure in $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/docker/{development,production,monitoring}"

# Copy Docker configuration files
log "Copying Docker configuration files..."
cp docker/production/docker-compose.prod.yml "$DEPLOY_DIR/docker/production/"
cp docker/development/Dockerfile "$DEPLOY_DIR/docker/development/"
cp docker/monitoring/prometheus.yml "$DEPLOY_DIR/docker/monitoring/"
cp docker/monitoring/alert.rules "$DEPLOY_DIR/docker/monitoring/"

# Set up environment
log "Setting up environment..."
cp .env.example "$DEPLOY_DIR/.env"

# Set permissions
log "Setting permissions..."
chown -R $USER:$USER "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

log "VPS setup completed. Please edit $DEPLOY_DIR/.env with your configuration."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    log "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start the services
log "Starting services..."
cd "$DEPLOY_DIR"
docker-compose -f docker/production/docker-compose.prod.yml up -d

log "VPS setup complete! Please check the logs with: docker-compose -f docker/production/docker-compose.prod.yml logs -f" 