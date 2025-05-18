"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionCommunication = void 0;
/**
 * Extension Communication
 * Handles message passing between extensions
 */
class ExtensionCommunication {
    constructor() {
        // Message handlers map
        this.handlers = new Map();
    }
    /**
     * Send a message to an extension
     */
    async sendMessage(message) {
        if (!message.target) {
            throw new Error('Message must specify a target extension');
        }
        // Find the target extension handler
        const handler = this.handlers.get(message.target);
        if (!handler) {
            throw new Error(`No handler registered for extension: ${message.target}`);
        }
        // Deliver the message
        try {
            return await handler(message);
        }
        catch (error) {
            console.error(`Error in message handler for ${message.target}:`, error);
            throw error;
        }
    }
    /**
     * Register a message handler for an extension
     */
    registerHandler(extensionId, handler) {
        if (this.handlers.has(extensionId)) {
            console.warn(`Replacing existing message handler for extension: ${extensionId}`);
        }
        this.handlers.set(extensionId, handler);
    }
    /**
     * Unregister a message handler for an extension
     */
    unregisterHandler(extensionId) {
        this.handlers.delete(extensionId);
    }
}
exports.ExtensionCommunication = ExtensionCommunication;
//# sourceMappingURL=ExtensionCommunication.js.map