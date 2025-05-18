import { v4 as uuidv4 } from 'uuid';
import { 
  TokenCreationAdapter, 
  TokenRenewalAdapter 
} from '../';
import { 
  DenominationValue,
  IEggGeneration,
  IDormantEgg,
  IFertilizationTrigger,
  IMaturationPath,
  MaturationStage,
  IRenewalRequest,
  ITelomeerRenewalTransformation
} from '../types';

/**
 * This test file demonstrates the complete lifecycle of a token from creation to renewal
 */
describe('Token Lifecycle', () => {
  // Initialize adapters
  const creationAdapter = new TokenCreationAdapter();
  const renewalAdapter = new TokenRenewalAdapter();
  
  // Test user identifiers
  const users = {
    alice: uuidv4(),
    bob: uuidv4(),
    charlie: uuidv4(),
    dave: uuidv4()
  };
  
  // Test data
  let eggs: IDormantEgg[] = [];
  let maturationPath: IMaturationPath;
  let tokenId: string;
  let renewalTransformation: ITelomeerRenewalTransformation;
  
  describe('Token Creation Process', () => {
    test('should generate new token eggs', async () => {
      // Create egg generation parameters
      const params: IEggGeneration = {
        eggId: uuidv4(),
        batchReference: 'BATCH-2023-TEST',
        denomination: DenominationValue.DENOMINATION_10,
        count: 3,
        generatorIds: [users.alice, users.bob, users.charlie],
        entropyCommitment: new Uint8Array(Buffer.from('random-entropy')),
        generationTimestampMs: Date.now()
      };
      
      // Generate eggs
      const result = await creationAdapter.generateEggs(params);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(3);
      
      if (result.success && result.data) {
        eggs = result.data;
      }
    });
    
    test('should fertilize a dormant egg', async () => {
      // Skip if no eggs were generated
      if (eggs.length === 0) {
        console.warn('Skipping egg fertilization test: No eggs available');
        return;
      }
      
      const dormantEgg = eggs[0];
      
      // Create fertilization trigger
      const trigger: IFertilizationTrigger = {
        eggId: dormantEgg.eggId,
        activatorId: users.dave,
        activityReference: 'community-volunteer-work',
        proofOfActivity: new Uint8Array(Buffer.from('activity-signature')),
        triggerTimestampMs: Date.now()
      };
      
      // Trigger fertilization
      const result = await creationAdapter.triggerFertilization(dormantEgg, trigger);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.fertilizationId).toBeDefined();
      
      // Initialize maturation path
      if (result.success) {
        maturationPath = {
          eggId: dormantEgg.eggId,
          currentStage: MaturationStage.DORMANT,
          stageEnteredMs: Date.now(),
          estimatedCompletionMs: Date.now() + (72 * 60 * 60 * 1000), // 72 hours
          completionPercentage: 0
        };
      }
    });
    
    test('should progress through maturation stages', () => {
      // Skip if maturation path not initialized
      if (!maturationPath) {
        console.warn('Skipping maturation test: No maturation path available');
        return;
      }
      
      // Progress to fertilized stage
      let result = creationAdapter.updateMaturationPath(maturationPath, MaturationStage.FERTILIZED);
      expect(result.success).toBe(true);
      expect(result.data?.currentStage).toBe(MaturationStage.FERTILIZED);
      
      if (result.success && result.data) {
        maturationPath = result.data;
      }
      
      // Progress to incubating stage
      result = creationAdapter.updateMaturationPath(maturationPath, MaturationStage.INCUBATING);
      expect(result.success).toBe(true);
      expect(result.data?.currentStage).toBe(MaturationStage.INCUBATING);
      
      if (result.success && result.data) {
        maturationPath = result.data;
      }
      
      // Progress to hatching stage
      result = creationAdapter.updateMaturationPath(maturationPath, MaturationStage.HATCHING);
      expect(result.success).toBe(true);
      expect(result.data?.currentStage).toBe(MaturationStage.HATCHING);
      
      if (result.success && result.data) {
        maturationPath = result.data;
      }
      
      // Progress to active stage
      result = creationAdapter.updateMaturationPath(maturationPath, MaturationStage.ACTIVE);
      expect(result.success).toBe(true);
      expect(result.data?.currentStage).toBe(MaturationStage.ACTIVE);
      expect(result.data?.completionPercentage).toBe(100);
      
      // Simulate token creation from the hatched egg
      tokenId = `TOKEN-${maturationPath.eggId}`;
    });
  });
  
  describe('Token Renewal Process', () => {
    test('should generate expiry notifications', () => {
      // Skip if no token was created
      if (!tokenId) {
        console.warn('Skipping renewal test: No token available');
        return;
      }
      
      // Create token expiry map
      const now = Date.now();
      const tokenExpiryMap = new Map<string, number>([
        [tokenId, now + (5 * 24 * 60 * 60 * 1000)] // 5 days until expiry
      ]);
      
      // Generate notifications
      const result = renewalAdapter.generateExpiryNotifications(tokenExpiryMap, now);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].daysRemaining).toBe(5);
      expect(result.data?.[0].requiresAction).toBe(false);
    });
    
    test('should validate renewal request', () => {
      // Skip if no token was created
      if (!tokenId) {
        console.warn('Skipping renewal test: No token available');
        return;
      }
      
      // Create renewal request
      const request: IRenewalRequest = {
        tokensToRenew: [{
          id: tokenId,
          version: 1
        }],
        requesterId: users.alice,
        requestTimestampMs: Date.now(),
        requestFacilitation: true,
        message: 'Please facilitate renewal of my token'
      };
      
      // Validate request
      const result = renewalAdapter.validateRenewalRequest(request);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
    
    test('should facilitate renewal', () => {
      // Skip if no token was created
      if (!tokenId) {
        console.warn('Skipping renewal test: No token available');
        return;
      }
      
      // Create renewal request
      const request: IRenewalRequest = {
        tokensToRenew: [{
          id: tokenId,
          version: 1
        }],
        requesterId: users.alice,
        requestTimestampMs: Date.now(),
        requestFacilitation: true
      };
      
      // Create token values map
      const tokenValues = new Map<string, number>([
        [tokenId, 10]
      ]);
      
      // Facilitate renewal
      const result = renewalAdapter.facilitateRenewal(request, users.bob, tokenValues);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.facilitatorId).toBe(users.bob);
      expect(result.data?.requestorId).toBe(users.alice);
      expect(result.data?.reward.expiredValueProcessed).toBe(10);
      expect(result.data?.reward.baseFacilitationReward).toBe(0); // Round down from 0.2
    });
    
    test('should create telomeer renewal transformation', () => {
      // Skip if no token was created
      if (!tokenId) {
        console.warn('Skipping renewal test: No token available');
        return;
      }
      
      // Create telomeer renewal transformation
      const result = renewalAdapter.createTelomeerRenewalTransformation(
        tokenId,
        users.alice
      );
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.oldTokenId.id).toBe(tokenId);
      expect(result.data?.newTokenId.id).toBeDefined();
      expect(result.data?.ownerId).toBe(users.alice);
      expect(result.data?.renewalSignature).toBeDefined();
      
      if (result.success && result.data) {
        renewalTransformation = result.data;
      }
    });
    
    test('should verify telomeer renewal transformation', () => {
      // Skip if no transformation was created
      if (!renewalTransformation) {
        console.warn('Skipping verification test: No transformation available');
        return;
      }
      
      // Verify transformation
      const result = renewalAdapter.verifyRenewalTransformation(renewalTransformation);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
}); 