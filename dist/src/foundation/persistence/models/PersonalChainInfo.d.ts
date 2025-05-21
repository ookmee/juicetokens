import { PersonalChainOperations } from '../interfaces';
import { PersonalChainInfo as PersonalChainInfoProto } from '../../../generated/foundation/persistence';
/**
 * Implementation of PersonalChainInfo
 * Manages a user's personal chain of DHT entries
 */
export declare class PersonalChainInfo implements PersonalChainOperations {
    private userId;
    private latestEntryHash;
    private latestSequenceNumber;
    private chainStartTimestampMs;
    private lastUpdateTimestampMs;
    private totalEntries;
    private chainRootSignature;
    private designatedBackupPeers;
    private backupMediumInfo;
    /**
     * Create a new PersonalChainInfo
     * @param userId The user ID
     * @param options Optional initialization parameters
     */
    constructor(userId: string, options?: {
        latestEntryHash?: Uint8Array;
        latestSequenceNumber?: number;
        chainStartTimestampMs?: number;
        lastUpdateTimestampMs?: number;
        totalEntries?: number;
        chainRootSignature?: Uint8Array;
        designatedBackupPeers?: string[];
        backupMediumInfo?: string;
    });
    /**
     * Get the user ID
     * @returns The user ID
     */
    getUserId(): string;
    /**
     * Get the latest entry hash
     * @returns The latest entry hash
     */
    getLatestEntryHash(): Uint8Array;
    /**
     * Get the latest sequence number
     * @returns The latest sequence number
     */
    getLatestSequenceNumber(): number;
    /**
     * Update the chain with a new entry
     * @param entryHash The new entry hash
     * @param sequenceNumber The new sequence number
     */
    updateChain(entryHash: Uint8Array, sequenceNumber: number): void;
    /**
     * Sign the chain root with the provided private key
     * @param privateKey The private key to sign with (PEM format)
     */
    signChainRoot(privateKey: string): void;
    /**
     * Verify the chain integrity using the provided public key
     * @param publicKey The public key to verify with (PEM format)
     * @returns True if the chain is valid
     */
    verifyChain(publicKey?: string): boolean;
    /**
     * Add a designated backup peer
     * @param peerId The peer ID to add
     */
    addBackupPeer(peerId: string): void;
    /**
     * Remove a designated backup peer
     * @param peerId The peer ID to remove
     */
    removeBackupPeer(peerId: string): void;
    /**
     * Set backup medium information
     * @param info The backup medium information
     */
    setBackupMediumInfo(info: string): void;
    /**
     * Get backup medium information
     * @returns The backup medium information
     */
    getBackupMediumInfo(): string;
    /**
     * Convert to protocol buffer format
     * @returns The protocol buffer representation
     */
    toProto(): PersonalChainInfoProto;
    /**
     * Serialize to binary format
     * @returns The serialized binary data
     */
    serialize(): Uint8Array;
    /**
     * Create a PersonalChainInfo from a protocol buffer
     * @param proto The protocol buffer
     * @returns A new PersonalChainInfo
     */
    static fromProto(proto: PersonalChainInfoProto): PersonalChainInfo;
    /**
     * Deserialize from binary format
     * @param data The serialized binary data
     * @returns A new PersonalChainInfo
     */
    static deserialize(data: Uint8Array): PersonalChainInfo;
    /**
     * Create signature data buffer
     * @returns Buffer containing data to sign
     */
    private getSignatureData;
}
