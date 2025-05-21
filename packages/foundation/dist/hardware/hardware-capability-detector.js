"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareCapabilityDetector = void 0;
const interfaces_1 = require("./interfaces");
/**
 * Implements hardware capability detection
 */
class HardwareCapabilityDetector {
    /**
     * Creates a new HardwareCapabilityDetector
     * @param logger Logger instance
     * @param factory Factory for creating capability providers
     * @param config Configuration options
     */
    constructor(logger, factory, config = {}) {
        this.providers = new Map();
        this.logger = logger;
        this.factory = factory;
        // Default configuration
        this.config = {
            securityLevelWeights: {
                [interfaces_1.HardwareSecurityCapability.TEE]: 20,
                [interfaces_1.HardwareSecurityCapability.TPM]: 20,
                [interfaces_1.HardwareSecurityCapability.SE]: 15,
                [interfaces_1.HardwareSecurityCapability.SGX]: 20,
                [interfaces_1.HardwareSecurityCapability.TZ]: 15,
                [interfaces_1.HardwareSecurityCapability.HSM]: 25,
                [interfaces_1.HardwareSecurityCapability.OTP]: 10
            },
            providerConfig: {},
            ...config
        };
        // Initialize providers
        this.initializeProviders().catch(error => {
            this.logger.error(`Error initializing hardware capability providers: ${error}`);
        });
    }
    /**
     * Initialize providers for all supported capabilities
     */
    async initializeProviders() {
        const supportedCapabilities = this.factory.getSupportedCapabilities();
        for (const capability of supportedCapabilities) {
            try {
                const provider = await this.factory.createProvider(capability, this.logger, this.config.providerConfig);
                this.providers.set(capability, provider);
                this.logger.info(`Initialized provider for hardware capability: ${capability}`);
            }
            catch (error) {
                this.logger.error(`Failed to initialize provider for capability ${capability}: ${error}`);
            }
        }
    }
    /**
     * {@inheritdoc}
     */
    async detectCapability(capability) {
        const provider = this.providers.get(capability);
        if (!provider) {
            this.logger.warn(`No provider available for hardware capability: ${capability}`);
            return {
                capability,
                available: false,
                error: 'Capability detection not supported on this platform'
            };
        }
        try {
            const status = await provider.detect();
            this.logger.info(`Detected hardware capability ${capability}: ${status.available ? 'Available' : 'Not Available'}`);
            return status;
        }
        catch (error) {
            this.logger.error(`Error detecting hardware capability ${capability}: ${error}`);
            return {
                capability,
                available: false,
                error: `Detection failed: ${error}`
            };
        }
    }
    /**
     * {@inheritdoc}
     */
    async detectAllCapabilities() {
        const statuses = [];
        for (const capability of this.providers.keys()) {
            try {
                const status = await this.detectCapability(capability);
                statuses.push(status);
            }
            catch (error) {
                this.logger.error(`Error detecting capability ${capability}: ${error}`);
                statuses.push({
                    capability,
                    available: false,
                    error: `Detection failed: ${error}`
                });
            }
        }
        return statuses;
    }
    /**
     * {@inheritdoc}
     */
    async getSecurityLevel() {
        const statuses = await this.detectAllCapabilities();
        // Calculate weighted security level
        let totalWeight = 0;
        let weightedSum = 0;
        for (const status of statuses) {
            const weight = this.config.securityLevelWeights?.[status.capability] || 0;
            if (weight > 0) {
                totalWeight += weight;
                if (status.available) {
                    weightedSum += weight;
                }
            }
        }
        // Calculate security level (0-100)
        const securityLevel = totalWeight > 0
            ? Math.round((weightedSum / totalWeight) * 100)
            : 0;
        this.logger.info(`Calculated device security level: ${securityLevel}`);
        return securityLevel;
    }
}
exports.HardwareCapabilityDetector = HardwareCapabilityDetector;
//# sourceMappingURL=hardware-capability-detector.js.map