"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterConfigManager = void 0;
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
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
class AdapterConfigManager {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!AdapterConfigManager.instance) {
            AdapterConfigManager.instance = new AdapterConfigManager();
        }
        return AdapterConfigManager.instance;
    }
    /**
     * Set configuration object
     */
    setConfig(config) {
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
    getConfig() {
        return this.config;
    }
    /**
     * Get global configuration
     */
    getGlobalConfig() {
        return this.config.global || DEFAULT_CONFIG.global;
    }
    /**
     * Get configuration for storage adapters
     */
    getStorageConfig() {
        return this.config.storage || [];
    }
    /**
     * Get configuration for network adapters
     */
    getNetworkConfig() {
        return this.config.network || [];
    }
    /**
     * Get configuration for hardware adapters
     */
    getHardwareConfig() {
        return this.config.hardware || [];
    }
    /**
     * Get configuration for a specific storage adapter
     */
    getStorageAdapterConfig(adapterId) {
        return this.getStorageConfig().find(c => c.id === adapterId);
    }
    /**
     * Get configuration for a specific network adapter
     */
    getNetworkAdapterConfig(adapterId) {
        return this.getNetworkConfig().find(c => c.id === adapterId);
    }
    /**
     * Get configuration for a specific hardware adapter
     */
    getHardwareAdapterConfig(adapterId) {
        return this.getHardwareConfig().find(c => c.id === adapterId);
    }
    /**
     * Add or update storage adapter configuration
     */
    updateStorageAdapterConfig(config) {
        this.config.storage = this.config.storage || [];
        const index = this.config.storage.findIndex(c => c.id === config.id);
        if (index >= 0) {
            this.config.storage[index] = { ...this.config.storage[index], ...config };
        }
        else {
            this.config.storage.push(config);
        }
    }
    /**
     * Add or update network adapter configuration
     */
    updateNetworkAdapterConfig(config) {
        this.config.network = this.config.network || [];
        const index = this.config.network.findIndex(c => c.id === config.id);
        if (index >= 0) {
            this.config.network[index] = { ...this.config.network[index], ...config };
        }
        else {
            this.config.network.push(config);
        }
    }
    /**
     * Add or update hardware adapter configuration
     */
    updateHardwareAdapterConfig(config) {
        this.config.hardware = this.config.hardware || [];
        const index = this.config.hardware.findIndex(c => c.id === config.id);
        if (index >= 0) {
            this.config.hardware[index] = { ...this.config.hardware[index], ...config };
        }
        else {
            this.config.hardware.push(config);
        }
    }
    /**
     * Remove storage adapter configuration
     */
    removeStorageAdapterConfig(adapterId) {
        if (!this.config.storage)
            return false;
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
    removeNetworkAdapterConfig(adapterId) {
        if (!this.config.network)
            return false;
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
    removeHardwareAdapterConfig(adapterId) {
        if (!this.config.hardware)
            return false;
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
    resetConfig() {
        this.config = { ...DEFAULT_CONFIG };
    }
}
exports.AdapterConfigManager = AdapterConfigManager;
//# sourceMappingURL=manager.js.map