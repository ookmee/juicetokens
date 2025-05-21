import { ProtoStorageProvider } from '../interfaces';
/**
 * File system implementation of protocol buffer storage
 */
export declare class FileProtoStorage implements ProtoStorageProvider {
    private basePath;
    /**
     * Create a new FileProtoStorage
     * @param basePath The base directory to store protocol buffers in
     */
    constructor(basePath: string);
    /**
     * Save a protocol buffer message
     * @param key The key to store under
     * @param message The message to store
     */
    saveProto<T>(key: string, message: T): Promise<void>;
    /**
     * Load a protocol buffer message
     * @param key The key to load from
     * @param type The constructor function of the expected type
     * @returns The loaded message or null if not found
     */
    loadProto<T>(key: string, type: any): Promise<T | null>;
    /**
     * Get the file path for a key
     * @param key The key
     * @returns The file path
     */
    private getFilePath;
}
/**
 * Memory implementation of protocol buffer storage
 * Used for testing and development
 */
export declare class MemoryProtoStorage implements ProtoStorageProvider {
    private storage;
    /**
     * Save a protocol buffer message
     * @param key The key to store under
     * @param message The message to store
     */
    saveProto<T>(key: string, message: T): Promise<void>;
    /**
     * Load a protocol buffer message
     * @param key The key to load from
     * @param type The constructor function of the expected type
     * @returns The loaded message or null if not found
     */
    loadProto<T>(key: string, type: any): Promise<T | null>;
    /**
     * Clear all stored data (for testing purposes)
     */
    clear(): void;
}
/**
 * Utilities for protocol buffer operations
 */
export declare class ProtoUtils {
    /**
     * Convert a protocol buffer message to JSON
     * @param message The message to convert
     * @returns The JSON representation
     */
    static toJson(message: any): string;
    /**
     * Create a protocol buffer from JSON
     * @param json The JSON string
     * @param type The constructor function of the expected type
     * @returns The created message
     */
    static fromJson<T>(json: string, type: any): T;
}
