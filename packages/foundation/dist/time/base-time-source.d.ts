import { Logger } from '@juicetokens/common';
import { ITimeSource, TimeSourceType } from './interfaces';
/**
 * Base abstract class for time sources
 */
export declare abstract class BaseTimeSource implements ITimeSource {
    /**
     * The type of time source
     */
    readonly type: TimeSourceType;
    /**
     * A unique identifier for this time source
     */
    readonly sourceId: string;
    /**
     * Logger instance
     */
    protected readonly logger: Logger;
    /**
     * Last synchronization time
     */
    protected lastSyncTime: number;
    /**
     * Last calculated confidence score
     */
    protected confidenceScore: number;
    /**
     * Creates a new BaseTimeSource
     * @param type The time source type
     * @param sourceId Unique identifier for this source
     * @param logger Logger instance
     */
    constructor(type: TimeSourceType, sourceId: string, logger: Logger);
    /**
     * Check if this time source is available
     */
    abstract isAvailable(): Promise<boolean>;
    /**
     * Get the current time from this source
     */
    abstract getCurrentTime(): Promise<number>;
    /**
     * Get the confidence score for this time source
     */
    getConfidenceScore(): Promise<number>;
    /**
     * Get the last synchronization time
     */
    getLastSyncTime(): Promise<number>;
    /**
     * Update the last synchronization time
     * @param time The synchronization time
     */
    protected updateLastSyncTime(time: number): void;
    /**
     * Update the confidence score
     * @param score The new confidence score
     */
    protected updateConfidenceScore(score: number): void;
}
