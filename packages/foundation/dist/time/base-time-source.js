"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTimeSource = void 0;
/**
 * Base abstract class for time sources
 */
class BaseTimeSource {
    /**
     * Creates a new BaseTimeSource
     * @param type The time source type
     * @param sourceId Unique identifier for this source
     * @param logger Logger instance
     */
    constructor(type, sourceId, logger) {
        /**
         * Last synchronization time
         */
        this.lastSyncTime = 0;
        /**
         * Last calculated confidence score
         */
        this.confidenceScore = 0;
        this.type = type;
        this.sourceId = sourceId;
        this.logger = logger;
    }
    /**
     * Get the confidence score for this time source
     */
    async getConfidenceScore() {
        // Default implementation returns cached confidence score
        return this.confidenceScore;
    }
    /**
     * Get the last synchronization time
     */
    async getLastSyncTime() {
        return this.lastSyncTime;
    }
    /**
     * Update the last synchronization time
     * @param time The synchronization time
     */
    updateLastSyncTime(time) {
        this.lastSyncTime = time;
    }
    /**
     * Update the confidence score
     * @param score The new confidence score
     */
    updateConfidenceScore(score) {
        // Ensure score is between 0-100
        this.confidenceScore = Math.min(100, Math.max(0, score));
    }
}
exports.BaseTimeSource = BaseTimeSource;
//# sourceMappingURL=base-time-source.js.map