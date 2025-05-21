import { DHTStorage } from '../interfaces';
import { DHTEntry } from '../../../generated/foundation/persistence';
import { MongoClient, Db, Collection, Document } from 'mongodb';

/**
 * MongoDB implementation of DHT storage
 * Used for testing and development in Docker environments
 * This serves as a precursor for IndexedDB and native storage
 */
export class MongoDBDHTStorage implements DHTStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection | null = null;
  private initialized = false;
  private readonly connectionString: string;
  private readonly dbName: string;
  private readonly collectionName: string;
  
  /**
   * Create a new MongoDBDHTStorage
   * @param connectionString MongoDB connection string
   * @param dbName Database name (default: juicetokens)
   * @param collectionName Collection name (default: dht_entries)
   */
  constructor(
    connectionString: string, 
    dbName = 'juicetokens',
    collectionName = 'dht_entries'
  ) {
    this.connectionString = connectionString;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }
  
  /**
   * Initialize the storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection(this.collectionName);
      
      // Create indexes for efficient queries
      await this.collection.createIndex({ key: 1 }, { unique: true });
      await this.collection.createIndex({ user_id: 1 });
      await this.collection.createIndex({ entry_type: 1 });
      
      this.initialized = true;
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to initialize: ${error}`);
      throw error;
    }
  }
  
  /**
   * Store a DHT entry
   * @param entry The entry to store
   */
  async put(entry: DHTEntry): Promise<void> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    const keyStr = this.keyToString(entry.key);
    const document = this.entryToDocument(entry);
    
    try {
      await this.collection!.updateOne(
        { key: keyStr },
        { $set: document },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to put entry: ${error}`);
      throw error;
    }
  }
  
  /**
   * Retrieve a DHT entry by key
   * @param key The key to retrieve
   * @returns The entry or null if not found
   */
  async get(key: Uint8Array): Promise<DHTEntry | null> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    const keyStr = this.keyToString(key);
    
    try {
      const document = await this.collection!.findOne({ key: keyStr });
      if (!document) {
        return null;
      }
      
      return this.documentToEntry(document);
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to get entry: ${error}`);
      throw error;
    }
  }
  
  /**
   * Delete a DHT entry by key
   * @param key The key to delete
   * @returns True if deleted, false if not found
   */
  async delete(key: Uint8Array): Promise<boolean> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    const keyStr = this.keyToString(key);
    
    try {
      const result = await this.collection!.deleteOne({ key: keyStr });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to delete entry: ${error}`);
      throw error;
    }
  }
  
  /**
   * List all entries
   * @returns Array of all entries
   */
  async list(): Promise<DHTEntry[]> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    try {
      const documents = await this.collection!.find({}).toArray();
      return documents.map(doc => this.documentToEntry(doc));
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to list entries: ${error}`);
      throw error;
    }
  }
  
  /**
   * Query entries by user ID
   * @param userId The user ID to query
   * @returns Array of matching entries
   */
  async queryByUser(userId: string): Promise<DHTEntry[]> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    try {
      const documents = await this.collection!.find({ user_id: userId }).toArray();
      return documents.map(doc => this.documentToEntry(doc));
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to query by user: ${error}`);
      throw error;
    }
  }
  
  /**
   * Query entries by entry type
   * @param entryType The entry type to query
   * @returns Array of matching entries
   */
  async queryByType(entryType: string): Promise<DHTEntry[]> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    try {
      const documents = await this.collection!.find({ entry_type: entryType }).toArray();
      return documents.map(doc => this.documentToEntry(doc));
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to query by type: ${error}`);
      throw error;
    }
  }
  
  /**
   * Clear all entries (for testing purposes)
   */
  async clear(): Promise<void> {
    if (!this.initialized || !this.collection) {
      await this.initialize();
    }
    
    try {
      await this.collection!.deleteMany({});
    } catch (error) {
      console.error(`[MongoDBDHTStorage] Failed to clear entries: ${error}`);
      throw error;
    }
  }
  
  /**
   * Close the MongoDB connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
      this.initialized = false;
    }
  }
  
  /**
   * Convert binary key to string representation
   * @param key The binary key
   * @returns String representation
   */
  private keyToString(key: Uint8Array): string {
    return Buffer.from(key).toString('base64');
  }
  
  /**
   * Convert string key to binary representation
   * @param keyStr The string key
   * @returns Binary representation
   */
  private stringToKey(keyStr: string): Uint8Array {
    return new Uint8Array(Buffer.from(keyStr, 'base64'));
  }
  
  /**
   * Convert entry to MongoDB document
   * @param entry DHT entry
   * @returns MongoDB document
   */
  private entryToDocument(entry: DHTEntry): Document {
    return {
      key: this.keyToString(entry.key),
      value: this.keyToString(entry.value),
      timestamp_ms: entry.timestamp_ms,
      ttl_seconds: entry.ttl_seconds,
      user_id: entry.user_id,
      entry_type: entry.entry_type,
      sequence_number: entry.sequence_number,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    };
  }
  
  /**
   * Convert MongoDB document to entry
   * @param doc MongoDB document
   * @returns DHT entry
   */
  private documentToEntry(doc: Document): DHTEntry {
    return DHTEntry.create({
      key: this.stringToKey(doc.key),
      value: this.stringToKey(doc.value),
      timestamp_ms: doc.timestamp_ms,
      ttl_seconds: doc.ttl_seconds,
      user_id: doc.user_id,
      entry_type: doc.entry_type,
      sequence_number: doc.sequence_number,
      metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
    });
  }
} 