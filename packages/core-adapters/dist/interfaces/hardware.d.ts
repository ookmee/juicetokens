/**
 * Base interface for hardware adapters
 */
export interface HardwareAdapter {
    /**
     * Unique identifier for the adapter
     */
    readonly id: string;
    /**
     * Initialize hardware
     */
    initialize(): Promise<void>;
    /**
     * Get hardware information
     */
    getInfo(): Promise<HardwareInfo>;
    /**
     * Check if specific hardware feature is available
     */
    isFeatureAvailable(featureId: string): Promise<boolean>;
    /**
     * Execute hardware-specific command
     */
    executeCommand(command: string, params?: Record<string, any>): Promise<any>;
    /**
     * Release hardware resources
     */
    shutdown(): Promise<void>;
}
/**
 * Hardware information structure
 */
export interface HardwareInfo {
    deviceId: string;
    model: string;
    manufacturer: string;
    firmwareVersion: string;
    capabilities: string[];
}
