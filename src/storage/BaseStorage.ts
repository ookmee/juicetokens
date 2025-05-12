import { StorageConfig, StorageResponse, TokenStorage } from './TokenStorage';

export abstract class BaseStorage implements TokenStorage {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract addTokens(tokens: any[]): Promise<StorageResponse>;
  abstract removeTokens(tokenIds: string[]): Promise<StorageResponse>;
  abstract getTokens(query: any): Promise<any[]>;
  abstract sync(lastSyncTimestamp: string): Promise<any>;

  protected createResponse(success: boolean, error?: string): StorageResponse {
    return { success, error };
  }
} 