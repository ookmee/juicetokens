import { Logger } from '@juicetokens/common';
import { BaseTimeSource } from './base-time-source';
/**
 * Configuration for SystemTimeSource
 */
export interface SystemTimeSourceConfig {
    /**
     * Default confidence score for system time
     */
    defaultConfidenceScore?: number;
    /**
     * How often to check system time drift in milliseconds
     */
    driftCheckIntervalMs?: number;
}
/**
 * Implementation of a time source that uses the system clock
 */
export declare class SystemTimeSource extends BaseTimeSource {
    private readonly config;
    private driftCheckInterval;
    private lastCheckedTime;
    private lastCheckedSystemTime;
    /**
     * Creates a new SystemTimeSource
     * @param sourceId Unique identifier for this source
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(sourceId: string, logger: Logger, config?: SystemTimeSourceConfig);
    /**
     * {@inheritdoc}
     */
    isAvailable(): Promise<boolean>;
    /**
     * {@inheritdoc}
     */
    getCurrentTime(): Promise<number>;
    /**
     * Start checking for system time drift
     */
    private startDriftChecking;
    /**
     * Check for system time drift by comparing elapsed time
     * with expected elapsed time since last check
     */
    private checkDrift;
    /**
     * Stop drift checking
     */
    stopDriftChecking(): void;
    /**
     * Clean up resources when no longer needed
     */
    dispose(): void;
}
