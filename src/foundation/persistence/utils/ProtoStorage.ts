import { ProtoStorageProvider } from '../interfaces';
import * as fs from 'fs';
import * as path from 'path';

/**
 * File system implementation of protocol buffer storage
 */
export class FileProtoStorage implements ProtoStorageProvider {
  private basePath: string;
  
  /**
   * Create a new FileProtoStorage
   * @param basePath The base directory to store protocol buffers in
   */
  constructor(basePath: string) {
    this.basePath = basePath;
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }
  
  /**
   * Save a protocol buffer message
   * @param key The key to store under
   * @param message The message to store
   */
  async saveProto<T>(key: string, message: T): Promise<void> {
    // Ensure the message has a serialize method
    if (typeof (message as any).serialize !== 'function') {
      throw new Error('Message must have a serialize method');
    }
    
    const data = (message as any).serialize();
    const filePath = this.getFilePath(key);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, Buffer.from(data));
    return Promise.resolve();
  }
  
  /**
   * Load a protocol buffer message
   * @param key The key to load from
   * @param type The constructor function of the expected type
   * @returns The loaded message or null if not found
   */
  async loadProto<T>(key: string, type: any): Promise<T | null> {
    const filePath = this.getFilePath(key);
    
    if (!fs.existsSync(filePath)) {
      return Promise.resolve(null);
    }
    
    try {
      // Ensure the type has a deserialize static method
      if (typeof type.deserialize !== 'function') {
        throw new Error('Type must have a static deserialize method');
      }
      
      const data = fs.readFileSync(filePath);
      return Promise.resolve(type.deserialize(data) as T);
    } catch (error) {
      console.error(`Error loading proto: ${error}`);
      return Promise.resolve(null);
    }
  }
  
  /**
   * Get the file path for a key
   * @param key The key
   * @returns The file path
   */
  private getFilePath(key: string): string {
    // Replace invalid filename characters
    const safeKey = key.replace(/[<>:"\/\\|?*]/g, '_');
    return path.join(this.basePath, `${safeKey}.pb`);
  }
}

/**
 * Memory implementation of protocol buffer storage
 * Used for testing and development
 */
export class MemoryProtoStorage implements ProtoStorageProvider {
  private storage: Map<string, Uint8Array> = new Map();
  
  /**
   * Save a protocol buffer message
   * @param key The key to store under
   * @param message The message to store
   */
  async saveProto<T>(key: string, message: T): Promise<void> {
    // Ensure the message has a serialize method
    if (typeof (message as any).serialize !== 'function') {
      throw new Error('Message must have a serialize method');
    }
    
    const data = (message as any).serialize();
    this.storage.set(key, data);
    return Promise.resolve();
  }
  
  /**
   * Load a protocol buffer message
   * @param key The key to load from
   * @param type The constructor function of the expected type
   * @returns The loaded message or null if not found
   */
  async loadProto<T>(key: string, type: any): Promise<T | null> {
    const data = this.storage.get(key);
    
    if (!data) {
      return Promise.resolve(null);
    }
    
    try {
      // Ensure the type has a deserialize static method
      if (typeof type.deserialize !== 'function') {
        throw new Error('Type must have a static deserialize method');
      }
      
      return Promise.resolve(type.deserialize(data) as T);
    } catch (error) {
      console.error(`Error loading proto: ${error}`);
      return Promise.resolve(null);
    }
  }
  
  /**
   * Clear all stored data (for testing purposes)
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * Utilities for protocol buffer operations
 */
export class ProtoUtils {
  /**
   * Convert a protocol buffer message to JSON
   * @param message The message to convert
   * @returns The JSON representation
   */
  static toJson(message: any): string {
    if (typeof message.toJSON !== 'function') {
      throw new Error('Message must have a toJSON method');
    }
    
    return JSON.stringify(message.toJSON());
  }
  
  /**
   * Create a protocol buffer from JSON
   * @param json The JSON string
   * @param type The constructor function of the expected type
   * @returns The created message
   */
  static fromJson<T>(json: string, type: any): T {
    if (typeof type.create !== 'function') {
      throw new Error('Type must have a static create method');
    }
    
    const data = JSON.parse(json);
    return type.create(data) as T;
  }
} 