import { Extension, ExtensionCapability, ExtensionContext, ExtensionMessage } from '../types';
/**
 * Notification Extension
 * Example extension that provides notification services to other extensions
 */
export declare class NotificationExtension implements Extension {
    id: string;
    name: string;
    version: string;
    description: string;
    capabilities: ExtensionCapability[];
    private context;
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
     * Handle a notification request
     */
    private handleNotification;
}
