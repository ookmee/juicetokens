import { Token } from '../../../packages/token/src/models/Token';
import { Transaction, TransactionContext, TransactionInitiation, TransactionResponse, TransactionConfirmation, TransactionAcknowledgement } from './types';
import { DenominationVectorClock } from './DenominationVectorClock';
/**
 * Error types for transaction operations
 */
export declare enum TransactionErrorType {
    INVALID_STATE = "INVALID_STATE",
    TIMEOUT = "TIMEOUT",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    INSUFFICIENT_TOKENS = "INSUFFICIENT_TOKENS",
    PEER_REJECTED = "PEER_REJECTED",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
/**
 * Represents a transaction error
 */
export declare class TransactionError extends Error {
    type: TransactionErrorType;
    details?: any;
    constructor(type: TransactionErrorType, message: string, details?: any);
}
/**
 * Manages token transaction operations following the four-packet transaction model
 */
export declare class TransactionManager {
    private _transactions;
    private _pendingTransactions;
    private _tokenVectorClock;
    /**
     * Creates a new TransactionManager
     */
    constructor();
    /**
     * Gets the denomination vector clock for token optimization
     */
    get vectorClock(): DenominationVectorClock;
    /**
     * Updates the denomination vector clock based on the current token portfolio
     * @param tokens The current token portfolio
     */
    updateVectorClock(tokens: Token[]): void;
    /**
     * Initiates a new transaction (sender side)
     * @param context Transaction context with participants, amount, etc.
     * @param senderTokens Tokens available from the sender
     * @param receiverPublicKey Receiver's public key
     * @returns Transaction initiation data packet
     */
    initiateTransaction(context: Omit<TransactionContext, 'receiverPublicKey'>, senderTokens: Token[], receiverPublicKey: Uint8Array): TransactionInitiation;
    /**
     * Responds to a transaction initiation (receiver side)
     * @param initiation The transaction initiation packet
     * @param receiverTokens Tokens available from the receiver
     * @param accept Whether to accept the transaction request
     * @param rejectReason Reason for rejection if not accepting
     * @returns Transaction response packet
     */
    respondToTransaction(initiation: TransactionInitiation, receiverTokens: Token[], accept: boolean, rejectReason?: string): TransactionResponse;
    /**
     * Processes a transaction response (sender side)
     * @param response The transaction response from the receiver
     * @returns Transaction confirmation packet if accepted, null if rejected
     */
    processResponse(response: TransactionResponse): TransactionConfirmation | null;
    /**
     * Processes a transaction confirmation (receiver side)
     * @param confirmation The transaction confirmation from the sender
     * @returns Transaction acknowledgement packet
     */
    processConfirmation(confirmation: TransactionConfirmation): TransactionAcknowledgement;
    /**
     * Finalizes a transaction (sender side)
     * @param acknowledgement The transaction acknowledgement from the receiver
     * @returns The finalized transaction
     */
    finalizeTransaction(acknowledgement: TransactionAcknowledgement): Transaction;
    /**
     * Aborts a transaction at any stage
     * @param transactionId The ID of the transaction to abort
     * @param reason The reason for aborting
     * @returns The aborted transaction
     */
    abortTransaction(transactionId: string, reason: string): Transaction;
    /**
     * Gets a transaction by ID
     * @param transactionId The ID of the transaction
     * @returns The transaction if found, undefined otherwise
     */
    getTransaction(transactionId: string): Transaction | undefined;
    /**
     * Calculates the tokens to be exchanged in a transaction
     * @param context Transaction context
     * @param senderTokens Available sender tokens
     * @param receiverTokens Available receiver tokens
     * @returns The token packages for exchange
     */
    private calculateTokenExchange;
    /**
     * Calculates the tokens to be retained for rollback safety
     * @param availableTokens All available tokens
     * @param selectedTokens Tokens selected for the transaction
     * @returns Tokens to be retained for rollback
     */
    private calculateRetroTokens;
    /**
     * Creates rollback instructions for a token package
     * @param exoPak The token package to create rollback instructions for
     * @returns Rollback instructions
     */
    private createRollbackInstructions;
    /**
     * Generates a commitment proof for a transaction
     * @param transaction The transaction to generate a proof for
     * @returns The commitment proof
     */
    private generateCommitmentProof;
    /**
     * Verifies a commitment proof for a transaction
     * @param proof The proof to verify
     * @param transaction The transaction to verify against
     * @returns True if valid, false otherwise
     */
    private verifyCommitmentProof;
    /**
     * Generates an atomic commitment proof for a finalized transaction
     * @param transaction The transaction to generate a proof for
     * @returns The atomic commitment proof
     */
    private generateAtomicCommitmentProof;
}
