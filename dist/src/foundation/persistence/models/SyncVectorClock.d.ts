import { SyncVectorClockOperations } from '../interfaces';
import { SyncVectorClock as SyncVectorClockProto } from '../../../generated/foundation/persistence';
/**
 * Implementation of SyncVectorClock
 * Used for creating fuzzy memberships to prioritize relevant data during synchronization
 */
export declare class SyncVectorClock implements SyncVectorClockOperations {
    private clockValues;
    private timestampMs;
    private originatorId;
    /**
     * Create a new SyncVectorClock
     * @param originatorId The ID of the node that originated this clock
     * @param timestampMs The timestamp when the clock was created (in ms since epoch)
     */
    constructor(originatorId: string, timestampMs?: number);
    /**
     * Get the clock value for a specific node
     * @param nodeId The node ID
     * @returns The clock value or 0 if not present
     */
    getClockValue(nodeId: string): number;
    /**
     * Update the clock value for a specific node
     * @param nodeId The node ID
     * @param value The new clock value
     */
    updateClockValue(nodeId: string, value: number): void;
    /**
     * Increment the clock value for a specific node
     * @param nodeId The node ID
     * @returns The new clock value
     */
    incrementClockValue(nodeId: string): number;
    /**
     * Merge with another vector clock
     * @param other The other vector clock to merge with
     */
    merge(other: SyncVectorClockOperations): void;
    /**
     * Get the timestamp when the clock was last updated
     * @returns Timestamp in milliseconds since epoch
     */
    getTimestamp(): number;
    /**
     * Get the originator ID
     * @returns The originator ID
     */
    getOriginatorId(): string;
    /**
     * Convert to protocol buffer format
     * @returns The protocol buffer representation
     */
    toProto(): SyncVectorClockProto;
    /**
     * Serialize to binary format
     * @returns The serialized binary data
     */
    serialize(): Uint8Array;
    /**
     * Create a SyncVectorClock from a protocol buffer
     * @param proto The protocol buffer
     * @returns A new SyncVectorClock
     */
    static fromProto(proto: SyncVectorClockProto): SyncVectorClock;
    /**
     * Deserialize from binary format
     * @param data The serialized binary data
     * @returns A new SyncVectorClock
     */
    static deserialize(data: Uint8Array): SyncVectorClock;
}
