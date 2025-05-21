"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockCapabilityProviderFactory = void 0;
const interfaces_1 = require("./interfaces");
/**
 * Mock implementation of a hardware capability provider
 */
class MockCapabilityProvider {
    /**
     * Creates a new MockCapabilityProvider
     * @param capability The capability to detect
     * @param logger Logger instance
     * @param config Configuration options
     */
    constructor(capability, logger, config = {}) {
        this.capability = capability;
        this.logger = logger;
        this.config = {
            mockAvailable: true,
            mockVersion: '1.0',
            mockDetails: {
                vendor: 'Mock Vendor',
                model: 'Mock Model',
                description: `Mock ${capability} implementation for testing`
            },
            ...config
        };
    }
    /**
     * {@inheritdoc}
     */
    async detect() {
        // Introduce some random delay (50-200ms) to simulate detection process
        const delay = 50 + Math.floor(Math.random() * 150);
        await new Promise(resolve => setTimeout(resolve, delay));
        this.logger.debug(`Mock detection of ${this.capability} completed`);
        return {
            capability: this.capability,
            available: this.config.mockAvailable,
            version: this.config.mockVersion,
            details: this.config.mockDetails
        };
    }
}
/**
 * Factory that creates mock hardware capability providers for testing
 */
class MockCapabilityProviderFactory {
    /**
     * Creates a new MockCapabilityProviderFactory
     * @param defaultConfig Default configuration for all providers
     */
    constructor(defaultConfig = {}) {
        this.defaultConfig = defaultConfig;
        this.capabilityConfigs = new Map();
    }
    /**
     * Configure a specific capability provider
     * @param capability The capability to configure
     * @param config Configuration options
     */
    configureCapability(capability, config) {
        this.capabilityConfigs.set(capability, config);
    }
    /**
     * {@inheritdoc}
     */
    async createProvider(capability, logger, config) {
        // Merge configurations in priority order: 
        // 1. Provided config
        // 2. Capability-specific config
        // 3. Default config
        const mergedConfig = {
            ...this.defaultConfig,
            ...this.capabilityConfigs.get(capability),
            ...config
        };
        return new MockCapabilityProvider(capability, logger, mergedConfig);
    }
    /**
     * {@inheritdoc}
     */
    getSupportedCapabilities() {
        // Mock factory supports all capabilities
        return Object.values(interfaces_1.HardwareSecurityCapability);
    }
}
exports.MockCapabilityProviderFactory = MockCapabilityProviderFactory;
//# sourceMappingURL=mock-capability-provider-factory.js.map