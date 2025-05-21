import { EventEmitter } from 'events';
/**
 * Interface representing the ProtocolVersion message from the protocol buffer
 */
export interface IProtocolVersion {
    version: string;
    releaseNotes: string;
    releaseTimestampMs: number;
    changedComponents: string[];
    backwardsCompatible: boolean;
}
/**
 * Class that manages protocol versioning, updates, and compatibility
 */
export declare class VersionManager extends EventEmitter {
    private static instance;
    private currentVersion;
    private availableVersions;
    private versionRoot;
    private versionProto;
    private initialized;
    private constructor();
    /**
     * Initialize the version manager
     */
    private initialize;
    /**
     * Get the singleton instance of the VersionManager
     */
    static getInstance(): VersionManager;
    /**
     * Create fallback type definitions for testing
     */
    private createFallbackTypes;
    /**
     * Load protocol definitions from .proto files
     */
    private loadProtocolDefinitions;
    /**
     * Wait for initialization to complete
     */
    private ensureInitialized;
    /**
     * Load all available versions from local storage or network
     */
    private loadAvailableVersions;
    /**
     * Get the current protocol version
     */
    getCurrentVersion(): Promise<IProtocolVersion>;
    /**
     * Get all available protocol versions
     */
    getAvailableVersions(): Promise<IProtocolVersion[]>;
    /**
     * Check if an update is available
     */
    isUpdateAvailable(): Promise<boolean>;
    /**
     * Compare two semantic versions
     * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    private compareVersions;
    /**
     * Update to a specific version
     * @param version The version to update to
     */
    updateToVersion(version: string): Promise<boolean>;
    /**
     * Register a new version in the system
     * @param version Version details
     */
    registerVersion(version: IProtocolVersion): Promise<void>;
    /**
     * Get components that changed between two versions
     */
    getChangedComponents(fromVersion: string, toVersion: string): Promise<string[]>;
    /**
     * Serialize a version to protocol buffer format
     */
    serializeVersion(version: IProtocolVersion): Promise<Uint8Array>;
    /**
     * Deserialize a protocol buffer to a version object
     */
    deserializeVersion(buffer: Uint8Array): Promise<IProtocolVersion>;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
