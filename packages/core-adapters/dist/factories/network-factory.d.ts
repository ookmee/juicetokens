import { NetworkAdapter } from '../interfaces';
/**
 * Factory class for creating and managing network adapters
 */
export declare class NetworkAdapterFactory {
    private static instance;
    private adapters;
    private defaultAdapter;
    private constructor();
    /**
     * Get the singleton instance of the factory
     */
    static getInstance(): NetworkAdapterFactory;
    /**
     * Register a network adapter
     */
    register(adapter: NetworkAdapter): void;
    /**
     * Set a specific adapter as the default
     */
    setDefaultAdapter(adapterId: string): void;
    /**
     * Get a specific adapter by ID
     */
    getAdapter(adapterId: string): NetworkAdapter;
    /**
     * Get the default adapter
     */
    getDefaultAdapter(): NetworkAdapter;
    /**
     * Get all registered adapters
     */
    getAllAdapters(): NetworkAdapter[];
    /**
     * Check if an adapter with the given ID exists
     */
    hasAdapter(adapterId: string): boolean;
    /**
     * Remove an adapter registration
     */
    unregister(adapterId: string): boolean;
}
