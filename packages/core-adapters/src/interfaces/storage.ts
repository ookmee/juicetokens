/**
 * Base interface for storage adapters
 */
export interface StorageAdapter {
  /**
   * Unique identifier for the adapter
   */
  readonly id: string;

  /**
   * Store data with the given key
   */
  store(key: string, data: any): Promise<void>;

  /**
   * Retrieve data for the given key
   */
  retrieve(key: string): Promise<any>;

  /**
   * Delete data with the given key
   */
  delete(key: string): Promise<void>;

  /**
   * Check if key exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;
} 