#!/bin/bash
set -e

# This script runs different test scenarios against the JuiceTokens system

usage() {
  echo "Usage: $0 [scenario]"
  echo ""
  echo "Available scenarios:"
  echo "  basic-transfer      - Basic token transfer between users on the same node"
  echo "  cross-node          - Cross-node token transfer between users"
  echo "  high-volume         - High volume token transfers to test performance"
  echo "  network-issues      - Test recovery from network issues"
  echo "  partition-recovery  - Test recovery from network partition"
  echo "  persistence         - Test data persistence across restarts"
  echo "  all                 - Run all scenarios in sequence"
  echo ""
  echo "Examples:"
  echo "  $0 basic-transfer  - Run the basic transfer scenario"
  exit 1
}

# Check number of arguments
if [ $# -lt 1 ]; then
  usage
fi

SCENARIO=$1
NETWORK_SIMULATOR="juicetokens-network-sim"

# Function to run network simulator commands
run_network_sim() {
  docker exec $NETWORK_SIMULATOR /app/scripts/simulate-network-conditions.sh "$@"
}

# Basic token transfer scenario
basic_transfer_scenario() {
  echo "Running basic token transfer scenario..."
  
  # Get user IDs from node1
  SENDER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[0].id'")
  RECEIVER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[1].id'")
  
  # Get a token ID owned by the sender
  TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
  
  echo "Initiating transfer of token $TOKEN_ID from $SENDER_ID to $RECEIVER_ID"
  
  # Perform transfer
  TRANSACTION_ID=$(docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
    --tokenId="$TOKEN_ID" \
    --fromId="$SENDER_ID" \
    --toId="$RECEIVER_ID" \
    --nodeId=node1)
  
  echo "Transaction $TRANSACTION_ID initiated"
  
  # Wait for completion
  sleep 5
  
  # Verify transfer
  CURRENT_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  
  if [ "$CURRENT_OWNER" == "$RECEIVER_ID" ]; then
    echo "Transfer successful! Token $TOKEN_ID now owned by $RECEIVER_ID"
  else
    echo "Transfer failed! Token $TOKEN_ID still owned by $CURRENT_OWNER"
  fi
}

# Cross-node token transfer scenario
cross_node_scenario() {
  echo "Running cross-node token transfer scenario..."
  
  # Get user IDs from different nodes
  SENDER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[0].id'")
  RECEIVER_ID=$(docker exec juicetokens-node2 sh -c "cat /app/data/node2/users.json | jq -r '.[0].id'")
  
  # Get a token ID owned by the sender
  TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
  
  echo "Initiating cross-node transfer of token $TOKEN_ID from $SENDER_ID on node1 to $RECEIVER_ID on node2"
  
  # Perform transfer
  TRANSACTION_ID=$(docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
    --tokenId="$TOKEN_ID" \
    --fromId="$SENDER_ID" \
    --toId="$RECEIVER_ID" \
    --nodeId=node1 \
    --remoteNode=node2)
  
  echo "Cross-node transaction $TRANSACTION_ID initiated"
  
  # Wait for completion (cross-node takes longer)
  sleep 10
  
  # Verify transfer on node2
  CURRENT_OWNER=$(docker exec juicetokens-node2 sh -c "cat /app/data/node2/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  
  if [ "$CURRENT_OWNER" == "$RECEIVER_ID" ]; then
    echo "Cross-node transfer successful! Token $TOKEN_ID now owned by $RECEIVER_ID on node2"
  else
    echo "Cross-node transfer status uncertain."
    echo "Checking node1 for token status..."
    NODE1_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
    echo "On node1, token is owned by: $NODE1_OWNER"
  fi
}

# Network issues scenario
network_issues_scenario() {
  echo "Running network issues scenario..."
  
  # Get user IDs from different nodes
  SENDER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[0].id'")
  RECEIVER_ID=$(docker exec juicetokens-node3 sh -c "cat /app/data/node3/users.json | jq -r '.[0].id'")
  
  # Get a token ID owned by the sender
  TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
  
  echo "Adding network latency to node3..."
  run_network_sim delay node3 500
  
  echo "Initiating transfer with high latency of token $TOKEN_ID from $SENDER_ID on node1 to $RECEIVER_ID on node3"
  
  # Perform transfer
  TRANSACTION_ID=$(docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
    --tokenId="$TOKEN_ID" \
    --fromId="$SENDER_ID" \
    --toId="$RECEIVER_ID" \
    --nodeId=node1 \
    --remoteNode=node3)
  
  echo "Transaction $TRANSACTION_ID initiated under high latency conditions"
  
  # Wait a bit then introduce packet loss
  sleep 5
  echo "Adding packet loss to node3..."
  run_network_sim packet-loss node3 20
  
  # Wait for transaction to attempt completion
  sleep 15
  
  # Restore network
  echo "Restoring network conditions..."
  run_network_sim restore node3
  
  # Check transaction status
  echo "Checking transaction status after network restoration..."
  sleep 10
  
  # Verify token ownership
  NODE1_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  NODE3_OWNER=$(docker exec juicetokens-node3 sh -c "cat /app/data/node3/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner 2>/dev/null || echo 'not found''")
  
  echo "Final token status:"
  echo "On node1, token is owned by: $NODE1_OWNER"
  echo "On node3, token is owned by: $NODE3_OWNER"
  
  # Check pending transactions
  PENDING=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/pending-transactions.json | jq '.[] | select(.tokenId == \"$TOKEN_ID\")'")
  echo "Pending transactions for this token: $PENDING"
}

# Partition recovery scenario
partition_recovery_scenario() {
  echo "Running partition recovery scenario..."
  
  # Get user IDs
  SENDER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[0].id'")
  RECEIVER_ID=$(docker exec juicetokens-node2 sh -c "cat /app/data/node2/users.json | jq -r '.[0].id'")
  
  # Get a token ID owned by the sender
  TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
  
  echo "Creating network partition for node2..."
  run_network_sim partition node2
  
  echo "Initiating transfer during network partition of token $TOKEN_ID from $SENDER_ID on node1 to $RECEIVER_ID on node2"
  
  # Attempt transfer (should fail or hang)
  TRANSACTION_ID=$(docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
    --tokenId="$TOKEN_ID" \
    --fromId="$SENDER_ID" \
    --toId="$RECEIVER_ID" \
    --nodeId=node1 \
    --remoteNode=node2 \
    --timeout=10)
  
  echo "Transaction $TRANSACTION_ID initiated during network partition"
  
  # Wait a bit before restoring network
  sleep 20
  
  echo "Restoring network for node2..."
  run_network_sim restore node2
  
  # Let the system recover
  echo "Waiting for system to recover..."
  sleep 30
  
  # Check token status after recovery
  NODE1_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  NODE2_OWNER=$(docker exec juicetokens-node2 sh -c "cat /app/data/node2/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner 2>/dev/null || echo 'not found''")
  
  echo "Post-recovery token status:"
  echo "On node1, token is owned by: $NODE1_OWNER"
  echo "On node2, token is owned by: $NODE2_OWNER"
}

# Persistence scenario
persistence_scenario() {
  echo "Running persistence scenario..."
  
  # Get user IDs
  SENDER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[0].id'")
  RECEIVER_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[1].id'")
  
  # Get a token ID owned by the sender
  TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
  
  echo "Current owner of token $TOKEN_ID is $SENDER_ID"
  
  # Perform transfer
  TRANSACTION_ID=$(docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
    --tokenId="$TOKEN_ID" \
    --fromId="$SENDER_ID" \
    --toId="$RECEIVER_ID" \
    --nodeId=node1)
  
  echo "Transaction $TRANSACTION_ID initiated"
  
  # Wait for completion
  sleep 5
  
  # Check new owner
  NEW_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  echo "After transfer, token is owned by: $NEW_OWNER"
  
  # Restart node1
  echo "Restarting node1 to test persistence..."
  docker restart juicetokens-node1
  
  # Wait for restart
  sleep 10
  
  # Check owner after restart
  PERSISTED_OWNER=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.id.fullId == \"$TOKEN_ID\") | .telomere.currentOwner'")
  echo "After restart, token is owned by: $PERSISTED_OWNER"
  
  if [ "$NEW_OWNER" == "$PERSISTED_OWNER" ]; then
    echo "Persistence test passed! Ownership data was maintained after restart."
  else
    echo "Persistence test failed! Ownership changed after restart."
  fi
}

# High volume scenario
high_volume_scenario() {
  echo "Running high volume transaction scenario..."
  
  # Initialize high volume test data on node1
  echo "Initializing high volume test data..."
  docker exec juicetokens-node1 sh -c "TEST_SCENARIO=high_volume /app/scripts/init-test-data.sh"
  
  # Get users with tokens
  USERS=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/users.json | jq -r '.[] | select(.tokens | length > 0) | .id'")
  USER_COUNT=$(echo "$USERS" | wc -l)
  
  echo "Found $USER_COUNT users with tokens for high volume testing"
  
  # Create multiple concurrent transactions
  TRANSACTION_COUNT=20
  echo "Creating $TRANSACTION_COUNT concurrent transactions..."
  
  for i in $(seq 1 $TRANSACTION_COUNT); do
    # Select random sender and receiver
    SENDER_IDX=$((RANDOM % USER_COUNT + 1))
    RECEIVER_IDX=$(((RANDOM % (USER_COUNT - 1) + 1 + SENDER_IDX) % USER_COUNT + 1))
    
    SENDER_ID=$(echo "$USERS" | sed -n "${SENDER_IDX}p")
    RECEIVER_ID=$(echo "$USERS" | sed -n "${RECEIVER_IDX}p")
    
    # Get a token owned by sender
    TOKEN_ID=$(docker exec juicetokens-node1 sh -c "cat /app/data/node1/tokens.json | jq -r '.[] | select(.telomere.currentOwner == \"$SENDER_ID\") | .id.fullId' | head -1")
    
    if [ -n "$TOKEN_ID" ]; then
      # Execute transaction in background
      docker exec juicetokens-node1 node /app/scripts/create-transaction.js \
        --tokenId="$TOKEN_ID" \
        --fromId="$SENDER_ID" \
        --toId="$RECEIVER_ID" \
        --nodeId=node1 &
      
      echo "Started transaction $i: Token $TOKEN_ID from $SENDER_ID to $RECEIVER_ID"
    else
      echo "Skipping transaction $i: No tokens available for $SENDER_ID"
    fi
  done
  
  echo "Waiting for transactions to complete..."
  wait
  
  echo "High volume testing completed"
}

# Run selected scenario
case "$SCENARIO" in
  basic-transfer)
    basic_transfer_scenario
    ;;
  cross-node)
    cross_node_scenario
    ;;
  network-issues)
    network_issues_scenario
    ;;
  partition-recovery)
    partition_recovery_scenario
    ;;
  persistence)
    persistence_scenario
    ;;
  high-volume)
    high_volume_scenario
    ;;
  all)
    echo "Running all test scenarios..."
    basic_transfer_scenario
    sleep 5
    cross_node_scenario
    sleep 5
    persistence_scenario
    sleep 5
    network_issues_scenario
    sleep 5
    partition_recovery_scenario
    sleep 5
    high_volume_scenario
    ;;
  *)
    usage
    ;;
esac

echo "Test scenario $SCENARIO completed"