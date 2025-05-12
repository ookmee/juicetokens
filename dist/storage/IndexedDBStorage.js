"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBStorage = void 0;
const TokenStorage_1 = require("./TokenStorage");
class IndexedDBStorage extends TokenStorage_1.BaseStorage {
    constructor() {
        super(...arguments);
        this.db = null;
        this.DB_NAME = 'tokenWallet';
        this.STORE_NAME = 'tokens';
        this.DB_VERSION = 1;
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'token.id' });
                    store.createIndex('status', 'token.status', { unique: false });
                    store.createIndex('offline_ready', 'offline_ready', { unique: false });
                }
            };
        });
    }
    async addTokens(tokens) {
        if (!this.db) {
            return this.createResponse(false, 'Database not initialized');
        }
        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            let success = true;
            let errorMessage;
            tokens.forEach((token) => {
                const request = store.put(token);
                request.onerror = () => {
                    success = false;
                    errorMessage = `Failed to add token ${token.token.id}`;
                };
            });
            transaction.oncomplete = () => {
                resolve(this.createResponse(success, errorMessage));
            };
            transaction.onerror = () => {
                resolve(this.createResponse(false, 'Transaction failed'));
            };
        });
    }
    async removeTokens(tokenIds) {
        if (!this.db) {
            return this.createResponse(false, 'Database not initialized');
        }
        return new Promise((resolve) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            let success = true;
            let errorMessage;
            tokenIds.forEach((id) => {
                const request = store.delete(id);
                request.onerror = () => {
                    success = false;
                    errorMessage = `Failed to remove token ${id}`;
                };
            });
            transaction.oncomplete = () => {
                resolve(this.createResponse(success, errorMessage));
            };
            transaction.onerror = () => {
                resolve(this.createResponse(false, 'Transaction failed'));
            };
        });
    }
    async getTokens(query) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const tokens = [];
            let request;
            if (query.status) {
                const index = store.index('status');
                request = index.getAll(query.status);
            }
            else if (query.offline_only) {
                const index = store.index('offline_ready');
                request = index.getAll(IDBKeyRange.only(true));
            }
            else {
                request = store.getAll();
            }
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(new Error('Failed to get tokens'));
            };
        });
    }
    async sync(lastSyncTimestamp) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const tokens = await this.getTokens({});
        const updatedTokens = tokens.filter(token => token.token.timestamp > parseInt(lastSyncTimestamp));
        return {
            updatedTokens,
            removedTokenIds: [], // Would need to track deleted tokens
            syncTimestamp: Date.now().toString()
        };
    }
}
exports.IndexedDBStorage = IndexedDBStorage;
//# sourceMappingURL=IndexedDBStorage.js.map