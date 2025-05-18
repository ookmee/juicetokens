import { DevelopmentalStageAdapter } from '../DevelopmentalStageAdapter';
import { 
  DevelopmentalStageLevel,
  IDevelopmentalStageActivity,
  IStageMilestone
} from '../developmental_stage_types';

describe('DevelopmentalStageAdapter', () => {
  let adapter: DevelopmentalStageAdapter;
  const testUserId = 'user-123';

  beforeEach(() => {
    adapter = new DevelopmentalStageAdapter();
  });

  describe('initializeUserStage', () => {
    it('should initialize a new user with TRUST as the starting stage', () => {
      const result = adapter.initializeUserStage(testUserId);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const userStatus = result.data!;
      expect(userStatus.userId).toBe(testUserId);
      expect(userStatus.currentPrimaryStage).toBe(DevelopmentalStageLevel.TRUST);
      expect(userStatus.currentSecondaryStage).toBe(DevelopmentalStageLevel.TRUST);
      expect(userStatus.stageHistory).toHaveLength(0);
      
      const trustMetric = userStatus.stageMetrics.get(DevelopmentalStageLevel.TRUST.toString());
      expect(trustMetric).toBeDefined();
      expect(trustMetric!.progress).toBe(0);
      expect(trustMetric!.experiencePoints).toBe(0);
    });

    it('should return error for empty userId', () => {
      const result = adapter.initializeUserStage('');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].field).toBe('userId');
    });
  });

  describe('recordActivityCompletion', () => {
    it('should update user metrics when an activity is completed', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      const userStatus = initResult.data!;

      // Create a test activity for the TRUST stage
      const activity: IDevelopmentalStageActivity = {
        activityId: 'activity-1',
        activityName: 'Trust Building Exercise',
        description: 'An activity to build trust',
        primaryStage: DevelopmentalStageLevel.TRUST,
        secondaryStages: [DevelopmentalStageLevel.AUTONOMY],
        experiencePoints: 100,
        repeatable: true,
        cooldownHours: 24,
        attributeMultipliers: new Map([['engagement', 1.2]])
      };

      // Record activity completion
      const completionResult = adapter.recordActivityCompletion(userStatus, activity);
      
      expect(completionResult.success).toBe(true);
      expect(completionResult.data).toBeDefined();
      
      const updatedStatus = completionResult.data!.userStatus;
      const completion = completionResult.data!.activityCompletion;
      
      // Check activity completion
      expect(completion.activityId).toBe(activity.activityId);
      expect(completion.userId).toBe(testUserId);
      expect(completion.awardedExperience).toBe(activity.experiencePoints);
      
      // Check updated metrics
      const trustMetric = updatedStatus.stageMetrics.get(DevelopmentalStageLevel.TRUST.toString());
      expect(trustMetric).toBeDefined();
      expect(trustMetric!.experiencePoints).toBe(activity.experiencePoints * 0.7); // 70% contribution
      expect(trustMetric!.activitiesCompleted).toBe(1);
      expect(trustMetric!.progress).toBeGreaterThan(0);
      
      // Check secondary stage contribution
      const autonomyMetric = updatedStatus.stageMetrics.get(DevelopmentalStageLevel.AUTONOMY.toString());
      expect(autonomyMetric).toBeDefined();
      expect(autonomyMetric!.experiencePoints).toBe(activity.experiencePoints * 0.3); // 30% contribution
      expect(autonomyMetric!.progress).toBeGreaterThan(0);
    });

    it('should not allow completing non-repeatable activities more than once', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      let userStatus = initResult.data!;

      // Create a non-repeatable test activity
      const activity: IDevelopmentalStageActivity = {
        activityId: 'activity-2',
        activityName: 'One-time Trust Exercise',
        description: 'A one-time activity to build trust',
        primaryStage: DevelopmentalStageLevel.TRUST,
        secondaryStages: [],
        experiencePoints: 200,
        repeatable: false,
        cooldownHours: 0,
        attributeMultipliers: new Map()
      };

      // Complete the activity once
      const firstCompletionResult = adapter.recordActivityCompletion(userStatus, activity);
      expect(firstCompletionResult.success).toBe(true);
      userStatus = firstCompletionResult.data!.userStatus;

      // Try to complete the same activity again
      const secondCompletionResult = adapter.recordActivityCompletion(userStatus, activity);
      expect(secondCompletionResult.success).toBe(false);
      expect(secondCompletionResult.errors).toBeDefined();
      expect(secondCompletionResult.errors![0].code).toBe('INVALID_STATE');
    });
  });

  describe('transitionStage', () => {
    it('should transition user to the next stage', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      const userStatus = initResult.data!;

      // Transition from TRUST to AUTONOMY
      const transitionResult = adapter.transitionStage(
        userStatus,
        DevelopmentalStageLevel.AUTONOMY,
        'test_transition',
        ['witness-1']
      );
      
      expect(transitionResult.success).toBe(true);
      expect(transitionResult.data).toBeDefined();
      
      const updatedStatus = transitionResult.data!;
      
      // Check updated stage
      expect(updatedStatus.currentPrimaryStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      expect(updatedStatus.currentSecondaryStage).toBe(DevelopmentalStageLevel.TRUST);
      expect(updatedStatus.lastTransitionMs).toBeGreaterThan(0);
      
      // Check stage history
      expect(updatedStatus.stageHistory).toHaveLength(1);
      const transition = updatedStatus.stageHistory[0];
      expect(transition.fromStage).toBe(DevelopmentalStageLevel.TRUST);
      expect(transition.toStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      expect(transition.transitionTrigger).toBe('test_transition');
      expect(transition.witnessIds).toContain('witness-1');
    });

    it('should not allow skipping stages', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      const userStatus = initResult.data!;

      // Try to skip from TRUST to IMAGINATION (skipping AUTONOMY)
      const transitionResult = adapter.transitionStage(
        userStatus,
        DevelopmentalStageLevel.IMAGINATION
      );
      
      expect(transitionResult.success).toBe(false);
      expect(transitionResult.errors).toBeDefined();
      expect(transitionResult.errors![0].message).toContain('Cannot skip');
    });
  });

  describe('Stage progression through multiple activities', () => {
    it('should progress through stages with enough activities', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      let userStatus = initResult.data!;

      // Helper function to create activities with high experience
      const createActivity = (id: string, name: string, stage: DevelopmentalStageLevel): IDevelopmentalStageActivity => ({
        activityId: id,
        activityName: name,
        description: `Activity for ${name}`,
        primaryStage: stage,
        secondaryStages: [],
        experiencePoints: 1000, // High experience to ensure progress
        repeatable: true,
        cooldownHours: 0,
        attributeMultipliers: new Map()
      });

      // Create high-value activities for each stage
      const trustActivity = createActivity('trust-1', 'Trust Building', DevelopmentalStageLevel.TRUST);
      const autonomyActivity = createActivity('autonomy-1', 'Autonomy Development', DevelopmentalStageLevel.AUTONOMY);
      const imaginationActivity = createActivity('imagination-1', 'Imagination Exploration', DevelopmentalStageLevel.IMAGINATION);

      // Complete multiple trust activities to progress to AUTONOMY stage
      for (let i = 0; i < 10; i++) {
        const result = adapter.recordActivityCompletion(userStatus, trustActivity);
        expect(result.success).toBe(true);
        userStatus = result.data!.userStatus;
      }

      // Check if user has progressed to AUTONOMY
      expect(userStatus.currentPrimaryStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      
      // Complete multiple autonomy activities to progress to IMAGINATION stage
      for (let i = 0; i < 10; i++) {
        const result = adapter.recordActivityCompletion(userStatus, autonomyActivity);
        expect(result.success).toBe(true);
        userStatus = result.data!.userStatus;
      }
      
      // Check if user has progressed to IMAGINATION
      expect(userStatus.currentPrimaryStage).toBe(DevelopmentalStageLevel.IMAGINATION);

      // Verify stage history has two transitions
      expect(userStatus.stageHistory).toHaveLength(2);
      expect(userStatus.stageHistory[0].fromStage).toBe(DevelopmentalStageLevel.TRUST);
      expect(userStatus.stageHistory[0].toStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      expect(userStatus.stageHistory[1].fromStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      expect(userStatus.stageHistory[1].toStage).toBe(DevelopmentalStageLevel.IMAGINATION);
    });
  });

  describe('generateProgressionRecommendations', () => {
    it('should recommend relevant activities for the current stage', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      const userStatus = initResult.data!;

      // Create test activities for different stages
      const activities: IDevelopmentalStageActivity[] = [
        {
          activityId: 'trust-1',
          activityName: 'Trust Exercise 1',
          description: 'First trust exercise',
          primaryStage: DevelopmentalStageLevel.TRUST,
          secondaryStages: [],
          experiencePoints: 100,
          repeatable: true,
          cooldownHours: 0,
          attributeMultipliers: new Map()
        },
        {
          activityId: 'trust-2',
          activityName: 'Trust Exercise 2',
          description: 'Second trust exercise',
          primaryStage: DevelopmentalStageLevel.TRUST,
          secondaryStages: [],
          experiencePoints: 200,
          repeatable: true,
          cooldownHours: 0,
          attributeMultipliers: new Map()
        },
        {
          activityId: 'autonomy-1',
          activityName: 'Autonomy Exercise',
          description: 'Autonomy exercise',
          primaryStage: DevelopmentalStageLevel.AUTONOMY,
          secondaryStages: [DevelopmentalStageLevel.TRUST],
          experiencePoints: 150,
          repeatable: true,
          cooldownHours: 0,
          attributeMultipliers: new Map()
        }
      ];

      // Generate recommendations
      const recommendationsResult = adapter.generateProgressionRecommendations(
        userStatus,
        activities,
        ['user-1', 'user-2', 'user-3', 'user-4']
      );
      
      expect(recommendationsResult.success).toBe(true);
      expect(recommendationsResult.data).toBeDefined();
      
      const recommendations = recommendationsResult.data!;
      
      // Should recommend trust activities first and secondary stage activities next
      expect(recommendations.recommendedActivities).toContain('trust-1');
      expect(recommendations.recommendedActivities).toContain('trust-2');
      
      // Should include some recommended connections
      expect(recommendations.recommendedConnections.length).toBeGreaterThan(0);
      
      // Should have personalized guidance
      expect(recommendations.personalizedGuidance).toContain('Trust');
    });
  });

  describe('recordMilestoneCompletion', () => {
    it('should record milestone completion and update metrics', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      let userStatus = initResult.data!;

      // Complete an activity to gain some progress
      const activity: IDevelopmentalStageActivity = {
        activityId: 'activity-1',
        activityName: 'Trust Building Exercise',
        description: 'An activity to build trust',
        primaryStage: DevelopmentalStageLevel.TRUST,
        secondaryStages: [],
        experiencePoints: 500,
        repeatable: true,
        cooldownHours: 0,
        attributeMultipliers: new Map()
      };

      const activityResult = adapter.recordActivityCompletion(userStatus, activity);
      expect(activityResult.success).toBe(true);
      userStatus = activityResult.data!.userStatus;

      // Create a milestone
      const milestone: IStageMilestone = {
        milestoneId: 'milestone-1',
        milestoneName: 'Trust Milestone',
        description: 'First trust milestone',
        stage: DevelopmentalStageLevel.TRUST,
        stageProgressThreshold: 0.3, // Lower threshold to ensure it can be completed
        experienceReward: 200,
        isStageTransition: false,
        prerequisiteMilestones: [],
        achievementProof: new Uint8Array()
      };

      // Record milestone completion
      const milestoneResult = adapter.recordMilestoneCompletion(userStatus, milestone);
      
      expect(milestoneResult.success).toBe(true);
      expect(milestoneResult.data).toBeDefined();
      
      const updatedStatus = milestoneResult.data!;
      
      // Check if milestone was recorded
      const trustMetric = updatedStatus.stageMetrics.get(DevelopmentalStageLevel.TRUST.toString());
      expect(trustMetric).toBeDefined();
      expect(trustMetric!.completedMilestones).toContain('milestone-1');
      
      // Check if experience was awarded
      expect(trustMetric!.experiencePoints).toBe(activity.experiencePoints * 0.7 + milestone.experienceReward);
    });

    it('should trigger stage transition for transition milestones', () => {
      // Initialize user
      const initResult = adapter.initializeUserStage(testUserId);
      expect(initResult.success).toBe(true);
      let userStatus = initResult.data!;

      // Complete an activity to gain some progress
      const activity: IDevelopmentalStageActivity = {
        activityId: 'activity-1',
        activityName: 'Trust Building Exercise',
        description: 'An activity to build trust',
        primaryStage: DevelopmentalStageLevel.TRUST,
        secondaryStages: [],
        experiencePoints: 500,
        repeatable: true,
        cooldownHours: 0,
        attributeMultipliers: new Map()
      };

      const activityResult = adapter.recordActivityCompletion(userStatus, activity);
      expect(activityResult.success).toBe(true);
      userStatus = activityResult.data!.userStatus;

      // Create a milestone that triggers stage transition
      const transitionMilestone: IStageMilestone = {
        milestoneId: 'transition-milestone',
        milestoneName: 'Trust to Autonomy Transition',
        description: 'Milestone marking the transition from Trust to Autonomy',
        stage: DevelopmentalStageLevel.TRUST,
        stageProgressThreshold: 0.3, // Lower threshold to ensure it can be completed
        experienceReward: 300,
        isStageTransition: true, // Marks a stage transition
        prerequisiteMilestones: [],
        achievementProof: new Uint8Array()
      };

      // Record milestone completion
      const milestoneResult = adapter.recordMilestoneCompletion(userStatus, transitionMilestone);
      
      expect(milestoneResult.success).toBe(true);
      expect(milestoneResult.data).toBeDefined();
      
      const updatedStatus = milestoneResult.data!;
      
      // Check if stage transition occurred
      expect(updatedStatus.currentPrimaryStage).toBe(DevelopmentalStageLevel.AUTONOMY);
      expect(updatedStatus.currentSecondaryStage).toBe(DevelopmentalStageLevel.TRUST);
      
      // Check stage history
      expect(updatedStatus.stageHistory).toHaveLength(1);
      expect(updatedStatus.stageHistory[0].transitionTrigger).toContain('milestone_completion');
    });
  });
}); 