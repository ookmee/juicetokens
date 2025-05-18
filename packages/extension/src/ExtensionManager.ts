import { Logger } from '@juicetokens/common';
import { 
  Extension, 
  ExtensionEvent, 
  ExtensionEventType, 
  ExtensionMessage, 
  ExtensionState, 
  IExtensionManager 
} from './types';
import { ExtensionSandbox } from './ExtensionSandbox';
import { ExtensionConfigManager } from './ExtensionConfig';
import { ExtensionCommunication } from './ExtensionCommunication';

/**
 * Implementation of the Extension Manager
 * Responsible for registering, initializing, and lifecycle management of extensions
 */
export class ExtensionManager implements IExtensionManager {
  private sandboxes: Map<string, ExtensionSandbox> = new Map();
  private extensions: Map<string, Extension> = new Map();
  private extensionStates: Map<string, ExtensionState> = new Map();
  private eventListeners: Map<ExtensionEventType, Set<(event: ExtensionEvent) => void>> = new Map();
  private configManager: ExtensionConfigManager;
  private communication: ExtensionCommunication;

  constructor(
    private readonly logger: Logger,
    configManager?: ExtensionConfigManager,
    communication?: ExtensionCommunication
  ) {
    this.configManager = configManager || new ExtensionConfigManager();
    this.communication = communication || new ExtensionCommunication();
  }

  /**
   * Register a new extension
   */
  async registerExtension(extension: Extension): Promise<void> {
    if (this.extensions.has(extension.id)) {
      throw new Error(`Extension with ID ${extension.id} is already registered`);
    }

    this.logger.info(`Registering extension: ${extension.id} (${extension.name})`);
    this.extensions.set(extension.id, extension);
    this.extensionStates.set(extension.id, ExtensionState.REGISTERED);

    // Initialize and create sandbox
    const sandbox = new ExtensionSandbox(
      extension,
      this.logger,
      this.configManager,
      this.communication
    );
    
    this.sandboxes.set(extension.id, sandbox);

    // Initialize the extension
    try {
      await sandbox.initialize();
      this.extensionStates.set(extension.id, ExtensionState.INITIALIZED);
      this.emitEvent({
        type: ExtensionEventType.INITIALIZED,
        extensionId: extension.id,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Failed to initialize extension ${extension.id}:`, error);
      this.extensionStates.set(extension.id, ExtensionState.ERROR);
      this.emitEvent({
        type: ExtensionEventType.ERROR,
        extensionId: extension.id,
        timestamp: Date.now(),
        data: { error }
      });
      throw error;
    }
  }

  /**
   * Unregister an extension
   */
  async unregisterExtension(extensionId: string): Promise<void> {
    const sandbox = this.sandboxes.get(extensionId);
    if (!sandbox) {
      throw new Error(`Extension with ID ${extensionId} is not registered`);
    }

    this.logger.info(`Unregistering extension: ${extensionId}`);

    // Deactivate if active
    if (this.extensionStates.get(extensionId) === ExtensionState.ACTIVE) {
      await this.deactivateExtension(extensionId);
    }

    // Clean up
    this.sandboxes.delete(extensionId);
    this.extensions.delete(extensionId);
    this.extensionStates.delete(extensionId);
    this.communication.unregisterHandler(extensionId);
  }

  /**
   * Get a registered extension by ID
   */
  getExtension(extensionId: string): Extension | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * Get all registered extensions
   */
  getExtensions(): Extension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Activate an extension
   */
  async activateExtension(extensionId: string): Promise<void> {
    const sandbox = this.sandboxes.get(extensionId);
    if (!sandbox) {
      throw new Error(`Extension with ID ${extensionId} is not registered`);
    }

    if (this.extensionStates.get(extensionId) === ExtensionState.ACTIVE) {
      this.logger.debug(`Extension ${extensionId} is already active`);
      return;
    }

    this.logger.info(`Activating extension: ${extensionId}`);
    try {
      await sandbox.activate();
      this.extensionStates.set(extensionId, ExtensionState.ACTIVE);
      this.emitEvent({
        type: ExtensionEventType.ACTIVATED,
        extensionId,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Failed to activate extension ${extensionId}:`, error);
      this.extensionStates.set(extensionId, ExtensionState.ERROR);
      this.emitEvent({
        type: ExtensionEventType.ERROR,
        extensionId,
        timestamp: Date.now(),
        data: { error }
      });
      throw error;
    }
  }

  /**
   * Deactivate an extension
   */
  async deactivateExtension(extensionId: string): Promise<void> {
    const sandbox = this.sandboxes.get(extensionId);
    if (!sandbox) {
      throw new Error(`Extension with ID ${extensionId} is not registered`);
    }

    if (this.extensionStates.get(extensionId) !== ExtensionState.ACTIVE) {
      this.logger.debug(`Extension ${extensionId} is not active`);
      return;
    }

    this.logger.info(`Deactivating extension: ${extensionId}`);
    try {
      await sandbox.deactivate();
      this.extensionStates.set(extensionId, ExtensionState.INITIALIZED);
      this.emitEvent({
        type: ExtensionEventType.PAUSED,
        extensionId,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error(`Failed to deactivate extension ${extensionId}:`, error);
      this.extensionStates.set(extensionId, ExtensionState.ERROR);
      this.emitEvent({
        type: ExtensionEventType.ERROR,
        extensionId,
        timestamp: Date.now(),
        data: { error }
      });
      throw error;
    }
  }

  /**
   * Send a message to an extension
   */
  async sendMessage(message: ExtensionMessage): Promise<any> {
    this.logger.debug(`Sending message to extension ${message.target}:`, message);
    return this.communication.sendMessage(message);
  }

  /**
   * Get the current state of an extension
   */
  getExtensionState(extensionId: string): ExtensionState {
    const state = this.extensionStates.get(extensionId);
    if (!state) {
      throw new Error(`Extension with ID ${extensionId} is not registered`);
    }
    return state;
  }

  /**
   * Add an event listener
   */
  addEventListener(type: ExtensionEventType, handler: (event: ExtensionEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(handler);
  }

  /**
   * Remove an event listener
   */
  removeEventListener(type: ExtensionEventType, handler: (event: ExtensionEvent) => void): void {
    if (this.eventListeners.has(type)) {
      this.eventListeners.get(type)!.delete(handler);
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  private emitEvent(event: ExtensionEvent): void {
    this.logger.debug(`Emitting event: ${event.type} for extension ${event.extensionId}`);
    
    // Notify type-specific listeners
    const typeListeners = this.eventListeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try {
          listener(event);
        } catch (error) {
          this.logger.error(`Error in event listener for ${event.type}:`, error);
        }
      }
    }
    
    // Notify all listeners
    const allListeners = this.eventListeners.get('*' as ExtensionEventType);
    if (allListeners) {
      for (const listener of allListeners) {
        try {
          listener(event);
        } catch (error) {
          this.logger.error('Error in global event listener:', error);
        }
      }
    }
  }
} 