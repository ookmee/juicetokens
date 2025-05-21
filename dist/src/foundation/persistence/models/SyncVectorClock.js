"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncVectorClock = void 0;
const persistence_1 = require("../../../generated/foundation/persistence");
/**
 * Implementation of SyncVectorClock
 * Used for creating fuzzy memberships to prioritize relevant data during synchronization
 */
class SyncVectorClock {
    /**
     * Create a new SyncVectorClock
     * @param originatorId The ID of the node that originated this clock
     * @param timestampMs The timestamp when the clock was created (in ms since epoch)
     */
    constructor(originatorId, timestampMs) {
        this.clockValues = new Map();
        this.originatorId = originatorId;
        this.timestampMs = timestampMs || Date.now();
    }
    /**
     * Get the clock value for a specific node
     * @param nodeId The node ID
     * @returns The clock value or 0 if not present
     */
    getClockValue(nodeId) {
        return this.clockValues.get(nodeId) || 0;
    }
    /**
     * Update the clock value for a specific node
     * @param nodeId The node ID
     * @param value The new clock value
     */
    updateClockValue(nodeId, value) {
        this.clockValues.set(nodeId, value);
        this.timestampMs = Date.now();
    }
    /**
     * Increment the clock value for a specific node
     * @param nodeId The node ID
     * @returns The new clock value
     */
    incrementClockValue(nodeId) {
        const currentValue = this.getClockValue(nodeId);
        const newValue = currentValue + 1;
        this.updateClockValue(nodeId, newValue);
        return newValue;
    }
    /**
     * Merge with another vector clock
     * @param other The other vector clock to merge with
     */
    merge(other) {
        if (other instanceof SyncVectorClock) {
            // Iterate through other's clock values
            other.clockValues.forEach((value, nodeId) => {
                const currentValue = this.getClockValue(nodeId);
                if (value > currentValue) {
                    this.updateClockValue(nodeId, value);
                }
            });
            // Update timestamp to the latest
            this.timestampMs = Math.max(this.timestampMs, other.timestampMs);
        }
        else {
            // Handle generic SyncVectorClockOperations
            if (other.toProto) {
                const proto = other.toProto();
                Object.entries(proto.clock_values).forEach(([nodeId, value]) => {
                    const currentValue = this.getClockValue(nodeId);
                    if (value > currentValue) {
                        this.updateClockValue(nodeId, value);
                    }
                });
            }
        }
    }
    /**
     * Get the timestamp when the clock was last updated
     * @returns Timestamp in milliseconds since epoch
     */
    getTimestamp() {
        return this.timestampMs;
    }
    /**
     * Get the originator ID
     * @returns The originator ID
     */
    getOriginatorId() {
        return this.originatorId;
    }
    /**
     * Convert to protocol buffer format
     * @returns The protocol buffer representation
     */
    toProto() {
        const clockValuesObj = {};
        this.clockValues.forEach((value, nodeId) => {
            clockValuesObj[nodeId] = value;
        });
        return persistence_1.SyncVectorClock.create({
            clock_values: clockValuesObj,
            timestamp_ms: this.timestampMs,
            originator_id: this.originatorId
        });
    }
    /**
     * Serialize to binary format
     * @returns The serialized binary data
     */
    serialize() {
        const proto = this.toProto();
        return persistence_1.SyncVectorClock.encode(proto).finish();
    }
    /**
     * Create a SyncVectorClock from a protocol buffer
     * @param proto The protocol buffer
     * @returns A new SyncVectorClock
     */
    static fromProto(proto) {
        const clock = new SyncVectorClock(proto.originator_id, proto.timestamp_ms || undefined);
        Object.entries(proto.clock_values).forEach(([nodeId, value]) => {
            clock.updateClockValue(nodeId, value);
        });
        return clock;
    }
    /**
     * Deserialize from binary format
     * @param data The serialized binary data
     * @returns A new SyncVectorClock
     */
    static deserialize(data) {
        const proto = persistence_1.SyncVectorClock.decode(data);
        return SyncVectorClock.fromProto(proto);
    }
}
exports.SyncVectorClock = SyncVectorClock;
//# sourceMappingURL=SyncVectorClock.js.map