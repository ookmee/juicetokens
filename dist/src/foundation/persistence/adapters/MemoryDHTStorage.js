"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDHTStorage = void 0;
/**
 * In-memory implementation of DHT storage
 * Used for testing and development environments
 */
class MemoryDHTStorage {
    constructor() {
        this.entries = new Map();
    }
    /**
     * Initialize the storage
     */
    async initialize() {
        // Nothing to initialize for in-memory storage
        return Promise.resolve();
    }
    /**
     * Store a DHT entry
     * @param entry The entry to store
     */
    async put(entry) {
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
    async get(key) {
        const keyString = this.keyToString(key);
        const entry = this.entries.get(keyString);
        return Promise.resolve(entry || null);
    }
    /**
     * Delete a DHT entry by key
     * @param key The key to delete
     * @returns True if deleted, false if not found
     */
    async delete(key) {
        const keyString = this.keyToString(key);
        const existed = this.entries.has(keyString);
        this.entries.delete(keyString);
        return Promise.resolve(existed);
    }
    /**
     * List all entries
     * @returns Array of all entries
     */
    async list() {
        return Promise.resolve(Array.from(this.entries.values()));
    }
    /**
     * Query entries by user ID
     * @param userId The user ID to query
     * @returns Array of matching entries
     */
    async queryByUser(userId) {
        const results = [];
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
    async queryByType(entryType) {
        const results = [];
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
    async clear() {
        this.entries.clear();
        return Promise.resolve();
    }
    /**
     * Convert binary key to string representation
     * @param key The binary key
     * @returns String representation
     */
    keyToString(key) {
        return Buffer.from(key).toString('hex');
    }
}
exports.MemoryDHTStorage = MemoryDHTStorage;
//# sourceMappingURL=MemoryDHTStorage.js.map