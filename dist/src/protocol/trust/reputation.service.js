"use strict";
/**
 * Reputation Service
 *
 * This service provides functionality for calculating and managing multi-dimensional
 * reputation scores based on the protocol definitions in protos/trust/reputation.proto.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
const types_1 = require("./types");
class ReputationService {
    constructor(attestationService) {
        this.attestationService = attestationService;
        this.reputationProfiles = new Map();
        this.reputationHistory = new Map();
        this.contextualData = {
            geographicContexts: new Map(),
            temporalPatterns: []
        };
    }
    /**
     * Creates or updates a reputation profile for a user
     */
    createOrUpdateReputationProfile(userId) {
        // Check if user already has a profile
        const existingProfile = this.reputationProfiles.get(userId);
        if (existingProfile) {
            // Update existing profile
            return this.updateReputationProfile(userId);
        }
        else {
            // Create new profile with default values
            const defaultReliability = {
                successfulTransactionsRate: 0,
                onTimeCompletionRate: 0,
                averageResponseTimeSeconds: 0,
                transactionCount: 0,
                score: 0.5 // Default neutral score
            };
            const defaultContribution = {
                renewalFacilitationRate: 0,
                attestationContributionRate: 0,
                networkRelayContribution: 0,
                contributionCount: 0,
                score: 0.5 // Default neutral score
            };
            const defaultValidation = {
                communityConsensusAlignment: 0,
                attestationVerificationRate: 0,
                falseAttestationRate: 0,
                validationCount: 0,
                score: 0.5 // Default neutral score
            };
            const newProfile = {
                userId,
                reliability: defaultReliability,
                contribution: defaultContribution,
                validation: defaultValidation,
                customMetrics: [],
                lastUpdatedMs: Date.now(),
                profileHash: new Uint8Array()
            };
            // Calculate profile hash
            newProfile.profileHash = this.calculateProfileHash(newProfile);
            // Store in local map
            this.reputationProfiles.set(userId, newProfile);
            // Create a chain entry for the new profile
            this.createReputationChainEntry(newProfile);
            return newProfile;
        }
    }
    /**
     * Updates a user's reputation profile based on attestations and activity
     */
    updateReputationProfile(userId) {
        const profile = this.reputationProfiles.get(userId);
        if (!profile) {
            return this.createOrUpdateReputationProfile(userId);
        }
        // Get attestations about the user
        const attestations = this.attestationService.getAttestationsAboutSubject(userId);
        // Update reliability score based on transaction attestations
        const transactionAttestations = attestations.filter(wrapper => wrapper.attestation &&
            'attestationType' in wrapper.attestation &&
            wrapper.attestation.attestationType === 'transaction');
        if (transactionAttestations.length > 0) {
            // Calculate transaction-based metrics
            const successfulCount = transactionAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('successful')).length;
            const onTimeCount = transactionAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('on-time')).length;
            // Update reliability scores
            profile.reliability.transactionCount = transactionAttestations.length;
            profile.reliability.successfulTransactionsRate =
                successfulCount / transactionAttestations.length;
            profile.reliability.onTimeCompletionRate =
                onTimeCount / transactionAttestations.length;
            // Combine metrics into overall score (simple average for now)
            profile.reliability.score =
                (profile.reliability.successfulTransactionsRate +
                    profile.reliability.onTimeCompletionRate) / 2;
        }
        // Update contribution score based on contribution attestations
        const contributionAttestations = attestations.filter(wrapper => wrapper.attestation &&
            'attestationType' in wrapper.attestation &&
            wrapper.attestation.attestationType === 'contribution');
        if (contributionAttestations.length > 0) {
            // Count attestation types
            const renewalCount = contributionAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('renewal')).length;
            const attestationCount = contributionAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('attestation')).length;
            const networkCount = contributionAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('network')).length;
            // Update contribution scores
            profile.contribution.contributionCount = contributionAttestations.length;
            profile.contribution.renewalFacilitationRate =
                renewalCount / Math.max(1, contributionAttestations.length);
            profile.contribution.attestationContributionRate =
                attestationCount / Math.max(1, contributionAttestations.length);
            profile.contribution.networkRelayContribution =
                networkCount / Math.max(1, contributionAttestations.length);
            // Combine metrics into overall score (simple average for now)
            profile.contribution.score =
                (profile.contribution.renewalFacilitationRate +
                    profile.contribution.attestationContributionRate +
                    profile.contribution.networkRelayContribution) / 3;
        }
        // Update validation score based on validation attestations
        const validationAttestations = attestations.filter(wrapper => wrapper.attestation &&
            'attestationType' in wrapper.attestation &&
            wrapper.attestation.attestationType === 'validation');
        if (validationAttestations.length > 0) {
            // Count validation types
            const consensusCount = validationAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('consensus')).length;
            const verificationCount = validationAttestations.filter(wrapper => 'attestationContent' in wrapper.attestation &&
                wrapper.attestation.attestationContent.includes('verification')).length;
            // Update validation scores
            profile.validation.validationCount = validationAttestations.length;
            profile.validation.communityConsensusAlignment =
                consensusCount / Math.max(1, validationAttestations.length);
            profile.validation.attestationVerificationRate =
                verificationCount / Math.max(1, validationAttestations.length);
            // Combine metrics into overall score (simple average for now)
            profile.validation.score =
                (profile.validation.communityConsensusAlignment +
                    profile.validation.attestationVerificationRate) / 2;
        }
        // Apply contextual adjustments
        this.applyContextualAdjustments(profile);
        // Update timestamp and hash
        profile.lastUpdatedMs = Date.now();
        profile.profileHash = this.calculateProfileHash(profile);
        // Store updated profile
        this.reputationProfiles.set(userId, profile);
        // Record the update
        this.recordReputationUpdate(profile, 'system', types_1.UpdateType.PERIODIC);
        // Create a chain entry for the updated profile
        this.createReputationChainEntry(profile);
        return profile;
    }
    /**
     * Creates a custom reputation metric
     */
    createReputationMetric(userId, name, description, initialValue = 0.5, contributingAttestations = []) {
        const profile = this.getOrCreateProfile(userId);
        // Create the new metric
        const metric = {
            metricId: (0, uuid_1.v4)(),
            name,
            description,
            value: Math.max(0, Math.min(1, initialValue)), // Ensure 0-1 range
            confidence: 0.5, // Start with medium confidence
            contributingAttestations
        };
        // Add to profile if not already exists
        const existingMetricIndex = profile.customMetrics.findIndex(m => m.name === name);
        if (existingMetricIndex >= 0) {
            profile.customMetrics[existingMetricIndex] = metric;
        }
        else {
            profile.customMetrics.push(metric);
        }
        // Update profile
        profile.lastUpdatedMs = Date.now();
        profile.profileHash = this.calculateProfileHash(profile);
        this.reputationProfiles.set(userId, profile);
        // Create history entry
        this.addReputationHistoryPoint(userId, metric.metricId, metric.value, metric.confidence);
        return metric;
    }
    /**
     * Updates a reputation metric value
     */
    updateReputationMetric(userId, metricId, newValue, evidenceId, confidence) {
        const profile = this.reputationProfiles.get(userId);
        if (!profile)
            return false;
        // Find the metric
        const metricIndex = profile.customMetrics.findIndex(m => m.metricId === metricId);
        if (metricIndex < 0)
            return false;
        // Get the current metric
        const metric = profile.customMetrics[metricIndex];
        const oldValue = metric.value;
        // Update the metric
        metric.value = Math.max(0, Math.min(1, newValue)); // Ensure 0-1 range
        if (confidence !== undefined) {
            metric.confidence = Math.max(0, Math.min(1, confidence)); // Ensure 0-1 range
        }
        // If evidence provided, add to contributing attestations
        if (evidenceId && !metric.contributingAttestations.includes(evidenceId)) {
            metric.contributingAttestations.push(evidenceId);
        }
        // Update the profile
        profile.customMetrics[metricIndex] = metric;
        profile.lastUpdatedMs = Date.now();
        profile.profileHash = this.calculateProfileHash(profile);
        this.reputationProfiles.set(userId, profile);
        // Record the update
        this.recordReputationUpdate(profile, evidenceId ? 'attestation' : 'manual', evidenceId ? types_1.UpdateType.ATTESTATION : types_1.UpdateType.MANUAL, metricId, oldValue, newValue);
        // Create history entry
        this.addReputationHistoryPoint(userId, metricId, newValue, metric.confidence, evidenceId);
        return true;
    }
    /**
     * Gets a user's reputation profile
     */
    getReputationProfile(userId) {
        return this.reputationProfiles.get(userId);
    }
    /**
     * Gets a metric from a user's reputation profile
     */
    getReputationMetric(userId, metricId) {
        const profile = this.reputationProfiles.get(userId);
        if (!profile)
            return undefined;
        return profile.customMetrics.find(m => m.metricId === metricId);
    }
    /**
     * Gets a user's reputation history for a specific metric
     */
    getReputationHistory(userId, metricId) {
        const userHistory = this.reputationHistory.get(userId);
        if (!userHistory)
            return undefined;
        return userHistory.get(metricId);
    }
    /**
     * Sets the environmental context for reputation calculation
     */
    setEnvironmentalContext(context) {
        this.contextualData.environmentalContext = context;
    }
    /**
     * Adds a geographic context for reputation calculation
     */
    addGeographicContext(context) {
        this.contextualData.geographicContexts.set(context.s2CellId, context);
    }
    /**
     * Adds a temporal pattern for reputation calculation
     */
    addTemporalPattern(pattern) {
        this.contextualData.temporalPatterns.push(pattern);
    }
    /**
     * Updates all reputation profiles with contextual adjustments
     */
    applyContextualAdjustmentsToAll() {
        for (const userId of this.reputationProfiles.keys()) {
            const profile = this.reputationProfiles.get(userId);
            if (profile) {
                this.applyContextualAdjustments(profile);
                profile.lastUpdatedMs = Date.now();
                profile.profileHash = this.calculateProfileHash(profile);
                this.reputationProfiles.set(userId, profile);
            }
        }
    }
    // Helper methods
    /**
     * Gets a user's profile or creates a new one if it doesn't exist
     */
    getOrCreateProfile(userId) {
        const profile = this.reputationProfiles.get(userId);
        if (profile)
            return profile;
        return this.createOrUpdateReputationProfile(userId);
    }
    /**
     * Applies contextual adjustments to a reputation profile
     */
    applyContextualAdjustments(profile) {
        // Apply environmental context adjustments if available
        if (this.contextualData.environmentalContext) {
            const context = this.contextualData.environmentalContext;
            // In crisis mode, adjust reliability scores
            if (context.crisisMode) {
                // For example, during a crisis, we might be more lenient with reliability
                const adjustmentFactor = Math.max(0.8, 1 - context.severity);
                // Store the base value
                const baseValue = profile.reliability.score;
                // Apply adjustment (increase score in crisis situations)
                profile.reliability.score =
                    Math.min(1, profile.reliability.score * adjustmentFactor +
                        (1 - adjustmentFactor) * 0.8);
                // Create adjustment record
                const adjustment = {
                    metricId: 'reliability',
                    baseValue,
                    adjustedValue: profile.reliability.score,
                    adjustmentFactors: { 'crisis': adjustmentFactor },
                    adjustmentRationale: `Crisis adjustment: ${context.crisisType}`
                };
                // In a real implementation, we would store this adjustment
            }
        }
        // Apply geographic context adjustments
        // Find the relevant geographic context for this user
        // In a real implementation, this would use actual user location data
        // Apply temporal patterns
        for (const pattern of this.contextualData.temporalPatterns) {
            // Apply pattern-based adjustments
            if (pattern.metricId in profile) {
                // This is a core metric (reliability, contribution, validation)
                this.applyTemporalPatternToMetric(profile, pattern);
            }
            else {
                // Check if it's a custom metric
                const customMetric = profile.customMetrics.find(m => m.metricId === pattern.metricId);
                if (customMetric) {
                    // Apply to custom metric
                    // In a real implementation, this would apply specific adjustments
                }
            }
        }
    }
    /**
     * Applies a temporal pattern to a metric
     */
    applyTemporalPatternToMetric(profile, pattern) {
        // Implementation would vary based on pattern type
        switch (pattern.patternType) {
            case types_1.PatternType.CYCLICAL:
                // Apply cyclical adjustments (e.g., time of day effects)
                break;
            case types_1.PatternType.TREND:
                // Apply trend adjustments (e.g., consistent improvement over time)
                break;
            case types_1.PatternType.SEASONAL:
                // Apply seasonal adjustments (e.g., holiday effects)
                break;
            case types_1.PatternType.EVENT:
                // Apply event-based adjustments (e.g., network congestion)
                break;
        }
    }
    /**
     * Adds a point to the reputation history for a metric
     */
    addReputationHistoryPoint(userId, metricId, value, confidence, evidenceId) {
        // Get user history map or create it
        let userHistory = this.reputationHistory.get(userId);
        if (!userHistory) {
            userHistory = new Map();
            this.reputationHistory.set(userId, userHistory);
        }
        // Get metric history or create it
        let metricHistory = userHistory.get(metricId);
        if (!metricHistory) {
            metricHistory = {
                userId,
                metricId,
                historyPoints: []
            };
        }
        // Add new history point
        const point = {
            timestampMs: Date.now(),
            value,
            confidence,
            evidenceId: evidenceId || ""
        };
        metricHistory.historyPoints.push(point);
        // Store updated history
        userHistory.set(metricId, metricHistory);
    }
    /**
     * Records a reputation update
     */
    recordReputationUpdate(profile, updateSource, updateType, metricId, oldValue, newValue) {
        // Create update record
        const update = {
            userId: profile.userId,
            updateSource,
            updateType,
            metricId: metricId || 'profile',
            oldValue: oldValue !== undefined ? oldValue : 0,
            newValue: newValue !== undefined ? newValue : 0,
            confidence: 1.0, // Default high confidence for system updates
            evidenceIds: [],
            timestampMs: Date.now()
        };
        // In a real implementation, this would store the update
    }
    /**
     * Calculates a hash of a reputation profile
     */
    calculateProfileHash(profile) {
        // Create a copy without the hash field to avoid circular dependency
        const hashData = {
            ...profile,
            profileHash: new Uint8Array() // Empty hash field
        };
        // Calculate hash
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update(JSON.stringify(hashData));
        return new Uint8Array(hash.digest());
    }
    /**
     * Creates a chain entry for a reputation profile
     */
    createReputationChainEntry(profile) {
        const chainEntry = {
            userId: profile.userId,
            reputationProfileHash: profile.profileHash,
            sequenceNumber: this.getNextSequenceNumber(profile.userId),
            entryType: "reputation",
            timestampMs: Date.now(),
            dhtKey: new Uint8Array() // In a real implementation, this would be the DHT key
        };
        // In a real implementation, this would store the chain entry
        return chainEntry;
    }
    /**
     * Gets the next sequence number for chain entries
     */
    getNextSequenceNumber(userId) {
        // In a real implementation, this would get the next sequence number from the chain
        return Date.now();
    }
}
exports.ReputationService = ReputationService;
//# sourceMappingURL=reputation.service.js.map