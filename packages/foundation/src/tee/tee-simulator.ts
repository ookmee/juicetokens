import { Logger } from '@juicetokens/common';
import { ITeeOperations, TeeAttestationResult, TeeSimulationConfig } from './interfaces';

/**
 * Simulates a Trusted Execution Environment (TEE) for testing
 */
export class TeeSimulator implements ITeeOperations {
  private readonly logger: Logger;
  private readonly config: TeeSimulationConfig;
  private readonly secureStorage: Map<string, Uint8Array> = new Map();
  
  /**
   * Creates a new TeeSimulator
   * @param logger Logger instance
   * @param config Configuration options
   */
  constructor(logger: Logger, config: TeeSimulationConfig = {}) {
    this.logger = logger;
    this.config = {
      attestationSuccess: true,
      securityLevel: 2,
      teeType: 'Simulated TEE',
      teeVersion: '1.0.0',
      simulateDelays: true,
      functionResults: new Map(),
      ...config
    };
    
    this.logger.info('TEE Simulator initialized');
  }
  
  /**
   * {@inheritdoc}
   */
  public async isTeeAvailable(): Promise<boolean> {
    await this.simulateDelay(50);
    return true; // Simulator is always available
  }
  
  /**
   * {@inheritdoc}
   */
  public async getAttestation(challenge?: Uint8Array): Promise<TeeAttestationResult> {
    await this.simulateDelay(200);
    
    if (!this.config.attestationSuccess) {
      this.logger.warn('TEE attestation failed (simulated failure)');
      return {
        success: false,
        error: 'Simulated attestation failure'
      };
    }
    
    // Create simulated attestation data
    const attestationData = new Uint8Array(32);
    // Fill with random bytes
    crypto.getRandomValues(attestationData);
    
    // If challenge provided, incorporate it into attestation
    if (challenge && challenge.length > 0) {
      // XOR the first bytes with the challenge (simple simulation)
      const bytesToXor = Math.min(challenge.length, attestationData.length);
      for (let i = 0; i < bytesToXor; i++) {
        attestationData[i] ^= challenge[i];
      }
    }
    
    this.logger.info('TEE attestation completed successfully');
    
    return {
      success: true,
      attestationData,
      teeInfo: {
        type: this.config.teeType!,
        version: this.config.teeVersion!,
        securityLevel: this.config.securityLevel!
      }
    };
  }
  
  /**
   * {@inheritdoc}
   */
  public async executeSecureFunction(functionName: string, args: any[]): Promise<any> {
    await this.simulateDelay(150);
    
    this.logger.info(`Executing secure function: ${functionName}`);
    
    // Check if we have a predefined result for this function
    if (this.config.functionResults && this.config.functionResults.has(functionName)) {
      const result = this.config.functionResults.get(functionName);
      
      // If result is a function, call it with the args
      if (typeof result === 'function') {
        return result(...args);
      }
      
      return result;
    }
    
    // Default behavior for common functions
    switch (functionName) {
      case 'generateRandomBytes':
        const length = args[0] || 32;
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return bytes;
        
      case 'hash':
        // In a real implementation, we would hash the data
        // For simulation, just return a random array
        const hashResult = new Uint8Array(32);
        crypto.getRandomValues(hashResult);
        return hashResult;
        
      case 'sign':
        // In a real implementation, we would sign the data
        // For simulation, just return a random signature
        const signature = new Uint8Array(64);
        crypto.getRandomValues(signature);
        return signature;
        
      default:
        throw new Error(`Secure function '${functionName}' is not implemented in the simulator`);
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async storeSecureData(key: string, data: Uint8Array): Promise<boolean> {
    await this.simulateDelay(100);
    
    try {
      this.secureStorage.set(key, data);
      this.logger.info(`Secure data stored with key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store secure data: ${error}`);
      return false;
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async retrieveSecureData(key: string): Promise<Uint8Array | null> {
    await this.simulateDelay(100);
    
    const data = this.secureStorage.get(key);
    
    if (data) {
      this.logger.info(`Retrieved secure data for key: ${key}`);
      return data;
    } else {
      this.logger.warn(`No secure data found for key: ${key}`);
      return null;
    }
  }
  
  /**
   * Simulate a delay for realistic timing
   * @param baseMs Base delay in milliseconds
   */
  private async simulateDelay(baseMs: number): Promise<void> {
    if (!this.config.simulateDelays) return;
    
    // Add some randomness to the delay (±20%)
    const variation = baseMs * 0.2;
    const delay = baseMs + (Math.random() * variation * 2) - variation;
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Reset the simulator state
   */
  public reset(): void {
    this.secureStorage.clear();
    this.logger.info('TEE Simulator reset');
  }
  
  /**
   * Configure a predefined result for a function
   * @param functionName Name of the function
   * @param result Result to return
   */
  public setFunctionResult(functionName: string, result: any): void {
    if (!this.config.functionResults) {
      this.config.functionResults = new Map();
    }
    
    this.config.functionResults.set(functionName, result);
    this.logger.info(`Configured result for function: ${functionName}`);
  }
} 