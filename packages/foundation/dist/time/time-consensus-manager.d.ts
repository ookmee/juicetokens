import { Logger } from '@juicetokens/common';
import { ITimeConsensusManager, ITimeSource, TimeConsensus } from './interfaces';
/**
 * Configuration for TimeConsensusManager
 */
export interface TimeConsensusManagerConfig {
    /**
     * How often to recalculate consensus in milliseconds
     */
    recalculateIntervalMs?: number;
    /**
     * The consensus algorithm to use
     */
    algorithm?: 'MEDIAN' | 'MEAN' | 'WEIGHTED_MEAN';
    /**
     * Maximum allowed deviation from consensus to participate
     */
    maxDeviationThresholdMs?: number;
}
/**
 * Manages time consensus from multiple sources
 */
export declare class TimeConsensusManager implements ITimeConsensusManager {
    private readonly logger;
    private readonly config;
    private readonly timeSources;
    private currentConsensus;
    private recalculateInterval;
    /**
     * Creates a new TimeConsensusManager
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(logger: Logger, config?: TimeConsensusManagerConfig);
    /**
     * {@inheritdoc}
     */
    getCurrentConsensus(): Promise<TimeConsensus>;
    /**
     * {@inheritdoc}
     */
    recalculateConsensus(): Promise<TimeConsensus>;
    /**
     * {@inheritdoc}
     */
    addTimeSource(source: ITimeSource): void;
    /**
     * {@inheritdoc}
     */
    removeTimeSource(sourceId: string): boolean;
    /**
     * Start periodic recalculation of consensus
     */
    private startPeriodicRecalculation;
    /**
     * Stop periodic recalculation
     */
    stopPeriodicRecalculation(): void;
    /**
     * Clean up resources when no longer needed
     */
    dispose(): void;
    /**
     * Calculate the median of an array of numbers
     */
    private calculateMedian;
    /**
     * Calculate the mean (average) of an array of numbers
     */
    private calculateMean;
    /**
     * Calculate the weighted mean of an array of numbers
     * @param values The values
     * @param weights The weights corresponding to each value
     */
    private calculateWeightedMean;
}
