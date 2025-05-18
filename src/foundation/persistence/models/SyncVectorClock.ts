import { SyncVectorClockOperations } from '../interfaces';
import { SyncVectorClock as SyncVectorClockProto } from '../../../generated/foundation/persistence';

/**
 * Implementation of SyncVectorClock
 * Used for creating fuzzy memberships to prioritize relevant data during synchronization
 */
export class SyncVectorClock implements SyncVectorClockOperations {
  private clockValues: Map<string, number> = new Map();
  private timestampMs: number;
  private originatorId: string;
  
  /**
   * Create a new SyncVectorClock
   * @param originatorId The ID of the node that originated this clock
   * @param timestampMs The timestamp when the clock was created (in ms since epoch)
   */
  constructor(originatorId: string, timestampMs?: number) {
    this.originatorId = originatorId;
    this.timestampMs = timestampMs || Date.now();
  }
  
  /**
   * Get the clock value for a specific node
   * @param nodeId The node ID
   * @returns The clock value or 0 if not present
   */
  getClockValue(nodeId: string): number {
    return this.clockValues.get(nodeId) || 0;
  }
  
  /**
   * Update the clock value for a specific node
   * @param nodeId The node ID
   * @param value The new clock value
   */
  updateClockValue(nodeId: string, value: number): void {
    this.clockValues.set(nodeId, value);
    this.timestampMs = Date.now();
  }
  
  /**
   * Increment the clock value for a specific node
   * @param nodeId The node ID
   * @returns The new clock value
   */
  incrementClockValue(nodeId: string): number {
    const currentValue = this.getClockValue(nodeId);
    const newValue = currentValue + 1;
    this.updateClockValue(nodeId, newValue);
    return newValue;
  }
  
  /**
   * Merge with another vector clock
   * @param other The other vector clock to merge with
   */
  merge(other: SyncVectorClockOperations): void {
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
    } else {
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
  getTimestamp(): number {
    return this.timestampMs;
  }
  
  /**
   * Get the originator ID
   * @returns The originator ID
   */
  getOriginatorId(): string {
    return this.originatorId;
  }
  
  /**
   * Convert to protocol buffer format
   * @returns The protocol buffer representation
   */
  toProto(): SyncVectorClockProto {
    const clockValuesObj: {[key: string]: number} = {};
    
    this.clockValues.forEach((value, nodeId) => {
      clockValuesObj[nodeId] = value;
    });
    
    return SyncVectorClockProto.create({
      clock_values: clockValuesObj,
      timestamp_ms: this.timestampMs,
      originator_id: this.originatorId
    });
  }
  
  /**
   * Serialize to binary format
   * @returns The serialized binary data
   */
  serialize(): Uint8Array {
    const proto = this.toProto();
    return SyncVectorClockProto.encode(proto).finish();
  }
  
  /**
   * Create a SyncVectorClock from a protocol buffer
   * @param proto The protocol buffer
   * @returns A new SyncVectorClock
   */
  static fromProto(proto: SyncVectorClockProto): SyncVectorClock {
    const clock = new SyncVectorClock(
      proto.originator_id,
      proto.timestamp_ms || undefined
    );
    
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
  static deserialize(data: Uint8Array): SyncVectorClock {
    const proto = SyncVectorClockProto.decode(data);
    return SyncVectorClock.fromProto(proto);
  }
} 