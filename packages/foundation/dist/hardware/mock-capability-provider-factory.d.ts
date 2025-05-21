import { Logger } from '@juicetokens/common';
import { HardwareCapabilityProviderConfig, HardwareSecurityCapability, IHardwareCapabilityProvider, IHardwareCapabilityProviderFactory } from './interfaces';
/**
 * Factory that creates mock hardware capability providers for testing
 */
export declare class MockCapabilityProviderFactory implements IHardwareCapabilityProviderFactory {
    private readonly defaultConfig;
    private readonly capabilityConfigs;
    /**
     * Creates a new MockCapabilityProviderFactory
     * @param defaultConfig Default configuration for all providers
     */
    constructor(defaultConfig?: HardwareCapabilityProviderConfig);
    /**
     * Configure a specific capability provider
     * @param capability The capability to configure
     * @param config Configuration options
     */
    configureCapability(capability: HardwareSecurityCapability, config: HardwareCapabilityProviderConfig): void;
    /**
     * {@inheritdoc}
     */
    createProvider(capability: HardwareSecurityCapability, logger: Logger, config?: HardwareCapabilityProviderConfig): Promise<IHardwareCapabilityProvider>;
    /**
     * {@inheritdoc}
     */
    getSupportedCapabilities(): HardwareSecurityCapability[];
}
