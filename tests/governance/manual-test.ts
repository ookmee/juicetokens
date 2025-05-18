// Simple manual test script for governance components
import { governance, ProposalType, PolicyDomain, ProposalStatus } from '../../src/protocol/governance';

process.env.NODE_ENV = 'test';

// Helper to log test results
function testResult(name: string, result: boolean): void {
  console.log(`${result ? '✅' : '❌'} ${name}`);
}

// Test the Version Manager
async function testVersionManager() {
  console.log('\n=== Testing Version Manager ===');
  
  const { versionManager } = governance;
  
  // Test getting current version
  try {
    const currentVersion = await versionManager.getCurrentVersion();
    testResult('Get current version', 
      currentVersion !== undefined && typeof currentVersion.version === 'string');
  } catch (error) {
    console.error('Error getting current version:', error);
    testResult('Get current version', false);
  }
  
  // Test registering a new version
  try {
    const newVersion = {
      version: '0.2.0',
      releaseNotes: 'Test version',
      releaseTimestampMs: Date.now(),
      changedComponents: ['governance'],
      backwardsCompatible: true
    };
    await versionManager.registerVersion(newVersion);
    
    const availableVersions = await versionManager.getAvailableVersions();
    const versionExists = availableVersions.some(v => v.version === newVersion.version);
    
    testResult('Register new version', versionExists);
  } catch (error) {
    console.error('Error registering version:', error);
    testResult('Register new version', false);
  }
}

// Test the Monitoring Service
async function testMonitoringService() {
  console.log('\n=== Testing Monitoring Service ===');
  
  const { monitoringService } = governance;
  
  // Test system health
  try {
    const health = await monitoringService.getSystemHealth();
    testResult('Get system health', 
      health !== undefined && typeof health.instanceId === 'string');
  } catch (error) {
    console.error('Error getting system health:', error);
    testResult('Get system health', false);
  }
  
  // Test alerts
  try {
    const alerts = await monitoringService.getActiveAlerts();
    testResult('Get active alerts', Array.isArray(alerts));
  } catch (error) {
    console.error('Error getting active alerts:', error);
    testResult('Get active alerts', false);
  }
}

// Test the Proposal Manager
function testProposalManager() {
  console.log('\n=== Testing Proposal Manager ===');
  
  const { proposalManager } = governance;
  
  // Create a proposal
  const proposal = proposalManager.createProposal({
    title: 'Test Proposal',
    description: 'This is a test proposal',
    type: ProposalType.FEATURE_REQUEST,
    authorId: 'test-author',
    implementationDeadline: Date.now() + (30 * 24 * 60 * 60 * 1000),
    proposedChanges: { feature: 'Test feature' }
  });
  
  testResult('Create proposal', 
    proposal !== undefined && typeof proposal.id === 'string');
  
  // Submit the proposal
  try {
    proposalManager.submitProposal(proposal.id);
    const updatedProposal = proposalManager.getProposal(proposal.id);
    
    testResult('Submit proposal', 
      updatedProposal?.status === ProposalStatus.SUBMITTED);
  } catch (error) {
    console.error('Error submitting proposal:', error);
    testResult('Submit proposal', false);
  }
  
  // Test getting proposals by status
  const draftProposals = proposalManager.getProposalsByStatus(ProposalStatus.DRAFT);
  testResult('Get proposals by status', Array.isArray(draftProposals));
}

// Test the Policy Enforcer
function testPolicyEnforcer() {
  console.log('\n=== Testing Policy Enforcer ===');
  
  const { policyEnforcer } = governance;
  
  // Add a test rule
  const testRule = {
    id: 'test-rule',
    name: 'Test Rule',
    description: 'A test policy rule',
    priority: 10,
    condition: (context: any) => context.testValue > 50,
    action: (context: any) => context.testValue < 100,
    enabled: true,
    tags: ['test']
  };
  
  policyEnforcer.addRule(testRule, [PolicyDomain.TOKEN_TRANSFER]);
  
  // Test getting rules
  const rules = policyEnforcer.getAllRules();
  testResult('Add and get rules', 
    rules.some(rule => rule.id === testRule.id));
  
  // Test applying policy - should allow
  const allowResult = policyEnforcer.applyPolicies(
    PolicyDomain.TOKEN_TRANSFER, 
    { testValue: 75 }
  );
  testResult('Apply policy (allow)', allowResult === true);
  
  // Test applying policy - should deny
  const denyResult = policyEnforcer.applyPolicies(
    PolicyDomain.TOKEN_TRANSFER, 
    { testValue: 150 }
  );
  testResult('Apply policy (deny)', denyResult === false);
}

// Test governance integration
function testGovernanceIntegration() {
  console.log('\n=== Testing Governance Integration ===');
  
  try {
    // Create a policy rule for protocol updates
    const updateRule = {
      id: 'protocol-update-rule',
      name: 'Protocol Update Policy',
      description: 'Policy for protocol version updates',
      priority: 100,
      condition: (context: any) => context.type === 'version_update',
      action: (context: any) => context.proposalStatus === ProposalStatus.ACCEPTED,
      enabled: true,
      tags: ['governance', 'version']
    };
    
    governance.policyEnforcer.addRule(updateRule, [PolicyDomain.PROTOCOL_UPGRADE]);
    
    // Create and accept a proposal
    const proposal = governance.proposalManager.createProposal({
      title: 'Update to Version 0.2.0',
      description: 'Protocol update',
      type: ProposalType.PROTOCOL_UPDATE,
      authorId: 'test-author',
      implementationDeadline: Date.now() + (14 * 24 * 60 * 60 * 1000),
      proposedChanges: { targetVersion: '0.2.0' }
    });
    
    governance.proposalManager.submitProposal(proposal.id);
    
    // Force proposal to accepted state for testing
    const retreivedProposal = governance.proposalManager.getProposal(proposal.id)!;
    retreivedProposal.status = ProposalStatus.ACCEPTED;
    
    // Check if policy allows the update
    const result = governance.policyEnforcer.applyPolicies(
      PolicyDomain.PROTOCOL_UPGRADE,
      {
        type: 'version_update',
        proposalId: proposal.id,
        proposalStatus: ProposalStatus.ACCEPTED,
        targetVersion: '0.2.0'
      }
    );
    
    testResult('Governance integration', result === true);
    
    // Implement the proposal
    governance.proposalManager.markAsImplemented(proposal.id);
    const implementedProposal = governance.proposalManager.getProposal(proposal.id);
    
    testResult('Mark proposal as implemented', 
      implementedProposal?.status === ProposalStatus.IMPLEMENTED);
  } catch (error) {
    console.error('Error in governance integration test:', error);
    testResult('Governance integration', false);
  }
}

// Run all tests
async function runTests() {
  console.log('===== JuiceTokens Governance Layer Manual Tests =====');
  
  // Run async tests
  await testVersionManager();
  await testMonitoringService();
  
  // Run sync tests
  testProposalManager();
  testPolicyEnforcer();
  testGovernanceIntegration();
  
  console.log('\n===== Manual Tests Complete =====');
  
  // Cleanup resources to prevent hanging
  governance.versionManager.cleanup();
  governance.monitoringService.cleanup();
  
  // Exit explicitly with success code
  process.exit(0);
}

// Execute tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  // Exit explicitly with error code
  process.exit(1);
}); 