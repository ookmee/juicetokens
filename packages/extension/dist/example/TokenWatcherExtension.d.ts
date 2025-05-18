import { Extension, ExtensionCapability, ExtensionContext, ExtensionMessage } from '../types';
/**
 * Token Watcher Extension
 * Example extension that monitors tokens and sends notifications
 */
export declare class TokenWatcherExtension implements Extension {
    id: string;
    name: string;
    version: string;
    description: string;
    capabilities: ExtensionCapability[];
    private context;
    private watchIntervalId?;
    /**
     * Initialize the extension
     */
    onInitialize(context: ExtensionContext): Promise<void>;
    /**
     * Activate the extension
     */
    onActivate(): Promise<void>;
    /**
     * Deactivate the extension
     */
    onDeactivate(): Promise<void>;
    /**
     * Handle incoming messages
     */
    onMessage(message: ExtensionMessage): Promise<any>;
    /**
     * Start the token watching process
     */
    private startWatching;
    /**
     * Stop the token watching process
     */
    private stopWatching;
    /**
     * Update the watch interval
     */
    private updateWatchInterval;
    /**
     * Check tokens for issues and send notifications
     */
    private checkTokens;
    /**
     * Send a notification using the notification extension
     */
    private sendNotification;
}
