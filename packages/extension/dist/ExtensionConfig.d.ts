import { ExtensionConfig, IExtensionConfigManager } from './types';
/**
 * Extension Configuration Manager
 * Handles configuration storage and retrieval for extensions
 */
export declare class ExtensionConfigManager implements IExtensionConfigManager {
    private configurations;
    /**
     * Get configuration for an extension
     */
    getConfig(extensionId: string): Promise<ExtensionConfig>;
    /**
     * Update configuration for an extension
     */
    updateConfig(extensionId: string, settings: Record<string, any>): Promise<void>;
    /**
     * Reset configuration to defaults
     */
    resetConfig(extensionId: string): Promise<void>;
}
