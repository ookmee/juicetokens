import { Logger } from '@juicetokens/common';
import { HardwareCapabilityProviderConfig, HardwareCapabilityStatus, HardwareSecurityCapability, IHardwareCapabilityDetector, IHardwareCapabilityProviderFactory } from './interfaces';
/**
 * Configuration for HardwareCapabilityDetector
 */
export interface HardwareCapabilityDetectorConfig {
    /**
     * Weight of each capability in the security level calculation
     */
    securityLevelWeights?: {
        [key in HardwareSecurityCapability]?: number;
    };
    /**
     * Default configuration for providers
     */
    providerConfig?: HardwareCapabilityProviderConfig;
}
/**
 * Implements hardware capability detection
 */
export declare class HardwareCapabilityDetector implements IHardwareCapabilityDetector {
    private readonly logger;
    private readonly factory;
    private readonly config;
    private readonly providers;
    /**
     * Creates a new HardwareCapabilityDetector
     * @param logger Logger instance
     * @param factory Factory for creating capability providers
     * @param config Configuration options
     */
    constructor(logger: Logger, factory: IHardwareCapabilityProviderFactory, config?: HardwareCapabilityDetectorConfig);
    /**
     * Initialize providers for all supported capabilities
     */
    private initializeProviders;
    /**
     * {@inheritdoc}
     */
    detectCapability(capability: HardwareSecurityCapability): Promise<HardwareCapabilityStatus>;
    /**
     * {@inheritdoc}
     */
    detectAllCapabilities(): Promise<HardwareCapabilityStatus[]>;
    /**
     * {@inheritdoc}
     */
    getSecurityLevel(): Promise<number>;
}
