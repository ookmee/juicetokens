"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeeSimulator = void 0;
/**
 * Simulates a Trusted Execution Environment (TEE) for testing
 */
class TeeSimulator {
    /**
     * Creates a new TeeSimulator
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(logger, config = {}) {
        this.secureStorage = new Map();
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
    async isTeeAvailable() {
        await this.simulateDelay(50);
        return true; // Simulator is always available
    }
    /**
     * {@inheritdoc}
     */
    async getAttestation(challenge) {
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
                type: this.config.teeType,
                version: this.config.teeVersion,
                securityLevel: this.config.securityLevel
            }
        };
    }
    /**
     * {@inheritdoc}
     */
    async executeSecureFunction(functionName, args) {
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
    async storeSecureData(key, data) {
        await this.simulateDelay(100);
        try {
            this.secureStorage.set(key, data);
            this.logger.info(`Secure data stored with key: ${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to store secure data: ${error}`);
            return false;
        }
    }
    /**
     * {@inheritdoc}
     */
    async retrieveSecureData(key) {
        await this.simulateDelay(100);
        const data = this.secureStorage.get(key);
        if (data) {
            this.logger.info(`Retrieved secure data for key: ${key}`);
            return data;
        }
        else {
            this.logger.warn(`No secure data found for key: ${key}`);
            return null;
        }
    }
    /**
     * Simulate a delay for realistic timing
     * @param baseMs Base delay in milliseconds
     */
    async simulateDelay(baseMs) {
        if (!this.config.simulateDelays)
            return;
        // Add some randomness to the delay (±20%)
        const variation = baseMs * 0.2;
        const delay = baseMs + (Math.random() * variation * 2) - variation;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    /**
     * Reset the simulator state
     */
    reset() {
        this.secureStorage.clear();
        this.logger.info('TEE Simulator reset');
    }
    /**
     * Configure a predefined result for a function
     * @param functionName Name of the function
     * @param result Result to return
     */
    setFunctionResult(functionName, result) {
        if (!this.config.functionResults) {
            this.config.functionResults = new Map();
        }
        this.config.functionResults.set(functionName, result);
        this.logger.info(`Configured result for function: ${functionName}`);
    }
}
exports.TeeSimulator = TeeSimulator;
//# sourceMappingURL=tee-simulator.js.map