import { Logger } from '@juicetokens/common';
import { Extension, ExtensionEvent, ExtensionEventType, ExtensionMessage, ExtensionState, IExtensionManager } from './types';
import { ExtensionConfigManager } from './ExtensionConfig';
import { ExtensionCommunication } from './ExtensionCommunication';
/**
 * Implementation of the Extension Manager
 * Responsible for registering, initializing, and lifecycle management of extensions
 */
export declare class ExtensionManager implements IExtensionManager {
    private readonly logger;
    private sandboxes;
    private extensions;
    private extensionStates;
    private eventListeners;
    private configManager;
    private communication;
    constructor(logger: Logger, configManager?: ExtensionConfigManager, communication?: ExtensionCommunication);
    /**
     * Register a new extension
     */
    registerExtension(extension: Extension): Promise<void>;
    /**
     * Unregister an extension
     */
    unregisterExtension(extensionId: string): Promise<void>;
    /**
     * Get a registered extension by ID
     */
    getExtension(extensionId: string): Extension | undefined;
    /**
     * Get all registered extensions
     */
    getExtensions(): Extension[];
    /**
     * Activate an extension
     */
    activateExtension(extensionId: string): Promise<void>;
    /**
     * Deactivate an extension
     */
    deactivateExtension(extensionId: string): Promise<void>;
    /**
     * Send a message to an extension
     */
    sendMessage(message: ExtensionMessage): Promise<any>;
    /**
     * Get the current state of an extension
     */
    getExtensionState(extensionId: string): ExtensionState;
    /**
     * Add an event listener
     */
    addEventListener(type: ExtensionEventType, handler: (event: ExtensionEvent) => void): void;
    /**
     * Remove an event listener
     */
    removeEventListener(type: ExtensionEventType, handler: (event: ExtensionEvent) => void): void;
    /**
     * Emit an event to all registered listeners
     */
    private emitEvent;
}
