export declare enum DevelopmentalStageLevel {
    TRUST = 0,// Building initial trust in the system
    AUTONOMY = 1,// Developing independence and self-direction
    IMAGINATION = 2,// Exploring creative possibilities
    COMPETENCE = 3,// Mastering skills and demonstrating ability
    IDENTITY = 4,// Defining personal values and self-concept
    CONNECTION = 5,// Building meaningful relationships with others
    GENERATIVITY = 6
}
export interface IStageMetric {
    stage: DevelopmentalStageLevel;
    progress: number;
    experiencePoints: number;
    activitiesCompleted: number;
    timeInStageMs: number;
    completedMilestones: string[];
    masteryScore: number;
}
export interface IStageTransition {
    fromStage: DevelopmentalStageLevel;
    toStage: DevelopmentalStageLevel;
    transitionTimeMs: number;
    transitionTrigger: string;
    fromStageMastery: number;
    transitionSignature: Uint8Array;
    witnessIds: string[];
}
export interface IUserDevelopmentalStageStatus {
    userId: string;
    stageMetrics: Map<string, IStageMetric>;
    currentPrimaryStage: DevelopmentalStageLevel;
    currentSecondaryStage: DevelopmentalStageLevel;
    lastTransitionMs: number;
    stageHistory: IStageTransition[];
}
export interface IDevelopmentalStageActivity {
    activityId: string;
    activityName: string;
    description: string;
    primaryStage: DevelopmentalStageLevel;
    secondaryStages: DevelopmentalStageLevel[];
    experiencePoints: number;
    repeatable: boolean;
    cooldownHours: number;
    attributeMultipliers: Map<string, number>;
}
export interface IActivityCompletion {
    completionId: string;
    activityId: string;
    userId: string;
    completionTimeMs: number;
    awardedExperience: number;
    progressContribution: number;
    evidence: Uint8Array;
    validatorIds: string[];
}
export interface IStageProgressionRecommendation {
    userId: string;
    currentStage: DevelopmentalStageLevel;
    currentProgress: number;
    recommendedActivities: string[];
    recommendedConnections: string[];
    estimatedTimeToNextStageHours: number;
    personalizedGuidance: string;
}
export interface IDevelopmentalStageChallenge {
    challengeId: string;
    challengeName: string;
    description: string;
    targetStage: DevelopmentalStageLevel;
    difficulty: number;
    experienceReward: number;
    prerequisiteChallenges: string[];
    requiredSkills: string[];
    completionCriteria: Map<string, number>;
}
export interface IStageMilestone {
    milestoneId: string;
    milestoneName: string;
    description: string;
    stage: DevelopmentalStageLevel;
    stageProgressThreshold: number;
    experienceReward: number;
    isStageTransition: boolean;
    prerequisiteMilestones: string[];
    achievementProof: Uint8Array;
}
