#!/bin/bash

# Create app directory
mkdir -p /opt/juicetokens

# Copy docker-compose file
cp docker-compose.prod.yml /opt/juicetokens/docker-compose.yml

# Copy prometheus config
cp prometheus.yml /opt/juicetokens/

# Set up environment variables
cat > /opt/juicetokens/.env << EOL
GRAFANA_PASSWORD=your_secure_password_here
EOL

# Set proper permissions
chmod 600 /opt/juicetokens/.env

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