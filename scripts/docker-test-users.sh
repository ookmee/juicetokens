#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 [start|stop|restart|status]"
  echo "  start   - Start the test user Docker containers"
  echo "  stop    - Stop the test user Docker containers"
  echo "  restart - Restart the test user Docker containers"
  echo "  status  - Check the status of the test user Docker containers"
  exit 1
}

# Check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running or not installed"
    exit 1
  fi
}

# Start the test user Docker containers
start_containers() {
  echo "Starting test user Docker containers..."
  docker-compose -f docker-compose.test-users.yml up -d --build
  echo "Test users started. Access them at:"
  echo "- Test User 1: http://localhost:3001"
  echo "- Test User 2: http://localhost:3002"
  echo "- Test User 3: http://localhost:3003"
}

# Stop the test user Docker containers
stop_containers() {
  echo "Stopping test user Docker containers..."
  docker-compose -f docker-compose.test-users.yml down
  echo "Test user Docker containers stopped"
}

# Check the status of the test user Docker containers
check_status() {
  echo "Status of test user Docker containers:"
  docker-compose -f docker-compose.test-users.yml ps
}

# Main script
check_docker

if [ $# -eq 0 ]; then
  usage
fi

case "$1" in
  start)
    start_containers
    ;;
  stop)
    stop_containers
    ;;
  restart)
    stop_containers
    start_containers
    ;;
  status)
    check_status
    ;;
  *)
    usage
    ;;
esac

exit 0 