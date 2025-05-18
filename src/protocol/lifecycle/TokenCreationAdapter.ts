import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { HashUtil } from './utils/crypto';
import {
  IEggGeneration,
  IHatchingCondition,
  ITokenDistribution,
  IGenesisPool,
  IDormantEgg,
  IFertilizationTrigger,
  IMaturationPath,
  IEggComponent,
  ISpermComponent,
  IFertilizationEvent,
  IResult,
  IValidationError,
  ValidationErrorCode,
  HatchingConditionType,
  DistributionStrategy,
  MaturationStage
} from './types';

/**
 * TokenCreationAdapter handles all aspects of the token creation lifecycle
 * from egg generation through hatching into active tokens.
 */
export class TokenCreationAdapter {
  private readonly MIN_GENERATORS = 3;
  private readonly MAX_GENERATORS = 12;
  private readonly MIN_POTENCY_LEVEL = 1;
  private readonly MAX_POTENCY_LEVEL = 100;
  private readonly VALID_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  
  /**
   * Generates new token eggs based on the provided parameters
   * @param params Egg generation parameters
   * @returns Result containing the created eggs or validation errors
   */
  public async generateEggs(params: IEggGeneration): Promise<IResult<IDormantEgg[]>> {
    // Validate parameters
    const validationErrors = this.validateEggGeneration(params);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    const eggs: IDormantEgg[] = [];
    const now = Date.now();
    
    // Default expiry is 30 days from now
    const defaultExpiryMs = now + (30 * 24 * 60 * 60 * 1000);
    
    // Create the specified number of eggs
    for (let i = 0; i < params.count; i++) {
      const eggId = `${params.batchReference}-${uuidv4()}`;
      
      // Create default hatching condition
      const hatchingCondition: IHatchingCondition = {
        eggId,
        conditionType: HatchingConditionType.ATTESTATION_THRESHOLD,
        conditionParameters: new Uint8Array(
          Buffer.from(JSON.stringify({ threshold: 3 }))
        ),
        expiryMs: defaultExpiryMs
      };
      
      // Create dormant egg
      const egg: IDormantEgg = {
        eggId,
        denomination: params.denomination,
        ownerId: params.generatorIds[0], // Default to first generator as owner
        dormancySeal: this.generateDormancySeal(eggId, params.entropyCommitment),
        hatchingCondition,
        creationTimestampMs: now,
        dormancyExpiresMs: defaultExpiryMs
      };
      
      eggs.push(egg);
    }
    
    return {
      success: true,
      data: eggs
    };
  }
  
