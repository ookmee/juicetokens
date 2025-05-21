"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentalStageAdapter = void 0;
const uuid_1 = require("uuid");
const crypto_1 = require("./utils/crypto");
const types_1 = require("./types");
const developmental_stage_types_1 = require("./developmental_stage_types");
/**
 * DevelopmentalStageAdapter handles all aspects of user progression through developmental stages
 * including tracking, transitions, metrics calculation, and activity recording.
 */
class DevelopmentalStageAdapter {
    constructor() {
        this.MIN_PROGRESS_FOR_TRANSITION = 0.8; // Minimum progress required before transitioning
        this.MIN_MASTERY_FOR_TRANSITION = 0.7; // Minimum mastery required before transitioning
        this.SECONDARY_STAGE_CONTRIBUTION = 0.3; // 30% contribution from secondary stage activities
        this.PRIMARY_STAGE_CONTRIBUTION = 0.7; // 70% contribution from primary stage activities
        this.BASE_EXPERIENCE_PER_LEVEL = 1000; // Base experience points required per level
    }
    /**
     * Initializes a new user developmental stage status
     * @param userId The user's unique identifier
     * @returns A new user developmental stage status
     */
    initializeUserStage(userId) {
        if (!userId) {
            return {
                success: false,
                errors: [{
                        field: 'userId',
                        message: 'User ID is required',
                        code: types_1.ValidationErrorCode.MISSING_REQUIRED
                    }]
            };
        }
        const now = Date.now();
        const trustStageMetric = {
            stage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            progress: 0,
            experiencePoints: 0,
            activitiesCompleted: 0,
            timeInStageMs: 0,
            completedMilestones: [],
            masteryScore: 0
        };
        const stageMetrics = new Map();
        stageMetrics.set(developmental_stage_types_1.DevelopmentalStageLevel.TRUST.toString(), trustStageMetric);
        const userStatus = {
            userId,
            stageMetrics,
            currentPrimaryStage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            currentSecondaryStage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            lastTransitionMs: now,
            stageHistory: []
        };
        return {
            success: true,
            data: userStatus
        };
    }
    /**
     * Updates the user's developmental stage status based on a completed activity
     * @param userStatus Current user developmental stage status
     * @param activity The activity that was completed
     * @param evidence Optional evidence of completion
     * @param validatorIds Optional list of validator IDs
     * @returns Updated user developmental stage status
     */
    recordActivityCompletion(userStatus, activity, evidence, validatorIds = []) {
        const errors = [];
        // Validate inputs
        if (!userStatus || !userStatus.userId) {
            errors.push({
                field: 'userStatus',
                message: 'Valid user status is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (!activity || !activity.activityId) {
            errors.push({
                field: 'activity',
                message: 'Valid activity is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }
        const now = Date.now();
        // Check if this is a repeatable activity
        if (!activity.repeatable) {
            // Check if this activity has already been completed
            const existingCompletions = userStatus.stageMetrics.get(activity.primaryStage.toString())?.activitiesCompleted || 0;
            if (existingCompletions > 0) {
                // In a real implementation, we'd check a detailed activity history to verify this specific activity
                // For simplicity, we're assuming the activity count represents unique activities
                return {
                    success: false,
                    errors: [{
                            field: 'activity',
                            message: 'Non-repeatable activity has already been completed',
                            code: types_1.ValidationErrorCode.INVALID_STATE
                        }]
                };
            }
        }
        // Create activity completion record
        const completion = {
            completionId: (0, uuid_1.v4)(),
            activityId: activity.activityId,
            userId: userStatus.userId,
            completionTimeMs: now,
            awardedExperience: activity.experiencePoints,
            progressContribution: this.calculateProgressContribution(activity, userStatus),
            evidence: evidence || new Uint8Array(),
            validatorIds
        };
        // Update user's primary stage metrics
        let primaryStageMetric = userStatus.stageMetrics.get(activity.primaryStage.toString());
        if (!primaryStageMetric) {
            // Create new stage metric if it doesn't exist yet
            primaryStageMetric = {
                stage: activity.primaryStage,
                progress: 0,
                experiencePoints: 0,
                activitiesCompleted: 0,
                timeInStageMs: 0,
                completedMilestones: [],
                masteryScore: 0
            };
            userStatus.stageMetrics.set(activity.primaryStage.toString(), primaryStageMetric);
        }
        // Update primary stage metrics
        primaryStageMetric.experiencePoints += activity.experiencePoints * this.PRIMARY_STAGE_CONTRIBUTION;
        primaryStageMetric.activitiesCompleted += 1;
        primaryStageMetric.progress = this.calculateStageProgress(primaryStageMetric);
        primaryStageMetric.masteryScore = this.calculateMasteryScore(primaryStageMetric);
        // Update user's secondary stage metrics if applicable
        if (activity.secondaryStages && activity.secondaryStages.length > 0) {
            for (const secondaryStage of activity.secondaryStages) {
                let secondaryStageMetric = userStatus.stageMetrics.get(secondaryStage.toString());
                if (!secondaryStageMetric) {
                    // Create new stage metric if it doesn't exist yet
                    secondaryStageMetric = {
                        stage: secondaryStage,
                        progress: 0,
                        experiencePoints: 0,
                        activitiesCompleted: 0,
                        timeInStageMs: 0,
                        completedMilestones: [],
                        masteryScore: 0
                    };
                    userStatus.stageMetrics.set(secondaryStage.toString(), secondaryStageMetric);
                }
                // Update secondary stage metrics
                const secondaryContribution = this.SECONDARY_STAGE_CONTRIBUTION / activity.secondaryStages.length;
                secondaryStageMetric.experiencePoints += activity.experiencePoints * secondaryContribution;
                secondaryStageMetric.progress = this.calculateStageProgress(secondaryStageMetric);
                secondaryStageMetric.masteryScore = this.calculateMasteryScore(secondaryStageMetric);
            }
        }
        // Check if user is ready to transition to next stage
        const currentPrimaryMetric = userStatus.stageMetrics.get(userStatus.currentPrimaryStage.toString());
        if (currentPrimaryMetric &&
            currentPrimaryMetric.progress >= this.MIN_PROGRESS_FOR_TRANSITION &&
            currentPrimaryMetric.masteryScore >= this.MIN_MASTERY_FOR_TRANSITION) {
            // User is ready to transition to the next stage if they're not already at the highest stage
            if (userStatus.currentPrimaryStage < developmental_stage_types_1.DevelopmentalStageLevel.GENERATIVITY) {
                const nextStage = userStatus.currentPrimaryStage + 1;
                const transitionResult = this.transitionStage(userStatus, nextStage);
                if (transitionResult.success && transitionResult.data) {
                    userStatus = transitionResult.data;
                }
            }
        }
        return {
            success: true,
            data: {
                userStatus,
                activityCompletion: completion
            }
        };
    }
    /**
     * Transitions a user to a new developmental stage
     * @param userStatus Current user developmental stage status
     * @param newStage The new stage to transition to
     * @param transitionTrigger Optional trigger description for the transition
     * @param witnessIds Optional list of witness IDs for the transition
     * @returns Updated user developmental stage status
     */
    transitionStage(userStatus, newStage, transitionTrigger = 'natural_progression', witnessIds = []) {
        const errors = [];
        // Validate inputs
        if (!userStatus || !userStatus.userId) {
            errors.push({
                field: 'userStatus',
                message: 'Valid user status is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (newStage === undefined || newStage < 0 || newStage > developmental_stage_types_1.DevelopmentalStageLevel.GENERATIVITY) {
            errors.push({
                field: 'newStage',
                message: 'Valid new stage is required',
                code: types_1.ValidationErrorCode.INVALID_VALUE
            });
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }
        // Validate stage progression is sequential (can't skip stages)
        if (newStage > userStatus.currentPrimaryStage + 1) {
            return {
                success: false,
                errors: [{
                        field: 'newStage',
                        message: 'Cannot skip developmental stages',
                        code: types_1.ValidationErrorCode.INVALID_VALUE
                    }]
            };
        }
        // Get current stage mastery
        const currentStageMetric = userStatus.stageMetrics.get(userStatus.currentPrimaryStage.toString());
        if (!currentStageMetric) {
            return {
                success: false,
                errors: [{
                        field: 'userStatus',
                        message: 'Current stage metrics not found',
                        code: types_1.ValidationErrorCode.INVALID_STATE
                    }]
            };
        }
        // Create transition record
        const now = Date.now();
        const transition = {
            fromStage: userStatus.currentPrimaryStage,
            toStage: newStage,
            transitionTimeMs: now,
            transitionTrigger,
            fromStageMastery: currentStageMetric.masteryScore,
            transitionSignature: this.generateTransitionSignature(userStatus.userId, userStatus.currentPrimaryStage, newStage),
            witnessIds
        };
        // Update user status
        const updatedStatus = {
            ...userStatus,
            currentPrimaryStage: newStage,
            currentSecondaryStage: userStatus.currentPrimaryStage, // Previous primary becomes secondary
            lastTransitionMs: now,
            stageHistory: [...userStatus.stageHistory, transition]
        };
        // Initialize metrics for new stage if not already present
        if (!updatedStatus.stageMetrics.has(newStage.toString())) {
            updatedStatus.stageMetrics.set(newStage.toString(), {
                stage: newStage,
                progress: 0,
                experiencePoints: 0,
                activitiesCompleted: 0,
                timeInStageMs: 0,
                completedMilestones: [],
                masteryScore: 0
            });
        }
        return {
            success: true,
            data: updatedStatus
        };
    }
    /**
     * Generates recommendations for stage progression based on user's current status
     * @param userStatus Current user developmental stage status
     * @param availableActivities Available activities to recommend
     * @param userConnections Available user connections to recommend
     * @returns Stage progression recommendations
     */
    generateProgressionRecommendations(userStatus, availableActivities, userConnections = []) {
        const errors = [];
        // Validate inputs
        if (!userStatus || !userStatus.userId) {
            errors.push({
                field: 'userStatus',
                message: 'Valid user status is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (!availableActivities || availableActivities.length === 0) {
            errors.push({
                field: 'availableActivities',
                message: 'Available activities are required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }
        const currentStage = userStatus.currentPrimaryStage;
        const currentStageMetric = userStatus.stageMetrics.get(currentStage.toString());
        if (!currentStageMetric) {
            return {
                success: false,
                errors: [{
                        field: 'userStatus',
                        message: 'Current stage metrics not found',
                        code: types_1.ValidationErrorCode.INVALID_STATE
                    }]
            };
        }
        // Find activities that match the user's current primary stage
        const relevantActivities = availableActivities.filter(activity => activity.primaryStage === currentStage ||
            activity.secondaryStages.includes(currentStage));
        // Sort activities by relevance (primary stage activities first, then by experience points)
        relevantActivities.sort((a, b) => {
            if (a.primaryStage === currentStage && b.primaryStage !== currentStage)
                return -1;
            if (a.primaryStage !== currentStage && b.primaryStage === currentStage)
                return 1;
            return b.experiencePoints - a.experiencePoints;
        });
        // Select top 5 activities to recommend
        const recommendedActivities = relevantActivities.slice(0, 5).map(a => a.activityId);
        // Simple recommendation for connections (in a real system, this would be more sophisticated)
        const recommendedConnections = userConnections.slice(0, 3);
        // Calculate estimated time to next stage
        const currentProgress = currentStageMetric.progress;
        const progressRemaining = this.MIN_PROGRESS_FOR_TRANSITION - currentProgress;
        // Assuming average progress per activity is 0.05 and average time per activity is 2 hours
        const avgProgressPerActivity = 0.05;
        const avgHoursPerActivity = 2;
        const estimatedActivitiesNeeded = Math.ceil(progressRemaining / avgProgressPerActivity);
        const estimatedHours = estimatedActivitiesNeeded * avgHoursPerActivity;
        // Create recommendation
        const recommendation = {
            userId: userStatus.userId,
            currentStage,
            currentProgress,
            recommendedActivities,
            recommendedConnections,
            estimatedTimeToNextStageHours: estimatedHours,
            personalizedGuidance: this.generatePersonalizedGuidance(currentStage, currentProgress)
        };
        return {
            success: true,
            data: recommendation
        };
    }
    /**
     * Records the completion of a milestone for a user
     * @param userStatus Current user developmental stage status
     * @param milestone The milestone that was completed
     * @param achievementProof Optional proof of achievement
     * @returns Updated user developmental stage status
     */
    recordMilestoneCompletion(userStatus, milestone, achievementProof) {
        const errors = [];
        // Validate inputs
        if (!userStatus || !userStatus.userId) {
            errors.push({
                field: 'userStatus',
                message: 'Valid user status is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (!milestone || !milestone.milestoneId) {
            errors.push({
                field: 'milestone',
                message: 'Valid milestone is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }
        // Get stage metrics
        let stageMetric = userStatus.stageMetrics.get(milestone.stage.toString());
        if (!stageMetric) {
            stageMetric = {
                stage: milestone.stage,
                progress: 0,
                experiencePoints: 0,
                activitiesCompleted: 0,
                timeInStageMs: 0,
                completedMilestones: [],
                masteryScore: 0
            };
            userStatus.stageMetrics.set(milestone.stage.toString(), stageMetric);
        }
        // Check if milestone has already been completed
        if (stageMetric.completedMilestones.includes(milestone.milestoneId)) {
            return {
                success: false,
                errors: [{
                        field: 'milestone',
                        message: 'Milestone has already been completed',
                        code: types_1.ValidationErrorCode.INVALID_STATE
                    }]
            };
        }
        // Check if user meets the progress threshold for this milestone
        if (stageMetric.progress < milestone.stageProgressThreshold) {
            return {
                success: false,
                errors: [{
                        field: 'userStatus',
                        message: 'User does not meet the progress threshold for this milestone',
                        code: types_1.ValidationErrorCode.INVALID_STATE
                    }]
            };
        }
        // Check prerequisites if any
        if (milestone.prerequisiteMilestones && milestone.prerequisiteMilestones.length > 0) {
            for (const prereq of milestone.prerequisiteMilestones) {
                if (!stageMetric.completedMilestones.includes(prereq)) {
                    return {
                        success: false,
                        errors: [{
                                field: 'milestone',
                                message: `Prerequisite milestone ${prereq} has not been completed`,
                                code: types_1.ValidationErrorCode.INVALID_STATE
                            }]
                    };
                }
            }
        }
        // Record milestone completion
        stageMetric.completedMilestones.push(milestone.milestoneId);
        stageMetric.experiencePoints += milestone.experienceReward;
        stageMetric.masteryScore = this.calculateMasteryScore(stageMetric);
        // Handle stage transition if this milestone marks a transition
        if (milestone.isStageTransition &&
            milestone.stage === userStatus.currentPrimaryStage &&
            userStatus.currentPrimaryStage < developmental_stage_types_1.DevelopmentalStageLevel.GENERATIVITY) {
            const nextStage = userStatus.currentPrimaryStage + 1;
            const transitionResult = this.transitionStage(userStatus, nextStage, `milestone_completion:${milestone.milestoneId}`);
            if (transitionResult.success && transitionResult.data) {
                return transitionResult;
            }
        }
        return {
            success: true,
            data: userStatus
        };
    }
    /**
     * Validates a challenge for a user's current developmental stage
     * @param userStatus Current user developmental stage status
     * @param challenge The challenge to validate
     * @returns Whether the challenge is valid for the user
     */
    validateChallenge(userStatus, challenge) {
        const errors = [];
        // Validate inputs
        if (!userStatus || !userStatus.userId) {
            errors.push({
                field: 'userStatus',
                message: 'Valid user status is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (!challenge || !challenge.challengeId) {
            errors.push({
                field: 'challenge',
                message: 'Valid challenge is required',
                code: types_1.ValidationErrorCode.MISSING_REQUIRED
            });
        }
        if (errors.length > 0) {
            return {
                success: false,
                errors
            };
        }
        // Check if challenge is appropriate for user's stage
        if (challenge.targetStage !== userStatus.currentPrimaryStage &&
            challenge.targetStage !== userStatus.currentSecondaryStage) {
            return {
                success: false,
                errors: [{
                        field: 'challenge',
                        message: 'Challenge is not appropriate for user\'s current stages',
                        code: types_1.ValidationErrorCode.INVALID_STATE
                    }]
            };
        }
        // In a real implementation, we would also verify prerequisites and required skills
        return {
            success: true,
            data: true
        };
    }
    /**
     * Calculates the progress contribution of an activity based on user status
     * @param activity The activity to calculate for
     * @param userStatus The user's developmental stage status
     * @returns Progress contribution value (0.0-1.0)
     */
    calculateProgressContribution(activity, userStatus) {
        // Base contribution is proportional to experience points (normalized to 0.01-0.1)
        const baseContribution = 0.01 + Math.min(0.09, (activity.experiencePoints / 1000) * 0.09);
        // Adjust contribution based on activity relevance to current stages
        let relevanceFactor = 1.0;
        if (activity.primaryStage === userStatus.currentPrimaryStage) {
            relevanceFactor = 1.5; // 50% boost for activities matching primary stage
        }
        else if (activity.primaryStage === userStatus.currentSecondaryStage) {
            relevanceFactor = 1.2; // 20% boost for activities matching secondary stage
        }
        else if (activity.secondaryStages.includes(userStatus.currentPrimaryStage)) {
            relevanceFactor = 1.1; // 10% boost if current primary stage is a secondary stage of the activity
        }
        // Calculate final contribution (capped at 0.2 to prevent rapid progression from a single activity)
        return Math.min(0.2, baseContribution * relevanceFactor);
    }
    /**
     * Calculates the overall progress of a developmental stage based on metrics
     * @param stageMetric The stage metrics to calculate progress for
     * @returns Progress value (0.0-1.0)
     */
    calculateStageProgress(stageMetric) {
        // Calculate required experience points for this stage
        const requiredExperience = this.BASE_EXPERIENCE_PER_LEVEL * (stageMetric.stage + 1);
        // Calculate progress as a percentage of required experience
        const rawProgress = stageMetric.experiencePoints / requiredExperience;
        // Ensure progress is between 0 and 1
        return Math.min(1.0, Math.max(0.0, rawProgress));
    }
    /**
     * Calculates the mastery score for a stage based on metrics
     * @param stageMetric The stage metrics to calculate mastery for
     * @returns Mastery score (0.0-1.0)
     */
    calculateMasteryScore(stageMetric) {
        // Mastery is a weighted combination of:
        // - Progress (40%)
        // - Activities completed (30%)
        // - Milestones completed (30%)
        const progressWeight = 0.4;
        const activitiesWeight = 0.3;
        const milestonesWeight = 0.3;
        // Calculate activities component (assuming 10 activities per stage is "complete")
        const activitiesComponent = Math.min(1.0, stageMetric.activitiesCompleted / 10);
        // Calculate milestones component (assuming 5 milestones per stage is "complete")
        const milestonesComponent = Math.min(1.0, stageMetric.completedMilestones.length / 5);
        // Calculate overall mastery
        const masteryScore = (stageMetric.progress * progressWeight) +
            (activitiesComponent * activitiesWeight) +
            (milestonesComponent * milestonesWeight);
        return Math.min(1.0, Math.max(0.0, masteryScore));
    }
    /**
     * Generates personalized guidance based on current stage and progress
     * @param stage Current developmental stage
     * @param progress Current progress within the stage
     * @returns Personalized guidance message
     */
    generatePersonalizedGuidance(stage, progress) {
        // In a real implementation, this would use a more sophisticated approach
        // with personalized recommendations based on user history and preferences
        if (progress < 0.3) {
            return `You're just getting started with your ${this.getStageName(stage)} journey. Focus on completing basic activities.`;
        }
        else if (progress < 0.6) {
            return `You're making good progress in the ${this.getStageName(stage)} stage. Try some more challenging activities to advance further.`;
        }
        else if (progress < this.MIN_PROGRESS_FOR_TRANSITION) {
            return `You're getting closer to mastering the ${this.getStageName(stage)} stage. Focus on completing milestones to progress.`;
        }
        else {
            return `You're ready to transition to the next developmental stage. Complete a few more activities to solidify your mastery.`;
        }
    }
    /**
     * Gets the human-readable name of a developmental stage
     * @param stage The developmental stage
     * @returns Human-readable stage name
     */
    getStageName(stage) {
        switch (stage) {
            case developmental_stage_types_1.DevelopmentalStageLevel.TRUST:
                return 'Trust';
            case developmental_stage_types_1.DevelopmentalStageLevel.AUTONOMY:
                return 'Autonomy';
            case developmental_stage_types_1.DevelopmentalStageLevel.IMAGINATION:
                return 'Imagination';
            case developmental_stage_types_1.DevelopmentalStageLevel.COMPETENCE:
                return 'Competence';
            case developmental_stage_types_1.DevelopmentalStageLevel.IDENTITY:
                return 'Identity';
            case developmental_stage_types_1.DevelopmentalStageLevel.CONNECTION:
                return 'Connection';
            case developmental_stage_types_1.DevelopmentalStageLevel.GENERATIVITY:
                return 'Generativity';
            default:
                return 'Unknown';
        }
    }
    /**
     * Generates a signature for a stage transition
     * @param userId User ID transitioning
     * @param fromStage Previous stage
     * @param toStage New stage
     * @returns Signature as Uint8Array
     */
    generateTransitionSignature(userId, fromStage, toStage) {
        // Use HashUtil from crypto.ts instead of directly using crypto
        const data = `${userId}-${fromStage}-${toStage}-${Date.now()}`;
        return crypto_1.HashUtil.sha256(data);
    }
}
exports.DevelopmentalStageAdapter = DevelopmentalStageAdapter;
//# sourceMappingURL=DevelopmentalStageAdapter.js.map