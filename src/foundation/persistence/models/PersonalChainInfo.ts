import { PersonalChainOperations } from '../interfaces';
import { PersonalChainInfo as PersonalChainInfoProto } from '../../../generated/foundation/persistence';
import * as crypto from 'crypto';

/**
 * Implementation of PersonalChainInfo
 * Manages a user's personal chain of DHT entries
 */
export class PersonalChainInfo implements PersonalChainOperations {
  private userId: string;
  private latestEntryHash: Uint8Array;
  private latestSequenceNumber: number;
  private chainStartTimestampMs: number;
  private lastUpdateTimestampMs: number;
  private totalEntries: number;
  private chainRootSignature: Uint8Array;
  private designatedBackupPeers: string[];
  private backupMediumInfo: string;
  
  /**
   * Create a new PersonalChainInfo
   * @param userId The user ID
   * @param options Optional initialization parameters
   */
  constructor(
    userId: string,
    options?: {
      latestEntryHash?: Uint8Array;
      latestSequenceNumber?: number;
      chainStartTimestampMs?: number;
      lastUpdateTimestampMs?: number;
      totalEntries?: number;
      chainRootSignature?: Uint8Array;
      designatedBackupPeers?: string[];
      backupMediumInfo?: string;
    }
  ) {
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
  getUserId(): string {
    return this.userId;
  }
  
  /**
   * Get the latest entry hash
   * @returns The latest entry hash
   */
  getLatestEntryHash(): Uint8Array {
    return this.latestEntryHash;
  }
  
  /**
   * Get the latest sequence number
   * @returns The latest sequence number
   */
  getLatestSequenceNumber(): number {
    return this.latestSequenceNumber;
  }
  
  /**
   * Update the chain with a new entry
   * @param entryHash The new entry hash
   * @param sequenceNumber The new sequence number
   */
  updateChain(entryHash: Uint8Array, sequenceNumber: number): void {
    // Verify the sequence number is valid
    if (sequenceNumber !== this.latestSequenceNumber + 1) {
      throw new Error(
        `Invalid sequence number: ${sequenceNumber}. Expected: ${this.latestSequenceNumber + 1}`
      );
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
  signChainRoot(privateKey: string): void {
    const dataToSign = this.getSignatureData();
    const signature = crypto.sign('sha256', dataToSign, privateKey);
    this.chainRootSignature = new Uint8Array(signature);
  }
  
  /**
   * Verify the chain integrity using the provided public key
   * @param publicKey The public key to verify with (PEM format)
   * @returns True if the chain is valid
   */
  verifyChain(publicKey?: string): boolean {
    // If no signature is present, chain is not verified
    if (this.chainRootSignature.length === 0) {
      return false;
    }
    
    // If public key is provided, verify the signature
    if (publicKey) {
      try {
        const dataToSign = this.getSignatureData();
        return crypto.verify(
          'sha256',
          dataToSign,
          publicKey,
          Buffer.from(this.chainRootSignature)
        );
      } catch (error) {
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
  addBackupPeer(peerId: string): void {
    if (!this.designatedBackupPeers.includes(peerId)) {
      this.designatedBackupPeers.push(peerId);
    }
  }
  
  /**
   * Remove a designated backup peer
   * @param peerId The peer ID to remove
   */
  removeBackupPeer(peerId: string): void {
    this.designatedBackupPeers = this.designatedBackupPeers.filter(
      (id) => id !== peerId
    );
  }
  
  /**
   * Set backup medium information
   * @param info The backup medium information
   */
  setBackupMediumInfo(info: string): void {
    this.backupMediumInfo = info;
  }
  
  /**
   * Get backup medium information
   * @returns The backup medium information
   */
  getBackupMediumInfo(): string {
    return this.backupMediumInfo;
  }
  
  /**
   * Convert to protocol buffer format
   * @returns The protocol buffer representation
   */
  toProto(): PersonalChainInfoProto {
    return PersonalChainInfoProto.create({
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
  serialize(): Uint8Array {
    const proto = this.toProto();
    return PersonalChainInfoProto.encode(proto).finish();
  }
  
  /**
   * Create a PersonalChainInfo from a protocol buffer
   * @param proto The protocol buffer
   * @returns A new PersonalChainInfo
   */
  static fromProto(proto: PersonalChainInfoProto): PersonalChainInfo {
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
  static deserialize(data: Uint8Array): PersonalChainInfo {
    const proto = PersonalChainInfoProto.decode(data);
    return PersonalChainInfo.fromProto(proto);
  }
  
  /**
   * Create signature data buffer
   * @returns Buffer containing data to sign
   */
  private getSignatureData(): Buffer {
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