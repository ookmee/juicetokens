import { DHTStorage } from '../interfaces';
import { DHTEntry } from '../../../generated/foundation/persistence';
/**
 * In-memory implementation of DHT storage
 * Used for testing and development environments
 */
export declare class MemoryDHTStorage implements DHTStorage {
    private entries;
    /**
     * Initialize the storage
     */
    initialize(): Promise<void>;
    /**
     * Store a DHT entry
     * @param entry The entry to store
     */
    put(entry: DHTEntry): Promise<void>;
    /**
     * Retrieve a DHT entry by key
     * @param key The key to retrieve
     * @returns The entry or null if not found
     */
    get(key: Uint8Array): Promise<DHTEntry | null>;
    /**
     * Delete a DHT entry by key
     * @param key The key to delete
     * @returns True if deleted, false if not found
     */
    delete(key: Uint8Array): Promise<boolean>;
    /**
     * List all entries
     * @returns Array of all entries
     */
    list(): Promise<DHTEntry[]>;
    /**
     * Query entries by user ID
     * @param userId The user ID to query
     * @returns Array of matching entries
     */
    queryByUser(userId: string): Promise<DHTEntry[]>;
    /**
     * Query entries by entry type
     * @param entryType The entry type to query
     * @returns Array of matching entries
     */
    queryByType(entryType: string): Promise<DHTEntry[]>;
    /**
     * Clear all entries (for testing purposes)
     */
    clear(): Promise<void>;
    /**
     * Convert binary key to string representation
     * @param key The binary key
     * @returns String representation
     */
    private keyToString;
}
