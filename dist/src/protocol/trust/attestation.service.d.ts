/**
 * Attestation Service
 *
 * This service provides functionality for creating, verifying, and managing attestation records
 * based on the protocol definitions in protos/trust/attestation.proto.
 */
import { SystemAttestation, PeerAttestation, CommunityAttestation, AttestationMetadata, Attestation, AttestationDHTWrapper, AttestationExpiry, GeospatialShard } from './types';
export declare class AttestationService {
    private localAttestations;
    /**
     * Creates a system attestation about a subject
     */
    createSystemAttestation(subjectId: string, attestationType: string, evidence: Uint8Array, confidenceScore: number, systemSource: string, metadata?: Partial<AttestationMetadata>): SystemAttestation;
    /**
     * Creates a peer attestation from one user about another
     */
    createPeerAttestation(subjectId: string, attesterId: string, attestationType: string, attestationContent: string, strength: number, privateKey: Uint8Array, // for signing
    metadata?: Partial<AttestationMetadata>): PeerAttestation;
    /**
     * Creates a community attestation from a group about a subject
     */
    createCommunityAttestation(subjectId: string, communityId: string, attestationType: string, attestationContent: string, approvalCount: number, threshold: number, communitySignature: Uint8Array, metadata?: Partial<AttestationMetadata>): CommunityAttestation;
    /**
     * Verifies an attestation's integrity and authenticity
     */
    verifyAttestation(attestation: Attestation): boolean;
    /**
     * Stores an attestation locally and potentially in the DHT
     */
    private storeAttestation;
    /**
     * Retrieves an attestation by ID
     */
    getAttestationById(attestationId: string): AttestationDHTWrapper | undefined;
    /**
     * Retrieves attestations about a subject
     */
    getAttestationsAboutSubject(subjectId: string): AttestationDHTWrapper[];
    /**
     * Updates an attestation's metadata
     */
    updateAttestationMetadata(attestationId: string, metadata: Partial<AttestationMetadata>): boolean;
    /**
     * Creates an attestation expiry record
     */
    createAttestationExpiry(attestationId: string, expiryMs: number, autoRenew?: boolean, renewalPolicy?: string): AttestationExpiry;
    /**
     * Creates a geospatial shard for attestations
     */
    createGeospatialShard(s2CellId: string, level: number): GeospatialShard;
    /**
     * Stores an attestation in the DHT
     */
    private storeAttestationInDHT;
    /**
     * Creates a chain entry for an attestation
     */
    private createAttestationChainEntry;
    /**
     * Gets the attestation ID from an attestation
     */
    private getAttestationId;
    /**
     * Gets the next sequence number for chain entries
     */
    private getNextSequenceNumber;
    /**
     * Creates a hash of an attestation for verification
     */
    private hashAttestation;
    /**
     * Verifies a system attestation
     */
    private verifySystemAttestation;
    /**
     * Verifies a peer attestation's signature
     */
    private verifyPeerAttestation;
    /**
     * Verifies a community attestation
     */
    private verifyCommunityAttestation;
    /**
     * Simulates signing data with a private key
     */
    private simulateSignature;
    /**
     * Simulates verification of a signature
     */
    private simulateVerification;
}
