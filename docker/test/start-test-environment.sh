#!/bin/bash
set -e

# JuiceTokens Test Environment Starter
# This script starts the Docker-based testing environment for JuiceTokens

# Display banner
echo "==============================================="
echo "      JuiceTokens Docker Test Environment      "
echo "==============================================="

# Get the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCKER_TEST_DIR="$PROJECT_ROOT/docker/test"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Parse command line arguments
DETACHED=false
CLEAN=false
STOP=false
SCENARIO=""

usage() {
    echo "Usage: $0 [options] [scenario]"
    echo ""
    echo "Options:"
    echo "  -d, --detached       Start containers in detached mode"
    echo "  -c, --clean          Remove volumes before starting (clean start)"
    echo "  -s, --stop           Stop the test environment"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Scenarios (when used with -d):"
    echo "  basic-transfer       Run basic transfer test scenario"
    echo "  cross-node           Run cross-node transfer test scenario"
    echo "  network-issues       Run network issues test scenario"
    echo "  partition-recovery   Run partition recovery test scenario"
    echo "  persistence          Run persistence test scenario"
    echo "  high-volume          Run high volume test scenario"
    echo "  all                  Run all test scenarios"
    echo ""
    echo "Examples:"
    echo "  $0                   Start all containers and show logs"
    echo "  $0 -d                Start all containers in detached mode"
    echo "  $0 -d cross-node     Start in detached mode and run cross-node scenario"
    echo "  $0 -c                Clean start (remove old volumes)"
    echo "  $0 -s                Stop the test environment"
    exit 1
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -s|--stop)
            STOP=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        basic-transfer|cross-node|network-issues|partition-recovery|persistence|high-volume|all)
            SCENARIO="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

COMPOSE_FILE="$DOCKER_TEST_DIR/docker-compose.test.yml"

# Stop the test environment if requested
if [ "$STOP" = true ]; then
    echo "Stopping the JuiceTokens test environment..."
    docker-compose -f "$COMPOSE_FILE" down
    echo "Test environment stopped successfully."
    exit 0
fi

# Clean up if requested
if [ "$CLEAN" = true ]; then
    echo "Cleaning up the JuiceTokens test environment..."
    docker-compose -f "$COMPOSE_FILE" down -v
    echo "Removed all containers and volumes."
fi

# Create required directories
mkdir -p "$PROJECT_ROOT/docker/test/scripts"

# Check if script files exist
SCRIPT_FILES=(
    "start-node.sh"
    "init-test-data.sh"
    "create-test-tokens.js"
    "create-test-users.js"
    "distribute-test-tokens.js"
    "setup-failing-transactions.js"
    "create-transaction.js"
    "simulate-network-conditions.sh"
    "run-test-scenario.sh"
)

MISSING_FILES=false
for SCRIPT in "${SCRIPT_FILES[@]}"; do
    if [ ! -f "$DOCKER_TEST_DIR/scripts/$SCRIPT" ]; then
        echo "Warning: Missing script file: $DOCKER_TEST_DIR/scripts/$SCRIPT"
        MISSING_FILES=true
    fi
done

if [ "$MISSING_FILES" = true ]; then
    echo "Some script files are missing. Please ensure all necessary files are in place."
    exit 1
fi

# Make scripts executable
chmod +x "$DOCKER_TEST_DIR/scripts/"*.sh

echo "Starting the JuiceTokens test environment..."

# Start containers
if [ "$DETACHED" = true ]; then
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo "Waiting for services to initialize..."
    sleep 15
    
    # Check if all containers are running
    CONTAINERS=$(docker-compose -f "$COMPOSE_FILE" ps -q)
    ALL_RUNNING=true
    
    for CONTAINER in $CONTAINERS; do
        STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER")
        if [ "$STATUS" != "running" ]; then
            echo "Warning: Container $CONTAINER is not running (status: $STATUS)"
            ALL_RUNNING=false
        fi
    done
    
    if [ "$ALL_RUNNING" = true ]; then
        echo "All containers are running!"
    else
        echo "Some containers are not running. Check the logs with 'docker-compose -f \"$COMPOSE_FILE\" logs'"
    fi
    
    # Run scenario if specified
    if [ -n "$SCENARIO" ]; then
        echo "Running test scenario: $SCENARIO"
        sleep 10 # Give more time for test data to initialize
        docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh "$SCENARIO"
    fi
else
    docker-compose -f "$COMPOSE_FILE" up
fi

echo "JuiceTokens test environment is ready!"