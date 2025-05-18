/**
 * Basic adapter configuration interface
 */
export interface AdapterConfig {
  id: string;
  enabled: boolean;
  priority?: number;
  options?: Record<string, any>;
}

/**
 * Storage adapter specific configuration
 */
export interface StorageAdapterConfig extends AdapterConfig {
  useEncryption?: boolean;
  encryptionKey?: string;
  maxStorageSize?: number;
  compressData?: boolean;
}

/**
 * Network adapter specific configuration
 */
export interface NetworkAdapterConfig extends AdapterConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  cacheStrategy?: 'none' | 'memory' | 'storage';
}

/**
 * Hardware adapter specific configuration
 */
export interface HardwareAdapterConfig extends AdapterConfig {
  autoInitialize?: boolean;
  pollingInterval?: number;
  requiredCapabilities?: string[];
  fallbackAdapter?: string;
}

/**
 * Complete adapter configuration
 */
export interface AdaptersConfig {
  storage?: StorageAdapterConfig[];
  network?: NetworkAdapterConfig[];
  hardware?: HardwareAdapterConfig[];
  global?: {
    autoSelectAdapters?: boolean;
    defaultPriority?: number;
    enableAdapterFallback?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  };
} 