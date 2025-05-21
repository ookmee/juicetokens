"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeStorage = void 0;
const BaseStorage_1 = require("./BaseStorage");
const mongodb_1 = require("mongodb");
class SafeStorage extends BaseStorage_1.BaseStorage {
    constructor() {
        super(...arguments);
        this.db = null;
        this.COLLECTION_NAME = 'safeTokens';
    }
    async initialize() {
        // Initialize MongoDB client
        const client = new mongodb_1.MongoClient(this.config.options?.mongoUri || 'mongodb://localhost:27017');
        await client.connect();
        this.db = client.db('tokenSafe');
    }
    async addTokens(tokens) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            await this.db.collection(this.COLLECTION_NAME).insertMany(tokens);
            return this.createResponse(true);
        }
        catch (error) {
            return this.createResponse(false, error?.message || 'Unknown error');
        }
    }
    async removeTokens(tokenIds) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const result = await this.db.collection(this.COLLECTION_NAME)
                .deleteMany({ 'token.id': { $in: tokenIds } });
            return this.createResponse(result.deletedCount === tokenIds.length);
        }
        catch (error) {
            return this.createResponse(false, error?.message || 'Unknown error');
        }
    }
    async getTokens(query) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            return await this.db.collection(this.COLLECTION_NAME)
                .find(query)
                .toArray();
        }
        catch (error) {
            throw new Error(`Failed to get tokens: ${error?.message || 'Unknown error'}`);
        }
    }
    async sync(lastSyncTimestamp) {
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
        }
        catch (error) {
            throw new Error(`Sync failed: ${error?.message || 'Unknown error'}`);
        }
    }
}
exports.SafeStorage = SafeStorage;
//# sourceMappingURL=SafeStorage.js.map