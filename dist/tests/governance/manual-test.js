"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simple manual test script for governance components
const governance_1 = require("../../src/protocol/governance");
process.env.NODE_ENV = 'test';
// Helper to log test results
function testResult(name, result) {
    console.log(`${result ? '✅' : '❌'} ${name}`);
}
// Test the Version Manager
async function testVersionManager() {
    console.log('\n=== Testing Version Manager ===');
    const { versionManager } = governance_1.governance;
    // Test getting current version
    try {
        const currentVersion = await versionManager.getCurrentVersion();
        testResult('Get current version', currentVersion !== undefined && typeof currentVersion.version === 'string');
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error registering version:', error);
        testResult('Register new version', false);
    }
}
// Test the Monitoring Service
async function testMonitoringService() {
    console.log('\n=== Testing Monitoring Service ===');
    const { monitoringService } = governance_1.governance;
    // Test system health
    try {
        const health = await monitoringService.getSystemHealth();
        testResult('Get system health', health !== undefined && typeof health.instanceId === 'string');
    }
    catch (error) {
        console.error('Error getting system health:', error);
        testResult('Get system health', false);
    }
    // Test alerts
    try {
        const alerts = await monitoringService.getActiveAlerts();
        testResult('Get active alerts', Array.isArray(alerts));
    }
    catch (error) {
        console.error('Error getting active alerts:', error);
        testResult('Get active alerts', false);
    }
}
// Test the Proposal Manager
function testProposalManager() {
    console.log('\n=== Testing Proposal Manager ===');
    const { proposalManager } = governance_1.governance;
    // Create a proposal
    const proposal = proposalManager.createProposal({
        title: 'Test Proposal',
        description: 'This is a test proposal',
        type: governance_1.ProposalType.FEATURE_REQUEST,
        authorId: 'test-author',
        implementationDeadline: Date.now() + (30 * 24 * 60 * 60 * 1000),
        proposedChanges: { feature: 'Test feature' }
    });
    testResult('Create proposal', proposal !== undefined && typeof proposal.id === 'string');
    // Submit the proposal
    try {
        proposalManager.submitProposal(proposal.id);
        const updatedProposal = proposalManager.getProposal(proposal.id);
        testResult('Submit proposal', updatedProposal?.status === governance_1.ProposalStatus.SUBMITTED);
    }
    catch (error) {
        console.error('Error submitting proposal:', error);
        testResult('Submit proposal', false);
    }
    // Test getting proposals by status
    const draftProposals = proposalManager.getProposalsByStatus(governance_1.ProposalStatus.DRAFT);
    testResult('Get proposals by status', Array.isArray(draftProposals));
}
// Test the Policy Enforcer
function testPolicyEnforcer() {
    console.log('\n=== Testing Policy Enforcer ===');
    const { policyEnforcer } = governance_1.governance;
    // Add a test rule
    const testRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test policy rule',
        priority: 10,
        condition: (context) => context.testValue > 50,
        action: (context) => context.testValue < 100,
        enabled: true,
        tags: ['test']
    };
    policyEnforcer.addRule(testRule, [governance_1.PolicyDomain.TOKEN_TRANSFER]);
    // Test getting rules
    const rules = policyEnforcer.getAllRules();
    testResult('Add and get rules', rules.some(rule => rule.id === testRule.id));
    // Test applying policy - should allow
    const allowResult = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, { testValue: 75 });
    testResult('Apply policy (allow)', allowResult === true);
    // Test applying policy - should deny
    const denyResult = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, { testValue: 150 });
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
            condition: (context) => context.type === 'version_update',
            action: (context) => context.proposalStatus === governance_1.ProposalStatus.ACCEPTED,
            enabled: true,
            tags: ['governance', 'version']
        };
        governance_1.governance.policyEnforcer.addRule(updateRule, [governance_1.PolicyDomain.PROTOCOL_UPGRADE]);
        // Create and accept a proposal
        const proposal = governance_1.governance.proposalManager.createProposal({
            title: 'Update to Version 0.2.0',
            description: 'Protocol update',
            type: governance_1.ProposalType.PROTOCOL_UPDATE,
            authorId: 'test-author',
            implementationDeadline: Date.now() + (14 * 24 * 60 * 60 * 1000),
            proposedChanges: { targetVersion: '0.2.0' }
        });
        governance_1.governance.proposalManager.submitProposal(proposal.id);
        // Force proposal to accepted state for testing
        const retreivedProposal = governance_1.governance.proposalManager.getProposal(proposal.id);
        retreivedProposal.status = governance_1.ProposalStatus.ACCEPTED;
        // Check if policy allows the update
        const result = governance_1.governance.policyEnforcer.applyPolicies(governance_1.PolicyDomain.PROTOCOL_UPGRADE, {
            type: 'version_update',
            proposalId: proposal.id,
            proposalStatus: governance_1.ProposalStatus.ACCEPTED,
            targetVersion: '0.2.0'
        });
        testResult('Governance integration', result === true);
        // Implement the proposal
        governance_1.governance.proposalManager.markAsImplemented(proposal.id);
        const implementedProposal = governance_1.governance.proposalManager.getProposal(proposal.id);
        testResult('Mark proposal as implemented', implementedProposal?.status === governance_1.ProposalStatus.IMPLEMENTED);
    }
    catch (error) {
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
    governance_1.governance.versionManager.cleanup();
    governance_1.governance.monitoringService.cleanup();
    // Exit explicitly with success code
    process.exit(0);
}
// Execute tests
runTests().catch(error => {
    console.error('Test execution failed:', error);
    // Exit explicitly with error code
    process.exit(1);
});
//# sourceMappingURL=manual-test.js.map