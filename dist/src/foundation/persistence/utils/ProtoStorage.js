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
exports.ProtoUtils = exports.MemoryProtoStorage = exports.FileProtoStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * File system implementation of protocol buffer storage
 */
class FileProtoStorage {
    /**
     * Create a new FileProtoStorage
     * @param basePath The base directory to store protocol buffers in
     */
    constructor(basePath) {
        this.basePath = basePath;
        // Create base directory if it doesn't exist
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }
    /**
     * Save a protocol buffer message
     * @param key The key to store under
     * @param message The message to store
     */
    async saveProto(key, message) {
        // Ensure the message has a serialize method
        if (typeof message.serialize !== 'function') {
            throw new Error('Message must have a serialize method');
        }
        const data = message.serialize();
        const filePath = this.getFilePath(key);
        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Write the file
        fs.writeFileSync(filePath, Buffer.from(data));
        return Promise.resolve();
    }
    /**
     * Load a protocol buffer message
     * @param key The key to load from
     * @param type The constructor function of the expected type
     * @returns The loaded message or null if not found
     */
    async loadProto(key, type) {
        const filePath = this.getFilePath(key);
        if (!fs.existsSync(filePath)) {
            return Promise.resolve(null);
        }
        try {
            // Ensure the type has a deserialize static method
            if (typeof type.deserialize !== 'function') {
                throw new Error('Type must have a static deserialize method');
            }
            const data = fs.readFileSync(filePath);
            return Promise.resolve(type.deserialize(data));
        }
        catch (error) {
            console.error(`Error loading proto: ${error}`);
            return Promise.resolve(null);
        }
    }
    /**
     * Get the file path for a key
     * @param key The key
     * @returns The file path
     */
    getFilePath(key) {
        // Replace invalid filename characters
        const safeKey = key.replace(/[<>:"\/\\|?*]/g, '_');
        return path.join(this.basePath, `${safeKey}.pb`);
    }
}
exports.FileProtoStorage = FileProtoStorage;
/**
 * Memory implementation of protocol buffer storage
 * Used for testing and development
 */
class MemoryProtoStorage {
    constructor() {
        this.storage = new Map();
    }
    /**
     * Save a protocol buffer message
     * @param key The key to store under
     * @param message The message to store
     */
    async saveProto(key, message) {
        // Ensure the message has a serialize method
        if (typeof message.serialize !== 'function') {
            throw new Error('Message must have a serialize method');
        }
        const data = message.serialize();
        this.storage.set(key, data);
        return Promise.resolve();
    }
    /**
     * Load a protocol buffer message
     * @param key The key to load from
     * @param type The constructor function of the expected type
     * @returns The loaded message or null if not found
     */
    async loadProto(key, type) {
        const data = this.storage.get(key);
        if (!data) {
            return Promise.resolve(null);
        }
        try {
            // Ensure the type has a deserialize static method
            if (typeof type.deserialize !== 'function') {
                throw new Error('Type must have a static deserialize method');
            }
            return Promise.resolve(type.deserialize(data));
        }
        catch (error) {
            console.error(`Error loading proto: ${error}`);
            return Promise.resolve(null);
        }
    }
    /**
     * Clear all stored data (for testing purposes)
     */
    clear() {
        this.storage.clear();
    }
}
exports.MemoryProtoStorage = MemoryProtoStorage;
/**
 * Utilities for protocol buffer operations
 */
class ProtoUtils {
    /**
     * Convert a protocol buffer message to JSON
     * @param message The message to convert
     * @returns The JSON representation
     */
    static toJson(message) {
        if (typeof message.toJSON !== 'function') {
            throw new Error('Message must have a toJSON method');
        }
        return JSON.stringify(message.toJSON());
    }
    /**
     * Create a protocol buffer from JSON
     * @param json The JSON string
     * @param type The constructor function of the expected type
     * @returns The created message
     */
    static fromJson(json, type) {
        if (typeof type.create !== 'function') {
            throw new Error('Type must have a static create method');
        }
        const data = JSON.parse(json);
        return type.create(data);
    }
}
exports.ProtoUtils = ProtoUtils;
//# sourceMappingURL=ProtoStorage.js.map