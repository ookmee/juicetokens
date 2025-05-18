import { ExtensionMessage, IExtensionCommunication } from './types';
/**
 * Extension Communication
 * Handles message passing between extensions
 */
export declare class ExtensionCommunication implements IExtensionCommunication {
    private handlers;
    /**
     * Send a message to an extension
     */
    sendMessage(message: ExtensionMessage): Promise<any>;
    /**
     * Register a message handler for an extension
     */
    registerHandler(extensionId: string, handler: (message: ExtensionMessage) => Promise<any>): void;
    /**
     * Unregister a message handler for an extension
     */
    unregisterHandler(extensionId: string): void;
}
