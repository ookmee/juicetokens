import { SafeStorage } from './SafeStorage';

export interface StorageConfig {
  type: 'wallet' | 'safe';
  location?: 'SERVER' | 'IPFS';
  options?: {
    mongoUri?: string;
    ipfsEndpoint?: string;
  };
}

export interface StorageResponse {
  success: boolean;
  error?: string;
}

export interface TokenStorage {
  initialize(): Promise<void>;
  addTokens(tokens: any[]): Promise<StorageResponse>;
  removeTokens(tokenIds: string[]): Promise<StorageResponse>;
  getTokens(query: any): Promise<any[]>;
  sync(lastSyncTimestamp: string): Promise<any>;
}

export class StorageFactory {
  static async create(config: StorageConfig): Promise<TokenStorage> {
    switch (config.type) {
      case 'safe':
        return new SafeStorage(config);
      default:
        throw new Error(`Unknown storage type: ${config.type}`);
    }
  }
} 