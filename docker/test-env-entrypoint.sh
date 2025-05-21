#!/bin/sh
set -e

# Display environment info
echo "Starting JuiceTokens Test Environment"
echo "User ID: $USER_ID"
echo "Container ID: $CONTAINER_ID"
echo "Mock Mode: $MOCK_MODE"
echo "MongoDB URI: $MONGODB_URI"

# Wait for MongoDB to be available if using external MongoDB
if [ ! -z "$MONGODB_URI" ]; then
  echo "Waiting for MongoDB to be available..."
  
  # Extract host and port from MongoDB URI
  MONGO_HOST=$(echo $MONGODB_URI | sed -n 's/.*mongodb:\/\/\([^:]*\).*/\1/p')
  
  # If we couldn't extract host, use default
  if [ -z "$MONGO_HOST" ]; then
    MONGO_HOST="mongodb"
  fi
  
  # Wait for MongoDB to be ready
  until nc -z $MONGO_HOST 27017; do
    echo "MongoDB is unavailable - sleeping"
    sleep 1
  done
  
  echo "MongoDB is available"
fi

# Initialize the test environment with user data
if [ "$INITIALIZE_DATA" = "true" ]; then
  echo "Initializing test data for user $USER_ID..."
  node dist/scripts/init-test-data.js
fi

# Run any database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  node dist/scripts/migrate.js
fi

# If the first argument is a node command, use it
# Otherwise, prepend node
if [ "${1#node}" != "$1" ]; then
  exec "$@"
else
  # Default to starting the server
  exec node dist/server.js
fi 