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
export declare class StorageFactory {
    static create(config: StorageConfig): Promise<TokenStorage>;
}
