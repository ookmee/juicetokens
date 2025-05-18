// Export interfaces
export * from './interfaces';

// Export factories
export * from './factories';

// Export environment utilities
export * from './environment';

// Export configuration
export * from './config';

// Export utility methods for simplified adapter setup
import { 
  StorageAdapterFactory, 
  NetworkAdapterFactory, 
  HardwareAdapterFactory 
} from './factories';

import {
  EnvironmentDetector,
  PlatformType,
  getPlatformInfo
} from './environment';

import {
  AdapterConfigManager,
  AdaptersConfig
} from './config';

/**
 * Initialize the core adapters framework
 */
export function initAdapters(config?: AdaptersConfig): void {
  // Set configuration if provided
  if (config) {
    AdapterConfigManager.getInstance().setConfig(config);
  }

  // Auto-select adapters if enabled in config
  const globalConfig = AdapterConfigManager.getInstance().getGlobalConfig();
  if (globalConfig && globalConfig.autoSelectAdapters) {
    const detector = EnvironmentDetector.getInstance();
    
    // Try to auto-select best storage adapter
    const storageAdapterId = detector.selectBestStorageAdapter();
    if (storageAdapterId) {
      StorageAdapterFactory.getInstance().setDefaultAdapter(storageAdapterId);
    }
    
    // Try to auto-select best network adapter
    const networkAdapterId = detector.selectBestNetworkAdapter();
    if (networkAdapterId) {
      NetworkAdapterFactory.getInstance().setDefaultAdapter(networkAdapterId);
    }
    
    // Try to auto-select best hardware adapter
    const hardwareAdapterId = detector.selectBestHardwareAdapter();
    if (hardwareAdapterId) {
      HardwareAdapterFactory.getInstance().setDefaultAdapter(hardwareAdapterId);
    }
  }
}

/**
 * Get the current platform information
 */
export function getCurrentPlatform() {
  return getPlatformInfo();
}

/**
 * Reset the adapter system to defaults
 */
export function resetAdapters(): void {
  // Reset configuration
  AdapterConfigManager.getInstance().resetConfig();
  
  // Reset factories
  const storageFactory = StorageAdapterFactory.getInstance();
  const networkFactory = NetworkAdapterFactory.getInstance();
  const hardwareFactory = HardwareAdapterFactory.getInstance();
  
  // Unregister all adapters
  for (const adapter of storageFactory.getAllAdapters()) {
    storageFactory.unregister(adapter.id);
  }
  
  for (const adapter of networkFactory.getAllAdapters()) {
    networkFactory.unregister(adapter.id);
  }
  
  for (const adapter of hardwareFactory.getAllAdapters()) {
    hardwareFactory.unregister(adapter.id);
  }
} 