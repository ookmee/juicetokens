import { Logger } from '@juicetokens/common';
import { ITimeIntegrityVerifier, TimeIntegrityResult, TimeSourceType } from './interfaces';
import { TimeSourceManager } from './time-source-manager';
/**
 * Configuration for TimeIntegrityVerifier
 */
export interface TimeIntegrityVerifierConfig {
    /**
     * Default confidence threshold for high confidence
     */
    highConfidenceThreshold?: number;
    /**
     * Maximum allowed deviation for a source to be considered consistent
     */
    maxConsistentDeviationMs?: number;
    /**
     * Time window for detecting sudden jumps in milliseconds
     */
    jumpDetectionWindowMs?: number;
    /**
     * Threshold for detecting jumps in milliseconds
     */
    jumpDetectionThresholdMs?: number;
    /**
     * Whether to enable transaction verification by default
     */
    enableTransactionVerification?: boolean;
}
/**
 * Implements time integrity verification
 */
export declare class TimeIntegrityVerifier implements ITimeIntegrityVerifier {
    private readonly logger;
    private readonly timeSourceManager;
    private readonly config;
    private lastVerificationTime;
    private lastReportedTimes;
    /**
     * Creates a new TimeIntegrityVerifier
     * @param logger Logger instance
     * @param timeSourceManager Time source manager to use
     * @param config Configuration options
     */
    constructor(logger: Logger, timeSourceManager: TimeSourceManager, config?: TimeIntegrityVerifierConfig);
    /**
     * {@inheritdoc}
     */
    verifyTimeIntegrity(sourceTypes: TimeSourceType[], requireHighConfidence: boolean, minimumSources: number, checkForSpoofing: boolean): Promise<TimeIntegrityResult>;
    /**
     * Detect potential time spoofing based on time source data
     * @param sourceStatuses Status of all time sources
     * @param consensusTime The calculated consensus time
     * @returns Spoofing detection result
     */
    private detectTimeSpoofing;
    /**
     * Calculate the median of an array of numbers
     */
    private calculateMedian;
}
