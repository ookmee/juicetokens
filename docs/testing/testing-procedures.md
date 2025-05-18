# JuiceTokens Testing Procedures

This document outlines testing procedures for the JuiceTokens system, including both manual and automated tests.

## Testing Overview

The JuiceTokens system uses a comprehensive testing approach with multiple levels of tests:

1. **Unit Tests**: Testing individual components in isolation
2. **Layer Tests**: Testing complete layers with their internal components
3. **Contract Tests**: Testing interfaces between layers
4. **Integration Tests**: Testing multiple layers working together
5. **End-to-End Tests**: Testing the complete system

## Test Environment Setup

### Docker Test Environment

The easiest way to run tests is using the Docker test environment:

```bash
# Run the test container
bash tests/integration/run-integration-tests.sh
```

This script will:
1. Build a Docker image with the testing environment
2. Run all integration tests in the container
3. Report test results

### Local Test Environment

For development testing, you can run tests locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run all tests
npm test

# Run specific test suites
npm test -- tests/unit
npm test -- tests/integration
```

## Test Structure

The tests are organized in a hierarchical structure:

```
tests/
├── unit/                  # Unit tests for individual components
│   ├── foundation/
│   ├── transport/
│   ├── token/
│   ├── trust/
│   ├── lifecycle/
│   ├── extension/
│   └── governance/
├── layer/                 # Layer-specific tests
│   ├── foundation/
│   ├── transport/
│   ├── token/
│   ├── trust/
│   └── lifecycle/
├── contract/              # Tests for layer interfaces
│   ├── foundation-transport/
│   ├── transport-token/
│   ├── token-trust/
│   └── trust-lifecycle/
├── integration/           # Multi-layer integration tests
│   ├── utils/
│   │   ├── testNode.js
│   │   └── testHarness.js
│   ├── tokenLifecycle.test.js
│   ├── transportReliability.test.js
│   ├── trustNetwork.test.js
│   └── endToEnd.test.js
└── setup.js               # Test setup file
```

## Running Integration Tests

The integration tests are the most important for validating the complete system. They include:

### Token Lifecycle Tests

Tests the full lifecycle of tokens from creation to expiration:

```bash
# Run token lifecycle tests
npm test -- tests/integration/tokenLifecycle.test.js
```

These tests verify:
- Token creation through the lifecycle layer
- Token transfers between nodes
- Token expiration and renewal

### Transport Layer Tests

Tests the transport layer's reliability under different network conditions:

```bash
# Run transport layer tests
npm test -- tests/integration/transportReliability.test.js
```

These tests verify:
- Transactions over degraded connections
- Recovery after network partitions
- Timeouts and transaction rollbacks
- Different transport mechanisms (QR, NFC, BLE)

### Trust Network Tests

Tests the trust layer's attestation and verification features:

```bash
# Run trust network tests
npm test -- tests/integration/trustNetwork.test.js
```

These tests verify:
- Creation and verification of attestations
- Trust propagation through a network
- Expired and revoked attestations
- Trust verification during transactions

### End-to-End Tests

Comprehensive tests of the entire system:

```bash
# Run end-to-end tests
npm test -- tests/integration/endToEnd.test.js
```

These tests verify:
- Complete token lifecycle with all layers
- Multi-node networks with error conditions
- Batch token creation and distribution
- Monitoring and governance integration

## Manual Testing Procedures

In addition to automated tests, some scenarios require manual testing:

### QR Code Transport Testing

1. Start two nodes (sender and receiver)
2. Generate QR code on sender
3. Scan QR code with receiver
4. Verify token transfer completes

### NFC Transport Testing

1. Start two nodes on NFC-capable devices
2. Bring devices close together to trigger NFC
3. Verify token transfer completes

### Cross-Device Testing

1. Deploy nodes on different device types (mobile, desktop, IoT)
2. Establish connections between different platforms
3. Execute transactions across platforms
4. Verify tokens transfer correctly

## Test Coverage

To check test coverage:

```bash
# Run tests with coverage report
npm test -- --coverage
```

Target coverage metrics:
- Foundation Layer: 95%+ coverage
- Transport Layer: 90%+ coverage
- Token Layer: 95%+ coverage
- Trust Layer: 90%+ coverage
- Lifecycle Layer: 90%+ coverage

## Continuous Integration

The JuiceTokens system is configured for continuous integration testing:

```yaml
# CI workflow (in .github/workflows/test.yml)
name: JuiceTokens Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
        
  integration-tests:
    needs: [unit-tests]
    runs-on: ubuntu-latest
    services:
      prometheus:
        image: prom/prometheus
        ports:
          - 9090:9090
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run integration tests
        run: npm run test:integration
```

## Test Data

Test data is generated using utility classes in `tests/integration/utils/`:

```javascript
// Example of creating test data
const testHarness = new TestHarness();
const { sender, receiver } = await testHarness.createNodePair();

// Create test tokens
await sender.createTestTokens(100);

// Verify initial state
expect(sender.getBalance()).toBe(100);
expect(receiver.getBalance()).toBe(0);

// Execute transaction
const txn = await sender.initiateTokenTransaction(receiver.id, 30);
await txn.execute();

