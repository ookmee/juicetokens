"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManager = void 0;
const types_1 = require("./types");
const ExtensionSandbox_1 = require("./ExtensionSandbox");
const ExtensionConfig_1 = require("./ExtensionConfig");
const ExtensionCommunication_1 = require("./ExtensionCommunication");
/**
 * Implementation of the Extension Manager
 * Responsible for registering, initializing, and lifecycle management of extensions
 */
class ExtensionManager {
    constructor(logger, configManager, communication) {
        this.logger = logger;
        this.sandboxes = new Map();
        this.extensions = new Map();
        this.extensionStates = new Map();
        this.eventListeners = new Map();
        this.configManager = configManager || new ExtensionConfig_1.ExtensionConfigManager();
        this.communication = communication || new ExtensionCommunication_1.ExtensionCommunication();
    }
    /**
     * Register a new extension
     */
    async registerExtension(extension) {
        if (this.extensions.has(extension.id)) {
            throw new Error(`Extension with ID ${extension.id} is already registered`);
        }
        this.logger.info(`Registering extension: ${extension.id} (${extension.name})`);
        this.extensions.set(extension.id, extension);
        this.extensionStates.set(extension.id, types_1.ExtensionState.REGISTERED);
        // Initialize and create sandbox
        const sandbox = new ExtensionSandbox_1.ExtensionSandbox(extension, this.logger, this.configManager, this.communication);
        this.sandboxes.set(extension.id, sandbox);
        // Initialize the extension
        try {
            await sandbox.initialize();
            this.extensionStates.set(extension.id, types_1.ExtensionState.INITIALIZED);
            this.emitEvent({
                type: types_1.ExtensionEventType.INITIALIZED,
                extensionId: extension.id,
                timestamp: Date.now()
            });
        }
        catch (error) {
            this.logger.error(`Failed to initialize extension ${extension.id}:`, error);
            this.extensionStates.set(extension.id, types_1.ExtensionState.ERROR);
            this.emitEvent({
                type: types_1.ExtensionEventType.ERROR,
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
    async unregisterExtension(extensionId) {
        const sandbox = this.sandboxes.get(extensionId);
        if (!sandbox) {
            throw new Error(`Extension with ID ${extensionId} is not registered`);
        }
        this.logger.info(`Unregistering extension: ${extensionId}`);
        // Deactivate if active
        if (this.extensionStates.get(extensionId) === types_1.ExtensionState.ACTIVE) {
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
    getExtension(extensionId) {
        return this.extensions.get(extensionId);
    }
    /**
     * Get all registered extensions
     */
    getExtensions() {
        return Array.from(this.extensions.values());
    }
    /**
     * Activate an extension
     */
    async activateExtension(extensionId) {
        const sandbox = this.sandboxes.get(extensionId);
        if (!sandbox) {
            throw new Error(`Extension with ID ${extensionId} is not registered`);
        }
        if (this.extensionStates.get(extensionId) === types_1.ExtensionState.ACTIVE) {
            this.logger.debug(`Extension ${extensionId} is already active`);
            return;
        }
        this.logger.info(`Activating extension: ${extensionId}`);
        try {
            await sandbox.activate();
            this.extensionStates.set(extensionId, types_1.ExtensionState.ACTIVE);
            this.emitEvent({
                type: types_1.ExtensionEventType.ACTIVATED,
                extensionId,
                timestamp: Date.now()
            });
        }
        catch (error) {
            this.logger.error(`Failed to activate extension ${extensionId}:`, error);
            this.extensionStates.set(extensionId, types_1.ExtensionState.ERROR);
            this.emitEvent({
                type: types_1.ExtensionEventType.ERROR,
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
    async deactivateExtension(extensionId) {
        const sandbox = this.sandboxes.get(extensionId);
        if (!sandbox) {
            throw new Error(`Extension with ID ${extensionId} is not registered`);
        }
        if (this.extensionStates.get(extensionId) !== types_1.ExtensionState.ACTIVE) {
            this.logger.debug(`Extension ${extensionId} is not active`);
            return;
        }
        this.logger.info(`Deactivating extension: ${extensionId}`);
        try {
            await sandbox.deactivate();
            this.extensionStates.set(extensionId, types_1.ExtensionState.INITIALIZED);
            this.emitEvent({
                type: types_1.ExtensionEventType.PAUSED,
                extensionId,
                timestamp: Date.now()
            });
        }
        catch (error) {
            this.logger.error(`Failed to deactivate extension ${extensionId}:`, error);
            this.extensionStates.set(extensionId, types_1.ExtensionState.ERROR);
            this.emitEvent({
                type: types_1.ExtensionEventType.ERROR,
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
    async sendMessage(message) {
        this.logger.debug(`Sending message to extension ${message.target}:`, message);
        return this.communication.sendMessage(message);
    }
    /**
     * Get the current state of an extension
     */
    getExtensionState(extensionId) {
        const state = this.extensionStates.get(extensionId);
        if (!state) {
            throw new Error(`Extension with ID ${extensionId} is not registered`);
        }
        return state;
    }
    /**
     * Add an event listener
     */
    addEventListener(type, handler) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, new Set());
        }
        this.eventListeners.get(type).add(handler);
    }
    /**
     * Remove an event listener
     */
    removeEventListener(type, handler) {
        if (this.eventListeners.has(type)) {
            this.eventListeners.get(type).delete(handler);
        }
    }
    /**
     * Emit an event to all registered listeners
     */
    emitEvent(event) {
        this.logger.debug(`Emitting event: ${event.type} for extension ${event.extensionId}`);
        // Notify type-specific listeners
        const typeListeners = this.eventListeners.get(event.type);
        if (typeListeners) {
            for (const listener of typeListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    this.logger.error(`Error in event listener for ${event.type}:`, error);
                }
            }
        }
        // Notify all listeners
        const allListeners = this.eventListeners.get('*');
        if (allListeners) {
            for (const listener of allListeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    this.logger.error('Error in global event listener:', error);
                }
            }
        }
    }
}
exports.ExtensionManager = ExtensionManager;
//# sourceMappingURL=ExtensionManager.js.map