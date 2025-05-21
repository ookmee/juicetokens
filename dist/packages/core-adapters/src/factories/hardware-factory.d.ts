import { HardwareAdapter } from '../interfaces';
/**
 * Factory class for creating and managing hardware adapters
 */
export declare class HardwareAdapterFactory {
    private static instance;
    private adapters;
    private defaultAdapter;
    private constructor();
    /**
     * Get the singleton instance of the factory
     */
    static getInstance(): HardwareAdapterFactory;
    /**
     * Register a hardware adapter
     */
    register(adapter: HardwareAdapter): void;
    /**
     * Set a specific adapter as the default
     */
    setDefaultAdapter(adapterId: string): void;
    /**
     * Get a specific adapter by ID
     */
    getAdapter(adapterId: string): HardwareAdapter;
    /**
     * Get the default adapter
     */
    getDefaultAdapter(): HardwareAdapter;
    /**
     * Get all registered adapters
     */
    getAllAdapters(): HardwareAdapter[];
    /**
     * Check if an adapter with the given ID exists
     */
    hasAdapter(adapterId: string): boolean;
    /**
     * Remove an adapter registration
     */
    unregister(adapterId: string): boolean;
}
