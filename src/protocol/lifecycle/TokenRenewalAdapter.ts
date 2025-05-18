import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { SignatureUtil } from './utils/crypto';
import {
  IExpiryNotification,
  IRenewalRequest,
  IRenewalFacilitation,
  IRenewalReward,
  ITelomeerRenewalTransformation,
  IValidationError,
  ValidationErrorCode,
  IResult
} from './types';

/**
 * TokenRenewalAdapter handles all aspects of the token renewal lifecycle
 * including expiry management, renewal requests, facilitation, and telomeer transformations.
 */
export class TokenRenewalAdapter {
  private readonly MIN_DAYS_NOTIFICATION = 7;
  private readonly MAX_FACILITATION_REWARD_PERCENTAGE = 0.05; // 5% maximum facilitation reward
  private readonly DEVELOPMENTAL_STAGE_DISTRIBUTION = {
    trustBuilding: 0.15,
    autonomySupport: 0.15,
    imaginationFunding: 0.15,
    competenceReward: 0.15,
    identityFormation: 0.15,
    connectionBridges: 0.15,
    generativityProjects: 0.10
  };
  
  /**
   * Generates expiry notifications for tokens that are about to expire
   * @param tokenIds Array of token IDs with expiry information
   * @param currentTimestampMs Current time in milliseconds
   * @returns Array of expiry notifications
   */
  public generateExpiryNotifications(
    tokenExpiryMap: Map<string, number>,
    currentTimestampMs: number
  ): IResult<IExpiryNotification[]> {
    const notifications: IExpiryNotification[] = [];
    const errors: IValidationError[] = [];
    
    if (!tokenExpiryMap || tokenExpiryMap.size === 0) {
      errors.push({
        field: 'tokenExpiryMap',
        message: 'Token expiry map is required and cannot be empty',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
      
      return {
        success: false,
        errors
      };
    }
    
    const msPerDay = 24 * 60 * 60 * 1000;
    const notificationThresholds = [
      7 * msPerDay,  // 7 days before expiry
      3 * msPerDay,  // 3 days before expiry
      1 * msPerDay   // 1 day before expiry
    ];
    
    // Group tokens by expiry thresholds
    const notificationGroups = new Map<number, string[]>();
    
    for (const [tokenId, expiryMs] of tokenExpiryMap.entries()) {
      const timeToExpiry = expiryMs - currentTimestampMs;
      
      // Skip tokens that have already expired
      if (timeToExpiry <= 0) continue;
      
      // Find the appropriate notification threshold
      for (const threshold of notificationThresholds) {
        if (timeToExpiry <= threshold) {
          const daysRemaining = Math.ceil(timeToExpiry / msPerDay);
          
          if (!notificationGroups.has(daysRemaining)) {
            notificationGroups.set(daysRemaining, []);
          }
          
          notificationGroups.get(daysRemaining)!.push(tokenId);
          break;
        }
      }
    }
    
    // Create notifications for each group
    for (const [daysRemaining, tokenIds] of notificationGroups.entries()) {
      const tokenIdObjects = tokenIds.map(id => ({
        id,
        version: 1 // Default version to 1 for now
      }));
      
      notifications.push({
        expiringTokens: tokenIdObjects,
        expiryTimestampMs: currentTimestampMs + (daysRemaining * msPerDay),
        notificationTimestampMs: currentTimestampMs,
        daysRemaining,
        requiresAction: daysRemaining <= 3 // Require action for tokens expiring in 3 days or less
      });
    }
    
    return {
      success: true,
      data: notifications
    };
  }
  
  /**
   * Validates a renewal request
   * @param request Renewal request to validate
   * @returns Result indicating if the request is valid
   */
  public validateRenewalRequest(request: IRenewalRequest): IResult<IRenewalRequest> {
    const errors: IValidationError[] = [];
    
    // Check tokens to renew
    if (!request.tokensToRenew || request.tokensToRenew.length === 0) {
      errors.push({
        field: 'tokensToRenew',
        message: 'At least one token must be specified for renewal',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // Check requester ID
    if (!request.requesterId) {
      errors.push({
        field: 'requesterId',
        message: 'Requester ID is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // Check timestamp
    if (!request.requestTimestampMs) {
      errors.push({
        field: 'requestTimestampMs',
        message: 'Request timestamp is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: true,
      data: request
    };
  }
  
  /**
   * Processes a renewal facilitation and calculates rewards
   * @param request Validated renewal request
   * @param facilitatorId ID of the facilitator
   * @param tokenValues Map of token IDs to their values
   * @returns Result containing the facilitation details including rewards
   */
  public facilitateRenewal(
    request: IRenewalRequest,
    facilitatorId: string,
    tokenValues: Map<string, number>
  ): IResult<IRenewalFacilitation> {
    const errors: IValidationError[] = [];
    
    // Ensure the requester isn't facilitating their own renewal
    if (request.requesterId === facilitatorId) {
      errors.push({
        field: 'facilitatorId',
        message: 'Facilitator cannot be the same as the requester',
        code: ValidationErrorCode.INVALID_VALUE
      });
      
      return {
        success: false,
        errors
      };
    }
    
    // Ensure all tokens have values
    let totalValue = 0;
    const missingTokens: string[] = [];
    
    for (const token of request.tokensToRenew) {
      if (!tokenValues.has(token.id)) {
        missingTokens.push(token.id);
      } else {
        totalValue += tokenValues.get(token.id)!;
      }
    }
    
    if (missingTokens.length > 0) {
      errors.push({
        field: 'tokensToRenew',
        message: `Missing values for tokens: ${missingTokens.join(', ')}`,
        code: ValidationErrorCode.INVALID_VALUE
      });
      
      return {
        success: false,
        errors
      };
    }
    
    // Calculate facilitation reward
    const reward = this.calculateFacilitationReward(totalValue);
    
    // Create facilitation record
    const facilitation: IRenewalFacilitation = {
      facilitationId: uuidv4(),
      facilitatorId,
      requestorId: request.requesterId,
      facilitatedTokens: request.tokensToRenew,
      facilitationTimestampMs: Date.now(),
      reward
    };
    
    return {
      success: true,
      data: facilitation
    };
  }
  
  /**
   * Creates a telomeer renewal transformation for a token
   * @param oldTokenId Old token ID
   * @param ownerId Owner ID
   * @param expiryDurationMs Duration until expiry in milliseconds
   * @returns Telomeer renewal transformation
   */
  public createTelomeerRenewalTransformation(
    oldTokenId: string,
    ownerId: string,
    expiryDurationMs: number = 365 * 24 * 60 * 60 * 1000 // Default 1 year expiry
  ): IResult<ITelomeerRenewalTransformation> {
    const errors: IValidationError[] = [];
    
    // Validate inputs
    if (!oldTokenId) {
      errors.push({
        field: 'oldTokenId',
        message: 'Old token ID is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    if (!ownerId) {
      errors.push({
        field: 'ownerId',
        message: 'Owner ID is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    if (expiryDurationMs <= 0) {
      errors.push({
        field: 'expiryDurationMs',
        message: 'Expiry duration must be positive',
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }
    
    const now = Date.now();
    
    // Generate new token ID (in real system would be more sophisticated)
    const newTokenId = `${oldTokenId.split('-')[0]}-${uuidv4()}`;
    
    // Create renewal transformation
    const transformation: ITelomeerRenewalTransformation = {
      oldTokenId: {
        id: oldTokenId,
        version: 1 // Default version to 1
      },
      newTokenId: {
        id: newTokenId,
        version: 1 // Start at version 1
      },
      ownerId,
      renewalSignature: this.generateRenewalSignature(oldTokenId, newTokenId, ownerId),
      renewalTimestampMs: now,
      newExpiryMs: now + expiryDurationMs
    };
    
    return {
      success: true,
      data: transformation
    };
  }
  
  /**
   * Verifies a telomeer renewal transformation
   * @param transformation Transformation to verify
   * @returns Result indicating if the transformation is valid
   */
  public verifyRenewalTransformation(
    transformation: ITelomeerRenewalTransformation
  ): IResult<boolean> {
    const errors: IValidationError[] = [];
    
    // Check if the transformation has a valid signature
    if (!transformation.renewalSignature || transformation.renewalSignature.length === 0) {
      errors.push({
        field: 'renewalSignature',
        message: 'Renewal signature is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // Check that the new expiry is in the future
    const now = Date.now();
    if (transformation.newExpiryMs <= now) {
      errors.push({
        field: 'newExpiryMs',
        message: 'New expiry must be in the future',
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }
    
    // For testing purposes, we'll verify using the same deterministic approach
    const message = `${transformation.oldTokenId.id}:${transformation.newTokenId.id}:${transformation.ownerId}`;
    const expectedSignature = SignatureUtil.deterministicSign(message);
    
    // Compare signatures
    const signaturesMatch = Buffer.compare(
      Buffer.from(transformation.renewalSignature),
      Buffer.from(expectedSignature)
    ) === 0;
    
    if (!signaturesMatch) {
      errors.push({
        field: 'renewalSignature',
        message: 'Invalid renewal signature',
        code: ValidationErrorCode.INVALID_VALUE
      });
      
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Calculates facilitation reward for processing expired tokens
   * @param expiredValue Total value of expired tokens
   * @param economicActivityMultiplier Multiplier based on economic activity (default 1.0)
   * @returns Renewal reward
   */
  private calculateFacilitationReward(
    expiredValue: number,
    economicActivityMultiplier: number = 1.0
  ): IRenewalReward {
    // Calculate base reward (default to 2% of expired value)
    const rewardPercentage = Math.min(0.02, this.MAX_FACILITATION_REWARD_PERCENTAGE);
    const baseReward = Math.round(expiredValue * rewardPercentage);
    
    // Apply economic activity multiplier
    const adjustedReward = Math.round(baseReward * economicActivityMultiplier);
    
    // Distribute across developmental stages
    const distribution = this.calculateDevelopmentalDistribution(adjustedReward);
    
    // Generate dummy token IDs for new tokens
    const newTokenIds = Array.from({ length: 2 }, () => ({
      id: uuidv4(),
      version: 1
    }));
    
    return {
      expiredValueProcessed: expiredValue,
      baseFacilitationReward: baseReward,
      economicActivityMultiplier,
      newTokens: newTokenIds,
      ...distribution
    };
  }
  
  /**
   * Distributes a reward amount across the developmental stages
   * @param totalReward Total reward amount
   * @returns Object with amounts distributed across stages
   */
  private calculateDevelopmentalDistribution(totalReward: number): {
    trustBuilding: number;
    autonomySupport: number;
    imaginationFunding: number;
    competenceReward: number;
    identityFormation: number;
    connectionBridges: number;
    generativityProjects: number;
  } {
    // Calculate raw distribution
    const rawDistribution = Object.entries(this.DEVELOPMENTAL_STAGE_DISTRIBUTION)
      .reduce((acc, [stage, percentage]) => {
        acc[stage] = Math.floor(totalReward * percentage);
        return acc;
      }, {} as Record<string, number>);
    
    // Calculate adjustment to ensure the sum equals totalReward (due to rounding)
    const distributedSum = Object.values(rawDistribution).reduce((sum, val) => sum + val, 0);
    const adjustment = totalReward - distributedSum;
    
    // Apply adjustment to the first stage
    rawDistribution.trustBuilding += adjustment;
    
    return {
      trustBuilding: rawDistribution.trustBuilding,
      autonomySupport: rawDistribution.autonomySupport,
      imaginationFunding: rawDistribution.imaginationFunding,
      competenceReward: rawDistribution.competenceReward,
      identityFormation: rawDistribution.identityFormation,
      connectionBridges: rawDistribution.connectionBridges,
      generativityProjects: rawDistribution.generativityProjects
    };
  }
  
  /**
   * Generates a renewal signature for telomeer transformation using ED25519
   * @param oldTokenId Old token ID
   * @param newTokenId New token ID
   * @param ownerId Owner ID
   * @returns Signature as Uint8Array
   */
  private generateRenewalSignature(
    oldTokenId: string,
    newTokenId: string,
    ownerId: string
  ): Uint8Array {
    // In a real implementation, this would use the actual owner's private key
    // For testing purposes, we use a deterministic signature
    const message = `${oldTokenId}:${newTokenId}:${ownerId}`;
    return SignatureUtil.deterministicSign(message);
  }
} 