#!/bin/bash

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Install commander if not already installed
if ! npm list -g | grep -q commander; then
  npm install commander
fi

# Kill any running test user processes
echo "Stopping any existing test user instances..."
pkill -f "node scripts/start-test-user.js" || true

# Start multiple test user instances
echo "Starting test user instances..."

# User 1
node scripts/start-test-user.js --port=3001 --user-id=test-user-1 &
echo "Started test-user-1 on http://localhost:3001"

# User 2
node scripts/start-test-user.js --port=3002 --user-id=test-user-2 &
echo "Started test-user-2 on http://localhost:3002"

# User 3
node scripts/start-test-user.js --port=3003 --user-id=test-user-3 &
echo "Started test-user-3 on http://localhost:3003"

echo ""
echo "All test users started. Access them at:"
echo "- Test User 1: http://localhost:3001"
echo "- Test User 2: http://localhost:3002"
echo "- Test User 3: http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop all instances"

# Wait for any key to stop
read -p "Press any key to stop all instances..." -n1 -s
echo ""

# Kill all test user processes
pkill -f "node scripts/start-test-user.js"
echo "All test user instances stopped"
