#!/bin/bash

# Create necessary directories
mkdir -p /opt/juicetokens
mkdir -p /opt/juicetokens/docker/{development,production,monitoring}

# Copy Docker configuration files
cp docker/production/docker-compose.prod.yml /opt/juicetokens/docker/production/
cp docker/development/Dockerfile /opt/juicetokens/docker/development/
cp docker/monitoring/prometheus.yml /opt/juicetokens/docker/monitoring/
cp docker/monitoring/alert.rules /opt/juicetokens/docker/monitoring/

# Set up environment
cp .env.example /opt/juicetokens/.env

# Set permissions
chown -R $USER:$USER /opt/juicetokens
chmod -R 755 /opt/juicetokens

echo "VPS setup completed. Please edit /opt/juicetokens/.env with your configuration."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start the services
cd /opt/juicetokens
docker-compose up -d

echo "VPS setup complete! Please check the logs with: docker-compose logs -f" 