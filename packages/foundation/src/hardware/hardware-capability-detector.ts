import { Logger } from '@juicetokens/common';
import { 
  HardwareCapabilityProviderConfig,
  HardwareCapabilityStatus, 
  HardwareSecurityCapability, 
  IHardwareCapabilityDetector, 
  IHardwareCapabilityProvider, 
  IHardwareCapabilityProviderFactory 
} from './interfaces';

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
export class HardwareCapabilityDetector implements IHardwareCapabilityDetector {
  private readonly logger: Logger;
  private readonly factory: IHardwareCapabilityProviderFactory;
  private readonly config: HardwareCapabilityDetectorConfig;
  private readonly providers: Map<HardwareSecurityCapability, IHardwareCapabilityProvider> = new Map();
  
  /**
   * Creates a new HardwareCapabilityDetector
   * @param logger Logger instance
   * @param factory Factory for creating capability providers
   * @param config Configuration options
   */
  constructor(
    logger: Logger,
    factory: IHardwareCapabilityProviderFactory,
    config: HardwareCapabilityDetectorConfig = {}
  ) {
    this.logger = logger;
    this.factory = factory;
    
    // Default configuration
    this.config = {
      securityLevelWeights: {
        [HardwareSecurityCapability.TEE]: 20,
        [HardwareSecurityCapability.TPM]: 20,
        [HardwareSecurityCapability.SE]: 15,
        [HardwareSecurityCapability.SGX]: 20,
        [HardwareSecurityCapability.TZ]: 15,
        [HardwareSecurityCapability.HSM]: 25,
        [HardwareSecurityCapability.OTP]: 10
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
  private async initializeProviders(): Promise<void> {
    const supportedCapabilities = this.factory.getSupportedCapabilities();
    
    for (const capability of supportedCapabilities) {
      try {
        const provider = await this.factory.createProvider(
          capability,
          this.logger,
          this.config.providerConfig
        );
        
        this.providers.set(capability, provider);
        this.logger.info(`Initialized provider for hardware capability: ${capability}`);
      } catch (error) {
        this.logger.error(`Failed to initialize provider for capability ${capability}: ${error}`);
      }
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async detectCapability(capability: HardwareSecurityCapability): Promise<HardwareCapabilityStatus> {
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
    } catch (error) {
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
  public async detectAllCapabilities(): Promise<HardwareCapabilityStatus[]> {
    const statuses: HardwareCapabilityStatus[] = [];
    
    for (const capability of this.providers.keys()) {
      try {
        const status = await this.detectCapability(capability);
        statuses.push(status);
      } catch (error) {
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
  public async getSecurityLevel(): Promise<number> {
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