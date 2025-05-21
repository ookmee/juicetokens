"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
// Add Jest types
const globals_1 = require("@jest/globals");
// Mock implementations of adapters for testing
class MemoryStorageAdapter {
    constructor() {
        this.id = 'memory-storage';
        this.storage = new Map();
    }
    async store(key, data) {
        this.storage.set(key, data);
    }
    async retrieve(key) {
        return this.storage.get(key);
    }
    async delete(key) {
        this.storage.delete(key);
    }
    async exists(key) {
        return this.storage.has(key);
    }
    async clear() {
        this.storage.clear();
    }
}
class HttpNetworkAdapter {
    constructor() {
        this.id = 'http-network';
    }
    async get(url, options) {
        // Mock implementation
        return {
            data: { success: true },
            statusCode: 200,
            headers: {
                'content-type': 'application/json'
            }
        };
    }
    async post(url, data, options) {
        // Mock implementation
        return {
            data: { success: true, id: '123' },
            statusCode: 201,
            headers: {
                'content-type': 'application/json'
            }
        };
    }
    async put(url, data, options) {
        // Mock implementation
        return {
            data: { success: true },
            statusCode: 200,
            headers: {
                'content-type': 'application/json'
            }
        };
    }
    async delete(url, options) {
        // Mock implementation
        return {
            data: { success: true },
            statusCode: 204,
            headers: {}
        };
    }
    openWebSocket(url, protocols) {
        throw new Error('WebSocket not implemented in mock');
    }
}
class TestHardwareAdapter {
    constructor() {
        this.id = 'test-hardware';
    }
    async initialize() {
        // Mock implementation
    }
    async getInfo() {
        return {
            deviceId: 'test-device-001',
            model: 'Test Model X1',
            manufacturer: 'Test Manufacturer',
            firmwareVersion: '1.0.0',
            capabilities: ['test', 'mock', 'simulation']
        };
    }
    async isFeatureAvailable(featureId) {
        return ['test', 'mock', 'simulation'].includes(featureId);
    }
    async executeCommand(command, params) {
        if (command === 'echo') {
            return params;
        }
        throw new Error(`Unknown command: ${command}`);
    }
    async shutdown() {
        // Mock implementation
    }
}
(0, globals_1.describe)('Adapter Pattern Demo', () => {
    // Reset adapters before each test
    (0, globals_1.beforeEach)(() => {
        (0, src_1.resetAdapters)();
    });
    (0, globals_1.test)('Storage adapter registration and usage', async () => {
        // Register a storage adapter
        const memoryStorage = new MemoryStorageAdapter();
        src_1.StorageAdapterFactory.getInstance().register(memoryStorage);
        // Use the storage adapter
        const storage = src_1.StorageAdapterFactory.getInstance().getDefaultAdapter();
        // Store and retrieve data
        await storage.store('test-key', { message: 'Hello, World!' });
        const data = await storage.retrieve('test-key');
        (0, globals_1.expect)(data).toEqual({ message: 'Hello, World!' });
        (0, globals_1.expect)(await storage.exists('test-key')).toBe(true);
        // Delete data
        await storage.delete('test-key');
        (0, globals_1.expect)(await storage.exists('test-key')).toBe(false);
    });
    (0, globals_1.test)('Network adapter registration and usage', async () => {
        // Register a network adapter
        const httpAdapter = new HttpNetworkAdapter();
        src_1.NetworkAdapterFactory.getInstance().register(httpAdapter);
        // Use the network adapter
        const network = src_1.NetworkAdapterFactory.getInstance().getDefaultAdapter();
        // Make HTTP requests
        const getResponse = await network.get('https://api.example.com/resource');
        (0, globals_1.expect)(getResponse.statusCode).toBe(200);
        const postResponse = await network.post('https://api.example.com/resource', { data: 'test' });
        (0, globals_1.expect)(postResponse.statusCode).toBe(201);
    });
    (0, globals_1.test)('Hardware adapter registration and usage', async () => {
        // Register a hardware adapter
        const testHardware = new TestHardwareAdapter();
        src_1.HardwareAdapterFactory.getInstance().register(testHardware);
        // Use the hardware adapter
        const hardware = src_1.HardwareAdapterFactory.getInstance().getDefaultAdapter();
        // Initialize hardware
        await hardware.initialize();
        // Get hardware info
        const info = await hardware.getInfo();
        (0, globals_1.expect)(info.deviceId).toBe('test-device-001');
        // Check feature availability
        (0, globals_1.expect)(await hardware.isFeatureAvailable('test')).toBe(true);
        (0, globals_1.expect)(await hardware.isFeatureAvailable('unknown')).toBe(false);
        // Execute command
        const result = await hardware.executeCommand('echo', { value: 'test' });
        (0, globals_1.expect)(result).toEqual({ value: 'test' });
    });
    (0, globals_1.test)('Configuration system', () => {
        // Set configuration
        const config = {
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
        src_1.AdapterConfigManager.getInstance().setConfig(config);
        // Verify configuration
        const storageConfig = src_1.AdapterConfigManager.getInstance().getStorageAdapterConfig('memory-storage');
        (0, globals_1.expect)(storageConfig).toBeDefined();
        (0, globals_1.expect)(storageConfig?.enabled).toBe(true);
        (0, globals_1.expect)(storageConfig?.useEncryption).toBe(false);
        const networkConfig = src_1.AdapterConfigManager.getInstance().getNetworkAdapterConfig('http-network');
        (0, globals_1.expect)(networkConfig).toBeDefined();
        (0, globals_1.expect)(networkConfig?.timeout).toBe(5000);
    });
    (0, globals_1.test)('Environment detection', () => {
        const platformInfo = (0, src_1.getPlatformInfo)();
        (0, globals_1.expect)(platformInfo).toBeDefined();
        (0, globals_1.expect)(typeof platformInfo.type).toBe('string');
    });
    (0, globals_1.test)('Complete adapter system initialization', () => {
        // Register adapters
        const memoryStorage = new MemoryStorageAdapter();
        const httpAdapter = new HttpNetworkAdapter();
        const testHardware = new TestHardwareAdapter();
        src_1.StorageAdapterFactory.getInstance().register(memoryStorage);
        src_1.NetworkAdapterFactory.getInstance().register(httpAdapter);
        src_1.HardwareAdapterFactory.getInstance().register(testHardware);
        // Set configuration
        const config = {
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
        (0, src_1.initAdapters)(config);
        // Verify defaults are set
        (0, globals_1.expect)(src_1.StorageAdapterFactory.getInstance().getDefaultAdapter().id).toBe('memory-storage');
        (0, globals_1.expect)(src_1.NetworkAdapterFactory.getInstance().getDefaultAdapter().id).toBe('http-network');
        (0, globals_1.expect)(src_1.HardwareAdapterFactory.getInstance().getDefaultAdapter().id).toBe('test-hardware');
    });
});
//# sourceMappingURL=adapter-demo.test.js.map