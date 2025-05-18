import { TransactionManager } from '../TransactionManager';
import { TokenId } from '../../../../packages/token/src/models/TokenId';
import { Token, TokenStatus } from '../../../../packages/token/src/models/Token';
import { 
  TransactionInitiation, 
  TransactionResponse,
  TransactionConfirmation,
  TransactionAcknowledgement,
  TransactionState
} from '../types';

describe('Transaction Flow', () => {
  // Mock token creation helper
  const createMockToken = (
    id: string, 
    denomination: number, 
    issuer = 'test-issuer'
  ): Token => {
    const tokenId = new TokenId({
      id,
      issuanceId: `${id}-issuance`,
      sequenceNumber: 1,
      creationTimeMs: Date.now() - 1000 // 1 second ago
    });
    
    return new Token({
      tokenId,
      denomination: denomination as 1 | 2 | 5 | 10 | 20 | 50 | 100 | 200 | 500,
      creationTimeMs: Date.now() - 1000,
      issuer,
      status: TokenStatus.ACTIVE
    });
  };
  
  // Create mock public keys
  const createMockPublicKey = (name: string): Uint8Array => {
    return new TextEncoder().encode(`${name}-public-key`);
  };
  
  test('Complete transaction flow (happy path)', () => {
    // Create transaction managers for both parties
    const senderManager = new TransactionManager();
    const receiverManager = new TransactionManager();
    
    // Create mock tokens for sender
    const senderTokens = [
      createMockToken('sender-1', 10),
      createMockToken('sender-2', 5),
      createMockToken('sender-3', 20),
      createMockToken('sender-4', 50),
      createMockToken('sender-5', 1)
    ];
    
    // Create mock tokens for receiver
    const receiverTokens = [
      createMockToken('receiver-1', 10),
      createMockToken('receiver-2', 2),
      createMockToken('receiver-3', 1)
    ];
    
    // Update vector clocks with current token portfolios
    senderManager.updateVectorClock(senderTokens);
    receiverManager.updateVectorClock(receiverTokens);
    
    // Mock public keys
    const senderPublicKey = createMockPublicKey('sender');
    const receiverPublicKey = createMockPublicKey('receiver');
    
    // Step 1: Sender initiates the transaction
    const initiation: TransactionInitiation = senderManager.initiateTransaction(
      {
        senderPublicKey,
        transactionType: 'DIRECT',
        purpose: 'test-transaction',
        amount: 25, // Sender wants to send 25 units to receiver
        constraints: {
          maxDurationMs: 60000, // 1 minute timeout
          minBalanceAfter: 1, // Require at least 1 token remaining
          allowedDenominations: [1, 2, 5, 10, 20, 50],
          requiredAttestationLevel: 1,
          useWisselToken: false,
          useAfrondingBuffer: false
        }
      },
      senderTokens,
      receiverPublicKey
    );
    
    // Validate initiation
    expect(initiation).toBeDefined();
    expect(initiation.transactionId).toBeDefined();
    expect(initiation.context.amount).toBe(25);
    expect(initiation.senderTokens).toHaveLength(5);
    
    // Step 2: Receiver responds to the transaction
    const response: TransactionResponse = receiverManager.respondToTransaction(
      initiation,
      receiverTokens,
      true // Accepting the transaction
    );
    
    // Validate response
    expect(response).toBeDefined();
    expect(response.transactionId).toBe(initiation.transactionId);
    expect(response.accepted).toBe(true);
    expect(response.senderExoPak).toBeDefined();
    expect(response.receiverExoPak).toBeDefined();
    
    if (response.senderExoPak && response.receiverExoPak) {
      // Validate token packages
      expect(response.senderExoPak.tokens).toBeDefined();
      
      // The total value of tokens in the sender's ExoPak should equal the requested amount
      const totalValue = response.senderExoPak.tokens.reduce(
        (sum, token) => sum + token.denomination,
        0
      );
      expect(totalValue).toBe(25);
    }
    
    // Step 3: Sender processes the response
    const confirmation: TransactionConfirmation | null = senderManager.processResponse(response);
    
    // Validate confirmation
    expect(confirmation).not.toBeNull();
    if (confirmation) {
      expect(confirmation.transactionId).toBe(initiation.transactionId);
      expect(confirmation.senderCommitmentProof).toBeDefined();
      
      // Step 4: Receiver processes the confirmation
      const acknowledgement: TransactionAcknowledgement = receiverManager.processConfirmation(confirmation);
      
      // Validate acknowledgement
      expect(acknowledgement).toBeDefined();
      expect(acknowledgement.transactionId).toBe(initiation.transactionId);
      expect(acknowledgement.receiverCommitmentProof).toBeDefined();
      
      // Step 5: Sender finalizes the transaction
      const finalizedTransaction = senderManager.finalizeTransaction(acknowledgement);
      
      // Validate finalized transaction
      expect(finalizedTransaction).toBeDefined();
      expect(finalizedTransaction.id).toBe(initiation.transactionId);
      expect(finalizedTransaction.state).toBe(TransactionState.COMMITTED);
      expect(finalizedTransaction.timestamps.completedAtMs).toBeDefined();
      
      // Check that transaction has been stored
      const retrievedTransaction = senderManager.getTransaction(initiation.transactionId);
      expect(retrievedTransaction).toBeDefined();
      expect(retrievedTransaction?.state).toBe(TransactionState.COMMITTED);
    }
  });
  
  test('Transaction rejection flow', () => {
    // Create transaction managers for both parties
    const senderManager = new TransactionManager();
    const receiverManager = new TransactionManager();
    
    // Create mock tokens
    const senderTokens = [createMockToken('sender-1', 10)];
    const receiverTokens = [createMockToken('receiver-1', 5)];
    
    // Mock public keys
    const senderPublicKey = createMockPublicKey('sender');
    const receiverPublicKey = createMockPublicKey('receiver');
    
    // Step 1: Sender initiates the transaction
    const initiation = senderManager.initiateTransaction(
      {
        senderPublicKey,
        transactionType: 'DIRECT',
        purpose: 'test-rejection',
        amount: 5,
        constraints: {
          maxDurationMs: 60000,
          minBalanceAfter: 1,
          allowedDenominations: [1, 2, 5, 10],
          requiredAttestationLevel: 1,
          useWisselToken: false,
          useAfrondingBuffer: false
        }
      },
      senderTokens,
      receiverPublicKey
    );
    
    // Step 2: Receiver rejects the transaction
    const response = receiverManager.respondToTransaction(
      initiation,
      receiverTokens,
      false, // Reject the transaction
      'Rejected for testing'
    );
    
    // Validate rejection response
    expect(response).toBeDefined();
    expect(response.transactionId).toBe(initiation.transactionId);
    expect(response.accepted).toBe(false);
    expect(response.reason).toBe('Rejected for testing');
    
    // Step 3: Sender processes the rejection
    const confirmation = senderManager.processResponse(response);
    
    // Validate that no confirmation is returned for rejection
    expect(confirmation).toBeNull();
    
    // Check that transaction has been stored as aborted
    const retrievedTransaction = senderManager.getTransaction(initiation.transactionId);
    expect(retrievedTransaction).toBeDefined();
    expect(retrievedTransaction?.state).toBe(TransactionState.ABORTED);
  });
  
  test('Transaction with DenominationVectorClock optimization', () => {
    // Create transaction managers for both parties
    const senderManager = new TransactionManager();
    const receiverManager = new TransactionManager();
    
    // Create tokens with specific denominations
    // Sender has abundance of small denominations, lack of large ones
    const senderTokens = [
      createMockToken('sender-1', 1),
      createMockToken('sender-2', 1),
      createMockToken('sender-3', 2),
      createMockToken('sender-4', 2),
      createMockToken('sender-5', 5),
      createMockToken('sender-6', 5),
      createMockToken('sender-7', 5),
      createMockToken('sender-8', 10),
      createMockToken('sender-9', 10),
      createMockToken('sender-10', 20),
    ];
    
    // Receiver has abundance of large denominations, lack of small ones
    const receiverTokens = [
      createMockToken('receiver-1', 50),
      createMockToken('receiver-2', 50),
      createMockToken('receiver-3', 20),
      createMockToken('receiver-4', 20),
      createMockToken('receiver-5', 20),
      createMockToken('receiver-6', 10),
    ];
    
    // Update vector clocks with current token portfolios
    senderManager.updateVectorClock(senderTokens);
    receiverManager.updateVectorClock(receiverTokens);
    
    // Mock public keys
    const senderPublicKey = createMockPublicKey('sender');
    const receiverPublicKey = createMockPublicKey('receiver');
    
    // Step 1: Sender initiates the transaction
    const initiation = senderManager.initiateTransaction(
      {
        senderPublicKey,
        transactionType: 'DIRECT',
        purpose: 'test-vector-clock',
        amount: 15, // Sender wants to send 15 units to receiver
        constraints: {
          maxDurationMs: 60000,
          minBalanceAfter: 1,
          allowedDenominations: [1, 2, 5, 10, 20, 50],
          requiredAttestationLevel: 1,
          useWisselToken: false,
          useAfrondingBuffer: false
        }
      },
      senderTokens,
      receiverPublicKey
    );
    
    // Step 2: Receiver responds to the transaction
    const response = receiverManager.respondToTransaction(
      initiation,
      receiverTokens,
      true
    );
    
    expect(response.accepted).toBe(true);
    if (response.senderExoPak) {
      // Expect optimization to prefer small denominations that receiver lacks
      const denominations = response.senderExoPak.tokens.map(t => t.denomination);
      
      // Check if the optimization worked by favoring small denominations
      // that the receiver lacks
      expect(denominations.filter(d => d <= 5).length).toBeGreaterThan(0);
      
      // The total value should still equal the requested amount
      const totalValue = denominations.reduce((sum, value) => sum + value, 0);
      expect(totalValue).toBe(15);
    }
  });
}); 