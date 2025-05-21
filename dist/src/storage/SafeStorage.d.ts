import { BaseStorage } from './BaseStorage';
import { StorageResponse } from './TokenStorage';
export declare class SafeStorage extends BaseStorage {
    private db;
    private readonly COLLECTION_NAME;
    initialize(): Promise<void>;
    addTokens(tokens: any[]): Promise<StorageResponse>;
    removeTokens(tokenIds: string[]): Promise<StorageResponse>;
    getTokens(query: any): Promise<any[]>;
    sync(lastSyncTimestamp: string): Promise<any>;
}
