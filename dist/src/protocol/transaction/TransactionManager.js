"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = exports.TransactionError = exports.TransactionErrorType = void 0;
const uuid_1 = require("uuid");
const types_1 = require("./types");
const DenominationVectorClock_1 = require("./DenominationVectorClock");
/**
 * Error types for transaction operations
 */
var TransactionErrorType;
(function (TransactionErrorType) {
    TransactionErrorType["INVALID_STATE"] = "INVALID_STATE";
    TransactionErrorType["TIMEOUT"] = "TIMEOUT";
    TransactionErrorType["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    TransactionErrorType["INSUFFICIENT_TOKENS"] = "INSUFFICIENT_TOKENS";
    TransactionErrorType["PEER_REJECTED"] = "PEER_REJECTED";
    TransactionErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(TransactionErrorType || (exports.TransactionErrorType = TransactionErrorType = {}));
/**
 * Represents a transaction error
 */
class TransactionError extends Error {
    constructor(type, message, details) {
        super(message);
        this.name = 'TransactionError';
        this.type = type;
        this.details = details;
    }
}
exports.TransactionError = TransactionError;
/**
 * Manages token transaction operations following the four-packet transaction model
 */
class TransactionManager {
    /**
     * Creates a new TransactionManager
     */
    constructor() {
        this._transactions = new Map();
        this._pendingTransactions = new Map();
        this._tokenVectorClock = new DenominationVectorClock_1.DenominationVectorClock();
    }
    /**
     * Gets the denomination vector clock for token optimization
     */
    get vectorClock() {
        return this._tokenVectorClock;
    }
    /**
     * Updates the denomination vector clock based on the current token portfolio
     * @param tokens The current token portfolio
     */
    updateVectorClock(tokens) {
        // Count tokens by denomination
        const distribution = new Map();
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
    initiateTransaction(context, senderTokens, receiverPublicKey) {
        // Create transaction ID
        const transactionId = (0, uuid_1.v4)();
        // Complete the context with receiver's public key
        const fullContext = {
            ...context,
            receiverPublicKey
        };
        // Prepare the transaction initiation packet
        const initiation = {
            transactionId,
            context: fullContext,
            senderTokens,
            receiverTokens: [], // This will be filled by the receiver
            timestamp: Date.now()
        };
        // Create a pending transaction and store it
        const transaction = {
            id: transactionId,
            state: types_1.TransactionState.INITIATED,
            context: fullContext,
            senderExoPak: {
                id: `sexo-${transactionId}`,
                status: types_1.PakStatus.CREATED,
                tokens: [],
                proof: new Uint8Array(),
                metadata: new Map()
            },
            receiverExoPak: {
                id: `rexo-${transactionId}`,
                status: types_1.PakStatus.CREATED,
                tokens: [],
                proof: new Uint8Array(),
                metadata: new Map()
            },
            senderRetroPak: {
                id: `sretro-${transactionId}`,
                status: types_1.PakStatus.CREATED,
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
                status: types_1.PakStatus.CREATED,
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
    respondToTransaction(initiation, receiverTokens, accept, rejectReason) {
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
        const { senderExoPak, receiverExoPak } = this.calculateTokenExchange(initiation.context, initiation.senderTokens, receiverTokens);
        // Create the transaction response
        const response = {
            transactionId: initiation.transactionId,
            accepted: true,
            senderExoPak,
            receiverExoPak,
            timestamp: Date.now()
        };
        // Create a pending transaction and store it
        const transaction = {
            id: initiation.transactionId,
            state: types_1.TransactionState.PREPARING,
            context: initiation.context,
            senderExoPak,
            receiverExoPak,
            senderRetroPak: {
                id: `sretro-${initiation.transactionId}`,
                status: types_1.PakStatus.CREATED,
                tokens: this.calculateRetroTokens(initiation.senderTokens, senderExoPak.tokens),
                rollbackInstructions: this.createRollbackInstructions(senderExoPak),
                proof: new Uint8Array(),
                metadata: new Map()
            },
            receiverRetroPak: {
                id: `rretro-${initiation.transactionId}`,
                status: types_1.PakStatus.CREATED,
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
    processResponse(response) {
        const { transactionId, accepted } = response;
        // Check if the transaction exists
        const pendingTransaction = this._pendingTransactions.get(transactionId);
        if (!pendingTransaction) {
            throw new TransactionError(TransactionErrorType.INVALID_STATE, `Transaction ${transactionId} not found`);
        }
        // If the transaction was rejected, update the state and return null
        if (!accepted) {
            pendingTransaction.state = types_1.TransactionState.ABORTED;
            this._transactions.set(transactionId, pendingTransaction);
            this._pendingTransactions.delete(transactionId);
            return null;
        }
        // Transaction was accepted, update with the proposed token packages
        if (!response.senderExoPak || !response.receiverExoPak) {
            throw new TransactionError(TransactionErrorType.VALIDATION_FAILED, 'Transaction response is missing token package information');
        }
        // Update the transaction with the token packages
        pendingTransaction.senderExoPak = response.senderExoPak;
        pendingTransaction.receiverExoPak = response.receiverExoPak;
        pendingTransaction.state = types_1.TransactionState.PREPARED;
        pendingTransaction.timestamps.preparedAtMs = Date.now();
        // Generate sender commitment proof
        const senderCommitmentProof = this.generateCommitmentProof(pendingTransaction);
        pendingTransaction.proofs.senderCommitmentProof = senderCommitmentProof;
        // Create transaction confirmation
        const confirmation = {
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
    processConfirmation(confirmation) {
        const { transactionId, senderCommitmentProof } = confirmation;
        // Check if the transaction exists
        const pendingTransaction = this._pendingTransactions.get(transactionId);
        if (!pendingTransaction) {
            throw new TransactionError(TransactionErrorType.INVALID_STATE, `Transaction ${transactionId} not found`);
        }
        // Verify the sender's commitment proof
        if (!this.verifyCommitmentProof(senderCommitmentProof, pendingTransaction)) {
            throw new TransactionError(TransactionErrorType.VALIDATION_FAILED, 'Invalid sender commitment proof');
        }
        // Update transaction state
        pendingTransaction.state = types_1.TransactionState.COMMITTING;
        pendingTransaction.proofs.senderCommitmentProof = senderCommitmentProof;
        // Generate receiver commitment proof
        const receiverCommitmentProof = this.generateCommitmentProof(pendingTransaction);
        pendingTransaction.proofs.receiverCommitmentProof = receiverCommitmentProof;
        // Update package statuses
        pendingTransaction.senderExoPak.status = types_1.PakStatus.RECEIVED;
        pendingTransaction.receiverExoPak.status = types_1.PakStatus.SENT;
        // Create transaction acknowledgement
        const acknowledgement = {
            transactionId,
            receiverCommitmentProof,
            timestamp: Date.now()
        };
        // Finalize the transaction on the receiver side
        pendingTransaction.state = types_1.TransactionState.COMMITTED;
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
    finalizeTransaction(acknowledgement) {
        const { transactionId, receiverCommitmentProof } = acknowledgement;
        // Check if the transaction exists
        const pendingTransaction = this._pendingTransactions.get(transactionId);
        if (!pendingTransaction) {
            throw new TransactionError(TransactionErrorType.INVALID_STATE, `Transaction ${transactionId} not found`);
        }
        // Verify the receiver's commitment proof
        if (!this.verifyCommitmentProof(receiverCommitmentProof, pendingTransaction)) {
            throw new TransactionError(TransactionErrorType.VALIDATION_FAILED, 'Invalid receiver commitment proof');
        }
        // Update transaction state
        pendingTransaction.state = types_1.TransactionState.COMMITTED;
        pendingTransaction.proofs.receiverCommitmentProof = receiverCommitmentProof;
        pendingTransaction.timestamps.committedAtMs = Date.now();
        pendingTransaction.timestamps.completedAtMs = Date.now();
        // Update package statuses
        pendingTransaction.senderExoPak.status = types_1.PakStatus.COMMITTED;
        pendingTransaction.receiverExoPak.status = types_1.PakStatus.COMMITTED;
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
    abortTransaction(transactionId, reason) {
        // Check if the transaction exists
        const pendingTransaction = this._pendingTransactions.get(transactionId);
        if (!pendingTransaction) {
            throw new TransactionError(TransactionErrorType.INVALID_STATE, `Transaction ${transactionId} not found`);
        }
        // Update transaction state
        pendingTransaction.state = types_1.TransactionState.ABORTED;
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
    getTransaction(transactionId) {
        return this._transactions.get(transactionId) || this._pendingTransactions.get(transactionId);
    }
    /**
     * Calculates the tokens to be exchanged in a transaction
     * @param context Transaction context
     * @param senderTokens Available sender tokens
     * @param receiverTokens Available receiver tokens
     * @returns The token packages for exchange
     */
    calculateTokenExchange(context, senderTokens, receiverTokens) {
        // Create the receiver's vector clock for optimization
        const receiverDistribution = new Map();
        receiverTokens.forEach(token => {
            const denom = token.denomination;
            receiverDistribution.set(denom, (receiverDistribution.get(denom) || 0) + 1);
        });
        const receiverVectorClock = new DenominationVectorClock_1.DenominationVectorClock(receiverDistribution);
        // Calculate the tokens for sender to receiver (senderExoPak)
        const senderAmount = context.amount;
        const selectedSenderTokens = this._tokenVectorClock.optimizeTokenSelection(senderTokens, senderAmount, receiverVectorClock);
        // Calculate the tokens for receiver to sender (receiverExoPak) if any
        const receiverAmount = 0; // For now, assume one-way transfer
        const selectedReceiverTokens = receiverAmount > 0 ?
            receiverVectorClock.optimizeTokenSelection(receiverTokens, receiverAmount, this._tokenVectorClock) : [];
        // Create the token packages
        const senderExoPak = {
            id: `sexo-${context.purpose}-${Date.now()}`,
            status: types_1.PakStatus.CREATED,
            tokens: selectedSenderTokens,
            proof: new Uint8Array(),
            metadata: new Map()
        };
        const receiverExoPak = {
            id: `rexo-${context.purpose}-${Date.now()}`,
            status: types_1.PakStatus.CREATED,
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
    calculateRetroTokens(availableTokens, selectedTokens) {
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
    createRollbackInstructions(exoPak) {
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
    generateCommitmentProof(transaction) {
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
    verifyCommitmentProof(proof, transaction) {
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
    generateAtomicCommitmentProof(transaction) {
        // In a real implementation, this would create a cryptographic signature
        // For now, we'll return a simple placeholder
        return new TextEncoder().encode(`atomic-proof-for-${transaction.id}`);
    }
}
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=TransactionManager.js.map