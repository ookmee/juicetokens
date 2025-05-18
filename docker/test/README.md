# JuiceTokens Docker Testing Environment

This directory contains a complete Docker-based testing environment for the JuiceTokens system. It provides a multi-node setup with monitoring capabilities and tools for simulating various network conditions.

## Overview

The testing environment consists of:

1. **Multiple JuiceTokens Nodes** - A network of 4 nodes with different roles:
   - Primary node (node1)
   - Secondary nodes (node2, node3)
   - Monitoring node (node4)

2. **Monitoring Stack** - Prometheus and Grafana for metrics collection and visualization:
   - Prometheus for collecting metrics from all nodes
   - Grafana dashboards for visualizing system performance and behavior

3. **Network Simulator** - For testing network conditions:
   - Network latency simulation
   - Packet loss simulation
   - Bandwidth limitation
   - Network partitioning

4. **Persistence Testing** - Volume mounts for each node to test data persistence across restarts

5. **Test Data Generation** - Scripts for initializing test data:
   - Token generation
   - User creation
   - Initial token distribution

## Getting Started

### Prerequisites

- Docker and Docker Compose v3.8+
- 4GB+ RAM available for the test environment
- Bash shell for running test scripts

### Starting the Test Environment

```bash
# Navigate to the project root directory
cd /path/to/juicetokens

# Start the complete testing environment
docker-compose -f docker/test/docker-compose.test.yml up -d

# Wait for all services to initialize
sleep 30

# Verify that all containers are running
docker-compose -f docker/test/docker-compose.test.yml ps
```

### Accessing Services

The test environment exposes the following ports:

- JuiceTokens Nodes:
  - Primary (node1): http://localhost:4242
  - Secondary (node2): http://localhost:4243
  - Recovery Test (node3): http://localhost:4244
  - Monitor (node4): http://localhost:4245

- Monitoring:
  - Prometheus: http://localhost:9090
  - Grafana: http://localhost:3500 (admin/admin)

## Test Scenarios

The testing environment includes several predefined test scenarios:

### Basic Token Transfer

Tests basic transfer of tokens between users on the same node:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh basic-transfer
```

### Cross-Node Token Transfer

Tests token transfer between users on different nodes:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh cross-node
```

### Network Issues Testing

Tests recovery from network issues like latency and packet loss:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh network-issues
```

### Network Partition Recovery

Tests recovery from complete network partitions:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh partition-recovery
```

### Persistence Testing

Tests data persistence across node restarts:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh persistence
```

### High Volume Testing

Tests system performance under high transaction load:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh high-volume
```

### Running All Scenarios

Run all test scenarios in sequence:

```bash
docker exec juicetokens-network-sim /app/scripts/run-test-scenario.sh all
```

## Simulating Network Conditions

Use the network simulator to create various network conditions:

```bash
# Add 200ms latency to node2
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh delay node2

# Create 10% packet loss to node3
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh packet-loss node3

# Limit bandwidth to 1Mbps for node4
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh bandwidth node4 1000

# Create network partition for node2
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh partition node2

# Restore normal network conditions for a specific node
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh restore node2

# Restore all network conditions
docker exec juicetokens-network-sim /app/scripts/simulate-network-conditions.sh restore-all
```

## Data Persistence

Each node has its own persistent volume:

- `node1_data`: Primary node data
- `node2_data`: Secondary node data
- `node3_data`: Recovery test node data
- `node4_data`: Monitor node data

Data is persisted even if containers are stopped and restarted. To clear data, you need to remove the volumes:

```bash
# Stop the environment
docker-compose -f docker/test/docker-compose.test.yml down

# Remove volumes to clear all data
docker-compose -f docker/test/docker-compose.test.yml down -v
```

## Monitoring

### Prometheus

Prometheus collects metrics from all JuiceTokens nodes. Access the Prometheus UI at http://localhost:9090.

### Grafana

Grafana provides visualization of metrics. Access Grafana at http://localhost:3500 with the following credentials:
- Username: admin
- Password: admin

Predefined dashboards include:
- JuiceTokens System Overview
- Node Performance
- Transaction Metrics
- Network Health

## Customizing the Test Environment

### Adding Test Data

You can initialize nodes with specific test data:

```bash
# Initialize default test data
docker exec juicetokens-node1 sh -c "INIT_TEST_DATA=true TEST_SCENARIO=default /app/scripts/init-test-data.sh"

# Initialize high volume test data
docker exec juicetokens-node1 sh -c "INIT_TEST_DATA=true TEST_SCENARIO=high_volume /app/scripts/init-test-data.sh"

# Initialize failure scenario test data
docker exec juicetokens-node2 sh -c "INIT_TEST_DATA=true TEST_SCENARIO=failure /app/scripts/init-test-data.sh"
```

### Custom Scenarios

You can create custom test scenarios by combining the provided tools:

1. Use `init-test-data.sh` to set up initial state
2. Use `create-transaction.js` to create specific transactions
3. Use `simulate-network-conditions.sh` to simulate specific network conditions
4. Use Docker commands to restart containers for testing recovery

## Deployment to VPS

To deploy the test environment to a VPS:

1. Clone the repository on the VPS
2. Start the environment with `docker-compose -f docker/test/docker-compose.test.yml up -d`
3. Configure firewall to expose the necessary ports
4. Share the VPS IP with test users

## Troubleshooting

### Container Startup Issues

If containers fail to start:

```bash
# Check logs
docker-compose -f docker/test/docker-compose.test.yml logs

# Check individual container logs
docker logs juicetokens-node1
```

### Data Consistency Issues

If you encounter data consistency issues:

```bash
# Restart the affected node
docker restart juicetokens-node1

# If issues persist, reinitialize test data
docker exec juicetokens-node1 sh -c "INIT_TEST_DATA=true /app/scripts/init-test-data.sh"
```

### Network Simulation Issues

If network simulation doesn't work:

```bash
# Ensure network-simulator container is running
docker ps | grep network-sim

# Check if network simulator has necessary permissions
docker exec -it juicetokens-network-sim sh -c "tc -help"
``` 