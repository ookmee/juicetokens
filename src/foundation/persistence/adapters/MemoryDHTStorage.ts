import { DHTStorage } from '../interfaces';
import { DHTEntry } from '../../../generated/foundation/persistence';

/**
 * In-memory implementation of DHT storage
 * Used for testing and development environments
 */
export class MemoryDHTStorage implements DHTStorage {
  private entries: Map<string, DHTEntry> = new Map();
  
  /**
   * Initialize the storage
   */
  async initialize(): Promise<void> {
    // Nothing to initialize for in-memory storage
    return Promise.resolve();
  }
  
  /**
   * Store a DHT entry
   * @param entry The entry to store
   */
  async put(entry: DHTEntry): Promise<void> {
    if (!entry.key) {
      throw new Error('Entry key cannot be empty');
    }
    
    const keyString = this.keyToString(entry.key);
    this.entries.set(keyString, entry);
    return Promise.resolve();
  }
  
  /**
   * Retrieve a DHT entry by key
   * @param key The key to retrieve
   * @returns The entry or null if not found
   */
  async get(key: Uint8Array): Promise<DHTEntry | null> {
    const keyString = this.keyToString(key);
    const entry = this.entries.get(keyString);
    return Promise.resolve(entry || null);
  }
  
  /**
   * Delete a DHT entry by key
   * @param key The key to delete
   * @returns True if deleted, false if not found
   */
  async delete(key: Uint8Array): Promise<boolean> {
    const keyString = this.keyToString(key);
    const existed = this.entries.has(keyString);
    this.entries.delete(keyString);
    return Promise.resolve(existed);
  }
  
  /**
   * List all entries
   * @returns Array of all entries
   */
  async list(): Promise<DHTEntry[]> {
    return Promise.resolve(Array.from(this.entries.values()));
  }
  
  /**
   * Query entries by user ID
   * @param userId The user ID to query
   * @returns Array of matching entries
   */
  async queryByUser(userId: string): Promise<DHTEntry[]> {
    const results: DHTEntry[] = [];
    
    for (const entry of this.entries.values()) {
      if (entry.user_id === userId) {
        results.push(entry);
      }
    }
    
    return Promise.resolve(results);
  }
  
  /**
   * Query entries by entry type
   * @param entryType The entry type to query
   * @returns Array of matching entries
   */
  async queryByType(entryType: string): Promise<DHTEntry[]> {
    const results: DHTEntry[] = [];
    
    for (const entry of this.entries.values()) {
      if (entry.entry_type === entryType) {
        results.push(entry);
      }
    }
    
    return Promise.resolve(results);
  }
  
  /**
   * Clear all entries (for testing purposes)
   */
  async clear(): Promise<void> {
    this.entries.clear();
    return Promise.resolve();
  }
  
  /**
   * Convert binary key to string representation
   * @param key The binary key
   * @returns String representation
   */
  private keyToString(key: Uint8Array): string {
    return Buffer.from(key).toString('hex');
  }
} 