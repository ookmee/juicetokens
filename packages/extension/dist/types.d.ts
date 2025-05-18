import { Logger } from '@juicetokens/common';
/**
 * Extension lifecycle states
 */
export declare enum ExtensionState {
    REGISTERED = "registered",
    INITIALIZED = "initialized",
    ACTIVE = "active",
    PAUSED = "paused",
    DISABLED = "disabled",
    ERROR = "error"
}
/**
 * Extension event types
 */
export declare enum ExtensionEventType {
    REGISTERED = "extension:registered",
    INITIALIZED = "extension:initialized",
    ACTIVATED = "extension:activated",
    PAUSED = "extension:paused",
    DISABLED = "extension:disabled",
    ERROR = "extension:error",
    CONFIG_CHANGED = "extension:config_changed",
    MESSAGE = "extension:message"
}
/**
 * Extension event interface
 */
export interface ExtensionEvent {
    type: ExtensionEventType;
    extensionId: string;
    timestamp: number;
    data?: any;
}
/**
 * Extension message interface for inter-extension communication
 */
export interface ExtensionMessage {
    source: string;
    target: string;
    action: string;
    payload?: any;
    id?: string;
    timestamp: number;
}
/**
 * Extension configuration interface
 */
export interface ExtensionConfig {
    id: string;
    version: string;
    enabled: boolean;
    settings: Record<string, any>;
}
/**
 * Extension capability definition
 */
export interface ExtensionCapability {
    name: string;
    description: string;
    permissions: string[];
}
/**
 * Extension context provided to extensions at runtime
 */
export interface ExtensionContext {
    extensionId: string;
    logger: Logger;
    sendMessage: (message: Omit<ExtensionMessage, 'source' | 'timestamp'>) => Promise<void>;
    getConfig: () => ExtensionConfig;
    updateConfig: (settings: Record<string, any>) => Promise<void>;
}
/**
 * Core extension interface that all extensions must implement
 */
export interface Extension {
    id: string;
    name: string;
    version: string;
    description: string;
    capabilities: ExtensionCapability[];
    onInitialize: (context: ExtensionContext) => Promise<void>;
    onActivate: () => Promise<void>;
    onDeactivate: () => Promise<void>;
    onMessage?: (message: ExtensionMessage) => Promise<any>;
}
/**
 * Extension manager interface
 */
export interface IExtensionManager {
    registerExtension: (extension: Extension) => Promise<void>;
    unregisterExtension: (extensionId: string) => Promise<void>;
    getExtension: (extensionId: string) => Extension | undefined;
    getExtensions: () => Extension[];
    activateExtension: (extensionId: string) => Promise<void>;
    deactivateExtension: (extensionId: string) => Promise<void>;
    sendMessage: (message: ExtensionMessage) => Promise<any>;
    getExtensionState: (extensionId: string) => ExtensionState;
    addEventListener: (type: ExtensionEventType, handler: (event: ExtensionEvent) => void) => void;
    removeEventListener: (type: ExtensionEventType, handler: (event: ExtensionEvent) => void) => void;
}
/**
 * Extension sandbox interface for security isolation
 */
export interface IExtensionSandbox {
    id: string;
    extension: Extension;
    state: ExtensionState;
    context: ExtensionContext;
    initialize: () => Promise<void>;
    activate: () => Promise<void>;
    deactivate: () => Promise<void>;
    sendMessage: (message: ExtensionMessage) => Promise<any>;
    updateConfig: (settings: Record<string, any>) => Promise<void>;
}
/**
 * Extension configuration manager interface
 */
export interface IExtensionConfigManager {
    getConfig: (extensionId: string) => Promise<ExtensionConfig>;
    updateConfig: (extensionId: string, settings: Record<string, any>) => Promise<void>;
    resetConfig: (extensionId: string) => Promise<void>;
}
/**
 * Extension communication interface
 */
export interface IExtensionCommunication {
    sendMessage: (message: ExtensionMessage) => Promise<any>;
    registerHandler: (extensionId: string, handler: (message: ExtensionMessage) => Promise<any>) => void;
    unregisterHandler: (extensionId: string) => void;
}
