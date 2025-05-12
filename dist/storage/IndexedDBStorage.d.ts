import { BaseStorage, StorageResponse } from './TokenStorage';
export declare class IndexedDBStorage extends BaseStorage {
    private db;
    private readonly DB_NAME;
    private readonly STORE_NAME;
    private readonly DB_VERSION;
    initialize(): Promise<void>;
    addTokens(tokens: any[]): Promise<StorageResponse>;
    removeTokens(tokenIds: string[]): Promise<StorageResponse>;
    getTokens(query: any): Promise<any[]>;
    sync(lastSyncTimestamp: string): Promise<any>;
}
//# sourceMappingURL=IndexedDBStorage.d.ts.map