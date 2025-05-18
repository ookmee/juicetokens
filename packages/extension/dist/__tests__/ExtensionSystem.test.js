"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExtensionManager_1 = require("../ExtensionManager");
const ExtensionConfig_1 = require("../ExtensionConfig");
const ExtensionCommunication_1 = require("../ExtensionCommunication");
const types_1 = require("../types");
const example_1 = require("../example");
// Mock logger for testing
const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
// Helper to create a mock extension
const createMockExtension = (id) => {
    return {
        id,
        name: `Test Extension ${id}`,
        version: '1.0.0',
        description: 'Test extension for unit tests',
        capabilities: [
            {
                name: 'test',
                description: 'Test capability',
                permissions: ['test:read', 'test:write']
            }
        ],
        onInitialize: jest.fn().mockResolvedValue(undefined),
        onActivate: jest.fn().mockResolvedValue(undefined),
        onDeactivate: jest.fn().mockResolvedValue(undefined),
        onMessage: jest.fn().mockImplementation((message) => {
            return Promise.resolve({ echo: message.payload });
        })
    };
};
describe('Extension System', () => {
    let manager;
    let configManager;
    let communication;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        // Create fresh instances for each test
        configManager = new ExtensionConfig_1.ExtensionConfigManager();
        communication = new ExtensionCommunication_1.ExtensionCommunication();
        manager = new ExtensionManager_1.ExtensionManager(mockLogger, configManager, communication);
    });
    describe('ExtensionManager', () => {
        test('should register and activate an extension', async () => {
            const extension = createMockExtension('test-extension-1');
            await manager.registerExtension(extension);
            expect(extension.onInitialize).toHaveBeenCalled();
            await manager.activateExtension('test-extension-1');
            expect(extension.onActivate).toHaveBeenCalled();
            expect(manager.getExtension('test-extension-1')).toBe(extension);
            expect(manager.getExtensions()).toContain(extension);
        });
        test('should deactivate and unregister an extension', async () => {
            const extension = createMockExtension('test-extension-2');
            await manager.registerExtension(extension);
            await manager.activateExtension('test-extension-2');
            await manager.deactivateExtension('test-extension-2');
            expect(extension.onDeactivate).toHaveBeenCalled();
            await manager.unregisterExtension('test-extension-2');
            expect(manager.getExtension('test-extension-2')).toBeUndefined();
        });
        test('should handle extension events', async () => {
            const eventHandler = jest.fn();
            manager.addEventListener(types_1.ExtensionEventType.ACTIVATED, eventHandler);
            const extension = createMockExtension('test-extension-3');
            await manager.registerExtension(extension);
            await manager.activateExtension('test-extension-3');
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
                type: types_1.ExtensionEventType.ACTIVATED,
                extensionId: 'test-extension-3'
            }));
        });
        test('should send messages between extensions', async () => {
            const extension1 = createMockExtension('test-extension-4');
            const extension2 = createMockExtension('test-extension-5');
            await manager.registerExtension(extension1);
            await manager.registerExtension(extension2);
            const message = {
                source: 'test-extension-4',
                target: 'test-extension-5',
                action: 'test',
                payload: { foo: 'bar' },
                timestamp: Date.now()
            };
            await manager.sendMessage(message);
            expect(extension2.onMessage).toHaveBeenCalledWith(message);
        });
    });
    describe('Extension Configuration', () => {
        test('should manage extension configuration', async () => {
            const extension = createMockExtension('test-extension-6');
            // Get default config
            const defaultConfig = await configManager.getConfig('test-extension-6');
            expect(defaultConfig.id).toBe('test-extension-6');
            expect(defaultConfig.enabled).toBe(true);
            // Update config
            await configManager.updateConfig('test-extension-6', {
                testSetting: 'value',
                testFlag: true
            });
            // Get updated config
            const updatedConfig = await configManager.getConfig('test-extension-6');
            expect(updatedConfig.settings.testSetting).toBe('value');
            expect(updatedConfig.settings.testFlag).toBe(true);
            // Reset config
            await configManager.resetConfig('test-extension-6');
            // Get reset config
            const resetConfig = await configManager.getConfig('test-extension-6');
            expect(resetConfig.settings.testSetting).toBeUndefined();
            expect(resetConfig.settings.testFlag).toBeUndefined();
        });
    });
    describe('Example Extensions', () => {
        test('should initialize and activate the Notification extension', async () => {
            const notificationExt = new example_1.NotificationExtension();
            await manager.registerExtension(notificationExt);
            await manager.activateExtension(notificationExt.id);
            const message = {
                source: 'test',
                target: notificationExt.id,
                action: 'notify',
                payload: { title: 'Test', body: 'Test notification' },
                timestamp: Date.now()
            };
            const result = await manager.sendMessage(message);
            expect(result.success).toBe(true);
        });
        test('should initialize and activate the TokenWatcher extension', async () => {
            const notificationExt = new example_1.NotificationExtension();
            const tokenWatcherExt = new example_1.TokenWatcherExtension();
            await manager.registerExtension(notificationExt);
            await manager.registerExtension(tokenWatcherExt);
            await manager.activateExtension(notificationExt.id);
            await manager.activateExtension(tokenWatcherExt.id);
            const message = {
                source: 'test',
                target: tokenWatcherExt.id,
                action: 'checkNow',
                timestamp: Date.now()
            };
            const result = await manager.sendMessage(message);
            expect(result.success).toBe(true);
            expect(result.tokensChecked).toBeGreaterThanOrEqual(0);
        });
    });
});
//# sourceMappingURL=ExtensionSystem.test.js.map