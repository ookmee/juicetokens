"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionSandbox = void 0;
const types_1 = require("./types");
/**
 * Extension Sandbox
 * Provides security boundaries and context for extensions
 */
class ExtensionSandbox {
    constructor(extension, logger, configManager, communication) {
        this.extension = extension;
        this.logger = logger;
        this.configManager = configManager;
        this.communication = communication;
        this.state = types_1.ExtensionState.REGISTERED;
        this.id = extension.id;
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
    async initialize() {
        this.logger.info(`Initializing extension: ${this.id}`);
        try {
            // Register message handler
            if (this.extension.onMessage) {
                this.communication.registerHandler(this.id, async (message) => {
                    return this.handleMessage(message);
                });
            }
            // Initialize extension
            await this.extension.onInitialize(this.context);
            this.state = types_1.ExtensionState.INITIALIZED;
            this.logger.info(`Extension initialized: ${this.id}`);
        }
        catch (error) {
            this.state = types_1.ExtensionState.ERROR;
            this.logger.error(`Failed to initialize extension ${this.id}:`, error);
            throw error;
        }
    }
    /**
     * Activate the extension
     */
    async activate() {
        this.logger.info(`Activating extension: ${this.id}`);
        try {
            await this.extension.onActivate();
            this.state = types_1.ExtensionState.ACTIVE;
            this.logger.info(`Extension activated: ${this.id}`);
        }
        catch (error) {
            this.state = types_1.ExtensionState.ERROR;
            this.logger.error(`Failed to activate extension ${this.id}:`, error);
            throw error;
        }
    }
    /**
     * Deactivate the extension
     */
    async deactivate() {
        this.logger.info(`Deactivating extension: ${this.id}`);
        try {
            await this.extension.onDeactivate();
            this.state = types_1.ExtensionState.INITIALIZED;
            this.logger.info(`Extension deactivated: ${this.id}`);
        }
        catch (error) {
            this.state = types_1.ExtensionState.ERROR;
            this.logger.error(`Failed to deactivate extension ${this.id}:`, error);
            throw error;
        }
    }
    /**
     * Send a message to the extension
     */
    async sendMessage(message) {
        if (!this.extension.onMessage) {
            this.logger.warn(`Extension ${this.id} does not handle messages`);
            return null;
        }
        try {
            return await this.handleMessage(message);
        }
        catch (error) {
            this.logger.error(`Error handling message in extension ${this.id}:`, error);
            throw error;
        }
    }
    /**
     * Update the extension configuration
     */
    async updateConfig(settings) {
        return this.configManager.updateConfig(this.id, settings);
    }
    /**
     * Get the current extension configuration
     */
    async getConfig() {
        return this.configManager.getConfig(this.id);
    }
    /**
     * Create a scoped logger for the extension
     */
    createScopedLogger() {
        const prefix = `[Extension:${this.id}]`;
        return {
            debug: (message, ...args) => this.logger.debug(`${prefix} ${message}`, ...args),
            info: (message, ...args) => this.logger.info(`${prefix} ${message}`, ...args),
            warn: (message, ...args) => this.logger.warn(`${prefix} ${message}`, ...args),
            error: (message, ...args) => this.logger.error(`${prefix} ${message}`, ...args)
        };
    }
    /**
     * Create a message sender function for the extension context
     */
    createMessageSender() {
        return async (message) => {
            const fullMessage = {
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
    async handleMessage(message) {
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
        }
        catch (error) {
            this.logger.error(`Error in extension ${this.id} message handler:`, error);
            throw error;
        }
    }
}
exports.ExtensionSandbox = ExtensionSandbox;
//# sourceMappingURL=ExtensionSandbox.js.map