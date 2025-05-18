import {
  StorageAdapter,
  NetworkAdapter,
  HardwareAdapter,
  StorageAdapterFactory,
  NetworkAdapterFactory,
  HardwareAdapterFactory,
  initAdapters,
  resetAdapters,
  AdapterConfigManager,
  AdaptersConfig,
  getPlatformInfo,
  HardwareInfo,
  NetworkResponse
} from '../src';

// Add Jest types
import { describe, beforeEach, test, expect } from '@jest/globals';

// Mock implementations of adapters for testing
class MemoryStorageAdapter implements StorageAdapter {
  readonly id = 'memory-storage';
  private storage: Map<string, any> = new Map();

  async store(key: string, data: any): Promise<void> {
    this.storage.set(key, data);
  }

  async retrieve(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

class HttpNetworkAdapter implements NetworkAdapter {
  readonly id = 'http-network';

  async get<T = any>(url: string, options?: any): Promise<NetworkResponse<T>> {
    // Mock implementation
    return {
      data: { success: true } as any,
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  async post<T = any>(url: string, data: any, options?: any): Promise<NetworkResponse<T>> {
    // Mock implementation
    return {
      data: { success: true, id: '123' } as any,
      statusCode: 201,
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  async put<T = any>(url: string, data: any, options?: any): Promise<NetworkResponse<T>> {
    // Mock implementation
    return {
      data: { success: true } as any,
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      }
    };
  }

  async delete<T = any>(url: string, options?: any): Promise<NetworkResponse<T>> {
    // Mock implementation
    return {
      data: { success: true } as any,
      statusCode: 204,
      headers: {}
    };
  }

  openWebSocket(url: string, protocols?: string | string[]): WebSocket {
    throw new Error('WebSocket not implemented in mock');
  }
}

class TestHardwareAdapter implements HardwareAdapter {
  readonly id = 'test-hardware';

  async initialize(): Promise<void> {
    // Mock implementation
  }

  async getInfo(): Promise<HardwareInfo> {
    return {
      deviceId: 'test-device-001',
      model: 'Test Model X1',
      manufacturer: 'Test Manufacturer',
      firmwareVersion: '1.0.0',
      capabilities: ['test', 'mock', 'simulation']
    };
  }

  async isFeatureAvailable(featureId: string): Promise<boolean> {
    return ['test', 'mock', 'simulation'].includes(featureId);
  }

  async executeCommand(command: string, params?: Record<string, any>): Promise<any> {
    if (command === 'echo') {
      return params;
    }
    throw new Error(`Unknown command: ${command}`);
  }

  async shutdown(): Promise<void> {
    // Mock implementation
  }
}

describe('Adapter Pattern Demo', () => {
  // Reset adapters before each test
  beforeEach(() => {
    resetAdapters();
  });

  test('Storage adapter registration and usage', async () => {
    // Register a storage adapter
    const memoryStorage = new MemoryStorageAdapter();
    StorageAdapterFactory.getInstance().register(memoryStorage);
    
    // Use the storage adapter
    const storage = StorageAdapterFactory.getInstance().getDefaultAdapter();
    
    // Store and retrieve data
    await storage.store('test-key', { message: 'Hello, World!' });
    const data = await storage.retrieve('test-key');
    
    expect(data).toEqual({ message: 'Hello, World!' });
    expect(await storage.exists('test-key')).toBe(true);
    
    // Delete data
    await storage.delete('test-key');
    expect(await storage.exists('test-key')).toBe(false);
  });

  test('Network adapter registration and usage', async () => {
    // Register a network adapter
    const httpAdapter = new HttpNetworkAdapter();
    NetworkAdapterFactory.getInstance().register(httpAdapter);
    
    // Use the network adapter
    const network = NetworkAdapterFactory.getInstance().getDefaultAdapter();
    
    // Make HTTP requests
    const getResponse = await network.get('https://api.example.com/resource');
    expect(getResponse.statusCode).toBe(200);
    
    const postResponse = await network.post('https://api.example.com/resource', { data: 'test' });
    expect(postResponse.statusCode).toBe(201);
  });

  test('Hardware adapter registration and usage', async () => {
    // Register a hardware adapter
    const testHardware = new TestHardwareAdapter();
    HardwareAdapterFactory.getInstance().register(testHardware);
    
    // Use the hardware adapter
    const hardware = HardwareAdapterFactory.getInstance().getDefaultAdapter();
    
    // Initialize hardware
    await hardware.initialize();
    
    // Get hardware info
    const info = await hardware.getInfo();
    expect(info.deviceId).toBe('test-device-001');
    
    // Check feature availability
    expect(await hardware.isFeatureAvailable('test')).toBe(true);
    expect(await hardware.isFeatureAvailable('unknown')).toBe(false);
    
    // Execute command
    const result = await hardware.executeCommand('echo', { value: 'test' });
    expect(result).toEqual({ value: 'test' });
  });

  test('Configuration system', () => {
    // Set configuration
    const config: AdaptersConfig = {
      storage: [
        {
          id: 'memory-storage',
          enabled: true,
          priority: 100,
          useEncryption: false
        }
      ],
      network: [
        {
          id: 'http-network',
          enabled: true,
          priority: 200,
          timeout: 5000
        }
      ],
      global: {
        autoSelectAdapters: true,
        logLevel: 'info'
      }
    };
    
    AdapterConfigManager.getInstance().setConfig(config);
    
    // Verify configuration
    const storageConfig = AdapterConfigManager.getInstance().getStorageAdapterConfig('memory-storage');
    expect(storageConfig).toBeDefined();
    expect(storageConfig?.enabled).toBe(true);
    expect(storageConfig?.useEncryption).toBe(false);
    
    const networkConfig = AdapterConfigManager.getInstance().getNetworkAdapterConfig('http-network');
    expect(networkConfig).toBeDefined();
    expect(networkConfig?.timeout).toBe(5000);
  });

  test('Environment detection', () => {
    const platformInfo = getPlatformInfo();
    expect(platformInfo).toBeDefined();
    expect(typeof platformInfo.type).toBe('string');
  });

  test('Complete adapter system initialization', () => {
    // Register adapters
    const memoryStorage = new MemoryStorageAdapter();
    const httpAdapter = new HttpNetworkAdapter();
    const testHardware = new TestHardwareAdapter();
    
    StorageAdapterFactory.getInstance().register(memoryStorage);
    NetworkAdapterFactory.getInstance().register(httpAdapter);
    HardwareAdapterFactory.getInstance().register(testHardware);
    
    // Set configuration
    const config: AdaptersConfig = {
      storage: [
        {
          id: 'memory-storage',
          enabled: true,
          useEncryption: false
        }
      ],
      network: [
        {
          id: 'http-network',
          enabled: true,
          timeout: 3000
        }
      ],
      hardware: [
        {
          id: 'test-hardware',
          enabled: true,
          autoInitialize: true
        }
      ],
      global: {
        autoSelectAdapters: true,
        enableAdapterFallback: true
      }
    };
    
    // Initialize the adapter system
    initAdapters(config);
    
    // Verify defaults are set
    expect(StorageAdapterFactory.getInstance().getDefaultAdapter().id).toBe('memory-storage');
    expect(NetworkAdapterFactory.getInstance().getDefaultAdapter().id).toBe('http-network');
    expect(HardwareAdapterFactory.getInstance().getDefaultAdapter().id).toBe('test-hardware');
  });
}); 