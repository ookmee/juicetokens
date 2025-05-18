import { DHTEntry, SyncVectorClock as SyncVectorClockProto, PersonalChainInfo as PersonalChainInfoProto } from '../../generated/foundation/persistence';

/**
 * Interface for DHT (Distributed Hash Table) Entry Storage
 */
export interface DHTStorage {
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
}

/**
 * Interface for SyncVectorClock operations
 */
export interface SyncVectorClockOperations {
  /**
   * Get the clock value for a specific node
   * @param nodeId The node ID
   * @returns The clock value or 0 if not present
   */
  getClockValue(nodeId: string): number;
  
  /**
   * Update the clock value for a specific node
   * @param nodeId The node ID
   * @param value The new clock value
   */
  updateClockValue(nodeId: string, value: number): void;
  
  /**
   * Increment the clock value for a specific node
   * @param nodeId The node ID
   * @returns The new clock value
   */
  incrementClockValue(nodeId: string): number;
  
  /**
   * Merge with another vector clock
   * @param other The other vector clock to merge with
   */
  merge(other: SyncVectorClockOperations): void;
  
  /**
   * Convert to protocol buffer format
   * @returns The protocol buffer representation
   */
  toProto(): SyncVectorClockProto;
  
  /**
   * Serialize to binary format
   * @returns The serialized binary data
   */
  serialize(): Uint8Array;
}

/**
 * Interface for PersonalChain operations
 */
export interface PersonalChainOperations {
  /**
   * Get the user ID
   * @returns The user ID
   */
  getUserId(): string;
  
  /**
   * Get the latest entry hash
   * @returns The latest entry hash
   */
  getLatestEntryHash(): Uint8Array;
  
  /**
   * Get the latest sequence number
   * @returns The latest sequence number
   */
  getLatestSequenceNumber(): number;
  
  /**
   * Update the chain with a new entry
   * @param entryHash The new entry hash
   * @param sequenceNumber The new sequence number
   */
  updateChain(entryHash: Uint8Array, sequenceNumber: number): void;
  
  /**
   * Verify the chain integrity
   * @returns True if the chain is valid
   */
  verifyChain(): boolean;
  
  /**
   * Convert to protocol buffer format
   * @returns The protocol buffer representation
   */
  toProto(): PersonalChainInfoProto;
  
  /**
   * Serialize to binary format
   * @returns The serialized binary data
   */
  serialize(): Uint8Array;
}

/**
 * Storage provider for protocol buffer messages
 */
export interface ProtoStorageProvider {
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
} 