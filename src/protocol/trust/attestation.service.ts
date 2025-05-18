/**
 * Attestation Service
 * 
 * This service provides functionality for creating, verifying, and managing attestation records
 * based on the protocol definitions in protos/trust/attestation.proto.
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash, createVerify } from 'crypto';
import {
  SystemAttestation,
  PeerAttestation,
  CommunityAttestation,
  AttestationMetadata,
  Attestation,
  AttestationDHTWrapper,
  AttestationStorage,
  StorageType,
  AttestationExpiry,
  GeospatialShard,
  AttestationChainEntry,
  Direction
} from './types';

export class AttestationService {
  private localAttestations: Map<string, AttestationDHTWrapper> = new Map();
  
  /**
   * Creates a system attestation about a subject
   */
  createSystemAttestation(
    subjectId: string,
    attestationType: string,
    evidence: Uint8Array,
    confidenceScore: number,
    systemSource: string,
    metadata?: Partial<AttestationMetadata>
  ): SystemAttestation {
    const attestation: SystemAttestation = {
      attestationId: uuidv4(),
      subjectId,
      attestationType,
      evidence,
      timestampMs: Date.now(),
      confidenceScore: Math.max(0, Math.min(100, confidenceScore)), // Ensure 0-100 range
      systemSource
    };
    
    // Store locally and potentially in DHT
    this.storeAttestation(attestation, metadata);
    
    return attestation;
  }
  
  /**
   * Creates a peer attestation from one user about another
   */
  createPeerAttestation(
    subjectId: string,
    attesterId: string,
    attestationType: string,
    attestationContent: string,
    strength: number,
    privateKey: Uint8Array, // for signing
    metadata?: Partial<AttestationMetadata>
  ): PeerAttestation {
    const timestampMs = Date.now();
    
    // Create attestation without signature first
    const attestationData = {
      attestationId: uuidv4(),
      subjectId,
      attesterId,
      attestationType,
      attestationContent,
      strength: Math.max(0, Math.min(100, strength)), // Ensure 0-100 range
      timestampMs,
      signature: new Uint8Array()
    };
    
    // Create data to sign (exclude signature field)
    const dataToSign = Buffer.from(
      JSON.stringify({
        attestationId: attestationData.attestationId,
        subjectId: attestationData.subjectId,
        attesterId: attestationData.attesterId,
        attestationType: attestationData.attestationType,
        attestationContent: attestationData.attestationContent,
        strength: attestationData.strength,
        timestampMs: attestationData.timestampMs
      })
    );
    
    // In a real implementation, this would use the actual crypto signature mechanism
    // For this exercise, we'll simulate signing
    const signature = this.simulateSignature(dataToSign, privateKey);
    
    const attestation: PeerAttestation = {
      ...attestationData,
      signature
    };
    
    // Store locally and potentially in DHT
    this.storeAttestation(attestation, metadata);
    
    return attestation;
  }
  
  /**
   * Creates a community attestation from a group about a subject
   */
  createCommunityAttestation(
    subjectId: string,
    communityId: string,
    attestationType: string,
    attestationContent: string,
    approvalCount: number,
    threshold: number,
    communitySignature: Uint8Array,
    metadata?: Partial<AttestationMetadata>
  ): CommunityAttestation {
    const attestation: CommunityAttestation = {
      attestationId: uuidv4(),
      subjectId,
      communityId,
      attestationType,
      attestationContent,
      approvalCount,
      threshold,
      timestampMs: Date.now(),
      communitySignature
    };
    
    // Store locally and potentially in DHT
    this.storeAttestation(attestation, metadata);
    
    return attestation;
  }
  
  /**
   * Verifies an attestation's integrity and authenticity
   */
  verifyAttestation(attestation: Attestation): boolean {
    if ('systemSource' in attestation) {
      // System attestation validation
      return this.verifySystemAttestation(attestation);
    } else if ('attesterId' in attestation) {
      // Peer attestation validation
      return this.verifyPeerAttestation(attestation);
    } else if ('communityId' in attestation) {
      // Community attestation validation
      return this.verifyCommunityAttestation(attestation);
    }
    
    return false;
  }
  
  /**
   * Stores an attestation locally and potentially in the DHT
   */
  private storeAttestation(
    attestation: Attestation,
    metadata?: Partial<AttestationMetadata>
  ): void {
    const defaultMetadata: AttestationMetadata = {
      context: "",
      geographicRegion: "",
      culturalContext: "",
      validFromMs: Date.now(),
      validUntilMs: Date.now() + 1000 * 60 * 60 * 24 * 365, // Default 1 year
      tags: []
    };
    
    const fullMetadata: AttestationMetadata = {
      ...defaultMetadata,
      ...metadata
    };
    
    const storageConfig: AttestationStorage = {
      storageType: StorageType.LOCAL, // Default to local storage
      encrypted: false,
      encryptionScheme: "",
      authorizedViewers: []
    };
    
    const wrapper: AttestationDHTWrapper = {
      attestation,
      metadata: fullMetadata,
      storageConfig,
      entryType: "attestation"
    };
    
    // Store locally
    const attestationId = this.getAttestationId(attestation);
    this.localAttestations.set(attestationId, wrapper);
    
    // In a real implementation, this would store to DHT based on storageConfig
    if (storageConfig.storageType === StorageType.DHT || 
        storageConfig.storageType === StorageType.BOTH) {
      this.storeAttestationInDHT(wrapper);
    }
    
    // Create chain entry for the attestation
    this.createAttestationChainEntry(attestation);
  }
  
  /**
   * Retrieves an attestation by ID
   */
  getAttestationById(attestationId: string): AttestationDHTWrapper | undefined {
    // Check local storage first
    if (this.localAttestations.has(attestationId)) {
      return this.localAttestations.get(attestationId);
    }
    
    // In a real implementation, this would also search in DHT if not found locally
    return undefined;
  }
  
  /**
   * Retrieves attestations about a subject
   */
  getAttestationsAboutSubject(subjectId: string): AttestationDHTWrapper[] {
    const results: AttestationDHTWrapper[] = [];
    
    // Search in local storage
    for (const wrapper of this.localAttestations.values()) {
      const attestation = wrapper.attestation;
      if (attestation && 'subjectId' in attestation && attestation.subjectId === subjectId) {
        results.push(wrapper);
      }
    }
    
    // In a real implementation, this would also search in DHT
    
    return results;
  }
  
  /**
   * Updates an attestation's metadata
   */
  updateAttestationMetadata(
    attestationId: string,
    metadata: Partial<AttestationMetadata>
  ): boolean {
    const wrapper = this.getAttestationById(attestationId);
    if (!wrapper) {
      return false;
    }
    
    wrapper.metadata = {
      ...wrapper.metadata,
      ...metadata
    };
    
    // Update local storage
    this.localAttestations.set(attestationId, wrapper);
    
    // In a real implementation, this would also update in DHT if needed
    
    return true;
  }
  
  /**
   * Creates an attestation expiry record
   */
  createAttestationExpiry(
    attestationId: string,
    expiryMs: number,
    autoRenew: boolean = false,
    renewalPolicy: string = ""
  ): AttestationExpiry {
    const expiry: AttestationExpiry = {
      attestationId,
      creationMs: Date.now(),
      expiryMs,
      autoRenew,
      renewalPolicy
    };
    
    // In a real implementation, this would store the expiry record
    
    return expiry;
  }
  
  /**
   * Creates a geospatial shard for attestations
   */
  createGeospatialShard(
    s2CellId: string,
    level: number
  ): GeospatialShard {
    const shard: GeospatialShard = {
      s2CellId,
      level,
      containedAttestationIds: [],
      merkleRoot: new Uint8Array(),
      lastUpdatedMs: Date.now()
    };
    
    // In a real implementation, this would initialize the shard in DHT
    
    return shard;
  }
  
  // DHT-related methods
  
  /**
   * Stores an attestation in the DHT
   */
  private storeAttestationInDHT(wrapper: AttestationDHTWrapper): void {
    // In a real implementation, this would use DHT storage
    console.log(`Storing attestation in DHT: ${this.getAttestationId(wrapper.attestation)}`);
  }
  
  /**
   * Creates a chain entry for an attestation
   */
  private createAttestationChainEntry(attestation: Attestation): AttestationChainEntry {
    // Determine direction based on attestation type
    let direction: Direction = Direction.OBSERVED;
    let counterpartyId = "";
    
    if ('attesterId' in attestation) {
      // This is a peer attestation
      direction = Direction.GIVEN;
      counterpartyId = attestation.subjectId;
    }
    
    const attestationId = this.getAttestationId(attestation);
    
    // Create chain entry
    const chainEntry: AttestationChainEntry = {
      attestationId,
      sequenceNumber: this.getNextSequenceNumber(),
      entryType: "attestation",
      direction,
      counterpartyId,
      dhtKey: new Uint8Array(), // In a real implementation, this would be the DHT key
      attestationHash: this.hashAttestation(attestation)
    };
    
    // In a real implementation, this would store the chain entry
    
    return chainEntry;
  }
  
  // Helper methods
  
  /**
   * Gets the attestation ID from an attestation
   */
  private getAttestationId(attestation: Attestation): string {
    if ('attestationId' in attestation) {
      return attestation.attestationId;
    }
    return "";
  }
  
  /**
   * Gets the next sequence number for chain entries
   */
  private getNextSequenceNumber(): number {
    // In a real implementation, this would get the next sequence number from the chain
    return Date.now();
  }
  
  /**
   * Creates a hash of an attestation for verification
   */
  private hashAttestation(attestation: Attestation): Uint8Array {
    // In a real implementation, this would create a proper hash
    const hash = createHash('sha256');
    hash.update(JSON.stringify(attestation));
    return new Uint8Array(hash.digest());
  }
  
  /**
   * Verifies a system attestation
   */
  private verifySystemAttestation(attestation: SystemAttestation): boolean {
    // In a real implementation, this would verify the system attestation
    // For now, we'll just return true
    return true;
  }
  
  /**
   * Verifies a peer attestation's signature
   */
  private verifyPeerAttestation(attestation: PeerAttestation): boolean {
    // In a real implementation, this would verify the signature
    // For now, we'll simulate verification
    const dataToVerify = Buffer.from(
      JSON.stringify({
        attestationId: attestation.attestationId,
        subjectId: attestation.subjectId,
        attesterId: attestation.attesterId,
        attestationType: attestation.attestationType,
        attestationContent: attestation.attestationContent,
        strength: attestation.strength,
        timestampMs: attestation.timestampMs
      })
    );
    
    // Simulate signature verification
    return this.simulateVerification(dataToVerify, attestation.signature);
  }
  
  /**
   * Verifies a community attestation
   */
  private verifyCommunityAttestation(attestation: CommunityAttestation): boolean {
    // In a real implementation, this would verify the community signature
    // and check that the approval count meets the threshold
    return attestation.approvalCount >= attestation.threshold;
  }
  
  /**
   * Simulates signing data with a private key
   */
  private simulateSignature(data: Buffer, privateKey: Uint8Array): Uint8Array {
    // In a real implementation, this would use the actual crypto signature mechanism
    // For this exercise, we'll just create a hash of the data and key
    const hash = createHash('sha256');
    hash.update(data);
    hash.update(Buffer.from(privateKey));
    return new Uint8Array(hash.digest());
  }
  
  /**
   * Simulates verification of a signature
   */
  private simulateVerification(data: Buffer, signature: Uint8Array): boolean {
    // In a real implementation, this would use the actual crypto verification
    // For this exercise, we'll just return true
    return true;
  }
} 