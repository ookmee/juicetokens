/**
 * End-to-End Integration Tests
 * 
 * Comprehensive tests that validate the entire JuiceTokens ecosystem working together.
 * These tests exercise all layers from foundation through lifecycle in realistic scenarios.
 */

const TestHarness = require('./utils/testHarness');

describe('End-to-End Integration', () => {
  let harness;
  
  beforeEach(async () => {
    harness = new TestHarness();
  });
  
  afterEach(async () => {
    await harness.cleanup();
  });

  test('should complete a full token lifecycle with all layers', async () => {
    // Create a complete ecosystem
    const issuer = await harness.createNode({ id: 'issuer' });
    const merchant = await harness.createNode({ id: 'merchant' });
    const customer = await harness.createNode({ id: 'customer' });
    
    // Connect all nodes
    await issuer.connectTo(merchant);
    await merchant.connectTo(customer);
    await issuer.connectTo(customer);
    
    // 1. Issuer creates tokens
    const tokens = await issuer.lifecycle.createTokens({
      requester: issuer.id,
      amount: 100,
      denomination: 10,
      metadata: {
        purpose: 'end-to-end-test',
        expiryTimeMs: 3600000 // 1 hour
      }
    });
    
    expect(tokens.length).toBe(100);
    issuer.tokens.push(...tokens);
    
    // 2. Issuer establishes trust with merchant
    const merchantAttestation = await issuer.trust.createAttestation({
      subjectId: merchant.id,
      attestorId: issuer.id,
      claims: [
        { type: 'MERCHANT_STATUS', value: 'AUTHORIZED' },
        { type: 'TRANSACTION_LIMIT', value: '1000' }
      ]
    });
    
    // 3. Issuer transfers tokens to merchant
    const merchantTxn = await issuer.initiateTokenTransaction(merchant.id, 50);
    const merchantTransferResult = await merchantTxn.execute();
    
    expect(merchantTransferResult.success).toBe(true);
    expect(issuer.getBalance()).toBe(50);
    expect(merchant.getBalance()).toBe(50);
    
    // 4. Merchant establishes trust with customer
    const customerAttestation = await merchant.trust.createAttestation({
      subjectId: customer.id,
      attestorId: merchant.id,
      claims: [
        { type: 'CUSTOMER_STATUS', value: 'VERIFIED' },
        { type: 'TRANSACTION_LIMIT', value: '200' }
      ]
    });
    
    // 5. Merchant transfers tokens to customer
    const customerTxn = await merchant.initiateTokenTransaction(customer.id, 25);
    const customerTransferResult = await customerTxn.execute();
    
    expect(customerTransferResult.success).toBe(true);
    expect(merchant.getBalance()).toBe(25);
    expect(customer.getBalance()).toBe(25);
    
    // 6. Customer uses tokens (back to merchant)
    const purchaseTxn = await customer.initiateTokenTransaction(merchant.id, 10);
    const purchaseResult = await purchaseTxn.execute();
    
    expect(purchaseResult.success).toBe(true);
    expect(customer.getBalance()).toBe(15);
    expect(merchant.getBalance()).toBe(35);
    
    // 7. Merchant returns tokens to issuer
    const returnTxn = await merchant.initiateTokenTransaction(issuer.id, 20);
    const returnResult = await returnTxn.execute();
    
    expect(returnResult.success).toBe(true);
    expect(merchant.getBalance()).toBe(15);
    expect(issuer.getBalance()).toBe(70);
    
    // 8. Verify transaction history and logs
    const issuerLogs = issuer.getTransactionHistory();
    const merchantLogs = merchant.getTransactionHistory();
    const customerLogs = customer.getTransactionHistory();
    
    expect(issuerLogs.length).toBeGreaterThanOrEqual(2); // Initial transfer + return
    expect(merchantLogs.length).toBeGreaterThanOrEqual(3); // Receive + send to customer + receive from customer
    expect(customerLogs.length).toBeGreaterThanOrEqual(2); // Receive + purchase
  });
  
  test('should handle multi-node network with error conditions', async () => {
    // Create network
    const nodes = await harness.createNetwork(5, 'star');
    const [central, node1, node2, node3, node4] = nodes;
    
    // Create tokens for central node
    await central.createTestTokens(200);
    
    // Set up degraded network to test resilience
    harness.setNetworkCondition('degraded');
    
    // Create a sequence of transfers
    const transfers = [];
    
    // Transfer to all nodes
    for (let i = 1; i < nodes.length; i++) {
      const txn = await central.initiateTokenTransaction(nodes[i].id, 20);
      transfers.push(txn.execute());
    }
    
    // Wait for all transfers
    const results = await Promise.all(transfers);
    for (const result of results) {
      expect(result.success).toBe(true);
    }
    
    // Verify balances
    expect(central.getBalance()).toBe(120); // 200 - (4 * 20)
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].getBalance()).toBe(20);
    }
    
    // Test transaction between non-central nodes
    // This will need to go through the central node due to star topology
    const nodeTxn = await node1.initiateTokenTransaction(node2.id, 10);
    const nodeResult = await nodeTxn.execute();
    
    expect(nodeResult.success).toBe(true);
    expect(node1.getBalance()).toBe(10);
    expect(node2.getBalance()).toBe(30);
    
    // Test error condition: Disconnect a node and attempt transfer
    // Simulate network partition for node3
    for (const connection of central.connections.values()) {
      if (connection.node.id === node3.id) {
        connection.status = 'disconnected';
        connection.pipe.reliability = 0;
      }
    }
    
    // Attempt transfer to disconnected node
    const failedTxn = await central.initiateTokenTransaction(node3.id, 10);
    const failedResult = await failedTxn.execute().catch(e => ({ success: false, error: e.message }));
    
    expect(failedResult.success).toBe(false);
  });
  
  test('should handle token batch creation and multi-recipient distribution', async () => {
    // Create a token issuer and multiple recipients
    const issuer = await harness.createNode({ id: 'issuer' });
    const recipients = await harness.createNetwork(3, 'star');
    
    // Connect issuer to all recipients
    for (const recipient of recipients) {
      await issuer.connectTo(recipient);
    }
    
    // Create a batch of tokens
    const batch = await issuer.lifecycle.createTokenBatch({
      requester: issuer.id,
      totalAmount: 300,
      denomination: 1,
      batchReference: 'DISTRIBUTION-001',
      metadata: {
        purpose: 'batch-distribution-test'
      }
    });
    
    expect(batch.tokens.length).toBe(300);
    issuer.tokens.push(...batch.tokens);
    
    // Distribute tokens to recipients in one operation
    const distribution = await issuer.lifecycle.distributeTokens({
      senderId: issuer.id,
      distributions: recipients.map((recipient, index) => ({
        recipientId: recipient.id,
        amount: (index + 1) * 50 // 50, 100, 150
      }))
    });
    
    // Verify distribution results
    expect(distribution.success).toBe(true);
    expect(distribution.totalDistributed).toBe(300);
    
    // Verify recipient balances
    expect(recipients[0].getBalance()).toBe(50);
    expect(recipients[1].getBalance()).toBe(100);
    expect(recipients[2].getBalance()).toBe(150);
    
    // Verify issuer has no tokens left
    expect(issuer.getBalance()).toBe(0);
  });
  
  test('should integrate monitoring and governance layer', async () => {
    // Create network
    const nodes = await harness.createNetwork(3, 'fully_connected');
    const [node1, node2, node3] = nodes;
    
    // Enable monitoring
    for (const node of nodes) {
      node.governance.enableMonitoring({
        metricsInterval: 100,
        detailedLogs: true
      });
    }
    
    // Create tokens and execute transactions
    await node1.createTestTokens(100);
    
    // Transfer some tokens
    const txn1 = await node1.initiateTokenTransaction(node2.id, 30);
    await txn1.execute();
    
    const txn2 = await node2.initiateTokenTransaction(node3.id, 15);
    await txn2.execute();
    
    // Wait for metrics collection
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Collect system-wide metrics
    const metrics = await node1.governance.collectNetworkMetrics();
    
    // Verify metrics were collected
    expect(metrics.nodes.length).toBeGreaterThanOrEqual(3);
    expect(metrics.transactions.length).toBeGreaterThanOrEqual(2);
    
    // Verify metrics accuracy
    const node1Metrics = metrics.nodes.find(n => n.nodeId === node1.id);
    const node2Metrics = metrics.nodes.find(n => n.nodeId === node2.id);
    const node3Metrics = metrics.nodes.find(n => n.nodeId === node3.id);
    
    expect(node1Metrics.tokenCount).toBe(70);
    expect(node2Metrics.tokenCount).toBe(15);
    expect(node3Metrics.tokenCount).toBe(15);
    
    // Test system health check
    const healthCheck = await node1.governance.checkSystemHealth();
    expect(healthCheck.status).toBe('HEALTHY');
    expect(healthCheck.layers.foundation.status).toBe('OPERATIONAL');
    expect(healthCheck.layers.transport.status).toBe('OPERATIONAL');
    expect(healthCheck.layers.token.status).toBe('OPERATIONAL');
    expect(healthCheck.layers.trust.status).toBe('OPERATIONAL');
    expect(healthCheck.layers.lifecycle.status).toBe('OPERATIONAL');
  });
}); 