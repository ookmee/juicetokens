// JuiceTokens Protocol - Lifecycle Layer - Developmental Stage Types
// This file defines interfaces for the developmental stage tracking system

import { ValidationErrorCode, IResult, IValidationError } from './types';

// Enum for developmental stage levels matching the proto definition
export enum DevelopmentalStageLevel {
  TRUST = 0,            // Building initial trust in the system
  AUTONOMY = 1,         // Developing independence and self-direction
  IMAGINATION = 2,      // Exploring creative possibilities
  COMPETENCE = 3,       // Mastering skills and demonstrating ability
  IDENTITY = 4,         // Defining personal values and self-concept
  CONNECTION = 5,       // Building meaningful relationships with others
  GENERATIVITY = 6      // Creating lasting value for future generations
}

// Interface for metrics of a specific developmental stage
export interface IStageMetric {
  stage: DevelopmentalStageLevel;
  progress: number;                   // Progress within stage (0.0-1.0)
  experiencePoints: number;           // Experience points earned in this stage
  activitiesCompleted: number;        // Number of stage-relevant activities completed
  timeInStageMs: number;              // Time spent in this stage
  completedMilestones: string[];      // Completed stage milestones
  masteryScore: number;               // Mastery score (0.0-1.0)
}

// Interface for recording stage transitions
export interface IStageTransition {
  fromStage: DevelopmentalStageLevel;
  toStage: DevelopmentalStageLevel;
  transitionTimeMs: number;
  transitionTrigger: string;
  fromStageMastery: number;
  transitionSignature: Uint8Array;
  witnessIds: string[];
}

// Interface for user's developmental stage status
export interface IUserDevelopmentalStageStatus {
  userId: string;
  stageMetrics: Map<string, IStageMetric>;  // Key is the stage level as string
  currentPrimaryStage: DevelopmentalStageLevel;
  currentSecondaryStage: DevelopmentalStageLevel;
  lastTransitionMs: number;
  stageHistory: IStageTransition[];
}

// Interface for developmental stage activities
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

// Interface for recording activity completions
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

// Interface for stage progression recommendations
export interface IStageProgressionRecommendation {
  userId: string;
  currentStage: DevelopmentalStageLevel;
  currentProgress: number;
  recommendedActivities: string[];
  recommendedConnections: string[];
  estimatedTimeToNextStageHours: number;
  personalizedGuidance: string;
}

// Interface for developmental stage challenges
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

// Interface for developmental stage milestones
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