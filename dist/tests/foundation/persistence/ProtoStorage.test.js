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
const ProtoStorage_1 = require("../../../src/foundation/persistence/utils/ProtoStorage");
const SyncVectorClock_1 = require("../../../src/foundation/persistence/models/SyncVectorClock");
const PersonalChainInfo_1 = require("../../../src/foundation/persistence/models/PersonalChainInfo");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
describe('ProtoStorage', () => {
    let memoryStorage;
    let fileStorage;
    let tempDir;
    beforeEach(() => {
        // Create memory storage
        memoryStorage = new ProtoStorage_1.MemoryProtoStorage();
        // Create temp directory for file storage
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'juicetokens-test-'));
        fileStorage = new ProtoStorage_1.FileProtoStorage(tempDir);
    });
    afterEach(() => {
        // Clean up memory storage
        memoryStorage.clear();
        // Clean up file storage
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
    describe('MemoryProtoStorage', () => {
        test('should store and retrieve SyncVectorClock', async () => {
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            clock.updateClockValue('node-1', 5);
            clock.updateClockValue('node-2', 10);
            await memoryStorage.saveProto('test-clock', clock);
            const retrievedClock = await memoryStorage.loadProto('test-clock', SyncVectorClock_1.SyncVectorClock);
            expect(retrievedClock).not.toBeNull();
            expect(retrievedClock.getOriginatorId()).toBe('node-1');
            expect(retrievedClock.getClockValue('node-1')).toBe(5);
            expect(retrievedClock.getClockValue('node-2')).toBe(10);
        });
        test('should store and retrieve PersonalChainInfo', async () => {
            const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
            const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
            chain.updateChain(entryHash, 1);
            await memoryStorage.saveProto('test-chain', chain);
            const retrievedChain = await memoryStorage.loadProto('test-chain', PersonalChainInfo_1.PersonalChainInfo);
            expect(retrievedChain).not.toBeNull();
            expect(retrievedChain.getUserId()).toBe('user-1');
            expect(retrievedChain.getLatestSequenceNumber()).toBe(1);
            expect(retrievedChain.getLatestEntryHash()).toEqual(entryHash);
        });
        test('should return null for non-existent keys', async () => {
            const result = await memoryStorage.loadProto('non-existent', SyncVectorClock_1.SyncVectorClock);
            expect(result).toBeNull();
        });
        test('should throw error for messages without serialize method', async () => {
            const invalidObject = { value: 42 };
            await expect(async () => {
                await memoryStorage.saveProto('invalid', invalidObject);
            }).rejects.toThrow('Message must have a serialize method');
        });
        test('should throw error for types without deserialize method', async () => {
            class InvalidType {
                static create() {
                    return new InvalidType();
                }
            }
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            await memoryStorage.saveProto('test-clock', clock);
            await expect(async () => {
                await memoryStorage.loadProto('test-clock', InvalidType);
            }).rejects.toThrow('Type must have a static deserialize method');
        });
    });
    describe('FileProtoStorage', () => {
        test('should store and retrieve SyncVectorClock', async () => {
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            clock.updateClockValue('node-1', 5);
            clock.updateClockValue('node-2', 10);
            await fileStorage.saveProto('test-clock', clock);
            // Verify file was created
            const filePath = path.join(tempDir, 'test-clock.pb');
            expect(fs.existsSync(filePath)).toBe(true);
            const retrievedClock = await fileStorage.loadProto('test-clock', SyncVectorClock_1.SyncVectorClock);
            expect(retrievedClock).not.toBeNull();
            expect(retrievedClock.getOriginatorId()).toBe('node-1');
            expect(retrievedClock.getClockValue('node-1')).toBe(5);
            expect(retrievedClock.getClockValue('node-2')).toBe(10);
        });
        test('should store and retrieve PersonalChainInfo', async () => {
            const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
            const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
            chain.updateChain(entryHash, 1);
            await fileStorage.saveProto('test-chain', chain);
            // Verify file was created
            const filePath = path.join(tempDir, 'test-chain.pb');
            expect(fs.existsSync(filePath)).toBe(true);
            const retrievedChain = await fileStorage.loadProto('test-chain', PersonalChainInfo_1.PersonalChainInfo);
            expect(retrievedChain).not.toBeNull();
            expect(retrievedChain.getUserId()).toBe('user-1');
            expect(retrievedChain.getLatestSequenceNumber()).toBe(1);
            expect(retrievedChain.getLatestEntryHash()).toEqual(entryHash);
        });
        test('should return null for non-existent keys', async () => {
            const result = await fileStorage.loadProto('non-existent', SyncVectorClock_1.SyncVectorClock);
            expect(result).toBeNull();
        });
        test('should create subdirectories for nested keys', async () => {
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            const nestedKey = 'user/clocks/node-1';
            await fileStorage.saveProto(nestedKey, clock);
            // Verify subdirectories and file were created
            const filePath = path.join(tempDir, 'user', 'clocks', 'node-1.pb');
            expect(fs.existsSync(filePath)).toBe(true);
            const retrievedClock = await fileStorage.loadProto(nestedKey, SyncVectorClock_1.SyncVectorClock);
            expect(retrievedClock).not.toBeNull();
            expect(retrievedClock.getOriginatorId()).toBe('node-1');
        });
        test('should handle keys with invalid filename characters', async () => {
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            const invalidKey = 'invalid/key:with*special?chars';
            await fileStorage.saveProto(invalidKey, clock);
            // Key should be sanitized
            const retrievedClock = await fileStorage.loadProto(invalidKey, SyncVectorClock_1.SyncVectorClock);
            expect(retrievedClock).not.toBeNull();
            expect(retrievedClock.getOriginatorId()).toBe('node-1');
        });
    });
    describe('ProtoUtils', () => {
        test('should convert proto to JSON and back', () => {
            const clock = new SyncVectorClock_1.SyncVectorClock('node-1');
            clock.updateClockValue('node-1', 5);
            clock.updateClockValue('node-2', 10);
            // Convert to JSON
            const json = ProtoStorage_1.ProtoUtils.toJson(clock.toProto());
            expect(typeof json).toBe('string');
            // Convert back from JSON
            const proto = ProtoStorage_1.ProtoUtils.fromJson(json, clock.toProto().constructor);
            expect(proto).toBeDefined();
            expect(proto.originator_id).toBe('node-1');
            expect(proto.clock_values['node-1']).toBe(5);
            expect(proto.clock_values['node-2']).toBe(10);
        });
        test('should throw error for invalid inputs', () => {
            // Object without toJSON method
            const invalidObject = { value: 42 };
            expect(() => {
                ProtoStorage_1.ProtoUtils.toJson(invalidObject);
            }).toThrow('Message must have a toJSON method');
            // Type without create method
            class InvalidType {
            }
            expect(() => {
                ProtoStorage_1.ProtoUtils.fromJson('{"value": 42}', InvalidType);
            }).toThrow('Type must have a static create method');
        });
    });
});
//# sourceMappingURL=ProtoStorage.test.js.map