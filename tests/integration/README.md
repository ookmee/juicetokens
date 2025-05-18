# JuiceTokens Integration Tests

This directory contains comprehensive integration tests for the JuiceTokens system. These tests validate cross-layer interactions and end-to-end functionality.

## Test Structure

```
integration/
├── utils/                     # Test utilities
│   ├── testNode.js            # TestNode implementation
│   └── testHarness.js         # Test harness for scenarios
├── tokenLifecycle.test.js     # Token lifecycle tests
├── transportReliability.test.js  # Transport layer tests
├── trustNetwork.test.js       # Trust layer tests
├── endToEnd.test.js           # Full system tests
├── Dockerfile.test            # Docker configuration for tests
├── run-integration-tests.sh   # Test runner script
└── README.md                  # This file
```

## Running the Tests

### Using Docker (Recommended)

The easiest way to run the integration tests is using Docker:

```bash
# Run all integration tests
bash tests/integration/run-integration-tests.sh
```

This script will:
1. Set up a complete test environment using Docker Compose
2. Run all integration tests
3. Report results
4. Optionally keep the environment running for inspection

### Running Tests Locally

For development, you can run tests locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run integration tests
npm test -- tests/integration

# Run a specific test file
npm test -- tests/integration/tokenLifecycle.test.js
```

## Test Scenarios

The integration tests cover multiple key scenarios:

### Token Lifecycle

Tests the complete lifecycle of tokens:
- Token creation
- Token transfers
- Token expiration and renewal

### Transport Reliability

Tests transport layer under different conditions:
- Degraded networks
- Connection recovery
- Timeouts and rollbacks
- Various transport types (QR, NFC, BLE)

### Trust Network

Tests trust layer functionality:
- Attestation creation and verification
- Trust propagation
- Trust path discovery
- Trust verification during transactions

### End-to-End

Tests the complete system:
- Full token lifecycle with all layers
- Multi-node networks
- Batch operations
- Error handling

## Test Utilities

### TestNode

The `TestNode` class simulates a complete JuiceTokens node with all layers for testing:

```javascript
// Create a test node
const node = new TestNode();

// Create tokens
await node.createTestTokens(100);

// Connect to another node
await node.connectTo(otherNode);

// Initiate a transaction
const txn = await node.initiateTokenTransaction(otherNode.id, 30);
await txn.execute();
```

### TestHarness

The `TestHarness` class provides utilities for setting up test scenarios:

```javascript
// Create a harness
const harness = new TestHarness();

// Create a pair of connected nodes
const { sender, receiver } = await harness.createNodePair();

// Create a network of nodes
const nodes = await harness.createNetwork(5, 'fully_connected');

// Set up a token transaction scenario
const scenario = await harness.setupTokenTransactionScenario();
await scenario.transfer(30);
```

## Adding New Tests

When adding new integration tests:

1. Follow the existing test file structure
2. Use the `TestHarness` and `TestNode` utilities
3. Keep tests isolated and repeatable
4. Cover both happy paths and error conditions
5. Use descriptive test names

## Docker Test Environment

The test environment includes:

- JuiceTokens test container
- Prometheus for metrics collection
- Grafana for dashboard visualization

You can access these services when running the integration tests with the `keep-running` option:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## Troubleshooting

If tests are failing:

1. Check the test output for specific error messages
2. Review Docker logs: `docker-compose -f docker-compose.test.yml logs test`
3. Run specific test files to isolate issues
4. Enable verbose mode: `npm test -- --verbose tests/integration/tokenLifecycle.test.js` 