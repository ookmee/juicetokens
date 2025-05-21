"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEnforcer = exports.PolicyDomain = void 0;
const events_1 = require("events");
/**
 * Policy domains - different areas where policies can be applied
 */
var PolicyDomain;
(function (PolicyDomain) {
    PolicyDomain["TOKEN_TRANSFER"] = "token_transfer";
    PolicyDomain["PROTOCOL_UPGRADE"] = "protocol_upgrade";
    PolicyDomain["USER_VERIFICATION"] = "user_verification";
    PolicyDomain["GOVERNANCE_VOTING"] = "governance_voting";
    PolicyDomain["ATTESTATION"] = "attestation";
})(PolicyDomain || (exports.PolicyDomain = PolicyDomain = {}));
/**
 * Service for enforcing governance policies
 */
class PolicyEnforcer extends events_1.EventEmitter {
    constructor() {
        super();
        this.rules = new Map();
        this.domains = new Map();
        this.executionHistory = [];
        this.historyLimit = 1000; // Maximum number of execution results to keep
        this.initializeDomains();
    }
    /**
     * Initialize policy domains
     */
    initializeDomains() {
        Object.values(PolicyDomain).forEach(domain => {
            this.domains.set(domain, []);
        });
    }
    /**
     * Get the singleton instance of the PolicyEnforcer
     */
    static getInstance() {
        if (!PolicyEnforcer.instance) {
            PolicyEnforcer.instance = new PolicyEnforcer();
        }
        return PolicyEnforcer.instance;
    }
    /**
     * Add a policy rule
     */
    addRule(rule, domains) {
        // Validate rule
        if (!rule.id || !rule.name || !rule.condition || !rule.action) {
            throw new Error('Invalid policy rule');
        }
        // Add the rule
        this.rules.set(rule.id, rule);
        // Associate rule with domains
        domains.forEach(domain => {
            const domainRules = this.domains.get(domain) || [];
            if (!domainRules.includes(rule.id)) {
                domainRules.push(rule.id);
                this.domains.set(domain, domainRules);
            }
        });
        this.emit('ruleAdded', rule);
    }
    /**
     * Remove a policy rule
     */
    removeRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            return false;
        }
        // Remove the rule
        this.rules.delete(ruleId);
        // Remove rule from all domains
        this.domains.forEach((ruleIds, domain) => {
            const filteredRules = ruleIds.filter(id => id !== ruleId);
            this.domains.set(domain, filteredRules);
        });
        this.emit('ruleRemoved', rule);
        return true;
    }
    /**
     * Enable a policy rule
     */
    enableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            return false;
        }
        rule.enabled = true;
        this.emit('ruleEnabled', rule);
        return true;
    }
    /**
     * Disable a policy rule
     */
    disableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            return false;
        }
        rule.enabled = false;
        this.emit('ruleDisabled', rule);
        return true;
    }
    /**
     * Apply policy rules for a specific domain
     * Returns true if the action is allowed, false otherwise
     */
    applyPolicies(domain, context) {
        const domainRules = this.domains.get(domain) || [];
        const applicableRules = domainRules
            .map(ruleId => this.rules.get(ruleId))
            .filter(rule => rule && rule.enabled)
            .sort((a, b) => b.priority - a.priority); // Sort by priority, highest first
        if (applicableRules.length === 0) {
            // No rules to apply, default to allowed
            return true;
        }
        // Apply each rule in order
        for (const rule of applicableRules) {
            if (!rule)
                continue;
            try {
                // Check if the rule condition applies to this context
                if (rule.condition(context)) {
                    // Execute the rule action
                    const allowed = rule.action(context);
                    // Record the execution result
                    const result = {
                        ruleId: rule.id,
                        ruleName: rule.name,
                        allowed,
                        timestamp: Date.now(),
                        context,
                        message: allowed
                            ? `Action allowed by rule: ${rule.name}`
                            : `Action denied by rule: ${rule.name}`
                    };
                    // Add to history and trim if needed
                    this.executionHistory.unshift(result);
                    if (this.executionHistory.length > this.historyLimit) {
                        this.executionHistory = this.executionHistory.slice(0, this.historyLimit);
                    }
                    this.emit('policyApplied', result);
                    // Return the result of the action
                    return allowed;
                }
            }
            catch (error) {
                console.error(`Error executing policy rule ${rule.id}:`, error);
                // Record the error
                const result = {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    allowed: false, // Default to deny on error
                    timestamp: Date.now(),
                    context,
                    message: `Error executing rule: ${error.message}`
                };
                this.executionHistory.unshift(result);
                if (this.executionHistory.length > this.historyLimit) {
                    this.executionHistory = this.executionHistory.slice(0, this.historyLimit);
                }
                this.emit('policyError', { rule, error, context });
                // Continue to next rule
            }
        }
        // If no rule matched or took effect, default to allowed
        return true;
    }
    /**
     * Get all policy rules
     */
    getAllRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Get policy rules for a specific domain
     */
    getRulesForDomain(domain) {
        const domainRules = this.domains.get(domain) || [];
        return domainRules
            .map(ruleId => this.rules.get(ruleId))
            .filter(rule => rule !== undefined);
    }
    /**
     * Get policy execution history
     */
    getExecutionHistory(limit) {
        return this.executionHistory.slice(0, limit || this.historyLimit);
    }
    /**
     * Clear policy execution history
     */
    clearExecutionHistory() {
        this.executionHistory = [];
        this.emit('historyCleared');
    }
    /**
     * Configure the policy enforcer
     */
    configure(config) {
        if (config.historyLimit !== undefined) {
            this.historyLimit = config.historyLimit;
            // Trim history if needed
            if (this.executionHistory.length > this.historyLimit) {
                this.executionHistory = this.executionHistory.slice(0, this.historyLimit);
            }
        }
    }
}
exports.PolicyEnforcer = PolicyEnforcer;
//# sourceMappingURL=policyEnforcer.js.map