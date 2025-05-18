/**
 * Trust and Attestation Layer Tests
 * 
 * This file contains tests for the Trust and Attestation Layer components.
 */

import {
  AttestationService,
  ReputationService,
  IdentityService,
  DHTAdapter,
  DHTStorageOptions,
  SystemAttestation,
  PeerAttestation,
  CommunityAttestation,
  AttributeVerificationStatus,
  LinkType
} from '../../../src/protocol/trust';

describe('Trust and Attestation Layer', () => {
  let attestationService: AttestationService;
  let reputationService: ReputationService;
  let identityService: IdentityService;
  let dhtAdapter: DHTAdapter;
  
  beforeEach(() => {
    // Initialize services
    attestationService = new AttestationService();
    dhtAdapter = new DHTAdapter();
    reputationService = new ReputationService(attestationService);
    identityService = new IdentityService();
  });
  
  describe('Attestation Management', () => {
    test('creates and verifies a system attestation', () => {
      // Create a system attestation
      const systemAttestation = attestationService.createSystemAttestation(
        'user123',
        'system.verification',
        new Uint8Array([1, 2, 3, 4]), // Example evidence
        90, // Confidence score
        'verification-system',
        {
          context: 'kyc-verification',
          tags: ['identity', 'verification']
        }
      );
      
      // Verify it was created correctly
      expect(systemAttestation).toBeDefined();
      expect(systemAttestation.subjectId).toBe('user123');
      expect(systemAttestation.attestationType).toBe('system.verification');
      expect(systemAttestation.confidenceScore).toBe(90);
      
      // Verify the attestation
      const isValid = attestationService.verifyAttestation(systemAttestation);
      expect(isValid).toBe(true);
      
      // Retrieve the attestation
      const retrieved = attestationService.getAttestationById(systemAttestation.attestationId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.attestation).toBe(systemAttestation);
    });
    
    test('creates and verifies a peer attestation', () => {
      // Create a peer attestation
      const privateKey = new Uint8Array([1, 2, 3, 4, 5]); // Simulated private key
      const peerAttestation = attestationService.createPeerAttestation(
        'user456',
        'user789',
        'peer.recommendation',
        'I recommend this user for their reliability',
        85, // Strength
        privateKey,
        {
          context: 'professional-recommendation',
          tags: ['professional', 'recommendation']
        }
      );
      
      // Verify it was created correctly
      expect(peerAttestation).toBeDefined();
      expect(peerAttestation.subjectId).toBe('user456');
      expect(peerAttestation.attesterId).toBe('user789');
      expect(peerAttestation.strength).toBe(85);
      
      // Verify the attestation signature
      const isValid = attestationService.verifyAttestation(peerAttestation);
      expect(isValid).toBe(true);
    });
    
    test('creates and verifies a community attestation', () => {
      // Create a community attestation
      const communityAttestation = attestationService.createCommunityAttestation(
        'user123',
        'community456',
        'community.validation',
        'This user has been validated by the community',
        7, // Approval count
        5, // Threshold
        new Uint8Array([5, 6, 7, 8]), // Simulated signature
        {
          context: 'community-validation',
          tags: ['community', 'validation']
        }
      );
      
      // Verify it was created correctly
      expect(communityAttestation).toBeDefined();
      expect(communityAttestation.subjectId).toBe('user123');
      expect(communityAttestation.communityId).toBe('community456');
      expect(communityAttestation.approvalCount).toBe(7);
      expect(communityAttestation.threshold).toBe(5);
      
      // Verify the attestation (should pass since approval count > threshold)
      const isValid = attestationService.verifyAttestation(communityAttestation);
      expect(isValid).toBe(true);
    });
    
    test('stores and retrieves attestations in the DHT', () => {
      // Create an attestation
      const systemAttestation = attestationService.createSystemAttestation(
        'user123',
        'system.verification',
        new Uint8Array([1, 2, 3, 4]),
        90,
        'verification-system'
      );
      
      // Get the attestation wrapper
      const wrapper = attestationService.getAttestationById(systemAttestation.attestationId);
      expect(wrapper).toBeDefined();
      
      // Store in DHT
      const options: DHTStorageOptions = {
        ttlSeconds: 3600,
        replicate: true,
        replicationFactor: 3,
        s2CellId: 'abcdef'
      };
      
      const dhtKey = dhtAdapter.publishAttestation(wrapper!, options);
      expect(dhtKey).toBeDefined();
      
      // Retrieve from DHT
      const retrieved = dhtAdapter.getAttestationByKey(dhtKey);
      expect(retrieved).toBeDefined();
      
      // Should be the same attestation
      expect(retrieved?.attestation).toEqual(systemAttestation);
    });
    
    test('queries attestations by subject ID', () => {
      // Create multiple attestations for the same subject
      const subject = 'user123';
      
      attestationService.createSystemAttestation(
        subject,
        'system.verification',
        new Uint8Array([1, 2, 3, 4]),
        90,
        'verification-system'
      );
      
      attestationService.createPeerAttestation(
        subject,
        'attester1',
        'peer.recommendation',
        'Recommendation',
        85,
        new Uint8Array([1, 2, 3, 4, 5])
      );
      
      attestationService.createPeerAttestation(
        subject,
        'attester2',
        'peer.endorsement',
        'Endorsement',
        90,
        new Uint8Array([1, 2, 3, 4, 5])
      );
      
      // Query by subject ID
      const attestations = attestationService.getAttestationsAboutSubject(subject);
      
      // Should find 3 attestations
      expect(attestations.length).toBe(3);
      
      // Verify the attestations are for the correct subject
      attestations.forEach(wrapper => {
        expect('subjectId' in wrapper.attestation).toBe(true);
        if ('subjectId' in wrapper.attestation) {
          expect(wrapper.attestation.subjectId).toBe(subject);
        }
      });
    });
  });
  
  describe('Reputation Management', () => {
    test('creates and updates a reputation profile', () => {
      // Create reputation profile
      const userId = 'user123';
      const profile = reputationService.createOrUpdateReputationProfile(userId);
      
      // Verify it was created correctly
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      
      // Default scores should be neutral
      expect(profile.reliability.score).toBeCloseTo(0.5);
      expect(profile.contribution.score).toBeCloseTo(0.5);
      expect(profile.validation.score).toBeCloseTo(0.5);
      
      // Create custom metric
      const metric = reputationService.createReputationMetric(
        userId,
        'technical-skill',
        'Technical skill level',
        0.8
      );
      
      // Verify custom metric was created
      expect(metric).toBeDefined();
      expect(metric.name).toBe('technical-skill');
      expect(metric.value).toBeCloseTo(0.8);
      
      // Update the metric
      const updated = reputationService.updateReputationMetric(
        userId,
        metric.metricId,
        0.9
      );
      
      expect(updated).toBe(true);
      
      // Retrieve the updated profile
      const updatedProfile = reputationService.getReputationProfile(userId);
      expect(updatedProfile).toBeDefined();
      
      // Find the metric in the profile
      const updatedMetric = updatedProfile?.customMetrics.find(m => m.metricId === metric.metricId);
      expect(updatedMetric).toBeDefined();
      expect(updatedMetric?.value).toBeCloseTo(0.9);
    });
    
    test('calculates reputation based on attestations', () => {
      // Create a user
      const userId = 'user123';
      
      // Create attestations that affect reputation
      attestationService.createPeerAttestation(
        userId,
        'attester1',
        'transaction',
        'successful on-time transaction',
        90,
        new Uint8Array([1, 2, 3, 4])
      );
      
      attestationService.createPeerAttestation(
        userId,
        'attester2',
        'transaction',
        'successful transaction but delayed',
        80,
        new Uint8Array([1, 2, 3, 4])
      );
      
      attestationService.createPeerAttestation(
        userId,
        'attester3',
        'contribution',
        'attestation contribution to network',
        85,
        new Uint8Array([1, 2, 3, 4])
      );
      
      // Calculate reputation
      const profile = reputationService.updateReputationProfile(userId);
      
      // Verify reputation was calculated correctly
      expect(profile.reliability.transactionCount).toBe(2);
      expect(profile.reliability.successfulTransactionsRate).toBeCloseTo(1.0); // Both successful
      expect(profile.reliability.onTimeCompletionRate).toBeCloseTo(0.5); // One on-time
      
      expect(profile.contribution.contributionCount).toBe(1);
      expect(profile.contribution.attestationContributionRate).toBeCloseTo(1.0); // The one contribution was attestation
    });
    
    test('applies contextual adjustments to reputation', () => {
      // Create a user with baseline reputation
      const userId = 'user123';
      const profile = reputationService.createOrUpdateReputationProfile(userId);
      
      // Set a crisis environmental context
      reputationService.setEnvironmentalContext({
        crisisMode: true,
        crisisType: 'natural-disaster',
        severity: 0.7,
        detectedAtMs: Date.now(),
        adjustedThresholds: {}
      });
      
      // Update profile with contextual adjustments
      const adjustedProfile = reputationService.updateReputationProfile(userId);
      
      // Crisis should have increased reliability score due to leniency in crisis
      expect(adjustedProfile.reliability.score).toBeGreaterThan(profile.reliability.score);
    });
  });
  
  describe('Identity Management', () => {
    test('creates and updates an identity', () => {
      // Create an identity
      const identity = identityService.createIdentity(
        'John Doe',
        'key123',
        {
          'email': 'john@example.com',
          'location': 'New York'
        }
      );
      
      // Verify it was created correctly
      expect(identity).toBeDefined();
      expect(identity.displayName).toBe('John Doe');
      expect(identity.publicKeys).toContain('key123');
      expect(identity.attributes.length).toBe(2);
      
      // Update an attribute
      const updated = identityService.setIdentityAttribute(
        identity.identityId,
        'location',
        'San Francisco',
        true, // Public
        new Uint8Array([1, 2, 3, 4]) // Simulated signature
      );
      
      expect(updated).toBe(true);
      
      // Retrieve the updated identity
      const updatedIdentity = identityService.getIdentity(identity.identityId);
      expect(updatedIdentity).toBeDefined();
      
      // Check the updated attribute
      const locationAttr = updatedIdentity?.attributes.find(a => a.attributeName === 'location');
      expect(locationAttr).toBeDefined();
      expect(locationAttr?.attributeValue).toBe('San Francisco');
      expect(locationAttr?.public).toBe(true);
    });
    
    test('creates identity links', () => {
      // Create two identities
      const identity1 = identityService.createIdentity('Alice', 'key1');
      const identity2 = identityService.createIdentity('Bob', 'key2');
      
      // Create a trust link
      const link = identityService.createIdentityLink(
        identity1.identityId,
        identity2.identityId,
        LinkType.TRUSTS,
        90,
        'Trusted colleague',
        new Uint8Array([1, 2, 3, 4]), // Simulated signature
        true // Bidirectional
      );
      
      expect(link).toBeDefined();
      
      // Verify the link exists in both directions
      const hasLink1to2 = identityService.hasLink(
        identity1.identityId,
        identity2.identityId,
        LinkType.TRUSTS
      );
      
      const hasLink2to1 = identityService.hasLink(
        identity2.identityId,
        identity1.identityId,
        LinkType.TRUSTS
      );
      
      expect(hasLink1to2).toBe(true);
      expect(hasLink2to1).toBe(true);
    });
    
    test('creates a pseudonym with privacy', () => {
      // Create a real identity
      const realIdentity = identityService.createIdentity('Real Name', 'key1');
      
      // Create a pseudonym
      const pseudonym = identityService.createPseudonym(
        realIdentity.identityId,
        'Anon123',
        'key2',
        new Uint8Array([1, 2, 3, 4]) // Simulated signature
      );
      
      expect(pseudonym).toBeDefined();
      expect(pseudonym?.displayName).toBe('Anon123');
      
      // Real identity should have a link to the pseudonym
      const hasLink = identityService.hasLink(
        realIdentity.identityId,
        pseudonym!.identityId
      );
      
      expect(hasLink).toBe(true);
      
      // But the pseudonym should not have a link back (for privacy)
      const hasReverseLink = identityService.hasLink(
        pseudonym!.identityId,
        realIdentity.identityId
      );
      
      expect(hasReverseLink).toBe(false);
    });
    
    test('manages selective disclosure of attributes', () => {
      // Create two identities
      const identity1 = identityService.createIdentity('Alice', 'key1', {
        'email': 'alice@example.com',
        'phone': '555-1234',
        'ssn': '123-45-6789'
      });
      
      const identity2 = identityService.createIdentity('Bob', 'key2');
      
      // Make email public
      identityService.setIdentityAttribute(
        identity1.identityId,
        'email',
        'alice@example.com',
        true, // Public
        new Uint8Array([1, 2, 3, 4])
      );
      
      // Create a trust link for selective disclosure
      identityService.createIdentityLink(
        identity1.identityId,
        identity2.identityId,
        LinkType.TRUSTS,
        80,
        'Trusted friend',
        new Uint8Array([1, 2, 3, 4])
      );
      
      // Request disclosure of attributes
      const disclosure = identityService.createSelectiveDisclosure(
        identity1.identityId,
        ['email', 'phone', 'ssn'],
        identity2.identityId,
        new Uint8Array([1, 2, 3, 4])
      );
      
      // Email should be disclosed because it's public
      expect(disclosure).toHaveProperty('email', 'alice@example.com');
      
      // Phone should be disclosed because of trust link
      expect(disclosure).toHaveProperty('phone', '555-1234');
      
      // SSN should be disclosed because of trust link, but in a real implementation
      // it might be restricted by additional privacy rules
      expect(disclosure).toHaveProperty('ssn', '123-45-6789');
    });
  });
  
  describe('Integration Tests', () => {
    test('attestations update reputation and link to identity', () => {
      // Create identities
      const identity1 = identityService.createIdentity('Alice', 'key1');
      const identity2 = identityService.createIdentity('Bob', 'key2');
      
      // Create reputation profiles
      reputationService.createOrUpdateReputationProfile(identity1.identityId);
      reputationService.createOrUpdateReputationProfile(identity2.identityId);
      
      // Create attestation from Bob about Alice
      const attestation = attestationService.createPeerAttestation(
        identity1.identityId, // Alice is the subject
        identity2.identityId, // Bob is the attester
        'peer.endorsement',
        'Alice is highly skilled in programming',
        95,
        new Uint8Array([1, 2, 3, 4]) // Simulated private key for Bob
      );
      
      // Link the attestation to Alice's identity attribute
      identityService.addAttributeAttestation(
        identity1.identityId,
        'programming-skill',
        attestation.attestationId,
        AttributeVerificationStatus.PEER_VERIFIED
      );
      
      // Update Alice's reputation with the attestation
      reputationService.createReputationMetric(
        identity1.identityId,
        'programming-skill',
        'Programming skill level',
        0.0 // Start at 0
      );
      
      // Get Alice's profile and metric
      const aliceProfile = reputationService.getReputationProfile(identity1.identityId);
      const metric = aliceProfile?.customMetrics.find(m => m.name === 'programming-skill');
      
      // Update the metric based on the attestation
      if (metric) {
        reputationService.updateReputationMetric(
          identity1.identityId,
          metric.metricId,
          attestation.strength / 100, // Convert 0-100 to 0-1
          attestation.attestationId, // Link the attestation as evidence
          0.9 // High confidence because it's verified
        );
      }
      
      // Get updated profile
      const updatedProfile = reputationService.getReputationProfile(identity1.identityId);
      const updatedMetric = updatedProfile?.customMetrics.find(m => m.name === 'programming-skill');
      
      // Verify the metric was updated
      expect(updatedMetric).toBeDefined();
      expect(updatedMetric?.value).toBeCloseTo(0.95); // 95/100
      expect(updatedMetric?.contributingAttestations).toContain(attestation.attestationId);
      
      // Get Alice's identity
      const aliceIdentity = identityService.getIdentity(identity1.identityId);
      
      // Verify the attribute was linked to the attestation
      const progSkill = aliceIdentity?.attributes.find(a => a.attributeName === 'programming-skill');
      expect(progSkill).toBeDefined();
      expect(progSkill?.attestationIds).toContain(attestation.attestationId);
      expect(progSkill?.verificationStatus).toBe(AttributeVerificationStatus.PEER_VERIFIED);
    });
  });
}); 