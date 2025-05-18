/**
 * Trust Network Integration Test
 * 
 * Tests the trust layer's ability to create, verify, and propagate attestations
 * through a network of nodes.
 */

const TestHarness = require('./utils/testHarness');

describe('Trust Network', () => {
  let harness;
  
  beforeEach(async () => {
    harness = new TestHarness();
  });
  
  afterEach(async () => {
    await harness.cleanup();
  });

  test('should create and verify attestations between nodes', async () => {
    // Create nodes
    const attestor = await harness.createNode();
    const subject = await harness.createNode();
    
    // Connect nodes
    await attestor.connectTo(subject);
    
    // Create attestation
    const attestation = await attestor.trust.createAttestation({
      subjectId: subject.id,
      attestorId: attestor.id,
      claims: [
        { type: 'IDENTITY', value: 'VERIFIED' },
        { type: 'REPUTATION', value: '80' }
      ],
      expiryTimeMs: 3600000 // 1 hour
    });
    
    // Verify attestation is valid
    const verificationResult = await subject.trust.verifyAttestation(attestation);
    expect(verificationResult.valid).toBe(true);
    expect(verificationResult.subjectId).toBe(subject.id);
    expect(verificationResult.attestorId).toBe(attestor.id);
  });
  
  test('should propagate trust through a network', async () => {
    // Create a chain of trust: A -> B -> C -> D
    const nodes = await harness.createNetwork(4, 'ring'); // A -> B -> C -> D -> A
    const [nodeA, nodeB, nodeC, nodeD] = nodes;
    
    // Create attestations in a chain
    // A attests to B
    const attestationAB = await nodeA.trust.createAttestation({
      subjectId: nodeB.id,
      attestorId: nodeA.id,
      claims: [{ type: 'TRUST_LEVEL', value: 'HIGH' }]
    });
    
    // B attests to C
    const attestationBC = await nodeB.trust.createAttestation({
      subjectId: nodeC.id,
      attestorId: nodeB.id,
      claims: [{ type: 'TRUST_LEVEL', value: 'MEDIUM' }]
    });
    
    // C attests to D
    const attestationCD = await nodeC.trust.createAttestation({
      subjectId: nodeD.id,
      attestorId: nodeC.id,
      claims: [{ type: 'TRUST_LEVEL', value: 'LOW' }]
    });
    
    // Node A should trust B directly
    const directTrust = await nodeA.trust.getTrustLevel(nodeB.id);
    expect(directTrust).toBe('HIGH');
    
    // Node A should trust C indirectly
    const indirectTrust1 = await nodeA.trust.getTrustLevel(nodeC.id, { maxDepth: 2 });
    expect(indirectTrust1).toBe('MEDIUM');
    
    // Node A should trust D indirectly with depth 3
    const indirectTrust2 = await nodeA.trust.getTrustLevel(nodeD.id, { maxDepth: 3 });
    expect(indirectTrust2).toBe('LOW');
    
    // Node A shouldn't trust D with depth 2
    const limitedTrust = await nodeA.trust.getTrustLevel(nodeD.id, { maxDepth: 2 });
    expect(limitedTrust).toBe('NONE');
  });
  
  test('should reject expired attestations', async () => {
    // Create nodes
    const attestor = await harness.createNode();
    const subject = await harness.createNode();
    
    // Connect nodes
    await attestor.connectTo(subject);
    
    // Create attestation that expires in 50ms
    const attestation = await attestor.trust.createAttestation({
      subjectId: subject.id,
      attestorId: attestor.id,
      claims: [{ type: 'IDENTITY', value: 'VERIFIED' }],
      expiryTimeMs: 50 // Very short expiry
    });
    
    // Verify attestation is valid initially
    const initialVerification = await subject.trust.verifyAttestation(attestation);
    expect(initialVerification.valid).toBe(true);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify attestation is now invalid
    const expiredVerification = await subject.trust.verifyAttestation(attestation);
    expect(expiredVerification.valid).toBe(false);
    expect(expiredVerification.reason).toContain('expired');
  });
  
  test('should verify attestations before token transactions', async () => {
    // Create nodes
    const { sender, receiver } = await harness.createNodePair();
    
    // Add tokens to sender
    await sender.createTestTokens(50);
    
    // Create attestation that the receiver is trusted
    const attestation = await sender.trust.createAttestation({
      subjectId: receiver.id,
      attestorId: sender.id,
      claims: [{ type: 'TRANSACTION_APPROVAL', value: 'APPROVED' }]
    });
    
    // Set trust requirement for transactions
    sender.token.setVerificationRequired(true);
    
    // Transaction should succeed with valid attestation
    const txn = await sender.initiateTokenTransaction(receiver.id, 20);
    const result = await txn.execute();
    
    expect(result.success).toBe(true);
    expect(sender.getBalance()).toBe(30);
    expect(receiver.getBalance()).toBe(20);
    
    // Create a new receiver without attestation
    const untrustedReceiver = await harness.createNode();
    await sender.connectTo(untrustedReceiver);
    
    // Transaction should fail without attestation
    const failedTxn = await sender.initiateTokenTransaction(untrustedReceiver.id, 10);
    const failedResult = await failedTxn.execute().catch(e => ({ success: false, error: e.message }));
    
    expect(failedResult.success).toBe(false);
    expect(failedResult.error).toContain('trust verification');
    expect(sender.getBalance()).toBe(30); // Unchanged
    expect(untrustedReceiver.getBalance()).toBe(0);
  });
  
  test('should properly handle revoked attestations', async () => {
    // Create nodes
    const attestor = await harness.createNode();
    const subject = await harness.createNode();
    
    // Connect nodes
    await attestor.connectTo(subject);
    
    // Create attestation
    const attestation = await attestor.trust.createAttestation({
      subjectId: subject.id,
      attestorId: attestor.id,
      claims: [{ type: 'IDENTITY', value: 'VERIFIED' }]
    });
    
    // Verify valid initially
    const initialVerification = await subject.trust.verifyAttestation(attestation);
    expect(initialVerification.valid).toBe(true);
    
    // Revoke attestation
    await attestor.trust.revokeAttestation(attestation.id);
    
    // Verify now invalid
    const revokedVerification = await subject.trust.verifyAttestation(attestation);
    expect(revokedVerification.valid).toBe(false);
    expect(revokedVerification.reason).toContain('revoked');
  });
}); 