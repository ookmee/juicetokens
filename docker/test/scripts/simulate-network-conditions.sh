#!/bin/bash
set -e

# This script simulates various network conditions for testing JuiceTokens
# Must be run with network admin privileges

usage() {
  echo "Usage: $0 [command] [target]"
  echo ""
  echo "Commands:"
  echo "  delay [node]         - Add network latency to a specific node"
  echo "  packet-loss [node]   - Simulate packet loss to a specific node"
  echo "  bandwidth [node]     - Limit bandwidth to a specific node"
  echo "  partition [node]     - Network partition a specific node"
  echo "  restore [node]       - Restore normal network conditions for a node"
  echo "  restore-all          - Restore all network conditions"
  echo ""
  echo "Examples:"
  echo "  $0 delay node2       - Add 200ms latency to node2"
  echo "  $0 packet-loss node3 - Add 10% packet loss to node3"
  echo "  $0 partition node4   - Isolate node4 from the network"
  echo "  $0 restore node2     - Restore normal network for node2"
  echo "  $0 restore-all       - Restore all network conditions"
  exit 1
}

# Check for tc command
if ! command -v tc &> /dev/null; then
  echo "Error: tc command not found. Please install iproute2 package."
  exit 1
fi

# Node IP mapping
get_node_ip() {
  case "$1" in
    node1) echo "172.28.0.11" ;;
    node2) echo "172.28.0.12" ;;
    node3) echo "172.28.0.13" ;;
    node4) echo "172.28.0.14" ;;
    prometheus) echo "172.28.0.21" ;;
    grafana) echo "172.28.0.22" ;;
    *) echo "Unknown node: $1" && exit 1 ;;
  esac
}

# Add network delay
add_delay() {
  NODE=$1
  IP=$(get_node_ip $NODE)
  DELAY=${2:-200}  # Default 200ms delay
  
  echo "Adding ${DELAY}ms delay to $NODE ($IP)"
  
  # Delete any existing rules
  tc qdisc del dev eth0 root 2>/dev/null || true
  
  # Add delay
  tc qdisc add dev eth0 root handle 1: prio
  tc qdisc add dev eth0 parent 1:3 handle 30: netem delay ${DELAY}ms 20ms distribution normal
  tc filter add dev eth0 protocol ip parent 1:0 prio 3 u32 match ip dst $IP/32 flowid 1:3
  
  echo "Network delay added successfully"
}

# Add packet loss
add_packet_loss() {
  NODE=$1
  IP=$(get_node_ip $NODE)
  LOSS=${2:-10}  # Default 10% packet loss
  
  echo "Adding ${LOSS}% packet loss to $NODE ($IP)"
  
  # Delete any existing rules
  tc qdisc del dev eth0 root 2>/dev/null || true
  
  # Add packet loss
  tc qdisc add dev eth0 root handle 1: prio
  tc qdisc add dev eth0 parent 1:3 handle 30: netem loss ${LOSS}%
  tc filter add dev eth0 protocol ip parent 1:0 prio 3 u32 match ip dst $IP/32 flowid 1:3
  
  echo "Packet loss added successfully"
}

# Limit bandwidth
limit_bandwidth() {
  NODE=$1
  IP=$(get_node_ip $NODE)
  BANDWIDTH=${2:-1000}  # Default 1Mbps bandwidth limit
  
  echo "Limiting bandwidth to ${BANDWIDTH}kbit for $NODE ($IP)"
  
  # Delete any existing rules
  tc qdisc del dev eth0 root 2>/dev/null || true
  
  # Add bandwidth limit
  tc qdisc add dev eth0 root handle 1: htb default 30
  tc class add dev eth0 parent 1: classid 1:1 htb rate ${BANDWIDTH}kbit
  tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 match ip dst $IP/32 flowid 1:1
  
  echo "Bandwidth limited successfully"
}

# Create network partition
create_partition() {
  NODE=$1
  IP=$(get_node_ip $NODE)
  
  echo "Creating network partition for $NODE ($IP)"
  
  # Use iptables to block traffic
  iptables -A FORWARD -d $IP -j DROP
  iptables -A FORWARD -s $IP -j DROP
  
  echo "Network partition created successfully"
}

# Restore network conditions
restore_network() {
  NODE=$1
  IP=$(get_node_ip $NODE)
  
  echo "Restoring network conditions for $NODE ($IP)"
  
  # Remove tc qdisc rules
  tc qdisc del dev eth0 root 2>/dev/null || true
  
  # Remove iptables rules
  iptables -D FORWARD -d $IP -j DROP 2>/dev/null || true
  iptables -D FORWARD -s $IP -j DROP 2>/dev/null || true
  
  echo "Network conditions restored successfully"
}

# Restore all network conditions
restore_all() {
  echo "Restoring all network conditions"
  
  # Remove all tc qdisc rules
  tc qdisc del dev eth0 root 2>/dev/null || true
  
  # Flush all iptables rules
  iptables -F FORWARD
  
  echo "All network conditions restored successfully"
}

# Command processing
COMMAND=$1
TARGET=$2

case "$COMMAND" in
  delay)
    [ -z "$TARGET" ] && usage
    add_delay $TARGET
    ;;
  packet-loss)
    [ -z "$TARGET" ] && usage
    add_packet_loss $TARGET
    ;;
  bandwidth)
    [ -z "$TARGET" ] && usage
    limit_bandwidth $TARGET
    ;;
  partition)
    [ -z "$TARGET" ] && usage
    create_partition $TARGET
    ;;
  restore)
    [ -z "$TARGET" ] && usage
    restore_network $TARGET
    ;;
  restore-all)
    restore_all
    ;;
  *)
    usage
    ;;
esac 