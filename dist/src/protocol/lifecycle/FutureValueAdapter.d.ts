/**
 * JuiceTokens Protocol - Future Value and Promise Protocol Adapter
 *
 * This adapter provides functionality for:
 * - Creating, validating, and tracking promises representing future value
 * - Managing escrow conditions for token locking
 * - Handling communal pooling of tokens
 */
import { IResult } from './types';
export declare enum RequirementType {
    ATTESTATION = 0,
    EVIDENCE = 1,
    TIMELOCK = 2,
    CONDITIONAL = 3
}
export declare enum FulfillmentState {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    PARTIALLY_FULFILLED = 2,
    FULFILLED = 3,
    DISPUTED = 4,
    CANCELED = 5
}
export declare enum ConditionType {
    TIME_BASED = 0,
    EVENT_BASED = 1,
    MULTI_SIG = 2,
    ORACLE_BASED = 3
}
export declare enum EscrowStatus {
    ACTIVE = 0,
    FULFILLED = 1,
    REFUNDED = 2,
    DISPUTED = 3,
    EXPIRED = 4
}
export declare enum RiskStrategy {
    EQUAL = 0,
    PROPORTIONAL = 1,
    CUSTOM = 2
}
export declare enum FulfillmentStatus {
    PENDING = 0,
    VERIFIED = 1,
    REJECTED = 2,
    DISPUTED = 3
}
export interface IVerificationRequirement {
    requirementId: string;
    description: string;
    requirementType: RequirementType;
    requirementParameters: Uint8Array;
    optional: boolean;
    weight: number;
}
export interface IPromiseCreation {
    promiseId: string;
    creatorId: string;
    beneficiaryId: string;
    promiseDescription: string;
    valueAmount: number;
    dueDateMs: number;
    verificationRequirements: IVerificationRequirement[];
    creatorSignature: Uint8Array;
}
export interface IRequirementStatus {
    requirementId: string;
    completionPercentage: number;
    statusDescription: string;
    evidenceReferences: string[];
    lastUpdateMs: number;
}
export interface IFulfillmentTracking {
    promiseId: string;
    requirementStatuses: IRequirementStatus[];
    overallCompletionPercentage: number;
    lastUpdateMs: number;
    state: FulfillmentState;
}
export interface IPromiseMetadata {
    promiseId: string;
    category: string;
    context: string;
    tags: string[];
    public: boolean;
    customAttributes: Record<string, string>;
}
export interface IEscrowCondition {
    conditionId: string;
    description: string;
    conditionType: ConditionType;
    conditionParameters: Uint8Array;
    negated: boolean;
}
export interface IMultiSignatureRequirement {
    requirementId: string;
    requiredSigners: string[];
    threshold: number;
    timeoutHours: number;
    allowDelegation: boolean;
}
export interface ITimeBasedTrigger {
    triggerId: string;
    triggerTimeMs: number;
    releaseOnTrigger: boolean;
    recurring: boolean;
    recurrenceIntervalHours: number;
    maxRecurrences: number;
}
export interface IEscrowStatusData {
    escrowId: string;
    escrowedTokens: string[];
    depositorId: string;
    recipientId: string;
    conditions: IEscrowCondition[];
    status: EscrowStatus;
    creationMs: number;
    lastUpdateMs: number;
}
export interface IGroupCommitment {
    commitmentId: string;
    groupId: string;
    commitmentPurpose: string;
    participantIds: string[];
    contributions: Record<string, number>;
    totalValue: number;
    creationMs: number;
    fulfillmentDeadlineMs: number;
}
export interface IRiskDistribution {
    distributionId: string;
    parentCommitmentId: string;
    riskWeights: Record<string, number>;
    strategy: RiskStrategy;
    distributionRules: Uint8Array;
}
export interface IVerificationVote {
    verifierId: string;
    approved: boolean;
    comment: string;
    voteTimestampMs: number;
    signature: Uint8Array;
}
export interface ICollectiveFulfillment {
    fulfillmentId: string;
    parentCommitmentId: string;
    verifierIds: string[];
    verificationThreshold: number;
    votes: IVerificationVote[];
    status: FulfillmentStatus;
    lastUpdateMs: number;
}
export interface IPoolMetadata {
    poolId: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    public: boolean;
    customAttributes: Record<string, string>;
}
/**
 * Adapter for managing promises representing future value
 */
