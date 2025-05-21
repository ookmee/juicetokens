import { StorageAdapter } from '../interfaces';
/**
 * Factory class for creating and managing storage adapters
 */
export declare class StorageAdapterFactory {
    private static instance;
    private adapters;
    private defaultAdapter;
    private constructor();
    /**
     * Get the singleton instance of the factory
     */
    static getInstance(): StorageAdapterFactory;
    /**
     * Register a storage adapter
     */
    register(adapter: StorageAdapter): void;
    /**
     * Set a specific adapter as the default
     */
    setDefaultAdapter(adapterId: string): void;
    /**
     * Get a specific adapter by ID
     */
    getAdapter(adapterId: string): StorageAdapter;
    /**
     * Get the default adapter
     */
    getDefaultAdapter(): StorageAdapter;
    /**
     * Get all registered adapters
     */
    getAllAdapters(): StorageAdapter[];
    /**
     * Check if an adapter with the given ID exists
     */
    hasAdapter(adapterId: string): boolean;
    /**
     * Remove an adapter registration
     */
    unregister(adapterId: string): boolean;
}
