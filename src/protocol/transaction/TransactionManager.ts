import { v4 as uuidv4 } from 'uuid';
import { Token, TokenDenomination } from '../../../packages/token/src/models/Token';
import { 
  Transaction, TransactionState, PakStatus, 
  TransactionContext, TransactionInitiation, 
  TransactionResponse, TransactionConfirmation, 
  TransactionAcknowledgement, ExoPak, RetroPak,
  TransactionTimestamps, TransactionProofs,
  RollbackInstructions
} from './types';
import { DenominationVectorClock } from './DenominationVectorClock';

/**
 * Error types for transaction operations
 */
export enum TransactionErrorType {
  INVALID_STATE = 'INVALID_STATE',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  PEER_REJECTED = 'PEER_REJECTED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Represents a transaction error
 */
export class TransactionError extends Error {
  type: TransactionErrorType;
  details?: any;

  constructor(type: TransactionErrorType, message: string, details?: any) {
    super(message);
    this.name = 'TransactionError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Manages token transaction operations following the four-packet transaction model
 */
export class TransactionManager {
  private _transactions: Map<string, Transaction>;
  private _pendingTransactions: Map<string, Transaction>;
  private _tokenVectorClock: DenominationVectorClock;
  
  /**
   * Creates a new TransactionManager
   */
  constructor() {
    this._transactions = new Map();
    this._pendingTransactions = new Map();
    this._tokenVectorClock = new DenominationVectorClock();
  }
  
  /**
   * Gets the denomination vector clock for token optimization
   */
  get vectorClock(): DenominationVectorClock {
    return this._tokenVectorClock;
  }
  
  /**
   * Updates the denomination vector clock based on the current token portfolio
   * @param tokens The current token portfolio
   */
  updateVectorClock(tokens: Token[]): void {
    // Count tokens by denomination
    const distribution = new Map<TokenDenomination, number>();
    tokens.forEach(token => {
      const denom = token.denomination;
      distribution.set(denom, (distribution.get(denom) || 0) + 1);
    });
    
    // Update the vector clock with the current distribution
    this._tokenVectorClock.calculateStatusCodes(distribution);
  }
  
  /**
   * Initiates a new transaction (sender side)
   * @param context Transaction context with participants, amount, etc.
   * @param senderTokens Tokens available from the sender
   * @param receiverPublicKey Receiver's public key
   * @returns Transaction initiation data packet
   */
  initiateTransaction(
    context: Omit<TransactionContext, 'receiverPublicKey'>, 
    senderTokens: Token[],
    receiverPublicKey: Uint8Array
  ): TransactionInitiation {
    // Create transaction ID
    const transactionId = uuidv4();
    
    // Complete the context with receiver's public key
    const fullContext: TransactionContext = {
      ...context,
      receiverPublicKey
    };
    
    // Prepare the transaction initiation packet
    const initiation: TransactionInitiation = {
      transactionId,
      context: fullContext,
      senderTokens,
      receiverTokens: [], // This will be filled by the receiver
      timestamp: Date.now()
    };
    
    // Create a pending transaction and store it
    const transaction: Transaction = {
      id: transactionId,
      state: TransactionState.INITIATED,
      context: fullContext,
      senderExoPak: {
        id: `sexo-${transactionId}`,
        status: PakStatus.CREATED,
        tokens: [],
        proof: new Uint8Array(),
        metadata: new Map()
      },
      receiverExoPak: {
        id: `rexo-${transactionId}`,
        status: PakStatus.CREATED,
        tokens: [],
        proof: new Uint8Array(),
        metadata: new Map()
      },
      senderRetroPak: {
        id: `sretro-${transactionId}`,
        status: PakStatus.CREATED,
        tokens: [],
        rollbackInstructions: {
          steps: [],
          timeoutMs: 30000, // 30 seconds default timeout
          proof: new Uint8Array()
        },
        proof: new Uint8Array(),
        metadata: new Map()
      },
      receiverRetroPak: {
        id: `rretro-${transactionId}`,
        status: PakStatus.CREATED,
        tokens: [],
        rollbackInstructions: {
          steps: [],
          timeoutMs: 30000, // 30 seconds default timeout
          proof: new Uint8Array()
        },
        proof: new Uint8Array(),
        metadata: new Map()
      },
      timestamps: {
        createdAtMs: Date.now(),
        initiatedAtMs: Date.now(),
        timeoutAtMs: Date.now() + fullContext.constraints.maxDurationMs
      },
      proofs: {
        transactionSignature: new Uint8Array()
      },
      metadata: new Map()
    };
    
    this._pendingTransactions.set(transactionId, transaction);
    
    return initiation;
  }
  
  /**
   * Responds to a transaction initiation (receiver side)
   * @param initiation The transaction initiation packet
   * @param receiverTokens Tokens available from the receiver
   * @param accept Whether to accept the transaction request
   * @param rejectReason Reason for rejection if not accepting
   * @returns Transaction response packet
   */
  respondToTransaction(
    initiation: TransactionInitiation,
    receiverTokens: Token[],
    accept: boolean,
    rejectReason?: string
  ): TransactionResponse {
    if (!accept) {
      // Transaction rejected, return simple rejection response
      return {
        transactionId: initiation.transactionId,
        accepted: false,
        reason: rejectReason || 'Transaction rejected by receiver',
        timestamp: Date.now()
      };
    }
    
    // Calculate token packages for the accepted transaction
    const { senderExoPak, receiverExoPak } = this.calculateTokenExchange(
      initiation.context,
      initiation.senderTokens,
      receiverTokens
    );
    
    // Create the transaction response
    const response: TransactionResponse = {
      transactionId: initiation.transactionId,
      accepted: true,
      senderExoPak,
      receiverExoPak,
      timestamp: Date.now()
    };
    
    // Create a pending transaction and store it
    const transaction: Transaction = {
      id: initiation.transactionId,
      state: TransactionState.PREPARING,
      context: initiation.context,
      senderExoPak,
      receiverExoPak,
      senderRetroPak: {
        id: `sretro-${initiation.transactionId}`,
        status: PakStatus.CREATED,
        tokens: this.calculateRetroTokens(initiation.senderTokens, senderExoPak.tokens),
        rollbackInstructions: this.createRollbackInstructions(senderExoPak),
        proof: new Uint8Array(),
        metadata: new Map()
      },
      receiverRetroPak: {
        id: `rretro-${initiation.transactionId}`,
        status: PakStatus.CREATED,
        tokens: this.calculateRetroTokens(receiverTokens, receiverExoPak.tokens),
        rollbackInstructions: this.createRollbackInstructions(receiverExoPak),
        proof: new Uint8Array(),
        metadata: new Map()
      },
      timestamps: {
        createdAtMs: initiation.timestamp,
        initiatedAtMs: initiation.timestamp,
        preparedAtMs: Date.now(),
        timeoutAtMs: initiation.timestamp + initiation.context.constraints.maxDurationMs
      },
      proofs: {
        transactionSignature: new Uint8Array()
      },
      metadata: new Map()
    };
    
    this._pendingTransactions.set(initiation.transactionId, transaction);
    
    return response;
  }
  
  /**
   * Processes a transaction response (sender side)
   * @param response The transaction response from the receiver
   * @returns Transaction confirmation packet if accepted, null if rejected
   */
  processResponse(response: TransactionResponse): TransactionConfirmation | null {
    const { transactionId, accepted } = response;
    
    // Check if the transaction exists
    const pendingTransaction = this._pendingTransactions.get(transactionId);
    if (!pendingTransaction) {
      throw new TransactionError(
        TransactionErrorType.INVALID_STATE,
        `Transaction ${transactionId} not found`
      );
    }
    
    // If the transaction was rejected, update the state and return null
    if (!accepted) {
      pendingTransaction.state = TransactionState.ABORTED;
      this._transactions.set(transactionId, pendingTransaction);
      this._pendingTransactions.delete(transactionId);
      return null;
    }
    
    // Transaction was accepted, update with the proposed token packages
    if (!response.senderExoPak || !response.receiverExoPak) {
      throw new TransactionError(
        TransactionErrorType.VALIDATION_FAILED,
        'Transaction response is missing token package information'
      );
    }
    
    // Update the transaction with the token packages
    pendingTransaction.senderExoPak = response.senderExoPak;
    pendingTransaction.receiverExoPak = response.receiverExoPak;
    pendingTransaction.state = TransactionState.PREPARED;
    pendingTransaction.timestamps.preparedAtMs = Date.now();
    
    // Generate sender commitment proof
    const senderCommitmentProof = this.generateCommitmentProof(pendingTransaction);
    pendingTransaction.proofs.senderCommitmentProof = senderCommitmentProof;
    
    // Create transaction confirmation
    const confirmation: TransactionConfirmation = {
      transactionId,
      senderCommitmentProof,
      timestamp: Date.now()
    };
    
    // Update the pending transaction
    this._pendingTransactions.set(transactionId, pendingTransaction);
    
    return confirmation;
  }
  
  /**
   * Processes a transaction confirmation (receiver side)
   * @param confirmation The transaction confirmation from the sender
   * @returns Transaction acknowledgement packet
   */
  processConfirmation(confirmation: TransactionConfirmation): TransactionAcknowledgement {
    const { transactionId, senderCommitmentProof } = confirmation;
    
    // Check if the transaction exists
    const pendingTransaction = this._pendingTransactions.get(transactionId);
    if (!pendingTransaction) {
      throw new TransactionError(
        TransactionErrorType.INVALID_STATE,
        `Transaction ${transactionId} not found`
      );
    }
    
    // Verify the sender's commitment proof
    if (!this.verifyCommitmentProof(senderCommitmentProof, pendingTransaction)) {
      throw new TransactionError(
        TransactionErrorType.VALIDATION_FAILED,
        'Invalid sender commitment proof'
      );
    }
    
    // Update transaction state
    pendingTransaction.state = TransactionState.COMMITTING;
    pendingTransaction.proofs.senderCommitmentProof = senderCommitmentProof;
    
    // Generate receiver commitment proof
    const receiverCommitmentProof = this.generateCommitmentProof(pendingTransaction);
    pendingTransaction.proofs.receiverCommitmentProof = receiverCommitmentProof;
    
    // Update package statuses
    pendingTransaction.senderExoPak.status = PakStatus.RECEIVED;
    pendingTransaction.receiverExoPak.status = PakStatus.SENT;
    
    // Create transaction acknowledgement
    const acknowledgement: TransactionAcknowledgement = {
      transactionId,
      receiverCommitmentProof,
      timestamp: Date.now()
    };
    
    // Finalize the transaction on the receiver side
    pendingTransaction.state = TransactionState.COMMITTED;
    pendingTransaction.timestamps.committedAtMs = Date.now();
    pendingTransaction.timestamps.completedAtMs = Date.now();
    
    // Move from pending to completed transactions
    this._transactions.set(transactionId, pendingTransaction);
    this._pendingTransactions.delete(transactionId);
    
    return acknowledgement;
  }
  
  /**
   * Finalizes a transaction (sender side)
   * @param acknowledgement The transaction acknowledgement from the receiver
   * @returns The finalized transaction
   */
  finalizeTransaction(acknowledgement: TransactionAcknowledgement): Transaction {
    const { transactionId, receiverCommitmentProof } = acknowledgement;
    
    // Check if the transaction exists
    const pendingTransaction = this._pendingTransactions.get(transactionId);
    if (!pendingTransaction) {
      throw new TransactionError(
        TransactionErrorType.INVALID_STATE,
        `Transaction ${transactionId} not found`
      );
    }
    
    // Verify the receiver's commitment proof
    if (!this.verifyCommitmentProof(receiverCommitmentProof, pendingTransaction)) {
      throw new TransactionError(
        TransactionErrorType.VALIDATION_FAILED,
        'Invalid receiver commitment proof'
      );
    }
    
    // Update transaction state
    pendingTransaction.state = TransactionState.COMMITTED;
    pendingTransaction.proofs.receiverCommitmentProof = receiverCommitmentProof;
    pendingTransaction.timestamps.committedAtMs = Date.now();
    pendingTransaction.timestamps.completedAtMs = Date.now();
    
    // Update package statuses
    pendingTransaction.senderExoPak.status = PakStatus.COMMITTED;
    pendingTransaction.receiverExoPak.status = PakStatus.COMMITTED;
    
    // Generate atomic commitment proof
    pendingTransaction.proofs.atomicCommitmentProof = this.generateAtomicCommitmentProof(pendingTransaction);
    
    // Move from pending to completed transactions
    this._transactions.set(transactionId, pendingTransaction);
    this._pendingTransactions.delete(transactionId);
    
    return pendingTransaction;
  }
  
  /**
   * Aborts a transaction at any stage
   * @param transactionId The ID of the transaction to abort
   * @param reason The reason for aborting
   * @returns The aborted transaction
   */
  abortTransaction(transactionId: string, reason: string): Transaction {
    // Check if the transaction exists
    const pendingTransaction = this._pendingTransactions.get(transactionId);
    if (!pendingTransaction) {
      throw new TransactionError(
        TransactionErrorType.INVALID_STATE,
        `Transaction ${transactionId} not found`
      );
    }
    
    // Update transaction state
    pendingTransaction.state = TransactionState.ABORTED;
    pendingTransaction.metadata.set('abortReason', reason);
    
    // Move from pending to completed transactions
    this._transactions.set(transactionId, pendingTransaction);
    this._pendingTransactions.delete(transactionId);
    
    return pendingTransaction;
  }
  
  /**
   * Gets a transaction by ID
   * @param transactionId The ID of the transaction
   * @returns The transaction if found, undefined otherwise
   */
  getTransaction(transactionId: string): Transaction | undefined {
    return this._transactions.get(transactionId) || this._pendingTransactions.get(transactionId);
  }
  
  /**
   * Calculates the tokens to be exchanged in a transaction
   * @param context Transaction context
   * @param senderTokens Available sender tokens
   * @param receiverTokens Available receiver tokens
   * @returns The token packages for exchange
   */
  private calculateTokenExchange(
    context: TransactionContext,
    senderTokens: Token[],
    receiverTokens: Token[]
  ): { senderExoPak: ExoPak, receiverExoPak: ExoPak } {
    // Create the receiver's vector clock for optimization
    const receiverDistribution = new Map<TokenDenomination, number>();
    receiverTokens.forEach(token => {
      const denom = token.denomination;
      receiverDistribution.set(denom, (receiverDistribution.get(denom) || 0) + 1);
    });
    const receiverVectorClock = new DenominationVectorClock(receiverDistribution);
    
    // Calculate the tokens for sender to receiver (senderExoPak)
    const senderAmount = context.amount;
    const selectedSenderTokens = this._tokenVectorClock.optimizeTokenSelection(
      senderTokens,
      senderAmount,
      receiverVectorClock
    ) as Token[];
    
    // Calculate the tokens for receiver to sender (receiverExoPak) if any
    const receiverAmount = 0; // For now, assume one-way transfer
    const selectedReceiverTokens = receiverAmount > 0 ? 
      receiverVectorClock.optimizeTokenSelection(
        receiverTokens,
        receiverAmount,
        this._tokenVectorClock
      ) as Token[] : [];
    
    // Create the token packages
    const senderExoPak: ExoPak = {
      id: `sexo-${context.purpose}-${Date.now()}`,
      status: PakStatus.CREATED,
      tokens: selectedSenderTokens,
      proof: new Uint8Array(),
      metadata: new Map()
    };
    
    const receiverExoPak: ExoPak = {
      id: `rexo-${context.purpose}-${Date.now()}`,
      status: PakStatus.CREATED,
      tokens: selectedReceiverTokens,
      proof: new Uint8Array(),
      metadata: new Map()
    };
    
    return { senderExoPak, receiverExoPak };
  }
  
  /**
   * Calculates the tokens to be retained for rollback safety
   * @param availableTokens All available tokens
   * @param selectedTokens Tokens selected for the transaction
   * @returns Tokens to be retained for rollback
   */
  private calculateRetroTokens(availableTokens: Token[], selectedTokens: Token[]): Token[] {
    // Extract token IDs from selected tokens for easy lookup
    const selectedIds = new Set(selectedTokens.map(t => t.tokenId.id));
    
    // Return tokens not selected for the transaction
    return availableTokens.filter(token => !selectedIds.has(token.tokenId.id));
  }
  
  /**
   * Creates rollback instructions for a token package
   * @param exoPak The token package to create rollback instructions for
   * @returns Rollback instructions
   */
  private createRollbackInstructions(exoPak: ExoPak): RollbackInstructions {
    // Create a simple rollback instruction to restore tokens
    return {
      steps: [{
        stepNumber: 1,
        stepType: 'RESTORE',
        stepData: new Uint8Array(),
        stepProof: new Uint8Array()
      }],
      timeoutMs: 30000, // 30 seconds default timeout
      proof: new Uint8Array()
    };
  }
  
  /**
   * Generates a commitment proof for a transaction
   * @param transaction The transaction to generate a proof for
   * @returns The commitment proof
   */
  private generateCommitmentProof(transaction: Transaction): Uint8Array {
    // In a real implementation, this would create a cryptographic signature
    // For now, we'll return a simple placeholder
    return new TextEncoder().encode(`proof-for-${transaction.id}`);
  }
  
  /**
   * Verifies a commitment proof for a transaction
   * @param proof The proof to verify
   * @param transaction The transaction to verify against
   * @returns True if valid, false otherwise
   */
  private verifyCommitmentProof(proof: Uint8Array, transaction: Transaction): boolean {
    // In a real implementation, this would verify a cryptographic signature
    // For now, we'll just check if it's the expected format
    const proofString = new TextDecoder().decode(proof);
    return proofString === `proof-for-${transaction.id}`;
  }
  
  /**
   * Generates an atomic commitment proof for a finalized transaction
   * @param transaction The transaction to generate a proof for
   * @returns The atomic commitment proof
   */
  private generateAtomicCommitmentProof(transaction: Transaction): Uint8Array {
    // In a real implementation, this would create a cryptographic signature
    // For now, we'll return a simple placeholder
    return new TextEncoder().encode(`atomic-proof-for-${transaction.id}`);
  }
} 