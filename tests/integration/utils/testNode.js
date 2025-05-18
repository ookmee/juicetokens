/**
 * TestNode
 * 
 * Utility class for integration testing that represents a JuiceTokens node
 * with all layers connected. Useful for testing cross-layer interactions.
 * 
 * NOTE: This implementation currently uses a simplified mock transaction model.
 * The actual Four-Packet Atomic Commitment Protocol will be gradually integrated
 * with proper protocol buffer implementation according to the project's
 * progressive testing strategy.
 */

const { v4: uuidv4 } = require('uuid');

class TestNode {
  constructor(config = {}) {
    this.id = config.id || uuidv4();
    this.tokens = [];
    this.connections = new Map();
    this.logs = [];
    
    // Initialize all layers
    this.foundation = require('../../../packages/foundation');
    this.transport = require('../../../packages/transport');
    this.token = require('../../../packages/token');
    this.trust = require('../../../packages/trust');
    this.lifecycle = require('../../../packages/lifecycle');
    
    this.log(`TestNode ${this.id} initialized`);
  }
  
  /**
   * Log an event for test verification
   */
  log(message) {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, message });
    // console.log(`[${this.id}] ${message}`);
  }
  
  /**
   * Create test tokens for this node
   */
  async createTestTokens(amount = 100, denomination = 1) {
    this.log(`Creating ${amount} test tokens`);
    
    const tokenIds = [];
    for (let i = 0; i < amount; i++) {
      const tokenId = `${this.id.substring(0, 6)}-TEST-${denomination}-${i}`;
      tokenIds.push(tokenId);
    }
    
    // Request tokens from lifecycle layer
    const tokens = await this.lifecycle.createTokens({
      requester: this.id,
      amount,
      denomination,
      metadata: {
        purpose: 'integration-test'
      }
    });
    
    this.tokens.push(...tokens);
    this.log(`Created ${tokens.length} tokens`);
    return tokens;
  }
  
  /**
   * Connect to another test node
   */
  async connectTo(otherNode, transportType = 'DIRECT') {
    this.log(`Connecting to node ${otherNode.id}`);
    
    // Create transport pipe
    const pipeConfig = {
      pipeType: transportType,
      timeoutMs: 30000
    };
    
    const pipe = await this.transport.createPipe(pipeConfig, otherNode.id);
    
    // Store connection
    this.connections.set(otherNode.id, {
      node: otherNode,
      pipe,
      status: 'connected'
    });
    
    this.log(`Connected to ${otherNode.id} via ${transportType}`);
    return pipe;
  }
  
  /**
   * Initiate a token transaction to another node
   * 
   * NOTE: This is a simplified mock implementation for testing.
   * The actual implementation will use the Four-Packet Atomic Commitment Protocol
   * with proper protocol buffer messages. This implementation will be incrementally
   * replaced as the protocol buffer implementation progresses.
   */
  async initiateTokenTransaction(receiverNodeId, amount) {
    this.log(`Initiating transaction of ${amount} tokens to ${receiverNodeId}`);
    
    // Check if connected
    if (!this.connections.has(receiverNodeId)) {
      throw new Error(`Not connected to ${receiverNodeId}`);
    }
    
    // Check if enough tokens
    if (this.tokens.length < amount) {
      throw new Error(`Not enough tokens: have ${this.tokens.length}, need ${amount}`);
    }
    
    // Select tokens for transaction
    const tokensToSend = this.tokens.slice(0, amount);
    
    // Create transaction
    const transaction = await this.token.createTransaction({
      senderId: this.id,
      receiverId: receiverNodeId,
      tokens: tokensToSend,
      pipe: this.connections.get(receiverNodeId).pipe
    });
    
    this.log(`Transaction created: ${transaction.id}`);
    return {
      transaction,
      execute: async () => {
        this.log(`Executing transaction ${transaction.id}`);
        const result = await this.token.executeTransaction(transaction);
        
        if (result.success) {
          // Update token lists on success
          this.tokens = this.tokens.slice(amount);
          const receiverNode = this.connections.get(receiverNodeId).node;
          receiverNode.tokens.push(...tokensToSend);
        }
        
        this.log(`Transaction ${transaction.id} ${result.success ? 'completed' : 'failed'}`);
        return result;
      }
    };
  }
  
  /**
   * Get current token balance
   */
  getBalance() {
    return this.tokens.length;
  }
  
  /**
   * Get transaction log
   */
  getTransactionHistory() {
    return this.logs.filter(log => log.message.includes('transaction'));
  }
  
  /**
   * Verify trust for a node
   */
  async verifyTrust(nodeId) {
    this.log(`Verifying trust for ${nodeId}`);
    return await this.trust.verifyNode(nodeId);
  }
  
  /**
   * Close connections and clean up
   */
  async shutdown() {
    this.log(`Shutting down node ${this.id}`);
    
    // Close all connections
    for (const [nodeId, connection] of this.connections.entries()) {
      this.log(`Closing connection to ${nodeId}`);
      await connection.pipe.close();
    }
    
    this.connections.clear();
    this.log(`Node ${this.id} shutdown complete`);
  }
}

