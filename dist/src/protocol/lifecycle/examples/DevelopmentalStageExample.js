"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DevelopmentalStageAdapter_1 = require("../DevelopmentalStageAdapter");
const developmental_stage_types_1 = require("../developmental_stage_types");
/**
 * This example demonstrates the basic usage of the DevelopmentalStageAdapter
 * to track user progression through developmental stages.
 */
async function runDevelopmentalStageExample() {
    console.log('JuiceTokens Developmental Stage System Example');
    console.log('------------------------------------------------');
    // Initialize the adapter
    const stageAdapter = new DevelopmentalStageAdapter_1.DevelopmentalStageAdapter();
    // Create a user
    const userId = 'user-' + Math.floor(Math.random() * 10000);
    console.log(`Creating new user with ID: ${userId}`);
    // Initialize user stage status
    const initResult = stageAdapter.initializeUserStage(userId);
    if (!initResult.success) {
        console.error('Failed to initialize user stage:', initResult.errors);
        return;
    }
    let userStatus = initResult.data;
    console.log(`User initialized at ${developmental_stage_types_1.DevelopmentalStageLevel[userStatus.currentPrimaryStage]} stage`);
    // Define some activities for different stages
    const activities = [
        {
            activityId: 'trust-activity-1',
            activityName: 'Community Introduction',
            description: 'Introduce yourself to the community',
            primaryStage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            secondaryStages: [],
            experiencePoints: 100,
            repeatable: false,
            cooldownHours: 0,
            attributeMultipliers: new Map()
        },
        {
            activityId: 'trust-activity-2',
            activityName: 'First Transaction',
            description: 'Complete your first token transaction',
            primaryStage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            secondaryStages: [developmental_stage_types_1.DevelopmentalStageLevel.AUTONOMY],
            experiencePoints: 200,
            repeatable: false,
            cooldownHours: 0,
            attributeMultipliers: new Map()
        },
        {
            activityId: 'trust-activity-3',
            activityName: 'Daily Check-in',
            description: 'Check in to the platform daily',
            primaryStage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
            secondaryStages: [],
            experiencePoints: 50,
            repeatable: true,
            cooldownHours: 24,
            attributeMultipliers: new Map()
        }
    ];
    // Define a milestone
    const trustMilestone = {
        milestoneId: 'trust-milestone-1',
        milestoneName: 'Trust Foundation',
        description: 'Complete the foundational trust activities',
        stage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
        stageProgressThreshold: 0.3,
        experienceReward: 300,
        isStageTransition: false,
        prerequisiteMilestones: [],
        achievementProof: new Uint8Array()
    };
    // Define a transition milestone
    const trustTransitionMilestone = {
        milestoneId: 'trust-to-autonomy',
        milestoneName: 'Autonomy Awakening',
        description: 'Transition from Trust to Autonomy stage',
        stage: developmental_stage_types_1.DevelopmentalStageLevel.TRUST,
        stageProgressThreshold: 0.8,
        experienceReward: 500,
        isStageTransition: true,
        prerequisiteMilestones: ['trust-milestone-1'],
        achievementProof: new Uint8Array()
    };
    // Complete activities to progress through the Trust stage
    console.log('\nCompleting activities:');
    // Complete first activity
    console.log(`\nCompleting activity: ${activities[0].activityName}`);
    let activityResult = stageAdapter.recordActivityCompletion(userStatus, activities[0]);
    if (!activityResult.success) {
        console.error('Failed to complete activity:', activityResult.errors);
    }
    else {
        userStatus = activityResult.data.userStatus;
        printUserProgress(userStatus);
    }
    // Complete second activity
    console.log(`\nCompleting activity: ${activities[1].activityName}`);
    activityResult = stageAdapter.recordActivityCompletion(userStatus, activities[1]);
    if (!activityResult.success) {
        console.error('Failed to complete activity:', activityResult.errors);
    }
    else {
        userStatus = activityResult.data.userStatus;
        printUserProgress(userStatus);
    }
    // Complete repeatable activity multiple times
    console.log(`\nCompleting activity (3 times): ${activities[2].activityName}`);
    for (let i = 0; i < 3; i++) {
        activityResult = stageAdapter.recordActivityCompletion(userStatus, activities[2]);
        if (!activityResult.success) {
            console.error('Failed to complete activity:', activityResult.errors);
            break;
        }
        else {
            userStatus = activityResult.data.userStatus;
        }
    }
    printUserProgress(userStatus);
    // Complete milestone
    console.log(`\nCompleting milestone: ${trustMilestone.milestoneName}`);
    const milestoneResult = stageAdapter.recordMilestoneCompletion(userStatus, trustMilestone);
    if (!milestoneResult.success) {
        console.error('Failed to complete milestone:', milestoneResult.errors);
    }
    else {
        userStatus = milestoneResult.data;
        printUserProgress(userStatus);
    }
    // Generate progression recommendations
    console.log('\nGenerating progression recommendations:');
    const recommendationsResult = stageAdapter.generateProgressionRecommendations(userStatus, activities, ['user-friend-1', 'user-friend-2']);
    if (recommendationsResult.success) {
        const recommendations = recommendationsResult.data;
        console.log(`- Personal guidance: ${recommendations.personalizedGuidance}`);
        console.log(`- Estimated time to next stage: ${recommendations.estimatedTimeToNextStageHours} hours`);
        console.log(`- Current progress: ${Math.round(recommendations.currentProgress * 100)}%`);
        console.log('- Recommended activities:', recommendations.recommendedActivities.join(', '));
        console.log('- Recommended connections:', recommendations.recommendedConnections.join(', '));
    }
    else {
        console.error('Failed to generate recommendations:', recommendationsResult.errors);
    }
    // Continue completing activities to reach transition threshold
    console.log('\nCompleting more activities to reach transition threshold:');
    for (let i = 0; i < 20; i++) {
        activityResult = stageAdapter.recordActivityCompletion(userStatus, activities[2]);
        if (!activityResult.success) {
            console.error('Failed to complete activity:', activityResult.errors);
            break;
        }
        else {
            userStatus = activityResult.data.userStatus;
        }
    }
    printUserProgress(userStatus);
    // Complete transition milestone
    console.log(`\nCompleting transition milestone: ${trustTransitionMilestone.milestoneName}`);
    const transitionResult = stageAdapter.recordMilestoneCompletion(userStatus, trustTransitionMilestone);
    if (!transitionResult.success) {
        console.error('Failed to complete transition milestone:', transitionResult.errors);
    }
    else {
        userStatus = transitionResult.data;
        console.log(`User has transitioned to ${developmental_stage_types_1.DevelopmentalStageLevel[userStatus.currentPrimaryStage]} stage!`);
        printUserProgress(userStatus);
    }
    // Print stage history
    console.log('\nStage transition history:');
    userStatus.stageHistory.forEach((transition, index) => {
        console.log(`${index + 1}. ${developmental_stage_types_1.DevelopmentalStageLevel[transition.fromStage]} → ${developmental_stage_types_1.DevelopmentalStageLevel[transition.toStage]}`);
        console.log(`   Trigger: ${transition.transitionTrigger}`);
        console.log(`   Time: ${new Date(transition.transitionTimeMs).toISOString()}`);
        console.log(`   Mastery at transition: ${Math.round(transition.fromStageMastery * 100)}%`);
    });
}
/**
 * Helper function to print user's current progress
 */
function printUserProgress(userStatus) {
    console.log(`Current stage: ${developmental_stage_types_1.DevelopmentalStageLevel[userStatus.currentPrimaryStage]} (Primary), ${developmental_stage_types_1.DevelopmentalStageLevel[userStatus.currentSecondaryStage]} (Secondary)`);
    // Print metrics for current primary stage
    const primaryMetrics = userStatus.stageMetrics.get(userStatus.currentPrimaryStage.toString());
    if (primaryMetrics) {
        console.log(`Progress: ${Math.round(primaryMetrics.progress * 100)}%`);
        console.log(`Experience: ${primaryMetrics.experiencePoints} points`);
        console.log(`Activities completed: ${primaryMetrics.activitiesCompleted}`);
        console.log(`Mastery: ${Math.round(primaryMetrics.masteryScore * 100)}%`);
        if (primaryMetrics.completedMilestones.length > 0) {
            console.log(`Completed milestones: ${primaryMetrics.completedMilestones.join(', ')}`);
        }
    }
}
// Run the example
runDevelopmentalStageExample().catch(console.error);
//# sourceMappingURL=DevelopmentalStageExample.js.map