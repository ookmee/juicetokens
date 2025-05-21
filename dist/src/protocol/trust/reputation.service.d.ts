/**
 * Reputation Service
 *
 * This service provides functionality for calculating and managing multi-dimensional
 * reputation scores based on the protocol definitions in protos/trust/reputation.proto.
 */
import { ReputationMetric, ReputationProfile, ReputationHistory, EnvironmentalContext, GeographicContext, TemporalPattern } from './types';
import { AttestationService } from './attestation.service';
export declare class ReputationService {
    private attestationService;
    private reputationProfiles;
    private reputationHistory;
    private contextualData;
    constructor(attestationService: AttestationService);
    /**
     * Creates or updates a reputation profile for a user
     */
    createOrUpdateReputationProfile(userId: string): ReputationProfile;
    /**
     * Updates a user's reputation profile based on attestations and activity
     */
    updateReputationProfile(userId: string): ReputationProfile;
    /**
     * Creates a custom reputation metric
     */
    createReputationMetric(userId: string, name: string, description: string, initialValue?: number, contributingAttestations?: string[]): ReputationMetric;
    /**
     * Updates a reputation metric value
     */
    updateReputationMetric(userId: string, metricId: string, newValue: number, evidenceId?: string, confidence?: number): boolean;
    /**
     * Gets a user's reputation profile
     */
    getReputationProfile(userId: string): ReputationProfile | undefined;
    /**
     * Gets a metric from a user's reputation profile
     */
    getReputationMetric(userId: string, metricId: string): ReputationMetric | undefined;
    /**
     * Gets a user's reputation history for a specific metric
     */
    getReputationHistory(userId: string, metricId: string): ReputationHistory | undefined;
    /**
     * Sets the environmental context for reputation calculation
     */
    setEnvironmentalContext(context: EnvironmentalContext): void;
    /**
     * Adds a geographic context for reputation calculation
     */
    addGeographicContext(context: GeographicContext): void;
    /**
     * Adds a temporal pattern for reputation calculation
     */
    addTemporalPattern(pattern: TemporalPattern): void;
    /**
     * Updates all reputation profiles with contextual adjustments
     */
    applyContextualAdjustmentsToAll(): void;
    /**
     * Gets a user's profile or creates a new one if it doesn't exist
     */
    private getOrCreateProfile;
    /**
     * Applies contextual adjustments to a reputation profile
     */
    private applyContextualAdjustments;
    /**
     * Applies a temporal pattern to a metric
     */
    private applyTemporalPatternToMetric;
    /**
     * Adds a point to the reputation history for a metric
     */
    private addReputationHistoryPoint;
    /**
     * Records a reputation update
     */
    private recordReputationUpdate;
    /**
     * Calculates a hash of a reputation profile
     */
    private calculateProfileHash;
    /**
     * Creates a chain entry for a reputation profile
     */
    private createReputationChainEntry;
    /**
     * Gets the next sequence number for chain entries
     */
    private getNextSequenceNumber;
}
