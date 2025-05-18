/**
 * Trusted Execution Environment (TEE) abstraction interfaces
 */

/**
 * Attestation result from a TEE
 */
export interface TeeAttestationResult {
  /**
   * Whether attestation was successful
   */
  success: boolean;
  
  /**
   * Attestation data (if successful)
   */
  attestationData?: Uint8Array;
  
  /**
   * Error message (if unsuccessful)
   */
  error?: string;
  
  /**
   * TEE-specific information
   */
  teeInfo?: {
    /**
     * Type of TEE
     */
    type: string;
    
    /**
     * Version of the TEE
     */
    version: string;
    
    /**
     * Security level (1-3)
     * 1: Software-based
     * 2: Hardware-backed
     * 3: Hardware-isolated
     */
    securityLevel: number;
  };
}

/**
 * Interface for TEE operations
 */
export interface ITeeOperations {
  /**
   * Check if a TEE is available
   * @returns Promise resolving to whether TEE is available
   */
  isTeeAvailable(): Promise<boolean>;
  
  /**
   * Get attestation from the TEE
   * @param challenge Optional challenge to include in attestation
   * @returns Promise resolving to attestation result
   */
  getAttestation(challenge?: Uint8Array): Promise<TeeAttestationResult>;
  
  /**
   * Execute a function in the TEE
   * @param functionName Name of the function to execute
   * @param args Arguments to pass to the function
   * @returns Promise resolving to the result
   */
  executeSecureFunction(functionName: string, args: any[]): Promise<any>;
  
  /**
   * Store data securely in the TEE
   * @param key Key to store the data under
   * @param data Data to store
   * @returns Promise resolving to whether storage was successful
   */
  storeSecureData(key: string, data: Uint8Array): Promise<boolean>;
  
  /**
   * Retrieve data from the TEE
   * @param key Key to retrieve
   * @returns Promise resolving to the retrieved data or null if not found
   */
  retrieveSecureData(key: string): Promise<Uint8Array | null>;
}

/**
 * Configuration for TEE simulation
 */
export interface TeeSimulationConfig {
  /**
   * Whether attestation should succeed
   */
  attestationSuccess?: boolean;
  
  /**
   * Security level to simulate (1-3)
   */
  securityLevel?: number;
  
  /**
   * Simulated TEE type
   */
  teeType?: string;
  
  /**
   * Simulated TEE version
   */
  teeVersion?: string;
  
  /**
   * Whether to simulate delays for realistic timing
   */
  simulateDelays?: boolean;
  
  /**
   * Map of function names to simulated results
   */
  functionResults?: Map<string, any>;
} 