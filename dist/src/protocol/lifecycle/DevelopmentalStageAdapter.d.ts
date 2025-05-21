import { IResult } from './types';
import { DevelopmentalStageLevel, IUserDevelopmentalStageStatus, IDevelopmentalStageActivity, IActivityCompletion, IStageProgressionRecommendation, IDevelopmentalStageChallenge, IStageMilestone } from './developmental_stage_types';
/**
 * DevelopmentalStageAdapter handles all aspects of user progression through developmental stages
 * including tracking, transitions, metrics calculation, and activity recording.
 */
export declare class DevelopmentalStageAdapter {
    private readonly MIN_PROGRESS_FOR_TRANSITION;
    private readonly MIN_MASTERY_FOR_TRANSITION;
    private readonly SECONDARY_STAGE_CONTRIBUTION;
    private readonly PRIMARY_STAGE_CONTRIBUTION;
    private readonly BASE_EXPERIENCE_PER_LEVEL;
    /**
     * Initializes a new user developmental stage status
     * @param userId The user's unique identifier
     * @returns A new user developmental stage status
     */
    initializeUserStage(userId: string): IResult<IUserDevelopmentalStageStatus>;
    /**
     * Updates the user's developmental stage status based on a completed activity
     * @param userStatus Current user developmental stage status
     * @param activity The activity that was completed
     * @param evidence Optional evidence of completion
     * @param validatorIds Optional list of validator IDs
     * @returns Updated user developmental stage status
     */
    recordActivityCompletion(userStatus: IUserDevelopmentalStageStatus, activity: IDevelopmentalStageActivity, evidence?: Uint8Array, validatorIds?: string[]): IResult<{
        userStatus: IUserDevelopmentalStageStatus;
        activityCompletion: IActivityCompletion;
    }>;
    /**
     * Transitions a user to a new developmental stage
     * @param userStatus Current user developmental stage status
     * @param newStage The new stage to transition to
     * @param transitionTrigger Optional trigger description for the transition
     * @param witnessIds Optional list of witness IDs for the transition
     * @returns Updated user developmental stage status
     */
    transitionStage(userStatus: IUserDevelopmentalStageStatus, newStage: DevelopmentalStageLevel, transitionTrigger?: string, witnessIds?: string[]): IResult<IUserDevelopmentalStageStatus>;
    /**
     * Generates recommendations for stage progression based on user's current status
     * @param userStatus Current user developmental stage status
     * @param availableActivities Available activities to recommend
     * @param userConnections Available user connections to recommend
     * @returns Stage progression recommendations
     */
    generateProgressionRecommendations(userStatus: IUserDevelopmentalStageStatus, availableActivities: IDevelopmentalStageActivity[], userConnections?: string[]): IResult<IStageProgressionRecommendation>;
    /**
     * Records the completion of a milestone for a user
     * @param userStatus Current user developmental stage status
     * @param milestone The milestone that was completed
     * @param achievementProof Optional proof of achievement
     * @returns Updated user developmental stage status
     */
    recordMilestoneCompletion(userStatus: IUserDevelopmentalStageStatus, milestone: IStageMilestone, achievementProof?: Uint8Array): IResult<IUserDevelopmentalStageStatus>;
    /**
     * Validates a challenge for a user's current developmental stage
     * @param userStatus Current user developmental stage status
     * @param challenge The challenge to validate
     * @returns Whether the challenge is valid for the user
     */
    validateChallenge(userStatus: IUserDevelopmentalStageStatus, challenge: IDevelopmentalStageChallenge): IResult<boolean>;
    /**
     * Calculates the progress contribution of an activity based on user status
     * @param activity The activity to calculate for
     * @param userStatus The user's developmental stage status
     * @returns Progress contribution value (0.0-1.0)
     */
    private calculateProgressContribution;
    /**
     * Calculates the overall progress of a developmental stage based on metrics
     * @param stageMetric The stage metrics to calculate progress for
     * @returns Progress value (0.0-1.0)
     */
    private calculateStageProgress;
    /**
     * Calculates the mastery score for a stage based on metrics
     * @param stageMetric The stage metrics to calculate mastery for
     * @returns Mastery score (0.0-1.0)
     */
    private calculateMasteryScore;
    /**
     * Generates personalized guidance based on current stage and progress
     * @param stage Current developmental stage
     * @param progress Current progress within the stage
     * @returns Personalized guidance message
     */
    private generatePersonalizedGuidance;
    /**
     * Gets the human-readable name of a developmental stage
     * @param stage The developmental stage
     * @returns Human-readable stage name
     */
    private getStageName;
    /**
     * Generates a signature for a stage transition
     * @param userId User ID transitioning
     * @param fromStage Previous stage
     * @param toStage New stage
     * @returns Signature as Uint8Array
     */
    private generateTransitionSignature;
}
