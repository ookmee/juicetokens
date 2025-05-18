import { Logger } from '@juicetokens/common';
import { Extension, ExtensionContext, ExtensionMessage, ExtensionState, IExtensionSandbox } from './types';
import { ExtensionConfigManager } from './ExtensionConfig';
import { ExtensionCommunication } from './ExtensionCommunication';
/**
 * Extension Sandbox
 * Provides security boundaries and context for extensions
 */
export declare class ExtensionSandbox implements IExtensionSandbox {
    extension: Extension;
    private logger;
    private configManager;
    private communication;
    id: string;
    state: ExtensionState;
    context: ExtensionContext;
    constructor(extension: Extension, logger: Logger, configManager: ExtensionConfigManager, communication: ExtensionCommunication);
    /**
     * Initialize the extension
     */
    initialize(): Promise<void>;
    /**
     * Activate the extension
     */
    activate(): Promise<void>;
    /**
     * Deactivate the extension
     */
    deactivate(): Promise<void>;
    /**
     * Send a message to the extension
     */
    sendMessage(message: ExtensionMessage): Promise<any>;
    /**
     * Update the extension configuration
     */
    updateConfig(settings: Record<string, any>): Promise<void>;
    /**
     * Get the current extension configuration
     */
    private getConfig;
    /**
     * Create a scoped logger for the extension
     */
    private createScopedLogger;
    /**
     * Create a message sender function for the extension context
     */
    private createMessageSender;
    /**
     * Handle a message sent to this extension
     */
    private handleMessage;
}