  /**
   * Creates a genesis pool for token issuance
   * @param params Genesis pool parameters
   * @returns Result containing the created genesis pool or validation errors
   */
  public async createGenesisPool(params: Omit<IGenesisPool, 'formationTimestampMs'>): Promise<IResult<IGenesisPool>> {
    const validationErrors: IValidationError[] = [];
    
    // Validate member count
    if (!params.memberIds || params.memberIds.length < this.MIN_GENERATORS) {
      validationErrors.push({
        field: 'memberIds',
        message: `Genesis pool requires at least ${this.MIN_GENERATORS} members`,
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    if (params.memberIds.length > this.MAX_GENERATORS) {
      validationErrors.push({
        field: 'memberIds',
        message: `Genesis pool cannot have more than ${this.MAX_GENERATORS} members`,
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    // Validate attestation strengths
    if (!params.attestationStrengths || params.attestationStrengths.size === 0) {
      validationErrors.push({
        field: 'attestationStrengths',
        message: 'Attestation strengths are required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Create genesis pool
    const genesisPool: IGenesisPool = {
      ...params,
      formationTimestampMs: Date.now()
    };
    
    return {
      success: true,
      data: genesisPool
    };
  }
  
  /**
   * Triggers the fertilization of a dormant egg
   * @param params Fertilization trigger parameters
   * @returns Result containing the fertilization event or validation errors
   */
  public async triggerFertilization(
    dormantEgg: IDormantEgg,
    trigger: IFertilizationTrigger
  ): Promise<IResult<IFertilizationEvent>> {
    const validationErrors: IValidationError[] = [];
    
    // Check if egg exists and is in dormant state
    if (!dormantEgg) {
      validationErrors.push({
        field: 'eggId',
        message: 'Dormant egg not found',
        code: ValidationErrorCode.INVALID_VALUE
      });
      
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Check if egg has expired
    if (dormantEgg.dormancyExpiresMs < Date.now()) {
      validationErrors.push({
        field: 'dormancyExpiresMs',
        message: 'Dormant egg has expired',
        code: ValidationErrorCode.EXPIRED
      });
      
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Create egg component
    const eggComponent: IEggComponent = {
      componentId: `egg-${dormantEgg.eggId}`,
      denomination: dormantEgg.denomination,
      issuerId: dormantEgg.ownerId,
      issuerCommitment: dormantEgg.dormancySeal,
      creationTimestampMs: dormantEgg.creationTimestampMs,
      authorizedFertilizers: [trigger.activatorId]
    };
    
    // Create sperm component
    const spermComponent: ISpermComponent = {
      componentId: `sperm-${uuidv4()}`,
      activityType: trigger.activityReference,
      potencyLevel: this.calculatePotencyLevel(trigger.proofOfActivity),
      generatorId: trigger.activatorId,
      activityProof: trigger.proofOfActivity,
      generationTimestampMs: trigger.triggerTimestampMs,
      viabilityExpiresMs: trigger.triggerTimestampMs + (24 * 60 * 60 * 1000) // 24 hours validity
    };
    
    // Create fertilization event
    const fertilizationEvent: IFertilizationEvent = {
      fertilizationId: uuidv4(),
      eggComponentId: eggComponent.componentId,
      spermComponentId: spermComponent.componentId,
      compatibilityProof: this.generateCompatibilityProof(eggComponent, spermComponent),
      fertilizationTimestampMs: Date.now(),
      maturationPeriodHours: 72, // Default 72 hour maturation period
      witnesses: [] // No witnesses by default
    };
    
    return {
      success: true,
      data: fertilizationEvent
    };
  }
  
  /**
   * Updates the maturation path of a fertilized egg
   * @param currentPath Current maturation path
   * @param newStage New maturation stage
   * @returns Updated maturation path
   */
  public updateMaturationPath(
    currentPath: IMaturationPath,
    newStage: MaturationStage
  ): IResult<IMaturationPath> {
    // Validate stage transition
    if (newStage <= currentPath.currentStage) {
      return {
        success: false,
        errors: [{
          field: 'newStage',
          message: 'New stage must be greater than current stage',
          code: ValidationErrorCode.INVALID_STATE
        }]
      };
    }
    
    const now = Date.now();
    let estimatedCompletionMs: number;
    let completionPercentage: number;
    
    // Calculate estimated completion time and percentage based on stage
    switch (newStage) {
      case MaturationStage.FERTILIZED:
        estimatedCompletionMs = now + (24 * 60 * 60 * 1000); // 24 hours
        completionPercentage = 25;
        break;
      
      case MaturationStage.INCUBATING:
        estimatedCompletionMs = now + (48 * 60 * 60 * 1000); // 48 hours
        completionPercentage = 50;
        break;
      
      case MaturationStage.HATCHING:
        estimatedCompletionMs = now + (12 * 60 * 60 * 1000); // 12 hours
        completionPercentage = 75;
        break;
      
      case MaturationStage.ACTIVE:
        estimatedCompletionMs = now;
        completionPercentage = 100;
        break;
      
      default:
        return {
          success: false,
          errors: [{
            field: 'newStage',
            message: 'Invalid maturation stage',
            code: ValidationErrorCode.INVALID_VALUE
          }]
        };
    }
    
    // Update maturation path
    const updatedPath: IMaturationPath = {
      ...currentPath,
      currentStage: newStage,
      stageEnteredMs: now,
      estimatedCompletionMs,
      completionPercentage
    };
    
    return {
      success: true,
      data: updatedPath
    };
  }
  
  /**
   * Creates a token distribution based on the specified strategy
   * @param params Token distribution parameters
   * @returns Result containing the token distribution or validation errors
   */
  public createTokenDistribution(params: Omit<ITokenDistribution, 'tokens'>): IResult<ITokenDistribution> {
    const validationErrors: IValidationError[] = [];
    
    // Validate batch ID
    if (!params.batchId) {
      validationErrors.push({
        field: 'batchId',
        message: 'Batch ID is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // Validate distribution strategy
    if (params.strategy === undefined) {
      validationErrors.push({
        field: 'strategy',
        message: 'Distribution strategy is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // For weighted distribution, validate weights
    if (params.strategy === DistributionStrategy.WEIGHTED && 
        (!params.recipientWeights || params.recipientWeights.size === 0)) {
      validationErrors.push({
        field: 'recipientWeights',
        message: 'Recipient weights are required for weighted distribution',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Create token distribution
    const distribution: ITokenDistribution = {
      ...params,
      tokens: [] // Tokens will be added during actual distribution process
    };
    
    return {
      success: true,
      data: distribution
    };
  }
  
  // Private helper methods
  
  /**
   * Validates egg generation parameters
   * @param params Egg generation parameters to validate
   * @returns Array of validation errors
   */
  private validateEggGeneration(params: IEggGeneration): IValidationError[] {
    const errors: IValidationError[] = [];
    
    // Check batch reference
    if (!params.batchReference) {
      errors.push({
        field: 'batchReference',
        message: 'Batch reference is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    // Check denomination
    if (!this.VALID_DENOMINATIONS.includes(params.denomination as number)) {
      errors.push({
        field: 'denomination',
        message: `Denomination must be one of: ${this.VALID_DENOMINATIONS.join(', ')}`,
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    // Check count
    if (params.count <= 0) {
      errors.push({
        field: 'count',
        message: 'Count must be greater than 0',
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    // Check generator IDs
    if (!params.generatorIds || params.generatorIds.length < this.MIN_GENERATORS) {
      errors.push({
        field: 'generatorIds',
        message: `At least ${this.MIN_GENERATORS} generator IDs are required`,
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    if (params.generatorIds && params.generatorIds.length > this.MAX_GENERATORS) {
      errors.push({
        field: 'generatorIds',
        message: `Maximum ${this.MAX_GENERATORS} generator IDs are allowed`,
        code: ValidationErrorCode.INVALID_VALUE
      });
    }
    
    // Check entropy commitment
    if (!params.entropyCommitment || params.entropyCommitment.length === 0) {
      errors.push({
        field: 'entropyCommitment',
        message: 'Entropy commitment is required',
        code: ValidationErrorCode.MISSING_REQUIRED
      });
    }
    
    return errors;
  }
  
  /**
   * Generates a dormancy seal for an egg using SHA256 hash stacking
   * @param eggId Egg ID
   * @param entropyCommitment Entropy commitment
   * @returns Dormancy seal as Uint8Array
   */
  private generateDormancySeal(eggId: string, entropyCommitment: Uint8Array): Uint8Array {
    // Use SHA256 hash stacking instead of HMAC
    return HashUtil.createCommitment(eggId, entropyCommitment);
  }
  
  /**
   * Calculates the potency level based on activity proof
   * @param activityProof Activity proof
   * @returns Potency level between 1-100
   */
  private calculatePotencyLevel(activityProof: Uint8Array): number {
    // Simple hash-based calculation for now
    const hash = HashUtil.sha256(activityProof);
    const firstByte = hash[0];
    
    // Map first byte (0-255) to potency level (1-100)
    return Math.max(this.MIN_POTENCY_LEVEL, 
      Math.min(this.MAX_POTENCY_LEVEL, 
        Math.floor(firstByte / 255 * this.MAX_POTENCY_LEVEL) + 1));
  }
  
  /**
   * Generates a compatibility proof between egg and sperm components using SHA256 hash stacking
   * @param eggComponent Egg component
   * @param spermComponent Sperm component
   * @returns Compatibility proof as Uint8Array
   */
  private generateCompatibilityProof(
    eggComponent: IEggComponent,
    spermComponent: ISpermComponent
  ): Uint8Array {
    // Use SHA256 hash stacking instead of HMAC
    return HashUtil.createCommitment(
      eggComponent.componentId,
      spermComponent.componentId,
      eggComponent.issuerId,
      spermComponent.generatorId
    );
  }
} 