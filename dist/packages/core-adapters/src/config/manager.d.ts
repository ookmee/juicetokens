import { AdaptersConfig, StorageAdapterConfig, NetworkAdapterConfig, HardwareAdapterConfig } from './types';
/**
 * Configuration manager for JuiceTokens adapters
 */
export declare class AdapterConfigManager {
    private static instance;
    private config;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): AdapterConfigManager;
    /**
     * Set configuration object
     */
    setConfig(config: AdaptersConfig): void;
    /**
     * Get the complete configuration
     */
    getConfig(): AdaptersConfig;
    /**
     * Get global configuration
     */
    getGlobalConfig(): AdaptersConfig['global'];
    /**
     * Get configuration for storage adapters
     */
    getStorageConfig(): StorageAdapterConfig[];
    /**
     * Get configuration for network adapters
     */
    getNetworkConfig(): NetworkAdapterConfig[];
    /**
     * Get configuration for hardware adapters
     */
    getHardwareConfig(): HardwareAdapterConfig[];
    /**
     * Get configuration for a specific storage adapter
     */
    getStorageAdapterConfig(adapterId: string): StorageAdapterConfig | undefined;
    /**
     * Get configuration for a specific network adapter
     */
    getNetworkAdapterConfig(adapterId: string): NetworkAdapterConfig | undefined;
    /**
     * Get configuration for a specific hardware adapter
     */
    getHardwareAdapterConfig(adapterId: string): HardwareAdapterConfig | undefined;
    /**
     * Add or update storage adapter configuration
     */
    updateStorageAdapterConfig(config: StorageAdapterConfig): void;
    /**
     * Add or update network adapter configuration
     */
    updateNetworkAdapterConfig(config: NetworkAdapterConfig): void;
    /**
     * Add or update hardware adapter configuration
     */
    updateHardwareAdapterConfig(config: HardwareAdapterConfig): void;
    /**
     * Remove storage adapter configuration
     */
    removeStorageAdapterConfig(adapterId: string): boolean;
    /**
     * Remove network adapter configuration
     */
    removeNetworkAdapterConfig(adapterId: string): boolean;
    /**
     * Remove hardware adapter configuration
     */
    removeHardwareAdapterConfig(adapterId: string): boolean;
    /**
     * Reset configuration to defaults
     */
    resetConfig(): void;
}
