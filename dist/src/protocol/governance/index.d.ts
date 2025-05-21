export * from './versionManager';
export * from './monitoringService';
export * from './proposalManager';
export * from './policyEnforcer';
import { VersionManager } from './versionManager';
import { MonitoringService } from './monitoringService';
import { ProposalManager } from './proposalManager';
import { PolicyEnforcer } from './policyEnforcer';
export declare function initializeGovernance(): {
    versionManager: VersionManager;
    monitoringService: MonitoringService;
    proposalManager: ProposalManager;
    policyEnforcer: PolicyEnforcer;
};
export declare const governance: {
    versionManager: VersionManager;
    monitoringService: MonitoringService;
    proposalManager: ProposalManager;
    policyEnforcer: PolicyEnforcer;
};
export default governance;
