import { Logger } from '@juicetokens/common';
import { ITimeSource, TimeSourceType } from './interfaces';
/**
 * Configuration for TimeSourceManager
 */
export interface TimeSourceManagerConfig {
    /**
     * Whether to initialize with a system time source
     */
    includeSystemTimeSource?: boolean;
    /**
     * System time source ID to use if includeSystemTimeSource is true
     */
    systemTimeSourceId?: string;
}
/**
 * Manages multiple time sources
 */
export declare class TimeSourceManager {
    private readonly logger;
    private readonly timeSources;
    private readonly timeSourcesByType;
    /**
     * Creates a new TimeSourceManager
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(logger: Logger, config?: TimeSourceManagerConfig);
    /**
     * Add a time source to the manager
     * @param timeSource The time source to add
     * @returns true if the source was added, false if a source with same ID already exists
     */
    addTimeSource(timeSource: ITimeSource): boolean;
    /**
     * Remove a time source by ID
     * @param sourceId The ID of the time source to remove
     * @returns true if the source was removed, false if no source with that ID exists
     */
    removeTimeSource(sourceId: string): boolean;
    /**
     * Get a time source by ID
     * @param sourceId The ID of the time source
     * @returns The time source, or undefined if not found
     */
    getTimeSource(sourceId: string): ITimeSource | undefined;
    /**
     * Get all time sources of a specific type
     * @param sourceType The type of time sources to get
     * @returns Array of time sources of the specified type
     */
    getTimeSourcesByType(sourceType: TimeSourceType): ITimeSource[];
    /**
     * Get all available time sources
     * @returns Promise resolving to array of available time sources
     */
    getAvailableTimeSources(): Promise<ITimeSource[]>;
    /**
     * Get the current time from the highest confidence available source
     * @returns Promise resolving to the current time in milliseconds
     * @throws Error if no time sources are available
     */
    getCurrentTime(): Promise<number>;
    /**
     * Clean up resources when no longer needed
     */
    dispose(): void;
}
