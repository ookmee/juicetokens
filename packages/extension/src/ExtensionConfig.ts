import { ExtensionConfig, IExtensionConfigManager } from './types';

/**
 * Extension Configuration Manager
 * Handles configuration storage and retrieval for extensions
 */
export class ExtensionConfigManager implements IExtensionConfigManager {
  // In-memory storage for configurations, in a real implementation this would use persistent storage
  private configurations: Map<string, ExtensionConfig> = new Map();
  
  /**
   * Get configuration for an extension
   */
  async getConfig(extensionId: string): Promise<ExtensionConfig> {
    // Return existing config or create a default one
    if (this.configurations.has(extensionId)) {
      return this.configurations.get(extensionId)!;
    }
    
    // Create default config
    const defaultConfig: ExtensionConfig = {
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
  async updateConfig(extensionId: string, settings: Record<string, any>): Promise<void> {
    const config = await this.getConfig(extensionId);
    
    // Update settings
    const updatedConfig: ExtensionConfig = {
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
  async resetConfig(extensionId: string): Promise<void> {
    const config = await this.getConfig(extensionId);
    
    // Keep ID and version but reset other properties
    const resetConfig: ExtensionConfig = {
      id: config.id,
      version: config.version,
      enabled: true,
      settings: {}
    };
    
    this.configurations.set(extensionId, resetConfig);
  }
} 