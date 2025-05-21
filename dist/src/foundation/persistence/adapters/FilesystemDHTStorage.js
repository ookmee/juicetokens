"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesystemDHTStorage = void 0;
const persistence_1 = require("../../../generated/foundation/persistence");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Filesystem implementation of DHT storage
 * Stores DHT entries as files on disk
 */
class FilesystemDHTStorage {
    /**
     * Create a new FilesystemDHTStorage
     * @param basePath The base directory to store entries in
     */
    constructor(basePath) {
        this.initialized = false;
        this.basePath = basePath;
    }
    /**
     * Initialize the storage
     */
    async initialize() {
        // Create base directory if it doesn't exist
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
        // Create subdirectories for users and types
        const usersPath = path.join(this.basePath, 'users');
        const typesPath = path.join(this.basePath, 'types');
        if (!fs.existsSync(usersPath)) {
            fs.mkdirSync(usersPath, { recursive: true });
        }
        if (!fs.existsSync(typesPath)) {
            fs.mkdirSync(typesPath, { recursive: true });
        }
        this.initialized = true;
        return Promise.resolve();
    }
    /**
     * Store a DHT entry
     * @param entry The entry to store
     */
    async put(entry) {
        this.ensureInitialized();
        if (!entry.key) {
            throw new Error('Entry key cannot be empty');
        }
        const keyString = this.keyToString(entry.key);
        const entryPath = path.join(this.basePath, `${keyString}.json`);
        // Write main entry file
        fs.writeFileSync(entryPath, JSON.stringify(entry.toJSON ? entry.toJSON() : entry));
        // Create user index if user_id is present
        if (entry.user_id) {
            const userDirPath = path.join(this.basePath, 'users', entry.user_id);
            if (!fs.existsSync(userDirPath)) {
                fs.mkdirSync(userDirPath, { recursive: true });
            }
            const userEntryPath = path.join(userDirPath, `${keyString}.link`);
            fs.writeFileSync(userEntryPath, entryPath);
        }
        // Create type index if entry_type is present
        if (entry.entry_type) {
            const typeDirPath = path.join(this.basePath, 'types', entry.entry_type);
            if (!fs.existsSync(typeDirPath)) {
                fs.mkdirSync(typeDirPath, { recursive: true });
            }
            const typeEntryPath = path.join(typeDirPath, `${keyString}.link`);
            fs.writeFileSync(typeEntryPath, entryPath);
        }
        return Promise.resolve();
    }
    /**
     * Retrieve a DHT entry by key
     * @param key The key to retrieve
     * @returns The entry or null if not found
     */
    async get(key) {
        this.ensureInitialized();
        const keyString = this.keyToString(key);
        const entryPath = path.join(this.basePath, `${keyString}.json`);
        if (!fs.existsSync(entryPath)) {
            return Promise.resolve(null);
        }
        try {
            const fileContent = fs.readFileSync(entryPath, 'utf8');
            const entryData = JSON.parse(fileContent);
            return Promise.resolve(persistence_1.DHTEntry.create(entryData));
        }
        catch (error) {
            console.error(`Error reading DHT entry: ${error}`);
            return Promise.resolve(null);
        }
    }
    /**
     * Delete a DHT entry by key
     * @param key The key to delete
     * @returns True if deleted, false if not found
     */
    async delete(key) {
        this.ensureInitialized();
        const keyString = this.keyToString(key);
        const entryPath = path.join(this.basePath, `${keyString}.json`);
        if (!fs.existsSync(entryPath)) {
            return Promise.resolve(false);
        }
        // Read entry first to get indices
        let userData = null;
        let typeData = null;
        try {
            const fileContent = fs.readFileSync(entryPath, 'utf8');
            const entryData = JSON.parse(fileContent);
            userData = entryData.user_id || null;
            typeData = entryData.entry_type || null;
        }
        catch (error) {
            console.error(`Error reading DHT entry for deletion: ${error}`);
        }
        // Delete entry file
        fs.unlinkSync(entryPath);
        // Delete user index if it exists
        if (userData) {
            const userEntryPath = path.join(this.basePath, 'users', userData, `${keyString}.link`);
            if (fs.existsSync(userEntryPath)) {
                fs.unlinkSync(userEntryPath);
            }
        }
        // Delete type index if it exists
        if (typeData) {
            const typeEntryPath = path.join(this.basePath, 'types', typeData, `${keyString}.link`);
            if (fs.existsSync(typeEntryPath)) {
                fs.unlinkSync(typeEntryPath);
            }
        }
        return Promise.resolve(true);
    }
    /**
     * List all entries
     * @returns Array of all entries
     */
    async list() {
        this.ensureInitialized();
        const entries = [];
        const files = fs.readdirSync(this.basePath);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(this.basePath, file);
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const entryData = JSON.parse(fileContent);
                    entries.push(persistence_1.DHTEntry.create(entryData));
                }
                catch (error) {
                    console.error(`Error reading DHT entry: ${error}`);
                }
            }
        }
        return Promise.resolve(entries);
    }
    /**
     * Query entries by user ID
     * @param userId The user ID to query
     * @returns Array of matching entries
     */
    async queryByUser(userId) {
        this.ensureInitialized();
        const userDirPath = path.join(this.basePath, 'users', userId);
        if (!fs.existsSync(userDirPath)) {
            return Promise.resolve([]);
        }
        const entries = [];
        const files = fs.readdirSync(userDirPath);
        for (const file of files) {
            if (file.endsWith('.link')) {
                try {
                    const linkPath = path.join(userDirPath, file);
                    const entryPath = fs.readFileSync(linkPath, 'utf8');
                    if (fs.existsSync(entryPath)) {
                        const fileContent = fs.readFileSync(entryPath, 'utf8');
                        const entryData = JSON.parse(fileContent);
                        entries.push(persistence_1.DHTEntry.create(entryData));
                    }
                }
                catch (error) {
                    console.error(`Error reading user DHT entry: ${error}`);
                }
            }
        }
        return Promise.resolve(entries);
    }
    /**
     * Query entries by entry type
     * @param entryType The entry type to query
     * @returns Array of matching entries
     */
    async queryByType(entryType) {
        this.ensureInitialized();
        const typeDirPath = path.join(this.basePath, 'types', entryType);
        if (!fs.existsSync(typeDirPath)) {
            return Promise.resolve([]);
        }
        const entries = [];
        const files = fs.readdirSync(typeDirPath);
        for (const file of files) {
            if (file.endsWith('.link')) {
                try {
                    const linkPath = path.join(typeDirPath, file);
                    const entryPath = fs.readFileSync(linkPath, 'utf8');
                    if (fs.existsSync(entryPath)) {
                        const fileContent = fs.readFileSync(entryPath, 'utf8');
                        const entryData = JSON.parse(fileContent);
                        entries.push(persistence_1.DHTEntry.create(entryData));
                    }
                }
                catch (error) {
                    console.error(`Error reading type DHT entry: ${error}`);
                }
            }
        }
        return Promise.resolve(entries);
    }
    /**
     * Convert binary key to string representation
     * @param key The binary key
     * @returns String representation
     */
    keyToString(key) {
        return Buffer.from(key).toString('hex');
    }
    /**
     * Ensure storage is initialized
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('FilesystemDHTStorage is not initialized. Call initialize() first.');
        }
    }
}
exports.FilesystemDHTStorage = FilesystemDHTStorage;
//# sourceMappingURL=FilesystemDHTStorage.js.map