// Verify final state
expect(sender.getBalance()).toBe(70);
expect(receiver.getBalance()).toBe(30);
```

## Common Test Scenarios

### Token Transaction Testing

```javascript
test('should complete a token transfer between nodes', async () => {
  // Setup
  const scenario = await harness.setupTokenTransactionScenario();
  
  // Initial state
  expect(scenario.getBalances().sender).toBe(100);
  expect(scenario.getBalances().receiver).toBe(0);
  
  // Execute transfer
  await scenario.transfer(30);
  
  // Verify final state
  expect(scenario.getBalances().sender).toBe(70);
  expect(scenario.getBalances().receiver).toBe(30);
});
```

### Trust Verification Testing

```javascript
test('should verify attestations before token transactions', async () => {
  // Create nodes
  const { sender, receiver } = await harness.createNodePair();
  
  // Add tokens to sender
  await sender.createTestTokens(50);
  
  // Create attestation
  await sender.trust.createAttestation({
    subjectId: receiver.id,
    attestorId: sender.id,
    claims: [{ type: 'TRANSACTION_APPROVAL', value: 'APPROVED' }]
  });
  
  // Enable trust verification
  sender.token.setVerificationRequired(true);
  
  // Transaction should succeed
  const txn = await sender.initiateTokenTransaction(receiver.id, 20);
  const result = await txn.execute();
  
  expect(result.success).toBe(true);
});
```

### Error Condition Testing

```javascript
test('should handle network partitions', async () => {
  // Setup nodes
  const { sender, receiver } = await harness.createNodePair();
  await sender.createTestTokens(50);
  
  // Partition the network
  harness.setNetworkCondition('partitioned');
  
  // Attempt transaction
  const txn = await sender.initiateTokenTransaction(receiver.id, 20);
  const result = await txn.execute().catch(e => ({ success: false, error: e.message }));
  
  // Verify transaction failed
  expect(result.success).toBe(false);
  
  // Verify balances unchanged
  expect(sender.getBalance()).toBe(50);
  expect(receiver.getBalance()).toBe(0);
});
```

## Performance Testing

Performance tests measure system throughput and latency:

```javascript
test('should handle multiple concurrent transfers', async () => {
  // Create network
  const nodes = await harness.createNetwork(10, 'fully_connected');
  
  // Create tokens for all nodes
  for (const node of nodes) {
    await node.createTestTokens(100);
  }
  
  // Execute many concurrent transfers
  const startTime = Date.now();
  
  const promises = [];
  for (let i = 0; i < 100; i++) {
    const sender = nodes[i % nodes.length];
    const receiver = nodes[(i + 1) % nodes.length];
    promises.push(sender.initiateTokenTransaction(receiver.id, 1).then(txn => txn.execute()));
  }
  
  await Promise.all(promises);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`Completed 100 transfers in ${duration}ms (${100000/duration} TPS)`);
});
```

## Security Testing

Security tests verify the system's resistance to attacks:

```javascript
test('should prevent double-spending', async () => {
  // Setup
  const { sender, receiver1, receiver2 } = await harness.createTriad();
  await sender.createTestTokens(50);
  
  // Attempt to spend the same tokens twice
  const tokens = sender.tokens.slice(0, 20);
  
  // First transaction
  const txn1 = await sender.initiateTokenTransaction(receiver1.id, 20);
  await txn1.execute();
  
  // Second transaction with same tokens should fail
  try {
    const txn2 = await sender.createTransaction({
      receiverId: receiver2.id,
      tokens: tokens
    });
    await txn2.execute();
    fail('Should have thrown an error');
  } catch (e) {
    expect(e.message).toContain('already spent');
  }
  
  // Verify only the first transaction succeeded
  expect(sender.getBalance()).toBe(30);
  expect(receiver1.getBalance()).toBe(20);
  expect(receiver2.getBalance()).toBe(0);
});
```

## Troubleshooting Tests

If tests are failing, try these steps:

1. **Check Test Environment**
   - Verify Docker is running correctly
   - Check that all dependencies are installed

2. **Isolated Testing**
   - Run specific test files to isolate issues
   - Use `--verbose` flag for detailed logs:
     ```bash
     npm test -- --verbose tests/integration/tokenLifecycle.test.js
     ```

3. **Debug Mode**
   - Enable debug logging:
     ```bash
     DEBUG=juicetokens:* npm test
     ```

4. **Common Issues**
   - Timeouts: Increase default timeout in Jest config
   - Connection errors: Check network configuration
   - Async failures: Check Promise rejection handling

## Accepting Test Criteria

For a test to be considered successful, it must:

1. Pass consistently (no flaky tests)
2. Complete within reasonable time limits
3. Not interfere with other tests (isolation)
4. Cover critical functionality
5. Include appropriate assertions

## Test Maintenance

Tests should be maintained as the system evolves:

1. Update tests when APIs change
2. Add tests for new features
3. Remove tests for deprecated functionality
4. Refactor tests to improve clarity and performance

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Integration Test Harness API](../api/test-harness.md)
- [Mocking Guidelines](../development/mocking.md) 