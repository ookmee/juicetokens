import { PlatformType, getPlatformInfo } from './platform';
import { StorageAdapterFactory, NetworkAdapterFactory, HardwareAdapterFactory } from '../factories';
import { StorageAdapter, NetworkAdapter, HardwareAdapter } from '../interfaces';

/**
 * Type for adapter selection strategy function
 */
type AdapterSelector<T> = (availableAdapters: T[], platformType: PlatformType, isMobile: boolean) => string | null;

/**
 * Class for detecting environment and selecting appropriate adapters
 */
export class EnvironmentDetector {
  private static instance: EnvironmentDetector;
  private storageSelector: AdapterSelector<StorageAdapter> | null = null;
  private networkSelector: AdapterSelector<NetworkAdapter> | null = null;
  private hardwareSelector: AdapterSelector<HardwareAdapter> | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentDetector {
    if (!EnvironmentDetector.instance) {
      EnvironmentDetector.instance = new EnvironmentDetector();
    }
    return EnvironmentDetector.instance;
  }

  /**
   * Set selection strategy for storage adapters
   */
  public setStorageAdapterSelector(selector: AdapterSelector<StorageAdapter>): void {
    this.storageSelector = selector;
  }

  /**
   * Set selection strategy for network adapters
   */
  public setNetworkAdapterSelector(selector: AdapterSelector<NetworkAdapter>): void {
    this.networkSelector = selector;
  }

  /**
   * Set selection strategy for hardware adapters
   */
  public setHardwareAdapterSelector(selector: AdapterSelector<HardwareAdapter>): void {
    this.hardwareSelector = selector;
  }

  /**
   * Automatically select the best storage adapter for current environment
   * @returns The ID of the selected adapter or null if none found
   */
  public selectBestStorageAdapter(): string | null {
    if (!this.storageSelector) {
      return this.defaultStorageSelector();
    }

    const platformInfo = getPlatformInfo();
    const availableAdapters = StorageAdapterFactory.getInstance().getAllAdapters();
    
    return this.storageSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
  }

  /**
   * Automatically select the best network adapter for current environment
   * @returns The ID of the selected adapter or null if none found
   */
  public selectBestNetworkAdapter(): string | null {
    if (!this.networkSelector) {
      return this.defaultNetworkSelector();
    }

    const platformInfo = getPlatformInfo();
    const availableAdapters = NetworkAdapterFactory.getInstance().getAllAdapters();
    
    return this.networkSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
  }

  /**
   * Automatically select the best hardware adapter for current environment
   * @returns The ID of the selected adapter or null if none found
   */
  public selectBestHardwareAdapter(): string | null {
    if (!this.hardwareSelector) {
      return this.defaultHardwareSelector();
    }

    const platformInfo = getPlatformInfo();
    const availableAdapters = HardwareAdapterFactory.getInstance().getAllAdapters();
    
    return this.hardwareSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
  }

  /**
   * Default strategy for selecting storage adapters
   */
  private defaultStorageSelector(): string | null {
    const platformInfo = getPlatformInfo();
    const factory = StorageAdapterFactory.getInstance();
    const adapters = factory.getAllAdapters();
    
    if (adapters.length === 0) {
      return null;
    }
    
    // Simple logic based on platform
    switch (platformInfo.type) {
      case PlatformType.BROWSER:
        // Prefer LocalStorage or IndexedDB adapters in browser
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('local') || 
              adapter.id.toLowerCase().includes('indexeddb')) {
            return adapter.id;
          }
        }
        break;
        
      case PlatformType.NODE:
        // Prefer FileSystem adapters in Node.js
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('file') || 
              adapter.id.toLowerCase().includes('fs')) {
            return adapter.id;
          }
        }
        break;
        
      case PlatformType.REACT_NATIVE:
        // Prefer AsyncStorage adapters in React Native
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('async')) {
            return adapter.id;
          }
        }
        break;
    }
    
    // Default to first available adapter if no preference
    return adapters[0].id;
  }

  /**
   * Default strategy for selecting network adapters
   */
  private defaultNetworkSelector(): string | null {
    const platformInfo = getPlatformInfo();
    const factory = NetworkAdapterFactory.getInstance();
    const adapters = factory.getAllAdapters();
    
    if (adapters.length === 0) {
      return null;
    }
    
    // Simple logic based on platform
    switch (platformInfo.type) {
      case PlatformType.BROWSER:
        // Prefer Fetch API adapters in browser
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('fetch')) {
            return adapter.id;
          }
        }
        break;
        
      case PlatformType.NODE:
        // Prefer HTTP/HTTPS module adapters in Node.js
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('http') || 
              adapter.id.toLowerCase().includes('axios')) {
            return adapter.id;
          }
        }
        break;
    }
    
    // Default to first available adapter if no preference
    return adapters[0].id;
  }

  /**
   * Default strategy for selecting hardware adapters
   */
  private defaultHardwareSelector(): string | null {
    const platformInfo = getPlatformInfo();
    const factory = HardwareAdapterFactory.getInstance();
    const adapters = factory.getAllAdapters();
    
    if (adapters.length === 0) {
      return null;
    }
    
    // Simple logic based on platform and mobile status
    if (platformInfo.isMobile) {
      // Prefer mobile-specific adapters
      for (const adapter of adapters) {
        if (adapter.id.toLowerCase().includes('mobile')) {
          return adapter.id;
        }
      }
    } else if (platformInfo.isDesktop) {
      // Prefer desktop-specific adapters
      for (const adapter of adapters) {
        if (adapter.id.toLowerCase().includes('desktop')) {
          return adapter.id;
        }
      }
    }
    
    // Platform-specific preferences
    switch (platformInfo.type) {
      case PlatformType.ELECTRON:
        for (const adapter of adapters) {
          if (adapter.id.toLowerCase().includes('electron')) {
            return adapter.id;
          }
        }
        break;
    }
    
    // Default to first available adapter if no preference
    return adapters[0].id;
  }
} 