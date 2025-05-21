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
exports.PersonalChainInfo = void 0;
const persistence_1 = require("../../../generated/foundation/persistence");
const crypto = __importStar(require("crypto"));
/**
 * Implementation of PersonalChainInfo
 * Manages a user's personal chain of DHT entries
 */
class PersonalChainInfo {
    /**
     * Create a new PersonalChainInfo
     * @param userId The user ID
     * @param options Optional initialization parameters
     */
    constructor(userId, options) {
        this.userId = userId;
        this.latestEntryHash = options?.latestEntryHash || new Uint8Array();
        this.latestSequenceNumber = options?.latestSequenceNumber || 0;
        this.chainStartTimestampMs = options?.chainStartTimestampMs || Date.now();
        this.lastUpdateTimestampMs = options?.lastUpdateTimestampMs || Date.now();
        this.totalEntries = options?.totalEntries || 0;
        this.chainRootSignature = options?.chainRootSignature || new Uint8Array();
        this.designatedBackupPeers = options?.designatedBackupPeers || [];
        this.backupMediumInfo = options?.backupMediumInfo || '';
    }
    /**
     * Get the user ID
     * @returns The user ID
     */
    getUserId() {
        return this.userId;
    }
    /**
     * Get the latest entry hash
     * @returns The latest entry hash
     */
    getLatestEntryHash() {
        return this.latestEntryHash;
    }
    /**
     * Get the latest sequence number
     * @returns The latest sequence number
     */
    getLatestSequenceNumber() {
        return this.latestSequenceNumber;
    }
    /**
     * Update the chain with a new entry
     * @param entryHash The new entry hash
     * @param sequenceNumber The new sequence number
     */
    updateChain(entryHash, sequenceNumber) {
        // Verify the sequence number is valid
        if (sequenceNumber !== this.latestSequenceNumber + 1) {
            throw new Error(`Invalid sequence number: ${sequenceNumber}. Expected: ${this.latestSequenceNumber + 1}`);
        }
        this.latestEntryHash = entryHash;
        this.latestSequenceNumber = sequenceNumber;
        this.lastUpdateTimestampMs = Date.now();
        this.totalEntries++;
    }
    /**
     * Sign the chain root with the provided private key
     * @param privateKey The private key to sign with (PEM format)
     */
    signChainRoot(privateKey) {
        const dataToSign = this.getSignatureData();
        const signature = crypto.sign('sha256', dataToSign, privateKey);
        this.chainRootSignature = new Uint8Array(signature);
    }
    /**
     * Verify the chain integrity using the provided public key
     * @param publicKey The public key to verify with (PEM format)
     * @returns True if the chain is valid
     */
    verifyChain(publicKey) {
        // If no signature is present, chain is not verified
        if (this.chainRootSignature.length === 0) {
            return false;
        }
        // If public key is provided, verify the signature
        if (publicKey) {
            try {
                const dataToSign = this.getSignatureData();
                return crypto.verify('sha256', dataToSign, publicKey, Buffer.from(this.chainRootSignature));
            }
            catch (error) {
                console.error(`Error verifying chain signature: ${error}`);
                return false;
            }
        }
        // Otherwise, just check if signature exists
        return this.chainRootSignature.length > 0;
    }
    /**
     * Add a designated backup peer
     * @param peerId The peer ID to add
     */
    addBackupPeer(peerId) {
        if (!this.designatedBackupPeers.includes(peerId)) {
            this.designatedBackupPeers.push(peerId);
        }
    }
    /**
     * Remove a designated backup peer
     * @param peerId The peer ID to remove
     */
    removeBackupPeer(peerId) {
        this.designatedBackupPeers = this.designatedBackupPeers.filter((id) => id !== peerId);
    }
    /**
     * Set backup medium information
     * @param info The backup medium information
     */
    setBackupMediumInfo(info) {
        this.backupMediumInfo = info;
    }
    /**
     * Get backup medium information
     * @returns The backup medium information
     */
    getBackupMediumInfo() {
        return this.backupMediumInfo;
    }
    /**
     * Convert to protocol buffer format
     * @returns The protocol buffer representation
     */
    toProto() {
        return persistence_1.PersonalChainInfo.create({
            user_id: this.userId,
            latest_entry_hash: this.latestEntryHash,
            latest_sequence_number: this.latestSequenceNumber,
            chain_start_timestamp_ms: this.chainStartTimestampMs,
            last_update_timestamp_ms: this.lastUpdateTimestampMs,
            total_entries: this.totalEntries,
            chain_root_signature: this.chainRootSignature,
            designated_backup_peers: this.designatedBackupPeers,
            backup_medium_info: this.backupMediumInfo
        });
    }
    /**
     * Serialize to binary format
     * @returns The serialized binary data
     */
    serialize() {
        const proto = this.toProto();
        return persistence_1.PersonalChainInfo.encode(proto).finish();
    }
    /**
     * Create a PersonalChainInfo from a protocol buffer
     * @param proto The protocol buffer
     * @returns A new PersonalChainInfo
     */
    static fromProto(proto) {
        return new PersonalChainInfo(proto.user_id, {
            latestEntryHash: proto.latest_entry_hash,
            latestSequenceNumber: proto.latest_sequence_number,
            chainStartTimestampMs: proto.chain_start_timestamp_ms,
            lastUpdateTimestampMs: proto.last_update_timestamp_ms,
            totalEntries: proto.total_entries,
            chainRootSignature: proto.chain_root_signature,
            designatedBackupPeers: proto.designated_backup_peers,
            backupMediumInfo: proto.backup_medium_info
        });
    }
    /**
     * Deserialize from binary format
     * @param data The serialized binary data
     * @returns A new PersonalChainInfo
     */
    static deserialize(data) {
        const proto = persistence_1.PersonalChainInfo.decode(data);
        return PersonalChainInfo.fromProto(proto);
    }
    /**
     * Create signature data buffer
     * @returns Buffer containing data to sign
     */
    getSignatureData() {
        // Create a buffer containing the essential chain data for signature
        const userIdBuffer = Buffer.from(this.userId);
        const latestEntryHashBuffer = Buffer.from(this.latestEntryHash);
        const sequenceBuffer = Buffer.alloc(8);
        sequenceBuffer.writeBigUInt64LE(BigInt(this.latestSequenceNumber), 0);
        const startTimeBuffer = Buffer.alloc(8);
        startTimeBuffer.writeBigUInt64LE(BigInt(this.chainStartTimestampMs), 0);
        return Buffer.concat([
            userIdBuffer,
            latestEntryHashBuffer,
            sequenceBuffer,
            startTimeBuffer
        ]);
    }
}
exports.PersonalChainInfo = PersonalChainInfo;
//# sourceMappingURL=PersonalChainInfo.js.map