/**
 * ===============================================================================
 * FUTURE IMPLEMENTATION - Four-Packet Atomic Commitment Protocol
 * ===============================================================================
 * The code below represents the intended implementation of the Four-Packet
 * Atomic Commitment Protocol. This will be integrated incrementally as the
 * project's protocol buffer implementation progresses.
 * 
 * The following methods are commented out and will replace the simplified
 * mock implementation above when integrated with proper protocol buffers.
 * ===============================================================================

class TestNodeWithProperProtocol {
  
  // Constructor and basic methods would remain similar...
  
  /**
   * Share seed to initiate transaction (first step in the protocol)
   */
  /*
  async shareSeed(receiverNodeId) {
    this.log(`Sharing seed with ${receiverNodeId} to initiate transaction`);
    
    // Check if connected
    if (!this.connections.has(receiverNodeId)) {
      throw new Error(`Not connected to ${receiverNodeId}`);
    }
    
    const connection = this.connections.get(receiverNodeId);
    const receiverNode = connection.node;
    
    // Generate a random seed for this transaction
    const transactionId = uuidv4();
    const seed = await this.foundation.crypto.generateRandomSeed();
    
    // Create transaction context
    const transactionContext = {
      id: transactionId,
      seed,
      senderId: receiverNodeId, // Actual sender is the receiver in first step
      receiverId: this.id,
      status: 'SEED_SHARED',
      timestamp: new Date().toISOString()
    };
    
    // Store transaction context
    this.transactions.set(transactionId, transactionContext);
    
    // Send seed to receiver (who will be the actual sender)
    await connection.pipe.send({
      type: 'TRANSACTION_SEED',
      transactionId,
      seed,
      receiverId: this.id
    });
    
    this.log(`Seed shared for transaction ${transactionId}`);
    return transactionId;
  }
  
  /**
   * Initiate a token transaction with ExoPak/RetroPak model
   * This is called by the sender after receiving a seed from the receiver
   */
  /*
  async initiateTokenTransaction(receiverNodeId, amount) {
    this.log(`Initiating transaction of ${amount} tokens to ${receiverNodeId}`);
    
    // Check if connected
    if (!this.connections.has(receiverNodeId)) {
      throw new Error(`Not connected to ${receiverNodeId}`);
    }
    
    // Check if enough tokens
    if (this.tokens.length < amount) {
      throw new Error(`Not enough tokens: have ${this.tokens.length}, need ${amount}`);
    }
    
    const connection = this.connections.get(receiverNodeId);
    const receiverNode = connection.node;
    
    // Select tokens for transaction
    const tokensToSend = this.tokens.slice(0, amount);
    
    // Create transaction ID
    const transactionId = uuidv4();
    
    // Get or create seed
    let seed;
    // Check if we have a transaction initiated by the receiver
    const existingTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.senderId === this.id && tx.receiverId === receiverNodeId && tx.status === 'SEED_SHARED');
    
    if (existingTransactions.length > 0) {
      // Use existing transaction with seed from receiver
      const existingTx = existingTransactions[0];
      seed = existingTx.seed;
      this.transactions.delete(existingTx.id);
      this.log(`Using seed from receiver for transaction ${transactionId}`);
    } else {
      // Generate new seed
      seed = await this.foundation.crypto.generateRandomSeed();
      this.log(`Generated new seed for transaction ${transactionId}`);
    }
    
    // Create ExoPak (tokens to send)
    const sExoPak = await this.token.createExoPak({
      transactionId,
      seed,
      tokens: tokensToSend,
      senderId: this.id,
      receiverId: receiverNodeId
    });
    
    // Create RetroPak (tokens to keep for rollback)
    const sRetroPak = await this.token.createRetroPak({
      transactionId,
      seed,
      tokens: tokensToSend,
      senderId: this.id,
      receiverId: receiverNodeId
    });
    
    // Create transaction context
    const transactionContext = {
      id: transactionId,
      senderId: this.id,
      receiverId: receiverNodeId,
      amount,
      tokens: tokensToSend,
      sExoPak,
      sRetroPak,
      status: 'INITIATED',
      pipe: connection.pipe,
      timestamp: new Date().toISOString()
    };
    
    // Store transaction context
    this.transactions.set(transactionId, transactionContext);
    
    this.log(`Transaction ${transactionId} created with ${amount} tokens`);
    
    return {
      transactionId,
      execute: async () => {
        return await this.executeTransaction(transactionId);
      }
    };
  }
  
  /**
   * Execute the Four-Packet Atomic Commitment Protocol for a transaction
   */
  /*
  async executeTransaction(transactionId) {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    this.log(`Executing transaction ${transactionId}`);
    
    // STEP 1: TRANSACTION INITIATION
    // Send sExoPak to receiver
    await tx.pipe.send({
      type: 'TRANSACTION_INITIATION',
      transactionId,
      sExoPak: tx.sExoPak,
      senderId: this.id,
      receiverId: tx.receiverId
    });
    
    tx.status = 'INITIATION_SENT';
    this.log(`Transaction initiation sent for ${transactionId}`);
    
    // STEP 2: Wait for TRANSACTION_PREPARATION from receiver (rExoPak)
    const preparationResponse = await this.waitForTransactionMessage(tx.pipe, 'TRANSACTION_PREPARATION', transactionId);
    
    if (!preparationResponse || !preparationResponse.rExoPak) {
      tx.status = 'FAILED';
      this.log(`Transaction ${transactionId} failed: No preparation response`);
      return { success: false, error: 'No preparation response received' };
    }
    
    tx.rExoPak = preparationResponse.rExoPak;
    tx.status = 'PREPARATION_RECEIVED';
    this.log(`Received preparation response for ${transactionId}`);
    
    // Validate rExoPak
    const rExoPakValid = await this.token.validateExoPak(tx.rExoPak, {
      transactionId,
      senderId: this.id,
      receiverId: tx.receiverId
    });
    
    if (!rExoPakValid) {
      // STEP 3A: TRANSACTION ABORT if validation fails
      await tx.pipe.send({
        type: 'TRANSACTION_ABORT',
        transactionId,
        reason: 'rExoPak validation failed',
        senderId: this.id,
        receiverId: tx.receiverId
      });
      
      tx.status = 'ABORTED';
      this.log(`Transaction ${transactionId} aborted: rExoPak validation failed`);
      return { success: false, error: 'rExoPak validation failed' };
    }
    
    // STEP 3B: TRANSACTION COMMITMENT
    await tx.pipe.send({
      type: 'TRANSACTION_COMMITMENT',
      transactionId,
      sRetroPak: tx.sRetroPak,
      senderId: this.id,
      receiverId: tx.receiverId
    });
    
    tx.status = 'COMMITMENT_SENT';
    this.log(`Transaction commitment sent for ${transactionId}`);
    
    // STEP 4: Wait for TRANSACTION_FINALIZATION from receiver (rRetroPak)
    const finalizationResponse = await this.waitForTransactionMessage(tx.pipe, 'TRANSACTION_FINALIZATION', transactionId);
    
    if (!finalizationResponse || !finalizationResponse.rRetroPak) {
      tx.status = 'FAILED';
      this.log(`Transaction ${transactionId} failed: No finalization response`);
      return { success: false, error: 'No finalization response received' };
    }
    
    tx.rRetroPak = finalizationResponse.rRetroPak;
    tx.status = 'FINALIZATION_RECEIVED';
    this.log(`Received finalization response for ${transactionId}`);
    
    // Validate rRetroPak
    const rRetroPakValid = await this.token.validateRetroPak(tx.rRetroPak, {
      transactionId,
      senderId: this.id,
      receiverId: tx.receiverId
    });
    
    if (!rRetroPakValid) {
      tx.status = 'FAILED';
      this.log(`Transaction ${transactionId} failed: rRetroPak validation failed`);
      return { success: false, error: 'rRetroPak validation failed' };
    }
    
    // Transaction completed successfully
    tx.status = 'COMPLETED';
    
    // Update token ownership
    this.tokens = this.tokens.filter(token => 
      !tx.tokens.some(txToken => txToken.id === token.id)
    );
    
    // Update receiver tokens
    const receiverNode = this.connections.get(tx.receiverId).node;
    receiverNode.tokens.push(...tx.tokens);
    
    this.log(`Transaction ${transactionId} completed successfully`);
    
    return { success: true, transactionId };
  }
  
  // Additional methods for the proper protocol implementation
  // ...
}
*/

module.exports = TestNode; 