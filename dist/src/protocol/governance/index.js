"use strict";
// Governance Layer Components for JuiceTokens
// This file exports all governance layer components
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.governance = void 0;
exports.initializeGovernance = initializeGovernance;
// Export Version Manager
__exportStar(require("./versionManager"), exports);
// Export Monitoring Service
__exportStar(require("./monitoringService"), exports);
// Export Proposal Manager
__exportStar(require("./proposalManager"), exports);
// Export Policy Enforcer
__exportStar(require("./policyEnforcer"), exports);
// Re-export specific types and interfaces that are commonly used
const versionManager_1 = require("./versionManager");
const monitoringService_1 = require("./monitoringService");
const proposalManager_1 = require("./proposalManager");
const policyEnforcer_1 = require("./policyEnforcer");
// Create a convenience function to initialize all governance components
function initializeGovernance() {
    // Initialize all singleton services
    const versionManager = versionManager_1.VersionManager.getInstance();
    const monitoringService = monitoringService_1.MonitoringService.getInstance();
    const proposalManager = proposalManager_1.ProposalManager.getInstance();
    const policyEnforcer = policyEnforcer_1.PolicyEnforcer.getInstance();
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
exports.governance = {
    versionManager: versionManager_1.VersionManager.getInstance(),
    monitoringService: monitoringService_1.MonitoringService.getInstance(),
    proposalManager: proposalManager_1.ProposalManager.getInstance(),
    policyEnforcer: policyEnforcer_1.PolicyEnforcer.getInstance()
};
// Export default as the governance object
exports.default = exports.governance;
//# sourceMappingURL=index.js.map