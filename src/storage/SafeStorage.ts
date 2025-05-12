import { BaseStorage } from './BaseStorage';
import { StorageConfig, StorageResponse } from './TokenStorage';
import { MongoClient, Db } from 'mongodb';

export class SafeStorage extends BaseStorage {
  private db: Db | null = null;
  private readonly COLLECTION_NAME = 'safeTokens';

  async initialize(): Promise<void> {
    // Initialize MongoDB client
    const client = new MongoClient(this.config.options?.mongoUri || 'mongodb://localhost:27017');
    await client.connect();
    this.db = client.db('tokenSafe');
  }

  async addTokens(tokens: any[]): Promise<StorageResponse> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      await this.db.collection(this.COLLECTION_NAME).insertMany(tokens);
      return this.createResponse(true);
    } catch (error: any) {
      return this.createResponse(false, error?.message || 'Unknown error');
    }
  }

  async removeTokens(tokenIds: string[]): Promise<StorageResponse> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      const result = await this.db.collection(this.COLLECTION_NAME)
        .deleteMany({ 'token.id': { $in: tokenIds } });
      return this.createResponse(result.deletedCount === tokenIds.length);
    } catch (error: any) {
      return this.createResponse(false, error?.message || 'Unknown error');
    }
  }

  async getTokens(query: any): Promise<any[]> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      return await this.db.collection(this.COLLECTION_NAME)
        .find(query)
        .toArray();
    } catch (error: any) {
      throw new Error(`Failed to get tokens: ${error?.message || 'Unknown error'}`);
    }
  }

  async sync(lastSyncTimestamp: string): Promise<any> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      const tokens = await this.db.collection(this.COLLECTION_NAME)
        .find({
          'token.timestamp': { $gt: parseInt(lastSyncTimestamp) }
        })
        .toArray();
      return {
        updatedTokens: tokens,
        removedTokenIds: [], // Would need to track deleted tokens
        syncTimestamp: Date.now().toString()
      };
    } catch (error: any) {
      throw new Error(`Sync failed: ${error?.message || 'Unknown error'}`);
    }
  }
} 