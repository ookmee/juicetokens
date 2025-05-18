/**
 * TestHarness
 * 
 * Utility for setting up and managing test environments for integration tests.
 * Provides methods for creating and configuring test nodes and common test scenarios.
 * 
 * NOTE: This implementation currently uses a simplified mock transaction model.
 * The actual Four-Packet Atomic Commitment Protocol will be gradually integrated
 * with proper protocol buffer implementation according to the project's
 * progressive testing strategy.
 */

const TestNode = require('./testNode');

class TestHarness {
  constructor() {
    this.nodes = new Map();
    this.networkState = 'normal'; // normal, degraded, partitioned
  }

  /**
   * Create a new test node
   */
  async createNode(config = {}) {
    const node = new TestNode(config);
    this.nodes.set(node.id, node);
    return node;
  }

  /**
   * Create a pair of connected nodes for testing
   */
  async createNodePair(config = {}) {
    const sender = await this.createNode({
      id: 'sender',
      ...config.sender
    });
    
    const receiver = await this.createNode({
      id: 'receiver',
      ...config.receiver
    });
    
    // Connect nodes
    await sender.connectTo(receiver);
    
    return { sender, receiver };
  }

  /**
   * Setup a token transaction scenario with sender and receiver nodes
   * 
   * NOTE: This is a simplified mock setup for testing.
   * The actual implementation will use the Four-Packet Atomic Commitment Protocol.
   */
  async setupTokenTransactionScenario(config = {}) {
    const { sender, receiver } = await this.createNodePair(config);
    
    // Create initial tokens for sender
    const initialTokens = config.initialTokens || 100;
    await sender.createTestTokens(initialTokens);
    
    return { sender, receiver };
  }

  /**
   * Simulate network degradation or partitioning
   */
  setNetworkCondition(condition) {
    this.networkState = condition;
    
    // Apply condition to all nodes
    for (const [id, node] of this.nodes.entries()) {
      for (const [connId, conn] of node.connections.entries()) {
        if (condition === 'degraded') {
          conn.pipe.setLatency(500); // 500ms latency
          conn.pipe.setPacketLoss(0.2); // 20% packet loss
        } else if (condition === 'partitioned') {
          conn.pipe.disconnect();
        } else {
          // normal
          conn.pipe.setLatency(0);
          conn.pipe.setPacketLoss(0);
          conn.pipe.reconnect();
        }
      }
    }
  }

  /**
   * Clean up all nodes
   */
  async cleanup() {
    for (const [id, node] of this.nodes.entries()) {
      await node.shutdown();
    }
    this.nodes.clear();
  }
}

/**
 * ===============================================================================
 * FUTURE IMPLEMENTATION - Four-Packet Atomic Commitment Protocol Support
 * ===============================================================================
 * 
 * The TestHarness will be extended to support the Four-Packet Transaction Model
 * and Atomic Commitment Protocol with the following features:
 * 
 * 1. setupFourPacketTransactionScenario() - Create a test environment with
 *    nodes properly set up for Four-Packet transactions, including the option
 *    to initialize with seed sharing
 * 
 * 2. executeCompleteTransaction() - Execute a full Four-Packet transaction
 *    including all steps in the protocol:
 *    - Receiver shares seed with sender
 *    - Sender initiates transaction with ExoPak
 *    - Complete Four-Packet exchange with validation
 *    - Returns transaction results and updated balances
 * 
 * These implementations will be integrated as the protocol buffer
 * implementation progresses according to the project's testing strategy.
 * ===============================================================================
 */

module.exports = TestHarness; 