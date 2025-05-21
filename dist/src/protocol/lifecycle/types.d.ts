export interface TokenId {
    id: string;
    version: number;
}
export declare enum DenominationValue {
    DENOMINATION_UNSPECIFIED = 0,
    DENOMINATION_1 = 1,
    DENOMINATION_2 = 2,
    DENOMINATION_5 = 5,
    DENOMINATION_10 = 10,
    DENOMINATION_20 = 20,
    DENOMINATION_50 = 50,
    DENOMINATION_100 = 100,
    DENOMINATION_200 = 200,
    DENOMINATION_500 = 500
}
export declare enum TokenState {
    ACTIVE = 0,
    FROZEN = 1,
    EXPIRED = 2,
    REVOKED = 3,
    PENDING = 4,
    SPLIT = 5,
    MERGED = 6
}
export interface IEggGeneration {
    eggId: string;
    batchReference: string;
    denomination: DenominationValue;
    count: number;
    generatorIds: string[];
    entropyCommitment: Uint8Array;
    generationTimestampMs: number;
}
export declare enum HatchingConditionType {
    ATTESTATION_THRESHOLD = 0,
    ACTIVITY_COMPLETION = 1,
    TEMPORAL_TRIGGER = 2,
    MULTI_PARTY_AGREEMENT = 3
}
export interface IHatchingCondition {
    eggId: string;
    conditionType: HatchingConditionType;
    conditionParameters: Uint8Array;
    expiryMs: number;
}
export declare enum DistributionStrategy {
    EQUAL = 0,
    WEIGHTED = 1,
    MERIT_BASED = 2,
    NEED_BASED = 3
}
export interface ITokenDistribution {
    batchId: string;
    strategy: DistributionStrategy;
    recipientWeights: Map<string, number>;
    tokens: any[];
}
export interface IGenesisPool {
    poolId: string;
    memberIds: string[];
    attestationStrengths: Map<string, number>;
    combinedStrength: number;
    formationTimestampMs: number;
}
export declare enum MaturationStage {
    DORMANT = 0,
    FERTILIZED = 1,
    INCUBATING = 2,
    HATCHING = 3,
    ACTIVE = 4
}
export interface IDormantEgg {
    eggId: string;
    denomination: DenominationValue;
    ownerId: string;
    dormancySeal: Uint8Array;
    hatchingCondition: IHatchingCondition;
    creationTimestampMs: number;
    dormancyExpiresMs: number;
}
export interface IFertilizationTrigger {
    eggId: string;
    activatorId: string;
    activityReference: string;
    proofOfActivity: Uint8Array;
    triggerTimestampMs: number;
}
export interface IMaturationPath {
    eggId: string;
    currentStage: MaturationStage;
    stageEnteredMs: number;
    estimatedCompletionMs: number;
    completionPercentage: number;
}
export interface IEggComponent {
    componentId: string;
    denomination: DenominationValue;
    issuerId: string;
    issuerCommitment: Uint8Array;
    creationTimestampMs: number;
    authorizedFertilizers: string[];
}
export interface ISpermComponent {
    componentId: string;
    activityType: string;
    potencyLevel: number;
    generatorId: string;
    activityProof: Uint8Array;
    generationTimestampMs: number;
    viabilityExpiresMs: number;
}
export interface IFertilizationEvent {
    fertilizationId: string;
    eggComponentId: string;
    spermComponentId: string;
    compatibilityProof: Uint8Array;
    fertilizationTimestampMs: number;
    maturationPeriodHours: number;
    witnesses: string[];
}
export interface IExpiryNotification {
    expiringTokens: TokenId[];
    expiryTimestampMs: number;
    notificationTimestampMs: number;
    daysRemaining: number;
    requiresAction: boolean;
}
export interface IRenewalRequest {
    tokensToRenew: TokenId[];
    requesterId: string;
    requestTimestampMs: number;
    requestFacilitation: boolean;
    message?: string;
}
export interface IRenewalReward {
    expiredValueProcessed: number;
    baseFacilitationReward: number;
    economicActivityMultiplier: number;
    newTokens: TokenId[];
    trustBuilding: number;
    autonomySupport: number;
    imaginationFunding: number;
    competenceReward: number;
    identityFormation: number;
    connectionBridges: number;
    generativityProjects: number;
}
export interface IRenewalFacilitation {
    facilitationId: string;
    facilitatorId: string;
    requestorId: string;
    facilitatedTokens: TokenId[];
    facilitationTimestampMs: number;
    reward: IRenewalReward;
}
export interface ITelomeerRenewalTransformation {
    oldTokenId: TokenId;
    newTokenId: TokenId;
    ownerId: string;
    renewalSignature: Uint8Array;
    renewalTimestampMs: number;
    newExpiryMs: number;
}
export interface IValidationError {
    field: string;
    message: string;
    code: ValidationErrorCode;
}
export declare enum ValidationErrorCode {
    INVALID_VALUE = "INVALID_VALUE",
    MISSING_REQUIRED = "MISSING_REQUIRED",
    INVALID_FORMAT = "INVALID_FORMAT",
    EXPIRED = "EXPIRED",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    INVALID_STATE = "INVALID_STATE"
}
export interface IResult<T> {
    success: boolean;
    data?: T;
    errors?: IValidationError[];
}
