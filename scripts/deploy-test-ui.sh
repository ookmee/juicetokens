#!/bin/bash

# Deploy Test UI with Service Provider Architecture
# This script copies the necessary files to the public directory and restarts the test user containers

# Create directory structure
mkdir -p public/js/services

# Copy service provider files
echo "Copying service provider files..."
cp -f public/js/service-provider.js public/js/
cp -f public/js/services/foundation-services.js public/js/services/
cp -f public/js/services/communication-services.js public/js/services/
cp -f public/js/services/token-services.js public/js/services/

# Make directory structure if files don't exist
if [ ! -f public/js/service-provider.js ]; then
  echo "Warning: service-provider.js not found, creating empty file"
  mkdir -p public/js
  echo "// Service Provider - to be implemented" > public/js/service-provider.js
fi

if [ ! -f public/js/services/foundation-services.js ]; then
  echo "Warning: foundation-services.js not found, creating empty file"
  mkdir -p public/js/services
  echo "// Foundation Services - to be implemented" > public/js/services/foundation-services.js
fi

if [ ! -f public/js/services/communication-services.js ]; then
  echo "Warning: communication-services.js not found, creating empty file"
  mkdir -p public/js/services
  echo "// Communication Services - to be implemented" > public/js/services/communication-services.js
fi

if [ ! -f public/js/services/token-services.js ]; then
  echo "Warning: token-services.js not found, creating empty file"
  mkdir -p public/js/services
  echo "// Token Services - to be implemented" > public/js/services/token-services.js
fi

# Restart the test user containers
echo "Restarting test user containers..."
./scripts/docker-test-users.sh restart

echo "Deployment complete. Test users are available at:"
echo "- Test User 1: http://localhost:3001"
echo "- Test User 2: http://localhost:3002"
echo "- Test User 3: http://localhost:3003" 