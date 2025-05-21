"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeConsensusManager = void 0;
/**
 * Manages time consensus from multiple sources
 */
class TimeConsensusManager {
    /**
     * Creates a new TimeConsensusManager
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(logger, config = {}) {
        this.timeSources = new Map();
        this.currentConsensus = null;
        this.recalculateInterval = null;
        this.logger = logger;
        this.config = {
            recalculateIntervalMs: 60000, // Recalculate every minute
            algorithm: 'WEIGHTED_MEAN',
            maxDeviationThresholdMs: 5000, // 5 seconds max deviation
            ...config
        };
        // Start periodic recalculation if enabled
        if (this.config.recalculateIntervalMs && this.config.recalculateIntervalMs > 0) {
            this.startPeriodicRecalculation();
        }
    }
    /**
     * {@inheritdoc}
     */
    async getCurrentConsensus() {
        if (!this.currentConsensus) {
            return this.recalculateConsensus();
        }
        return this.currentConsensus;
    }
    /**
     * {@inheritdoc}
     */
    async recalculateConsensus() {
        const sources = Array.from(this.timeSources.values());
        if (sources.length === 0) {
            // If no sources, use system time and zero confidence
            this.currentConsensus = {
                sources: [],
                consensusTimestamp: Date.now(),
                consensusConfidence: 0,
                algorithm: this.config.algorithm,
                contributingSources: 0,
                maxDeviationMs: 0,
                calculationTimestamp: Date.now()
            };
            return this.currentConsensus;
        }
        // Get available sources and their times
        const availableSources = [];
        const times = [];
        const confidences = [];
        for (const source of sources) {
            try {
                if (await source.isAvailable()) {
                    availableSources.push(source);
                    times.push(await source.getCurrentTime());
                    confidences.push(await source.getConfidenceScore());
                }
            }
            catch (error) {
                this.logger.error(`Error getting time from source ${source.sourceId}: ${error}`);
            }
        }
        if (availableSources.length === 0) {
            // If no available sources, return placeholder with current time
            this.currentConsensus = {
                sources: [],
                consensusTimestamp: Date.now(),
                consensusConfidence: 0,
                algorithm: this.config.algorithm,
                contributingSources: 0,
                maxDeviationMs: 0,
                calculationTimestamp: Date.now()
            };
            return this.currentConsensus;
        }
        // Calculate initial consensus based on algorithm
        let initialConsensus;
        switch (this.config.algorithm) {
            case 'MEDIAN':
                initialConsensus = this.calculateMedian(times);
                break;
            case 'MEAN':
                initialConsensus = this.calculateMean(times);
                break;
            case 'WEIGHTED_MEAN':
                initialConsensus = this.calculateWeightedMean(times, confidences);
                break;
            default:
                initialConsensus = this.calculateMedian(times);
        }
        // Filter out sources that are too far from consensus
        const contributingSources = [];
        const contributingTimes = [];
        const contributingConfidences = [];
        let maxDeviation = 0;
        for (let i = 0; i < availableSources.length; i++) {
            const deviation = Math.abs(times[i] - initialConsensus);
            maxDeviation = Math.max(maxDeviation, deviation);
            if (deviation <= this.config.maxDeviationThresholdMs) {
                contributingSources.push(availableSources[i]);
                contributingTimes.push(times[i]);
                contributingConfidences.push(confidences[i]);
            }
            else {
                this.logger.warn(`Time source ${availableSources[i].sourceId} excluded from consensus: deviation ${deviation}ms exceeds threshold`);
            }
        }
        // Recalculate consensus with contributing sources only
        let finalConsensus;
        if (contributingSources.length === 0) {
            // If no sources meet threshold, use initial consensus
            finalConsensus = initialConsensus;
            contributingSources.push(...availableSources);
            contributingTimes.push(...times);
            contributingConfidences.push(...confidences);
        }
        else {
            // Calculate final consensus
            switch (this.config.algorithm) {
                case 'MEDIAN':
                    finalConsensus = this.calculateMedian(contributingTimes);
                    break;
                case 'MEAN':
                    finalConsensus = this.calculateMean(contributingTimes);
                    break;
                case 'WEIGHTED_MEAN':
                    finalConsensus = this.calculateWeightedMean(contributingTimes, contributingConfidences);
                    break;
                default:
                    finalConsensus = this.calculateMedian(contributingTimes);
            }
        }
        // Calculate overall confidence in the consensus
        const avgConfidence = this.calculateMean(contributingConfidences);
        const sourceCountFactor = contributingSources.length / sources.length;
        const overallConfidence = Math.round(avgConfidence * sourceCountFactor);
        // Update current consensus
        this.currentConsensus = {
            sources: contributingSources,
            consensusTimestamp: finalConsensus,
            consensusConfidence: overallConfidence,
            algorithm: this.config.algorithm,
            contributingSources: contributingSources.length,
            maxDeviationMs: maxDeviation,
            calculationTimestamp: Date.now()
        };
        this.logger.info(`Time consensus recalculated: ${finalConsensus}ms with ${contributingSources.length} sources and confidence ${overallConfidence}`);
        return this.currentConsensus;
    }
    /**
     * {@inheritdoc}
     */
    addTimeSource(source) {
        if (this.timeSources.has(source.sourceId)) {
            this.logger.warn(`Time source ${source.sourceId} already exists in consensus manager`);
            return;
        }
        this.timeSources.set(source.sourceId, source);
        this.logger.info(`Added time source ${source.sourceId} to consensus manager`);
        // Recalculate consensus
        this.recalculateConsensus().catch(error => {
            this.logger.error(`Error recalculating consensus after adding source: ${error}`);
        });
    }
    /**
     * {@inheritdoc}
     */
    removeTimeSource(sourceId) {
        const exists = this.timeSources.has(sourceId);
        if (exists) {
            this.timeSources.delete(sourceId);
            this.logger.info(`Removed time source ${sourceId} from consensus manager`);
            // Recalculate consensus
            this.recalculateConsensus().catch(error => {
                this.logger.error(`Error recalculating consensus after removing source: ${error}`);
            });
        }
        return exists;
    }
    /**
     * Start periodic recalculation of consensus
     */
    startPeriodicRecalculation() {
        this.recalculateInterval = setInterval(() => {
            this.recalculateConsensus().catch(error => {
                this.logger.error(`Error in periodic consensus recalculation: ${error}`);
            });
        }, this.config.recalculateIntervalMs);
    }
    /**
     * Stop periodic recalculation
     */
    stopPeriodicRecalculation() {
        if (this.recalculateInterval) {
            clearInterval(this.recalculateInterval);
            this.recalculateInterval = null;
        }
    }
    /**
     * Clean up resources when no longer needed
     */
    dispose() {
        this.stopPeriodicRecalculation();
        this.timeSources.clear();
        this.currentConsensus = null;
    }
    /**
     * Calculate the median of an array of numbers
     */
    calculateMedian(values) {
        if (values.length === 0)
            return 0;
        if (values.length === 1)
            return values[0];
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        else {
            return sorted[middle];
        }
    }
    /**
     * Calculate the mean (average) of an array of numbers
     */
    calculateMean(values) {
        if (values.length === 0)
            return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }
    /**
     * Calculate the weighted mean of an array of numbers
     * @param values The values
     * @param weights The weights corresponding to each value
     */
    calculateWeightedMean(values, weights) {
        if (values.length === 0 || values.length !== weights.length)
            return 0;
        let sum = 0;
        let weightSum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i] * weights[i];
            weightSum += weights[i];
        }
        return weightSum > 0 ? sum / weightSum : 0;
    }
}
exports.TimeConsensusManager = TimeConsensusManager;
//# sourceMappingURL=time-consensus-manager.js.map