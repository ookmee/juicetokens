"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const governance_1 = require("../../src/protocol/governance");
// Set test environment flag
process.env.NODE_ENV = 'test';
describe('Governance Layer Components', () => {
    describe('Version Manager', () => {
        const { versionManager } = governance_1.governance;
        test('should provide the current version', () => {
            const currentVersion = versionManager.getCurrentVersion();
            expect(currentVersion).toBeDefined();
            expect(currentVersion.version).toBeDefined();
            expect(typeof currentVersion.version).toBe('string');
        });
        test('should check for available updates', () => {
            const isUpdateAvailable = versionManager.isUpdateAvailable();
            expect(typeof isUpdateAvailable).toBe('boolean');
        });
        test('should register a new version', () => {
            const newVersion = {
                version: '0.2.0',
                releaseNotes: 'Test version',
                releaseTimestampMs: Date.now(),
                changedComponents: ['governance'],
                backwardsCompatible: true
            };
            versionManager.registerVersion(newVersion);
            const availableVersions = versionManager.getAvailableVersions();
            expect(availableVersions.length).toBeGreaterThan(0);
            expect(availableVersions.find(v => v.version === newVersion.version)).toBeDefined();
        });
        test('should serialize and deserialize versions', () => {
            const originalVersion = versionManager.getCurrentVersion();
            const serialized = versionManager.serializeVersion(originalVersion);
            const deserialized = versionManager.deserializeVersion(serialized);
            expect(deserialized.version).toBe(originalVersion.version);
            expect(deserialized.releaseNotes).toBe(originalVersion.releaseNotes);
        });
    });
    describe('Monitoring Service', () => {
        const { monitoringService } = governance_1.governance;
        test('should provide system health', () => {
            const health = monitoringService.getSystemHealth();
            expect(health).toBeDefined();
            expect(health.instanceId).toBeDefined();
            expect(health.status).toBeDefined();
        });
        test('should serialize and deserialize system health', () => {
            const originalHealth = monitoringService.getSystemHealth();
            const serialized = monitoringService.serializeSystemHealth();
            const deserialized = monitoringService.deserializeSystemHealth(serialized);
            expect(deserialized.instanceId).toBe(originalHealth.instanceId);
            expect(deserialized.version).toBe(originalHealth.version);
        });
        test('should handle alerts', () => {
            // Get active alerts
            const activeAlerts = monitoringService.getActiveAlerts();
            expect(Array.isArray(activeAlerts)).toBe(true);
            // Test is limited since we can't easily trigger real alerts in a test
        });
    });
    describe('Proposal Manager', () => {
        const { proposalManager } = governance_1.governance;
        let testProposal;
        beforeEach(() => {
            // Create a test proposal before each test
            testProposal = proposalManager.createProposal({
                title: 'Test Proposal',
                description: 'This is a test proposal for unit tests',
                type: governance_1.ProposalType.FEATURE_REQUEST,
                authorId: 'test-author-001',
                implementationDeadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
                proposedChanges: {
                    'feature': 'New test feature',
                    'reason': 'Testing purposes'
                }
            });
        });
        test('should create proposals', () => {
            expect(testProposal).toBeDefined();
            expect(testProposal.id).toBeDefined();
            expect(testProposal.title).toBe('Test Proposal');
        });
        test('should submit proposals for voting', () => {
            proposalManager.submitProposal(testProposal.id);
            const updatedProposal = proposalManager.getProposal(testProposal.id);
            expect(updatedProposal).toBeDefined();
            expect(updatedProposal.status).toBe(governance_1.ProposalStatus.SUBMITTED);
        });
        test('should cast votes on proposals', () => {
            // First submit the proposal to make it eligible for voting
            proposalManager.submitProposal(testProposal.id);
            // Force the proposal into voting status for testing
            const proposal = proposalManager.getProposal(testProposal.id);
            proposal.status = governance_1.ProposalStatus.VOTING;
            // Set the voting period to include the current time
            const now = Date.now();
            proposal.votingStartTime = now - (1 * 24 * 60 * 60 * 1000); // 1 day ago
            proposal.votingEndTime = now + (5 * 24 * 60 * 60 * 1000); // 5 days from now
            // Cast a test vote
            proposalManager.castVote({
                proposalId: testProposal.id,
                voterId: 'test-voter-001',
                vote: 'yes',
                weight: 10
            });
            // Get votes for the proposal
            const votes = proposalManager.getVotesForProposal(testProposal.id);
            expect(votes.length).toBe(1);
            expect(votes[0].vote).toBe('yes');
            expect(votes[0].weight).toBe(10);
            // Calculate the result
            const result = proposalManager.calculateVotingResult(testProposal.id);
            expect(result.yesVotes).toBe(10);
            expect(result.noVotes).toBe(0);
        });
        test('should get proposals by status', () => {
            const draftProposals = proposalManager.getProposalsByStatus(governance_1.ProposalStatus.DRAFT);
            expect(Array.isArray(draftProposals)).toBe(true);
            // We should have at least our test proposal
            const foundProposal = draftProposals.find(p => p.id === testProposal.id);
            expect(foundProposal).toBeDefined();
        });
    });
    describe('Policy Enforcer', () => {
        const { policyEnforcer } = governance_1.governance;
        let testRule;
        beforeEach(() => {
            // Create a test policy rule
            testRule = {
                id: 'test-rule-001',
                name: 'Test Rule',
                description: 'A test rule for unit testing',
                priority: 10,
                condition: (context) => context.testValue > 50,
                action: (context) => context.testValue < 100, // Allow if < 100
                enabled: true,
                tags: ['test']
            };
            // Add the rule to the TOKEN_TRANSFER domain
            policyEnforcer.addRule(testRule, [governance_1.PolicyDomain.TOKEN_TRANSFER]);
        });
        test('should add policy rules', () => {
            const rules = policyEnforcer.getAllRules();
            expect(rules.length).toBeGreaterThan(0);
            const foundRule = rules.find(r => r.id === testRule.id);
            expect(foundRule).toBeDefined();
        });
        test('should get rules for a domain', () => {
            const domainRules = policyEnforcer.getRulesForDomain(governance_1.PolicyDomain.TOKEN_TRANSFER);
            expect(domainRules.length).toBeGreaterThan(0);
            const foundRule = domainRules.find(r => r.id === testRule.id);
            expect(foundRule).toBeDefined();
        });
        test('should apply policies and allow valid actions', () => {
            // This context should trigger the rule condition and be allowed
            const result = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, {
                testValue: 75 // > 50 so condition applies, < 100 so action allows it
            });
            expect(result).toBe(true);
        });
        test('should apply policies and deny invalid actions', () => {
            // This context should trigger the rule condition but be denied
            const result = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, {
                testValue: 150 // > 50 so condition applies, > 100 so action denies it
            });
            expect(result).toBe(false);
        });
        test('should enable and disable rules', () => {
            // Disable the rule
            policyEnforcer.disableRule(testRule.id);
            // With the rule disabled, the action should be allowed by default
            const result = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, {
                testValue: 150 // Would be denied if rule was enabled
            });
            expect(result).toBe(true);
            // Re-enable the rule
            policyEnforcer.enableRule(testRule.id);
            // Now the action should be denied again
            const result2 = policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, {
                testValue: 150
            });
            expect(result2).toBe(false);
        });
        test('should maintain execution history', () => {
            // Apply a policy to create history
            policyEnforcer.applyPolicies(governance_1.PolicyDomain.TOKEN_TRANSFER, {
                testValue: 75
            });
            const history = policyEnforcer.getExecutionHistory();
            expect(history.length).toBeGreaterThan(0);
            // Clear history
            policyEnforcer.clearExecutionHistory();
            const clearedHistory = policyEnforcer.getExecutionHistory();
            expect(clearedHistory.length).toBe(0);
        });
    });
    describe('Governance Integration', () => {
        test('should integrate all governance components', () => {
            // This test demonstrates how the components work together
            // 1. Create a policy rule
            const newVersionRule = {
                id: 'protocol-update-rule',
                name: 'Protocol Update Policy',
                description: 'Policy for protocol version updates',
                priority: 100,
                condition: (context) => context.type === 'version_update',
                action: (context) => {
                    // Allow update if proposal is accepted
                    if (context.proposalStatus === governance_1.ProposalStatus.ACCEPTED) {
                        // Get the version to update to
                        const targetVersion = context.targetVersion;
                        // In a real implementation, we would use the version manager here
                        // to actually perform the update
                        return true;
                    }
                    return false;
                },
                enabled: true,
                tags: ['governance', 'version']
            };
            governance_1.governance.policyEnforcer.addRule(newVersionRule, [governance_1.PolicyDomain.PROTOCOL_UPGRADE]);
            // 2. Create a proposal for a version update
            const updateProposal = governance_1.governance.proposalManager.createProposal({
                title: 'Update to Version 0.2.0',
                description: 'Protocol update with security fixes and performance improvements',
                type: governance_1.ProposalType.PROTOCOL_UPDATE,
                authorId: 'dev-team-001',
                implementationDeadline: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
                proposedChanges: {
                    'targetVersion': '0.2.0',
                    'changes': [
                        'Fix security vulnerability in token transfer',
                        'Improve performance of DHT lookups'
                    ]
                }
            });
            // 3. Submit the proposal and force it to accepted status for the test
            governance_1.governance.proposalManager.submitProposal(updateProposal.id);
            const proposal = governance_1.governance.proposalManager.getProposal(updateProposal.id);
            proposal.status = governance_1.ProposalStatus.ACCEPTED;
            // 4. Try to apply the policy with the accepted proposal
            const allowUpdate = governance_1.governance.policyEnforcer.applyPolicies(governance_1.PolicyDomain.PROTOCOL_UPGRADE, {
                type: 'version_update',
                proposalId: updateProposal.id,
                proposalStatus: governance_1.ProposalStatus.ACCEPTED,
                targetVersion: '0.2.0'
            });
            // Should allow the update
            expect(allowUpdate).toBe(true);
            // 5. Register the new version in the version manager
            governance_1.governance.versionManager.registerVersion({
                version: '0.2.0',
                releaseNotes: 'Security fixes and performance improvements',
                releaseTimestampMs: Date.now(),
                changedComponents: ['token', 'dht'],
                backwardsCompatible: true
            });
            // 6. Mark the proposal as implemented
            governance_1.governance.proposalManager.markAsImplemented(updateProposal.id);
            const implementedProposal = governance_1.governance.proposalManager.getProposal(updateProposal.id);
            expect(implementedProposal.status).toBe(governance_1.ProposalStatus.IMPLEMENTED);
        });
    });
});
//# sourceMappingURL=governance.test.js.map