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
const PersonalChainInfo_1 = require("../../../src/foundation/persistence/models/PersonalChainInfo");
const crypto = __importStar(require("crypto"));
describe('PersonalChainInfo', () => {
    // Generate key pair for testing
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    test('should initialize with default values', () => {
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
        expect(chain.getUserId()).toBe('user-1');
        expect(chain.getLatestSequenceNumber()).toBe(0);
        expect(chain.getLatestEntryHash().length).toBe(0);
    });
    test('should initialize with custom values', () => {
        const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1', {
            latestEntryHash: entryHash,
            latestSequenceNumber: 5,
            totalEntries: 5
        });
        expect(chain.getUserId()).toBe('user-1');
        expect(chain.getLatestSequenceNumber()).toBe(5);
        expect(chain.getLatestEntryHash()).toEqual(entryHash);
    });
    test('should update chain with new entry', () => {
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
        const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
        chain.updateChain(entryHash, 1);
        expect(chain.getLatestSequenceNumber()).toBe(1);
        expect(chain.getLatestEntryHash()).toEqual(entryHash);
        const entryHash2 = new Uint8Array([6, 7, 8, 9, 10]);
        chain.updateChain(entryHash2, 2);
        expect(chain.getLatestSequenceNumber()).toBe(2);
        expect(chain.getLatestEntryHash()).toEqual(entryHash2);
    });
    test('should throw error on invalid sequence number', () => {
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
        const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
        // Should be able to update with sequence 1
        chain.updateChain(entryHash, 1);
        // Should throw when trying to update with sequence 3 (skipping 2)
        const entryHash2 = new Uint8Array([6, 7, 8, 9, 10]);
        expect(() => {
            chain.updateChain(entryHash2, 3);
        }).toThrow('Invalid sequence number');
        // Should throw when trying to update with sequence 0 (going backwards)
        const entryHash3 = new Uint8Array([11, 12, 13, 14, 15]);
        expect(() => {
            chain.updateChain(entryHash3, 0);
        }).toThrow('Invalid sequence number');
    });
    test('should sign and verify chain', () => {
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
        const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
        chain.updateChain(entryHash, 1);
        // Initial state - not verified
        expect(chain.verifyChain()).toBe(false);
        // Sign the chain
        chain.signChainRoot(privateKey);
        // Should be verified now
        expect(chain.verifyChain()).toBe(true);
        // Verify with explicit public key
        expect(chain.verifyChain(publicKey)).toBe(true);
        // Verify with wrong public key should fail
        const { publicKey: wrongPublicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
        expect(chain.verifyChain(wrongPublicKey)).toBe(false);
    });
    test('should add and remove backup peers', () => {
        const chain = new PersonalChainInfo_1.PersonalChainInfo('user-1');
        // Add backup peers
        chain.addBackupPeer('peer-1');
        chain.addBackupPeer('peer-2');
        // Convert to proto to check the peers
        const proto = chain.toProto();
        expect(proto.designated_backup_peers).toContain('peer-1');
        expect(proto.designated_backup_peers).toContain('peer-2');
        // Remove a peer
        chain.removeBackupPeer('peer-1');
        // Convert to proto to check the peers again
        const proto2 = chain.toProto();
        expect(proto2.designated_backup_peers).not.toContain('peer-1');
        expect(proto2.designated_backup_peers).toContain('peer-2');
    });
    test('should serialize and deserialize', () => {
        const entryHash = new Uint8Array([1, 2, 3, 4, 5]);
        const originalChain = new PersonalChainInfo_1.PersonalChainInfo('user-1', {
            latestEntryHash: entryHash,
            latestSequenceNumber: 5
        });
        originalChain.addBackupPeer('peer-1');
        originalChain.setBackupMediumInfo('backup-medium-1');
        // Sign the chain to have a valid signature
        originalChain.signChainRoot(privateKey);
        const serialized = originalChain.serialize();
        expect(serialized).toBeInstanceOf(Uint8Array);
        const deserializedChain = PersonalChainInfo_1.PersonalChainInfo.deserialize(serialized);
        expect(deserializedChain).toBeInstanceOf(PersonalChainInfo_1.PersonalChainInfo);
        expect(deserializedChain.getUserId()).toBe('user-1');
        expect(deserializedChain.getLatestSequenceNumber()).toBe(5);
        expect(deserializedChain.getLatestEntryHash()).toEqual(entryHash);
        // Verify the chain using the original public key
        expect(deserializedChain.verifyChain(publicKey)).toBe(true);
        // Check proto object
        const proto = deserializedChain.toProto();
        expect(proto.designated_backup_peers).toContain('peer-1');
        expect(proto.backup_medium_info).toBe('backup-medium-1');
    });
});
//# sourceMappingURL=PersonalChainInfo.test.js.map