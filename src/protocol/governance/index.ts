// Governance Layer Components for JuiceTokens
// This file exports all governance layer components

// Export Version Manager
export * from './versionManager';

// Export Monitoring Service
export * from './monitoringService';

// Export Proposal Manager
export * from './proposalManager';

// Export Policy Enforcer
export * from './policyEnforcer';

// Re-export specific types and interfaces that are commonly used
import { 
  IProtocolVersion,
  VersionManager 
} from './versionManager';

import {
  SystemStatus,
  AlertStatus,
  IHealthMetric,
  ISystemHealth,
  IAlert,
  MonitoringService
} from './monitoringService';

import {
  ProposalStatus,
  ProposalType,
  IProposal,
  IVote,
  IVotingResult,
  ProposalManager
} from './proposalManager';

import {
  IPolicyRule,
  IPolicyResult,
  PolicyDomain,
  PolicyEnforcer
} from './policyEnforcer';

// Create a convenience function to initialize all governance components
export function initializeGovernance() {
  // Initialize all singleton services
  const versionManager = VersionManager.getInstance();
  const monitoringService = MonitoringService.getInstance();
  const proposalManager = ProposalManager.getInstance();
  const policyEnforcer = PolicyEnforcer.getInstance();
  
  // Start monitoring service
  monitoringService.startCollection();
  
  // Return all components for convenience
  return {
    versionManager,
    monitoringService,
    proposalManager,
    policyEnforcer
  };
}

// Default singleton instances that can be imported directly
export const governance = {
  versionManager: VersionManager.getInstance(),
  monitoringService: MonitoringService.getInstance(),
  proposalManager: ProposalManager.getInstance(),
  policyEnforcer: PolicyEnforcer.getInstance()
};

// Export default as the governance object
export default governance; 