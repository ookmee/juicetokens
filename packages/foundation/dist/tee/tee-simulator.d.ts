import { Logger } from '@juicetokens/common';
import { ITeeOperations, TeeAttestationResult, TeeSimulationConfig } from './interfaces';
/**
 * Simulates a Trusted Execution Environment (TEE) for testing
 */
export declare class TeeSimulator implements ITeeOperations {
    private readonly logger;
    private readonly config;
    private readonly secureStorage;
    /**
     * Creates a new TeeSimulator
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(logger: Logger, config?: TeeSimulationConfig);
    /**
     * {@inheritdoc}
     */
    isTeeAvailable(): Promise<boolean>;
    /**
     * {@inheritdoc}
     */
    getAttestation(challenge?: Uint8Array): Promise<TeeAttestationResult>;
    /**
     * {@inheritdoc}
     */
    executeSecureFunction(functionName: string, args: any[]): Promise<any>;
    /**
     * {@inheritdoc}
     */
    storeSecureData(key: string, data: Uint8Array): Promise<boolean>;
    /**
     * {@inheritdoc}
     */
    retrieveSecureData(key: string): Promise<Uint8Array | null>;
    /**
     * Simulate a delay for realistic timing
     * @param baseMs Base delay in milliseconds
     */
    private simulateDelay;
    /**
     * Reset the simulator state
     */
    reset(): void;
    /**
     * Configure a predefined result for a function
     * @param functionName Name of the function
     * @param result Result to return
     */
    setFunctionResult(functionName: string, result: any): void;
}
