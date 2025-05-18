import { Logger } from '@juicetokens/common';
import { ExtensionManager } from '../ExtensionManager';
import { ExtensionConfigManager } from '../ExtensionConfig';
import { ExtensionCommunication } from '../ExtensionCommunication';
import { Extension, ExtensionCapability, ExtensionContext, ExtensionEventType, ExtensionMessage } from '../types';
import { NotificationExtension, TokenWatcherExtension } from '../example';

// Mock logger for testing
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Helper to create a mock extension
const createMockExtension = (id: string): Extension => {
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
    onMessage: jest.fn().mockImplementation((message: ExtensionMessage) => {
      return Promise.resolve({ echo: message.payload });
    })
  };
};

describe('Extension System', () => {
  let manager: ExtensionManager;
  let configManager: ExtensionConfigManager;
  let communication: ExtensionCommunication;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create fresh instances for each test
    configManager = new ExtensionConfigManager();
    communication = new ExtensionCommunication();
    manager = new ExtensionManager(mockLogger, configManager, communication);
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
      manager.addEventListener(ExtensionEventType.ACTIVATED, eventHandler);
      
      const extension = createMockExtension('test-extension-3');
      await manager.registerExtension(extension);
      await manager.activateExtension('test-extension-3');
      
      expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining({
        type: ExtensionEventType.ACTIVATED,
        extensionId: 'test-extension-3'
      }));
    });
    
    test('should send messages between extensions', async () => {
      const extension1 = createMockExtension('test-extension-4');
      const extension2 = createMockExtension('test-extension-5');
      
      await manager.registerExtension(extension1);
      await manager.registerExtension(extension2);
      
      const message: ExtensionMessage = {
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
      const notificationExt = new NotificationExtension();
      
      await manager.registerExtension(notificationExt);
      await manager.activateExtension(notificationExt.id);
      
      const message: ExtensionMessage = {
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
      const notificationExt = new NotificationExtension();
      const tokenWatcherExt = new TokenWatcherExtension();
      
      await manager.registerExtension(notificationExt);
      await manager.registerExtension(tokenWatcherExt);
      
      await manager.activateExtension(notificationExt.id);
      await manager.activateExtension(tokenWatcherExt.id);
      
      const message: ExtensionMessage = {
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