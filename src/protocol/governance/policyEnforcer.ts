import { EventEmitter } from 'events';

/**
 * Interface for policy rule
 */
export interface IPolicyRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher number = higher priority
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
export enum PolicyDomain {
  TOKEN_TRANSFER = 'token_transfer',
  PROTOCOL_UPGRADE = 'protocol_upgrade',
  USER_VERIFICATION = 'user_verification',
  GOVERNANCE_VOTING = 'governance_voting',
  ATTESTATION = 'attestation'
}

/**
 * Service for enforcing governance policies
 */
export class PolicyEnforcer extends EventEmitter {
  private static instance: PolicyEnforcer;
  private rules: Map<string, IPolicyRule> = new Map();
  private domains: Map<PolicyDomain, string[]> = new Map();
  private executionHistory: IPolicyResult[] = [];
  private historyLimit: number = 1000; // Maximum number of execution results to keep
  
  private constructor() {
    super();
    this.initializeDomains();
  }
  
  /**
   * Initialize policy domains
   */
  private initializeDomains(): void {
    Object.values(PolicyDomain).forEach(domain => {
      this.domains.set(domain as PolicyDomain, []);
    });
  }
  
  /**
   * Get the singleton instance of the PolicyEnforcer
   */
  public static getInstance(): PolicyEnforcer {
    if (!PolicyEnforcer.instance) {
      PolicyEnforcer.instance = new PolicyEnforcer();
    }
    return PolicyEnforcer.instance;
  }
  
  /**
   * Add a policy rule
   */
  public addRule(rule: IPolicyRule, domains: PolicyDomain[]): void {
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
  public removeRule(ruleId: string): boolean {
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
  public enableRule(ruleId: string): boolean {
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
  public disableRule(ruleId: string): boolean {
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
  public applyPolicies(domain: PolicyDomain, context: Record<string, any>): boolean {
    const domainRules = this.domains.get(domain) || [];
    const applicableRules = domainRules
      .map(ruleId => this.rules.get(ruleId))
      .filter(rule => rule && rule.enabled)
      .sort((a, b) => b!.priority - a!.priority); // Sort by priority, highest first
    
    if (applicableRules.length === 0) {
      // No rules to apply, default to allowed
      return true;
    }
    
    // Apply each rule in order
    for (const rule of applicableRules) {
      if (!rule) continue;
      
      try {
        // Check if the rule condition applies to this context
        if (rule.condition(context)) {
          // Execute the rule action
          const allowed = rule.action(context);
          
          // Record the execution result
          const result: IPolicyResult = {
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
      } catch (error) {
        console.error(`Error executing policy rule ${rule.id}:`, error);
        
        // Record the error
        const result: IPolicyResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          allowed: false, // Default to deny on error
          timestamp: Date.now(),
          context,
          message: `Error executing rule: ${(error as Error).message}`
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
  public getAllRules(): IPolicyRule[] {
    return Array.from(this.rules.values());
  }
  
  /**
   * Get policy rules for a specific domain
   */
  public getRulesForDomain(domain: PolicyDomain): IPolicyRule[] {
    const domainRules = this.domains.get(domain) || [];
    return domainRules
      .map(ruleId => this.rules.get(ruleId))
      .filter(rule => rule !== undefined) as IPolicyRule[];
  }
  
  /**
   * Get policy execution history
   */
  public getExecutionHistory(limit?: number): IPolicyResult[] {
    return this.executionHistory.slice(0, limit || this.historyLimit);
  }
  
  /**
   * Clear policy execution history
   */
  public clearExecutionHistory(): void {
    this.executionHistory = [];
    this.emit('historyCleared');
  }
  
  /**
   * Configure the policy enforcer
   */
  public configure(config: {
    historyLimit?: number;
  }): void {
    if (config.historyLimit !== undefined) {
      this.historyLimit = config.historyLimit;
      
      // Trim history if needed
      if (this.executionHistory.length > this.historyLimit) {
        this.executionHistory = this.executionHistory.slice(0, this.historyLimit);
      }
    }
  }
} 