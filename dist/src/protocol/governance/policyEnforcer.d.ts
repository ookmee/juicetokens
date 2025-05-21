import { EventEmitter } from 'events';
/**
 * Interface for policy rule
 */
export interface IPolicyRule {
    id: string;
    name: string;
    description: string;
    priority: number;
    condition: (context: Record<string, any>) => boolean;
    action: (context: Record<string, any>) => boolean;
    enabled: boolean;
    tags: string[];
}
/**
 * Interface for policy execution result
 */
export interface IPolicyResult {
    ruleId: string;
    ruleName: string;
    allowed: boolean;
    timestamp: number;
    context: Record<string, any>;
    message?: string;
}
/**
 * Policy domains - different areas where policies can be applied
 */
export declare enum PolicyDomain {
    TOKEN_TRANSFER = "token_transfer",
    PROTOCOL_UPGRADE = "protocol_upgrade",
    USER_VERIFICATION = "user_verification",
    GOVERNANCE_VOTING = "governance_voting",
    ATTESTATION = "attestation"
}
/**
 * Service for enforcing governance policies
 */
export declare class PolicyEnforcer extends EventEmitter {
    private static instance;
    private rules;
    private domains;
    private executionHistory;
    private historyLimit;
    private constructor();
    /**
     * Initialize policy domains
     */
    private initializeDomains;
    /**
     * Get the singleton instance of the PolicyEnforcer
     */
    static getInstance(): PolicyEnforcer;
    /**
     * Add a policy rule
     */
    addRule(rule: IPolicyRule, domains: PolicyDomain[]): void;
    /**
     * Remove a policy rule
     */
    removeRule(ruleId: string): boolean;
    /**
     * Enable a policy rule
     */
    enableRule(ruleId: string): boolean;
    /**
     * Disable a policy rule
     */
    disableRule(ruleId: string): boolean;
    /**
     * Apply policy rules for a specific domain
     * Returns true if the action is allowed, false otherwise
     */
    applyPolicies(domain: PolicyDomain, context: Record<string, any>): boolean;
    /**
     * Get all policy rules
     */
    getAllRules(): IPolicyRule[];
    /**
     * Get policy rules for a specific domain
     */
    getRulesForDomain(domain: PolicyDomain): IPolicyRule[];
    /**
     * Get policy execution history
     */
    getExecutionHistory(limit?: number): IPolicyResult[];
    /**
     * Clear policy execution history
     */
    clearExecutionHistory(): void;
    /**
     * Configure the policy enforcer
     */
    configure(config: {
        historyLimit?: number;
    }): void;
}
