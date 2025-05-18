#!/bin/bash

# Script to run JuiceTokens integration tests in Docker

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}JuiceTokens Integration Test Runner${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running.${NC} Please start Docker and try again."
  exit 1
fi

# Build and run the test environment
echo -e "${YELLOW}Setting up test environment...${NC}"

# Run Docker Compose with the test configuration
echo -e "${YELLOW}Starting test containers...${NC}"
docker-compose -f docker-compose.test.yml down --remove-orphans
docker-compose -f docker-compose.test.yml up --build -d

# Wait for the test container to be ready
echo -e "${YELLOW}Waiting for test container to be ready...${NC}"
sleep 5

# Run the tests
echo -e "${YELLOW}Running integration tests...${NC}"
docker-compose -f docker-compose.test.yml exec test npm test -- tests/integration

# Get the exit code
EXIT_CODE=$?

# Output test results
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Integration tests passed successfully!${NC}"
else
  echo -e "${RED}❌ Integration tests failed with exit code $EXIT_CODE${NC}"
fi

# Option to keep containers running or shut them down
read -p "Keep test environment running? (y/n) [n]: " KEEP_RUNNING
KEEP_RUNNING=${KEEP_RUNNING:-n}

if [[ $KEEP_RUNNING != "y" && $KEEP_RUNNING != "Y" ]]; then
  echo -e "${YELLOW}Shutting down test environment...${NC}"
  docker-compose -f docker-compose.test.yml down
  echo -e "${GREEN}Test environment has been removed.${NC}"
else
  echo -e "${GREEN}Test environment is still running.${NC}"
  echo -e "Use 'docker-compose -f docker-compose.test.yml down' to shut it down when finished."
  echo -e "Prometheus: http://localhost:9090"
  echo -e "Grafana: http://localhost:3000 (admin/admin)"
fi

exit $EXIT_CODE 