import { IExpiryNotification, IRenewalRequest, IRenewalFacilitation, ITelomeerRenewalTransformation, IResult } from './types';
/**
 * TokenRenewalAdapter handles all aspects of the token renewal lifecycle
 * including expiry management, renewal requests, facilitation, and telomeer transformations.
 */
export declare class TokenRenewalAdapter {
    private readonly MIN_DAYS_NOTIFICATION;
    private readonly MAX_FACILITATION_REWARD_PERCENTAGE;
    private readonly DEVELOPMENTAL_STAGE_DISTRIBUTION;
    /**
     * Generates expiry notifications for tokens that are about to expire
     * @param tokenIds Array of token IDs with expiry information
     * @param currentTimestampMs Current time in milliseconds
     * @returns Array of expiry notifications
     */
    generateExpiryNotifications(tokenExpiryMap: Map<string, number>, currentTimestampMs: number): IResult<IExpiryNotification[]>;
    /**
     * Validates a renewal request
     * @param request Renewal request to validate
     * @returns Result indicating if the request is valid
     */
    validateRenewalRequest(request: IRenewalRequest): IResult<IRenewalRequest>;
    /**
     * Processes a renewal facilitation and calculates rewards
     * @param request Validated renewal request
     * @param facilitatorId ID of the facilitator
     * @param tokenValues Map of token IDs to their values
     * @returns Result containing the facilitation details including rewards
     */
    facilitateRenewal(request: IRenewalRequest, facilitatorId: string, tokenValues: Map<string, number>): IResult<IRenewalFacilitation>;
    /**
     * Creates a telomeer renewal transformation for a token
     * @param oldTokenId Old token ID
     * @param ownerId Owner ID
     * @param expiryDurationMs Duration until expiry in milliseconds
     * @returns Telomeer renewal transformation
     */
    createTelomeerRenewalTransformation(oldTokenId: string, ownerId: string, expiryDurationMs?: number): IResult<ITelomeerRenewalTransformation>;
    /**
     * Verifies a telomeer renewal transformation
     * @param transformation Transformation to verify
     * @returns Result indicating if the transformation is valid
     */
    verifyRenewalTransformation(transformation: ITelomeerRenewalTransformation): IResult<boolean>;
    /**
     * Calculates facilitation reward for processing expired tokens
     * @param expiredValue Total value of expired tokens
     * @param economicActivityMultiplier Multiplier based on economic activity (default 1.0)
     * @returns Renewal reward
     */
    private calculateFacilitationReward;
    /**
     * Distributes a reward amount across the developmental stages
     * @param totalReward Total reward amount
     * @returns Object with amounts distributed across stages
     */
    private calculateDevelopmentalDistribution;
    /**
     * Generates a renewal signature for telomeer transformation using ED25519
     * @param oldTokenId Old token ID
     * @param newTokenId New token ID
     * @param ownerId Owner ID
     * @returns Signature as Uint8Array
     */
    private generateRenewalSignature;
}
