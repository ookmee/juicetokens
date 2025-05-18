import { 
  FutureValueAdapter, 
  EscrowAdapter, 
  CommunalPoolAdapter,
  RequirementType,
  FulfillmentState,
  ConditionType,
  EscrowStatus,
  RiskStrategy 
} from '../FutureValueAdapter';

describe('FutureValueAdapter', () => {
  let adapter: FutureValueAdapter;
  
  beforeEach(() => {
    adapter = new FutureValueAdapter();
  });
  
  describe('createPromise', () => {
    it('should create a promise with valid parameters', async () => {
      const params = {
        creatorId: 'creator-123',
        beneficiaryId: 'beneficiary-456',
        promiseDescription: 'Deliver 5 widgets by next week',
        valueAmount: 100,
        dueDateMs: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
        verificationRequirements: [
          {
            requirementId: 'req-1',
            description: 'Widgets must be blue',
            requirementType: RequirementType.EVIDENCE,
            requirementParameters: new Uint8Array(),
            optional: false,
            weight: 1
          }
        ]
      };
      
      const result = await adapter.createPromise(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.promiseId).toBeDefined();
        expect(result.data.creatorId).toBe(params.creatorId);
        expect(result.data.beneficiaryId).toBe(params.beneficiaryId);
        expect(result.data.promiseDescription).toBe(params.promiseDescription);
        expect(result.data.valueAmount).toBe(params.valueAmount);
        expect(result.data.dueDateMs).toBe(params.dueDateMs);
        expect(result.data.verificationRequirements).toHaveLength(1);
      }
    });
    
    it('should reject a promise with missing required fields', async () => {
      const params = {
        creatorId: '',
        beneficiaryId: 'beneficiary-456',
        promiseDescription: 'Deliver 5 widgets by next week',
        valueAmount: 100,
        dueDateMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
        verificationRequirements: [
          {
            requirementId: 'req-1',
            description: 'Widgets must be blue',
            requirementType: RequirementType.EVIDENCE,
            requirementParameters: new Uint8Array(),
            optional: false,
            weight: 1
          }
        ]
      };
      
      const result = await adapter.createPromise(params);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('creatorId');
      }
    });
    
    it('should reject a promise with invalid due date', async () => {
      const params = {
        creatorId: 'creator-123',
        beneficiaryId: 'beneficiary-456',
        promiseDescription: 'Deliver 5 widgets by next week',
        valueAmount: 100,
        dueDateMs: Date.now() - 1000, // In the past
        verificationRequirements: [
          {
            requirementId: 'req-1',
            description: 'Widgets must be blue',
            requirementType: RequirementType.EVIDENCE,
            requirementParameters: new Uint8Array(),
            optional: false,
            weight: 1
          }
        ]
      };
      
      const result = await adapter.createPromise(params);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('dueDateMs');
      }
    });
  });
  
  describe('updateFulfillment', () => {
    it('should update fulfillment tracking for a promise', async () => {
      const result = await adapter.updateFulfillment(
        'promise-123',
        'req-1',
        50,
        'Halfway done with the widgets',
        ['photo-1.jpg']
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.promiseId).toBe('promise-123');
        expect(result.data.requirementStatuses).toHaveLength(1);
        expect(result.data.requirementStatuses[0].requirementId).toBe('req-1');
        expect(result.data.requirementStatuses[0].completionPercentage).toBe(50);
        expect(result.data.state).toBe(FulfillmentState.IN_PROGRESS);
      }
    });
    
    it('should mark a promise as fulfilled when completion is 100%', async () => {
      const result = await adapter.updateFulfillment(
        'promise-123',
        'req-1',
        100,
        'All widgets completed',
        ['photo-1.jpg', 'photo-2.jpg']
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.promiseId).toBe('promise-123');
        expect(result.data.state).toBe(FulfillmentState.FULFILLED);
      }
    });
  });
  
  describe('calculateOverallCompletion', () => {
    it('should calculate weighted completion percentage', () => {
      const requirements = [
        {
          requirementId: 'req-1',
          description: 'Requirement 1',
          requirementType: RequirementType.EVIDENCE,
          requirementParameters: new Uint8Array(),
          optional: false,
          weight: 2
        },
        {
          requirementId: 'req-2',
          description: 'Requirement 2',
          requirementType: RequirementType.EVIDENCE,
          requirementParameters: new Uint8Array(),
          optional: false,
          weight: 3
        }
      ];
      
      const statuses = [
        {
          requirementId: 'req-1',
          completionPercentage: 100,
          statusDescription: 'Complete',
          evidenceReferences: [],
          lastUpdateMs: Date.now()
        },
        {
          requirementId: 'req-2',
          completionPercentage: 50,
          statusDescription: 'Halfway',
          evidenceReferences: [],
          lastUpdateMs: Date.now()
        }
      ];
      
      const completion = adapter.calculateOverallCompletion(requirements, statuses);
      
      // Expected: (2*100 + 3*50) / (2+3) = (200 + 150) / 5 = 350 / 5 = 70
      expect(completion).toBe(70);
    });
    
    it('should handle optional requirements correctly', () => {
      const requirements = [
        {
          requirementId: 'req-1',
          description: 'Requirement 1',
          requirementType: RequirementType.EVIDENCE,
          requirementParameters: new Uint8Array(),
          optional: false,
          weight: 2
        },
        {
          requirementId: 'req-2',
          description: 'Requirement 2',
          requirementType: RequirementType.EVIDENCE,
          requirementParameters: new Uint8Array(),
          optional: true,
          weight: 1
        }
      ];
      
      const statuses = [
        {
          requirementId: 'req-1',
          completionPercentage: 100,
          statusDescription: 'Complete',
          evidenceReferences: [],
          lastUpdateMs: Date.now()
        }
      ];
      
      const completion = adapter.calculateOverallCompletion(requirements, statuses);
      
      // Optional requirement not started should be skipped
      // Expected: (2*100) / 2 = 100
      expect(completion).toBe(100);
    });
  });
});

