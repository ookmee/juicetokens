import { Logger } from '@juicetokens/common';

/**
 * Enum representing different time source types
 */
export enum TimeSourceType {
  SYSTEM = 'SYSTEM',
  NTP = 'NTP',
  GNSS = 'GNSS',
  RADIO = 'RADIO',
  CONSENSUS = 'CONSENSUS',
  TSA = 'TSA',
  BLOCKCHAIN = 'BLOCKCHAIN'
}

/**
 * Interface for a time source
 */
export interface ITimeSource {
  /**
   * The type of time source
   */
  readonly type: TimeSourceType;
  
  /**
   * A unique identifier for this time source
   */
  readonly sourceId: string;
  
  /**
   * Whether this time source is currently available
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Get the current timestamp from this source
   * @returns Timestamp in milliseconds since Unix epoch
   */
  getCurrentTime(): Promise<number>;
  
  /**
   * Get the confidence score for this time source
   * @returns Number between 0-100 indicating confidence
   */
  getConfidenceScore(): Promise<number>;
  
  /**
   * When this source was last synchronized
   * @returns Timestamp in milliseconds since Unix epoch
   */
  getLastSyncTime(): Promise<number>;
}

/**
 * Interface for time source providers
 */
export interface ITimeSourceProvider {
  /**
   * Create a time source instance
   * @param config Configuration for the time source
   * @param logger Logger instance
   */
  createTimeSource(config: any, logger: Logger): Promise<ITimeSource>;
}

/**
 * Interface for time integrity verification
 */
export interface ITimeIntegrityVerifier {
  /**
   * Verify time integrity using multiple sources
   * @param sourceTypes Types of time sources to use for verification
   * @param requireHighConfidence Whether high confidence is required
   * @param minimumSources Minimum number of sources required
   * @param checkForSpoofing Whether to check for time spoofing
   */
  verifyTimeIntegrity(
    sourceTypes: TimeSourceType[],
    requireHighConfidence: boolean,
    minimumSources: number,
    checkForSpoofing: boolean
  ): Promise<TimeIntegrityResult>;
}

/**
 * Result of time integrity verification
 */
export interface TimeIntegrityResult {
  timestamp: number;
  confidenceScore: number;
  sources: TimeSourceStatus[];
  integrityVerified: boolean;
  spoofingDetection?: SpoofingDetectionResult;
  suitableForTransactions: boolean;
}

/**
 * Status of a time source
 */
export interface TimeSourceStatus {
  sourceType: TimeSourceType;
  available: boolean;
  reportedTime: number;
  confidenceScore: number;
  deviationMs: number;
  errorMessage?: string;
  contributingToConsensus: boolean;
}

/**
 * Result of spoofing detection
 */
export interface SpoofingDetectionResult {
  spoofingDetected: boolean;
  detectionReason?: string;
  expectedTimeRangeMinMs?: number;
  expectedTimeRangeMaxMs?: number;
  detectedTimeMs?: number;
  confidenceInDetection?: number;
  affectedSources?: TimeSourceType[];
  signatures?: SpoofingSignature[];
}

/**
 * Signature of time spoofing
 */
export interface SpoofingSignature {
  signatureType: SpoofingSignatureType;
  severity: number;
  description: string;
  evidence?: Uint8Array;
}

/**
 * Types of spoofing signatures
 */
export enum SpoofingSignatureType {
  JUMP = 'JUMP',
  DRIFT = 'DRIFT',
  INCONSISTENCY = 'INCONSISTENCY',
  REPEATED = 'REPEATED',
  PATTERN = 'PATTERN'
}

/**
 * Interface for time synchronization
 */
export interface ITimeSynchronizer {
  /**
   * Synchronize time with preferred sources
   * @param preferredSources Preferred time sources
   * @param includeProof Whether to include a timestamp proof
   */
  synchronizeTime(
    preferredSources: TimeSourceType[],
    includeProof: boolean
  ): Promise<TimeSyncResult>;
}

/**
 * Result of time synchronization
 */
export interface TimeSyncResult {
  serverTime: number;
  clientTime: number;
  roundTripTime: number;
  estimatedOffset: number;
  proof?: TimestampProof;
  confidenceScore: number;
  availableSources: TimeSourceStatus[];
}

/**
 * Cryptographic proof of a timestamp
 */
export interface TimestampProof {
  timestamp: number;
  signature?: Uint8Array;
  signingAuthority?: string;
  additionalProof?: Uint8Array;
  proofType: string;
  creation: number;
  expiry: number;
}

/**
 * Interface for time consensus management
 */
export interface ITimeConsensusManager {
  /**
   * Get the current time consensus
   */
  getCurrentConsensus(): Promise<TimeConsensus>;
  
  /**
   * Recalculate time consensus using all available sources
   */
  recalculateConsensus(): Promise<TimeConsensus>;
  
  /**
   * Add a time source to the consensus calculation
   * @param source Time source to add
   */
  addTimeSource(source: ITimeSource): void;
  
  /**
   * Remove a time source from the consensus calculation
   * @param sourceId ID of the time source to remove
   */
  removeTimeSource(sourceId: string): boolean;
}

/**
 * Result of time consensus calculation
 */
export interface TimeConsensus {
  sources: ITimeSource[];
  consensusTimestamp: number;
  consensusConfidence: number;
  algorithm: string;
  contributingSources: number;
  maxDeviationMs: number;
  calculationTimestamp: number;
} 