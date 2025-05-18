#!/bin/bash
set -e

echo "Initializing test data for JuiceTokens..."

# Get node information
NODE_ID=${NODE_ID:-"node1"}
NODE_ROLE=${NODE_ROLE:-"primary"}
TEST_SCENARIO=${TEST_SCENARIO:-"default"}

echo "Node $NODE_ID ($NODE_ROLE) initializing test data for scenario: $TEST_SCENARIO"

# Create test data directory if it doesn't exist
mkdir -p /app/data/$NODE_ID

# Initialize different types of test data based on the scenario
case "$TEST_SCENARIO" in
  "default")
    echo "Initializing default test data..."
    
    # Create test tokens
    node /app/scripts/create-test-tokens.js --count=100 --value=10 --nodeId=$NODE_ID
    
    # Set up default test users
    node /app/scripts/create-test-users.js --count=5 --nodeId=$NODE_ID
    
    # Distribute tokens to test users
    node /app/scripts/distribute-test-tokens.js --nodeId=$NODE_ID
    ;;
    
  "high_volume")
    echo "Initializing high volume test data..."
    
    # Create a large number of test tokens
    node /app/scripts/create-test-tokens.js --count=1000 --value=10 --nodeId=$NODE_ID
    
    # Set up more test users
    node /app/scripts/create-test-users.js --count=50 --nodeId=$NODE_ID
    
    # Distribute tokens to test users
    node /app/scripts/distribute-test-tokens.js --nodeId=$NODE_ID
    ;;
    
  "persistence")
    echo "Initializing persistence test data..."
    
    # Create test tokens with specific IDs for consistency
    node /app/scripts/create-test-tokens.js --count=100 --value=10 --nodeId=$NODE_ID --persist=true
    
    # Set up test users with consistent IDs
    node /app/scripts/create-test-users.js --count=5 --nodeId=$NODE_ID --persist=true
    
    # Distribute tokens to test users
    node /app/scripts/distribute-test-tokens.js --nodeId=$NODE_ID --persist=true
    ;;
    
  "failure")
    echo "Initializing failure scenario test data..."
    
    # Create test tokens
    node /app/scripts/create-test-tokens.js --count=100 --value=10 --nodeId=$NODE_ID
    
    # Set up test users
    node /app/scripts/create-test-users.js --count=5 --nodeId=$NODE_ID
    
    # Distribute tokens to test users
    node /app/scripts/distribute-test-tokens.js --nodeId=$NODE_ID
    
    # Set up partial transactions that will fail
    node /app/scripts/setup-failing-transactions.js --nodeId=$NODE_ID
    ;;
    
  *)
    echo "Unknown scenario: $TEST_SCENARIO. Using default test data..."
    
    # Create test tokens
    node /app/scripts/create-test-tokens.js --count=50 --value=10 --nodeId=$NODE_ID
    
    # Set up default test users
    node /app/scripts/create-test-users.js --count=3 --nodeId=$NODE_ID
    
    # Distribute tokens to test users
    node /app/scripts/distribute-test-tokens.js --nodeId=$NODE_ID
    ;;
esac

echo "Test data initialization completed for node $NODE_ID" 