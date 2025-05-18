"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionConfigManager = void 0;
/**
 * Extension Configuration Manager
 * Handles configuration storage and retrieval for extensions
 */
class ExtensionConfigManager {
    constructor() {
        // In-memory storage for configurations, in a real implementation this would use persistent storage
        this.configurations = new Map();
    }
    /**
     * Get configuration for an extension
     */
    async getConfig(extensionId) {
        // Return existing config or create a default one
        if (this.configurations.has(extensionId)) {
            return this.configurations.get(extensionId);
        }
        // Create default config
        const defaultConfig = {
            id: extensionId,
            version: '1.0.0',
            enabled: true,
            settings: {}
        };
        this.configurations.set(extensionId, defaultConfig);
        return defaultConfig;
    }
    /**
     * Update configuration for an extension
     */
    async updateConfig(extensionId, settings) {
        const config = await this.getConfig(extensionId);
        // Update settings
        const updatedConfig = {
            ...config,
            settings: {
                ...config.settings,
                ...settings
            }
        };
        this.configurations.set(extensionId, updatedConfig);
    }
    /**
     * Reset configuration to defaults
     */
    async resetConfig(extensionId) {
        const config = await this.getConfig(extensionId);
        // Keep ID and version but reset other properties
        const resetConfig = {
            id: config.id,
            version: config.version,
            enabled: true,
            settings: {}
        };
        this.configurations.set(extensionId, resetConfig);
    }
}
exports.ExtensionConfigManager = ExtensionConfigManager;
//# sourceMappingURL=ExtensionConfig.js.map