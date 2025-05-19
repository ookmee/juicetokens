#!/bin/bash
set -e

# Get the node ID from environment variable or use a default
NODE_ID=${NODE_ID:-"node1"}
NODE_ROLE=${NODE_ROLE:-"primary"}
LOG_LEVEL=${LOG_LEVEL:-"info"}

echo "Starting JuiceTokens node: $NODE_ID with role: $NODE_ROLE"

# Wait for other services if needed
if [ -n "$WAIT_FOR_SERVICE" ]; then
  echo "Waiting for service $WAIT_FOR_SERVICE to be available..."
  SERVICE_HOST=$(echo $WAIT_FOR_SERVICE | cut -d':' -f1)
  SERVICE_PORT=$(echo $WAIT_FOR_SERVICE | cut -d':' -f2)
  
  while ! nc -z $SERVICE_HOST $SERVICE_PORT; do
    echo "Waiting for $SERVICE_HOST:$SERVICE_PORT..."
    sleep 1
  done
  echo "$WAIT_FOR_SERVICE is available"
fi

# Initialize test data if requested
if [ "$INIT_TEST_DATA" = "true" ]; then
  echo "Initializing test data..."
  /app/scripts/init-test-data.sh
fi

# Start the appropriate service based on node role
case "$NODE_ROLE" in
  "primary")
    echo "Starting primary node service..."
    node packages/app/dist/index.js --nodeId=$NODE_ID --role=primary --logLevel=$LOG_LEVEL
    ;;
  "secondary")
    echo "Starting secondary node service..."
    node packages/app/dist/index.js --nodeId=$NODE_ID --role=secondary --logLevel=$LOG_LEVEL
    ;;
  "monitor")
    echo "Starting monitoring node service..."
    node packages/app/dist/index.js --nodeId=$NODE_ID --role=monitor --logLevel=$LOG_LEVEL
    ;;
  *)
    echo "Unknown role: $NODE_ROLE. Starting with default configuration..."
    node packages/app/dist/index.js --nodeId=$NODE_ID --logLevel=$LOG_LEVEL
    ;;
esac