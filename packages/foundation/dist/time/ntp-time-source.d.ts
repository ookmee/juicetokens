import { Logger } from '@juicetokens/common';
import { BaseTimeSource } from './base-time-source';
/**
 * Configuration for NTPTimeSource
 */
export interface NTPTimeSourceConfig {
    /**
     * NTP server addresses to use
     */
    servers?: string[];
    /**
     * How often to synchronize with NTP servers in milliseconds
     */
    syncIntervalMs?: number;
    /**
     * Default confidence score
     */
    defaultConfidenceScore?: number;
    /**
     * Whether this is a mock implementation
     */
    mockMode?: boolean;
    /**
     * For mock mode: fixed offset from system time in milliseconds
     */
    mockTimeOffsetMs?: number;
    /**
     * For mock mode: whether the source is available
     */
    mockAvailable?: boolean;
}
/**
 * Implementation of a time source that uses NTP
 */
export declare class NTPTimeSource extends BaseTimeSource {
    private readonly config;
    private syncInterval;
    private offsetFromSystemTime;
    private available;
    /**
     * Creates a new NTPTimeSource
     * @param sourceId Unique identifier for this source
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(sourceId: string, logger: Logger, config?: NTPTimeSourceConfig);
    /**
     * {@inheritdoc}
     */
    isAvailable(): Promise<boolean>;
    /**
     * {@inheritdoc}
     */
    getCurrentTime(): Promise<number>;
    /**
     * Start NTP synchronization
     */
    private startSync;
    /**
     * Synchronize with NTP servers
     */
    private syncWithNTPServers;
    /**
     * Stop synchronization
     */
    stopSync(): void;
    /**
     * Clean up resources when no longer needed
     */
    dispose(): void;
    /**
     * For testing: set mock availability
     */
    setMockAvailability(available: boolean): void;
    /**
     * For testing: set mock time offset
     */
    setMockTimeOffset(offsetMs: number): void;
}
