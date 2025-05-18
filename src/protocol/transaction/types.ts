import { Token } from '../../../packages/token/src/models/Token';

/**
 * Represents the current state of a transaction
 */
export enum TransactionState {
  UNSPECIFIED = 0,
  INITIATED = 1,
  PREPARING = 2,
  PREPARED = 3,
  COMMITTING = 4,
  COMMITTED = 5,
  ABORTING = 6,
  ABORTED = 7,
  FAILED = 8
}

/**
 * Represents the state of a token package
 */
export enum PakStatus {
  UNSPECIFIED = 0,
  CREATED = 1,
  SENT = 2,
  RECEIVED = 3,
  VERIFIED = 4,
  COMMITTED = 5,
  ROLLED_BACK = 6,
  FAILED = 7
}

/**
 * Interface for the DenominationVectorClock data model
 * Used for communicating token denomination distribution status during transactions
 */
export interface DenominationVectorClock {
  // Map of denomination values to their status codes
  // 00=lack, 01=slightly wanting, 10=good, 11=abundance
  statusCodes: Map<number, string>;
  
  // Ideal distribution counts
  idealDistribution: Map<number, number>;
}

/**
 * Interface for transaction initiation
 */
export interface TransactionInitiation {
  transactionId: string;
  context: TransactionContext;
  senderTokens: Token[];
  receiverTokens: Token[];
  timestamp: number;
}

/**
 * Interface for transaction response
 */
export interface TransactionResponse {
  transactionId: string;
  accepted: boolean;
  senderExoPak?: ExoPak;
  receiverExoPak?: ExoPak;
  reason?: string;
  timestamp: number;
}

/**
 * Interface for transaction confirmation
 */
export interface TransactionConfirmation {
  transactionId: string;
  senderCommitmentProof: Uint8Array;
  timestamp: number;
}

/**
 * Interface for transaction acknowledgement
 */
export interface TransactionAcknowledgement {
  transactionId: string;
  receiverCommitmentProof: Uint8Array;
  timestamp: number;
}

/**
 * Interface for transaction context
 */
export interface TransactionContext {
  senderPublicKey: Uint8Array;
  receiverPublicKey: Uint8Array;
  transactionType: string;
  purpose: string;
  amount: number;
  location?: { latitude: number; longitude: number; accuracy: number; };
  reference?: { type: string; id: string; };
  constraints: TransactionConstraints;
}

/**
 * Interface for transaction constraints
 */
export interface TransactionConstraints {
  maxDurationMs: number;
  minBalanceAfter: number;
  allowedDenominations: number[];
  requiredAttestationLevel: number;
  useWisselToken: boolean;
  useAfrondingBuffer: boolean;
}

/**
 * Interface for ExoPak (tokens sent to the other party)
 */
export interface ExoPak {
  id: string;
  status: PakStatus;
  tokens: Token[];
  proof: Uint8Array;
  metadata: Map<string, string>;
}

/**
 * Interface for RetroPak (tokens retained for rollback safety)
 */
export interface RetroPak {
  id: string;
  status: PakStatus;
  tokens: Token[];
  rollbackInstructions: RollbackInstructions;
  proof: Uint8Array;
  metadata: Map<string, string>;
}

/**
 * Interface for rollback instructions
 */
export interface RollbackInstructions {
  steps: RollbackStep[];
  timeoutMs: number;
  proof: Uint8Array;
}

/**
 * Interface for a single rollback step
 */
export interface RollbackStep {
  stepNumber: number;
  stepType: string;
  stepData: Uint8Array;
  stepProof: Uint8Array;
}

/**
 * Interface for transaction timestamps
 */
export interface TransactionTimestamps {
  createdAtMs: number;
  initiatedAtMs: number;
  preparedAtMs?: number;
  committedAtMs?: number;
  completedAtMs?: number;
  timeoutAtMs: number;
}

/**
 * Interface for transaction proofs
 */
export interface TransactionProofs {
  transactionSignature: Uint8Array;
  senderCommitmentProof?: Uint8Array;
  receiverCommitmentProof?: Uint8Array;
  atomicCommitmentProof?: Uint8Array;
  zeroKnowledgeProofs?: Uint8Array[];
}

/**
 * Interface for a complete Transaction
 */
export interface Transaction {
  id: string;
  state: TransactionState;
  context: TransactionContext;
  senderExoPak: ExoPak;
  receiverExoPak: ExoPak;
  senderRetroPak: RetroPak;
  receiverRetroPak: RetroPak;
  timestamps: TransactionTimestamps;
  proofs: TransactionProofs;
  metadata: Map<string, string>;
} 