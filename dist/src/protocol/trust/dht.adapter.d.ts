/**
 * DHT Adapter for Trust and Attestation Layer
 *
 * This adapter provides distributed hash table (DHT) functionality for storing and retrieving
 * attestations, reputation data, and identity information.
 */
import { AttestationDHTWrapper, GeospatialShard, PrivacyPreservingLookup } from './types';
/**
 * Interface for DHT storage options
 */
export interface DHTStorageOptions {
    ttlSeconds: number;
    replicate: boolean;
    replicationFactor: number;
    s2CellId?: string;
    encryptionKey?: Uint8Array;
}
/**
 * Interface for DHT query options
 */
export interface DHTQueryOptions {
    maxResults?: number;
    includeExpired?: boolean;
    continuationToken?: string;
    s2CellId?: string;
}
/**
 * Interface for DHT query results
 */
export interface DHTQueryResult<T> {
    results: T[];
    totalResults: number;
    truncated: boolean;
    continuationToken?: string;
}
/**
 * DHT Adapter for the Trust and Attestation Layer
 */
export declare class DHTAdapter {
    private localDHTStore;
    private geospatialShards;
    /**
     * Publishes an attestation to the DHT
     */
    publishAttestation(wrapper: AttestationDHTWrapper, options: DHTStorageOptions): string;
    /**
     * Retrieves an attestation from the DHT by key
     */
    getAttestationByKey(dhtKey: string): AttestationDHTWrapper | null;
    /**
     * Queries attestations in the DHT
     */
    queryAttestations(query: {
        attestationId?: string;
        subjectId?: string;
        attesterId?: string;
        attestationType?: string;
    }, options?: DHTQueryOptions): DHTQueryResult<AttestationDHTWrapper>;
    /**
     * Queries attestations by geospatial shard
     */
    private queryAttestationsByGeospatialShard;
    /**
     * Publishes reputation data to the DHT
     */
    publishReputationData(userId: string, reputationData: any, options: DHTStorageOptions): string;
    /**
     * Retrieves reputation data from the DHT
     */
    getReputationData(userId: string): any;
    /**
     * Publishes identity data to the DHT
     */
    publishIdentityData(identityId: string, identityData: any, didDocument: any, options: DHTStorageOptions): string;
    /**
     * Retrieves identity data from the DHT
     */
    getIdentityData(identityId: string): any;
    /**
     * Performs a privacy-preserving lookup in the DHT
     */
    privacyPreservingLookup(lookup: PrivacyPreservingLookup): any[];
    /**
     * Creates a new geospatial shard
     */
    createGeospatialShard(s2CellId: string, level: number): GeospatialShard;
    /**
     * Adds an attestation to a geospatial shard
     */
    private addToGeospatialShard;
    /**
     * Generates a DHT key for an attestation
     */
    private generateDHTKey;
    /**
     * Generates a DHT key for reputation data
     */
    private generateReputationDHTKey;
    /**
     * Generates a DHT key for identity data
     */
    private generateIdentityDHTKey;
    /**
     * Generates a continuation token for paginated results
     */
    private generateContinuationToken;
    /**
     * Calculates a Merkle root for a list of attestation IDs
     */
    private calculateMerkleRoot;
    /**
     * Checks if an attestation matches a query
     */
    private matchesAttestationQuery;
}
