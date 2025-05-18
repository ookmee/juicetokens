import { Logger } from '@juicetokens/common';
import { 
  HardwareCapabilityProviderConfig, 
  HardwareCapabilityStatus, 
  HardwareSecurityCapability, 
  IHardwareCapabilityProvider, 
  IHardwareCapabilityProviderFactory 
} from './interfaces';

/**
 * Mock implementation of a hardware capability provider
 */
class MockCapabilityProvider implements IHardwareCapabilityProvider {
  public readonly capability: HardwareSecurityCapability;
  private readonly logger: Logger;
  private readonly config: HardwareCapabilityProviderConfig;
  
  /**
   * Creates a new MockCapabilityProvider
   * @param capability The capability to detect
   * @param logger Logger instance
   * @param config Configuration options
   */
  constructor(
    capability: HardwareSecurityCapability,
    logger: Logger,
    config: HardwareCapabilityProviderConfig = {}
  ) {
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
  public async detect(): Promise<HardwareCapabilityStatus> {
    // Introduce some random delay (50-200ms) to simulate detection process
    const delay = 50 + Math.floor(Math.random() * 150);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.logger.debug(`Mock detection of ${this.capability} completed`);
    
    return {
      capability: this.capability,
      available: this.config.mockAvailable!,
      version: this.config.mockVersion,
      details: this.config.mockDetails
    };
  }
}

/**
 * Factory that creates mock hardware capability providers for testing
 */
export class MockCapabilityProviderFactory implements IHardwareCapabilityProviderFactory {
  private readonly capabilityConfigs: Map<HardwareSecurityCapability, HardwareCapabilityProviderConfig> = new Map();
  
  /**
   * Creates a new MockCapabilityProviderFactory
   * @param defaultConfig Default configuration for all providers
   */
  constructor(private readonly defaultConfig: HardwareCapabilityProviderConfig = {}) {}
  
  /**
   * Configure a specific capability provider
   * @param capability The capability to configure
   * @param config Configuration options
   */
  public configureCapability(
    capability: HardwareSecurityCapability, 
    config: HardwareCapabilityProviderConfig
  ): void {
    this.capabilityConfigs.set(capability, config);
  }
  
  /**
   * {@inheritdoc}
   */
  public async createProvider(
    capability: HardwareSecurityCapability,
    logger: Logger,
    config?: HardwareCapabilityProviderConfig
  ): Promise<IHardwareCapabilityProvider> {
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
  public getSupportedCapabilities(): HardwareSecurityCapability[] {
    // Mock factory supports all capabilities
    return Object.values(HardwareSecurityCapability);
  }
} 