describe('EscrowAdapter', () => {
  let adapter: EscrowAdapter;
  
  beforeEach(() => {
    adapter = new EscrowAdapter();
  });
  
  describe('createEscrow', () => {
    it('should create an escrow with valid parameters', async () => {
      const result = await adapter.createEscrow(
        'depositor-123',
        'recipient-456',
        ['token-1', 'token-2'],
        [
          {
            conditionId: 'cond-1',
            description: 'Time-based release',
            conditionType: ConditionType.TIME_BASED,
            conditionParameters: new Uint8Array(),
            negated: false
          }
        ]
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.escrowId).toBeDefined();
        expect(result.data.depositorId).toBe('depositor-123');
        expect(result.data.recipientId).toBe('recipient-456');
        expect(result.data.escrowedTokens).toHaveLength(2);
        expect(result.data.conditions).toHaveLength(1);
        expect(result.data.status).toBe(EscrowStatus.ACTIVE);
      }
    });
    
    it('should reject an escrow with no tokens', async () => {
      const result = await adapter.createEscrow(
        'depositor-123',
        'recipient-456',
        [],
        [
          {
            conditionId: 'cond-1',
            description: 'Time-based release',
            conditionType: ConditionType.TIME_BASED,
            conditionParameters: new Uint8Array(),
            negated: false
          }
        ]
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('tokenIds');
      }
    });
  });
  
  describe('checkEscrowConditions', () => {
    it('should check if escrow conditions are met', async () => {
      const result = await adapter.checkEscrowConditions('escrow-123');
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('releaseEscrow', () => {
    it('should release an escrow when conditions are met', async () => {
      // Mock the checkEscrowConditions method to return true
      jest.spyOn(adapter, 'checkEscrowConditions').mockResolvedValue({
        success: true,
        data: true
      });
      
      const result = await adapter.releaseEscrow('escrow-123');
      
      expect(result.success).toBe(true);
      expect(adapter.checkEscrowConditions).toHaveBeenCalledWith('escrow-123');
    });
    
    it('should not release an escrow when conditions are not met', async () => {
      // Mock the checkEscrowConditions method to return false
      jest.spyOn(adapter, 'checkEscrowConditions').mockResolvedValue({
        success: true,
        data: false
      });
      
      const result = await adapter.releaseEscrow('escrow-123');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('escrowId');
        expect(result.errors[0].message).toBe('Escrow conditions not met');
      }
    });
  });
});

describe('CommunalPoolAdapter', () => {
  let adapter: CommunalPoolAdapter;
  
  beforeEach(() => {
    adapter = new CommunalPoolAdapter();
  });
  
  describe('createGroupCommitment', () => {
    it('should create a group commitment with valid parameters', async () => {
      const participants = ['user-1', 'user-2', 'user-3'];
      const contributions = {
        'user-1': 100,
        'user-2': 150,
        'user-3': 50
      };
      
      const result = await adapter.createGroupCommitment(
        'group-123',
        'Community garden project',
        participants,
        contributions,
        Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.commitmentId).toBeDefined();
        expect(result.data.groupId).toBe('group-123');
        expect(result.data.commitmentPurpose).toBe('Community garden project');
        expect(result.data.participantIds).toEqual(participants);
        expect(result.data.contributions).toEqual(contributions);
        expect(result.data.totalValue).toBe(300); // 100 + 150 + 50
      }
    });
    
    it('should reject a commitment with missing participants', async () => {
      const result = await adapter.createGroupCommitment(
        'group-123',
        'Community garden project',
        [],
        {},
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('participants');
      }
    });
  });
  
  describe('createRiskDistribution', () => {
    it('should create a risk distribution with valid parameters', async () => {
      const customWeights = {
        'user-1': 0.4,
        'user-2': 0.4,
        'user-3': 0.2
      };
      
      const result = await adapter.createRiskDistribution(
        'commitment-123',
        RiskStrategy.CUSTOM,
        customWeights
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.distributionId).toBeDefined();
        expect(result.data.parentCommitmentId).toBe('commitment-123');
        expect(result.data.strategy).toBe(RiskStrategy.CUSTOM);
        expect(result.data.riskWeights).toEqual(customWeights);
      }
    });
    
    it('should reject a custom distribution with no weights', async () => {
      const result = await adapter.createRiskDistribution(
        'commitment-123',
        RiskStrategy.CUSTOM
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('customWeights');
      }
    });
  });
  
  describe('createCollectiveFulfillment', () => {
    it('should create a collective fulfillment with valid parameters', async () => {
      const verifiers = ['verifier-1', 'verifier-2', 'verifier-3'];
      
      const result = await adapter.createCollectiveFulfillment(
        'commitment-123',
        verifiers,
        2 // 2-of-3 verification
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.fulfillmentId).toBeDefined();
        expect(result.data.parentCommitmentId).toBe('commitment-123');
        expect(result.data.verifierIds).toEqual(verifiers);
        expect(result.data.verificationThreshold).toBe(2);
        expect(result.data.votes).toHaveLength(0);
      }
    });
    
    it('should reject a fulfillment with invalid threshold', async () => {
      const result = await adapter.createCollectiveFulfillment(
        'commitment-123',
        ['verifier-1', 'verifier-2'],
        3 // Threshold > number of verifiers
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.success && result.errors) {
        expect(result.errors[0].field).toBe('threshold');
      }
    });
  });
  
  describe('recordVerificationVote', () => {
    it('should record a verification vote', async () => {
      const result = await adapter.recordVerificationVote(
        'fulfillment-123',
        'verifier-1',
        true,
        'Looks good to me'
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.votes).toHaveLength(1);
        expect(result.data.votes[0].verifierId).toBe('verifier-1');
        expect(result.data.votes[0].approved).toBe(true);
        expect(result.data.votes[0].comment).toBe('Looks good to me');
      }
    });
  });
}); 