import { 
  AdaptersConfig, 
  StorageAdapterConfig,
  NetworkAdapterConfig,
  HardwareAdapterConfig
} from './types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: AdaptersConfig = {
  global: {
    autoSelectAdapters: true,
    defaultPriority: 100,
    enableAdapterFallback: true,
    logLevel: 'info'
  }
};

/**
 * Configuration manager for JuiceTokens adapters
 */
export class AdapterConfigManager {
  private static instance: AdapterConfigManager;
  private config: AdaptersConfig;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AdapterConfigManager {
    if (!AdapterConfigManager.instance) {
      AdapterConfigManager.instance = new AdapterConfigManager();
    }
    return AdapterConfigManager.instance;
  }

  /**
   * Set configuration object
   */
  public setConfig(config: AdaptersConfig): void {
    // Merge with existing config to maintain defaults
    this.config = {
      storage: config.storage || this.config.storage,
      network: config.network || this.config.network,
      hardware: config.hardware || this.config.hardware,
      global: { ...DEFAULT_CONFIG.global, ...config.global }
    };
  }

  /**
   * Get the complete configuration
   */
  public getConfig(): AdaptersConfig {
    return this.config;
  }

  /**
   * Get global configuration
   */
  public getGlobalConfig(): AdaptersConfig['global'] {
    return this.config.global || DEFAULT_CONFIG.global;
  }

  /**
   * Get configuration for storage adapters
   */
  public getStorageConfig(): StorageAdapterConfig[] {
    return this.config.storage || [];
  }

  /**
   * Get configuration for network adapters
   */
  public getNetworkConfig(): NetworkAdapterConfig[] {
    return this.config.network || [];
  }

  /**
   * Get configuration for hardware adapters
   */
  public getHardwareConfig(): HardwareAdapterConfig[] {
    return this.config.hardware || [];
  }

  /**
   * Get configuration for a specific storage adapter
   */
  public getStorageAdapterConfig(adapterId: string): StorageAdapterConfig | undefined {
    return this.getStorageConfig().find(c => c.id === adapterId);
  }

  /**
   * Get configuration for a specific network adapter
   */
  public getNetworkAdapterConfig(adapterId: string): NetworkAdapterConfig | undefined {
    return this.getNetworkConfig().find(c => c.id === adapterId);
  }

  /**
   * Get configuration for a specific hardware adapter
   */
  public getHardwareAdapterConfig(adapterId: string): HardwareAdapterConfig | undefined {
    return this.getHardwareConfig().find(c => c.id === adapterId);
  }

  /**
   * Add or update storage adapter configuration
   */
  public updateStorageAdapterConfig(config: StorageAdapterConfig): void {
    this.config.storage = this.config.storage || [];
    const index = this.config.storage.findIndex(c => c.id === config.id);
    
    if (index >= 0) {
      this.config.storage[index] = { ...this.config.storage[index], ...config };
    } else {
      this.config.storage.push(config);
    }
  }

  /**
   * Add or update network adapter configuration
   */
  public updateNetworkAdapterConfig(config: NetworkAdapterConfig): void {
    this.config.network = this.config.network || [];
    const index = this.config.network.findIndex(c => c.id === config.id);
    
    if (index >= 0) {
      this.config.network[index] = { ...this.config.network[index], ...config };
    } else {
      this.config.network.push(config);
    }
  }

  /**
   * Add or update hardware adapter configuration
   */
  public updateHardwareAdapterConfig(config: HardwareAdapterConfig): void {
    this.config.hardware = this.config.hardware || [];
    const index = this.config.hardware.findIndex(c => c.id === config.id);
    
    if (index >= 0) {
      this.config.hardware[index] = { ...this.config.hardware[index], ...config };
    } else {
      this.config.hardware.push(config);
    }
  }

  /**
   * Remove storage adapter configuration
   */
  public removeStorageAdapterConfig(adapterId: string): boolean {
    if (!this.config.storage) return false;
    
    const index = this.config.storage.findIndex(c => c.id === adapterId);
    if (index >= 0) {
      this.config.storage.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove network adapter configuration
   */
  public removeNetworkAdapterConfig(adapterId: string): boolean {
    if (!this.config.network) return false;
    
    const index = this.config.network.findIndex(c => c.id === adapterId);
    if (index >= 0) {
      this.config.network.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove hardware adapter configuration
   */
  public removeHardwareAdapterConfig(adapterId: string): boolean {
    if (!this.config.hardware) return false;
    
    const index = this.config.hardware.findIndex(c => c.id === adapterId);
    if (index >= 0) {
      this.config.hardware.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
  }
} 