export declare class FutureValueAdapter {
    /**
     * Creates a new promise representing future value
     *
     * @param params Promise creation parameters
     * @returns Result containing the created promise
     */
    createPromise(params: Omit<IPromiseCreation, 'promiseId' | 'creatorSignature'>): Promise<IResult<IPromiseCreation>>;
    /**
     * Validates a promise creation request
     *
     * @param promise Promise to validate
     * @returns Validation result
     */
    validatePromise(promise: IPromiseCreation): IResult<boolean>;
    /**
     * Updates the fulfillment status of a promise
     *
     * @param promiseId ID of the promise to update
     * @param requirementId ID of the requirement to update
     * @param completionPercentage New completion percentage
     * @param statusDescription Description of the current status
     * @param evidenceReferences References to evidence supporting the update
     * @returns Updated fulfillment tracking data
     */
    updateFulfillment(promiseId: string, requirementId: string, completionPercentage: number, statusDescription: string, evidenceReferences?: string[]): Promise<IResult<IFulfillmentTracking>>;
    /**
     * Calculates the overall completion percentage based on requirement statuses
     *
     * @param requirements Requirements with their weights
     * @param statuses Current status of each requirement
     * @returns Overall completion percentage
     */
    calculateOverallCompletion(requirements: IVerificationRequirement[], statuses: IRequirementStatus[]): number;
    /**
     * Handles a broken promise, triggering recovery mechanisms
     *
     * @param promiseId ID of the broken promise
     * @param reason Reason for classifying the promise as broken
     * @returns Result of the recovery operation
     */
    handleBrokenPromise(promiseId: string, reason: string): Promise<IResult<boolean>>;
}
/**
 * Adapter for managing escrow mechanisms for future value
 */
export declare class EscrowAdapter {
    /**
     * Creates a new escrow for tokens
     *
     * @param depositorId ID of the user depositing tokens
     * @param recipientId ID of the intended recipient
     * @param tokenIds IDs of tokens to escrow
     * @param conditions Conditions for releasing the tokens
     * @returns Escrow status data
     */
    createEscrow(depositorId: string, recipientId: string, tokenIds: string[], conditions: IEscrowCondition[]): Promise<IResult<IEscrowStatusData>>;
    /**
     * Checks if an escrow's conditions have been met
     *
     * @param escrowId ID of the escrow to check
     * @returns Whether all conditions are met
     */
    checkEscrowConditions(escrowId: string): Promise<IResult<boolean>>;
    /**
     * Releases escrowed tokens to the recipient
     *
     * @param escrowId ID of the escrow to release
     * @returns Success indicator
     */
    releaseEscrow(escrowId: string): Promise<IResult<boolean>>;
    /**
     * Refunds escrowed tokens to the depositor
     *
     * @param escrowId ID of the escrow to refund
     * @param reason Reason for the refund
     * @returns Success indicator
     */
    refundEscrow(escrowId: string, reason: string): Promise<IResult<boolean>>;
}
/**
 * Adapter for managing communal pooling of tokens
 */
export declare class CommunalPoolAdapter {
    /**
     * Creates a new group commitment for a communal pool
     *
     * @param groupId ID of the group creating the commitment
     * @param purpose Purpose of the commitment
     * @param participants IDs of participants
     * @param contributions Contribution amounts by participant ID
     * @param fulfillmentDeadlineMs Deadline for fulfilling the commitment
     * @returns Group commitment data
     */
    createGroupCommitment(groupId: string, purpose: string, participants: string[], contributions: Record<string, number>, fulfillmentDeadlineMs: number): Promise<IResult<IGroupCommitment>>;
    /**
     * Creates a risk distribution strategy for a group commitment
     *
     * @param commitmentId ID of the parent commitment
     * @param strategy Risk distribution strategy
     * @param customWeights Custom risk weights by participant ID (required for CUSTOM strategy)
     * @returns Risk distribution data
     */
    createRiskDistribution(commitmentId: string, strategy: RiskStrategy, customWeights?: Record<string, number>): Promise<IResult<IRiskDistribution>>;
    /**
     * Creates a collective fulfillment verification for a commitment
     *
     * @param commitmentId ID of the commitment to verify
     * @param verifiers IDs of users who can verify fulfillment
     * @param threshold Number of verifiers required for approval (M-of-N)
     * @returns Collective fulfillment data
     */
    createCollectiveFulfillment(commitmentId: string, verifiers: string[], threshold: number): Promise<IResult<ICollectiveFulfillment>>;
    /**
     * Records a verification vote from a verifier
     *
     * @param fulfillmentId ID of the collective fulfillment
     * @param verifierId ID of the verifier
     * @param approved Whether the verifier approves the fulfillment
     * @param comment Optional comment explaining the vote
     * @returns Updated collective fulfillment data
     */
    recordVerificationVote(fulfillmentId: string, verifierId: string, approved: boolean, comment?: string): Promise<IResult<ICollectiveFulfillment>>;
}
