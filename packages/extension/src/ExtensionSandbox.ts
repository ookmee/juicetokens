import { Logger } from '@juicetokens/common';
import { 
  Extension, 
  ExtensionConfig, 
  ExtensionContext, 
  ExtensionMessage, 
  ExtensionState, 
  IExtensionSandbox 
} from './types';
import { ExtensionConfigManager } from './ExtensionConfig';
import { ExtensionCommunication } from './ExtensionCommunication';

/**
 * Extension Sandbox
 * Provides security boundaries and context for extensions
 */
export class ExtensionSandbox implements IExtensionSandbox {
  public id: string;
  public state: ExtensionState = ExtensionState.REGISTERED;
  public context: ExtensionContext;
  private cachedConfig: ExtensionConfig;

  constructor(
    public extension: Extension,
    private logger: Logger,
    private configManager: ExtensionConfigManager,
    private communication: ExtensionCommunication
  ) {
    this.id = extension.id;
    
    // Create default config for caching
    this.cachedConfig = {
      id: this.id,
      version: '1.0.0',
      enabled: true,
      settings: {}
    };
    
    // Create extension context
    this.context = {
      extensionId: this.id,
      logger: this.createScopedLogger(),
      sendMessage: this.createMessageSender(),
      getConfig: () => this.getConfig(),
      updateConfig: (settings) => this.updateConfig(settings)
    };
  }

  /**
   * Initialize the extension
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing extension: ${this.id}`);
    
    try {
      // Load initial configuration
      this.cachedConfig = await this.configManager.getConfig(this.id);
      
      // Register message handler
      if (this.extension.onMessage) {
        this.communication.registerHandler(this.id, async (message: ExtensionMessage) => {
          return this.handleMessage(message);
        });
      }
      
      // Initialize extension
      await this.extension.onInitialize(this.context);
      this.state = ExtensionState.INITIALIZED;
      this.logger.info(`Extension initialized: ${this.id}`);
    } catch (error) {
      this.state = ExtensionState.ERROR;
      this.logger.error(`Failed to initialize extension ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Activate the extension
   */
  async activate(): Promise<void> {
    this.logger.info(`Activating extension: ${this.id}`);
    
    try {
      await this.extension.onActivate();
      this.state = ExtensionState.ACTIVE;
      this.logger.info(`Extension activated: ${this.id}`);
    } catch (error) {
      this.state = ExtensionState.ERROR;
      this.logger.error(`Failed to activate extension ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate the extension
   */
  async deactivate(): Promise<void> {
    this.logger.info(`Deactivating extension: ${this.id}`);
    
    try {
      await this.extension.onDeactivate();
      this.state = ExtensionState.INITIALIZED;
      this.logger.info(`Extension deactivated: ${this.id}`);
    } catch (error) {
      this.state = ExtensionState.ERROR;
      this.logger.error(`Failed to deactivate extension ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Send a message to the extension
   */
  async sendMessage(message: ExtensionMessage): Promise<any> {
    if (!this.extension.onMessage) {
      this.logger.warn(`Extension ${this.id} does not handle messages`);
      return null;
    }
    
    try {
      return await this.handleMessage(message);
    } catch (error) {
      this.logger.error(`Error handling message in extension ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Update the extension configuration
   */
  async updateConfig(settings: Record<string, any>): Promise<void> {
    await this.configManager.updateConfig(this.id, settings);
    // Update cached config
    this.cachedConfig = await this.configManager.getConfig(this.id);
  }

  /**
   * Get the current extension configuration
   */
  private getConfig(): ExtensionConfig {
    return this.cachedConfig;
  }

  /**
   * Create a scoped logger for the extension
   */
  private createScopedLogger(): Logger {
    const prefix = `[Extension:${this.id}]`;
    return {
      debug: (message: string, ...args: any[]) => 
        this.logger.debug(`${prefix} ${message}`, ...args),
      info: (message: string, ...args: any[]) => 
        this.logger.info(`${prefix} ${message}`, ...args),
      warn: (message: string, ...args: any[]) => 
        this.logger.warn(`${prefix} ${message}`, ...args),
      error: (message: string, ...args: any[]) => 
        this.logger.error(`${prefix} ${message}`, ...args)
    };
  }

  /**
   * Create a message sender function for the extension context
   */
  private createMessageSender(): (message: Omit<ExtensionMessage, 'source' | 'timestamp'>) => Promise<void> {
    return async (message) => {
      const fullMessage: ExtensionMessage = {
        ...message,
        source: this.id,
        timestamp: Date.now()
      };
      await this.communication.sendMessage(fullMessage);
    };
  }

  /**
   * Handle a message sent to this extension
   */
  private async handleMessage(message: ExtensionMessage): Promise<any> {
    // Skip if no message handler
    if (!this.extension.onMessage) {
      return null;
    }
    
    // Validate message
    if (message.target !== this.id) {
      this.logger.warn(`Received message for ${message.target} but this sandbox is for ${this.id}`);
      return null;
    }
    
    // Process in try/catch to prevent extension errors from affecting the system
    try {
      return await this.extension.onMessage(message);
    } catch (error) {
      this.logger.error(`Error in extension ${this.id} message handler:`, error);
      throw error;
    }
  }
} 