import { SyncVectorClock } from '../../../src/foundation/persistence/models/SyncVectorClock';

describe('SyncVectorClock', () => {
  test('should initialize with default values', () => {
    const clock = new SyncVectorClock('node-1');
    expect(clock.getOriginatorId()).toBe('node-1');
    expect(clock.getClockValue('node-1')).toBe(0);
    expect(clock.getTimestamp()).toBeLessThanOrEqual(Date.now());
  });
  
  test('should initialize with custom timestamp', () => {
    const timestamp = Date.now() - 1000; // 1 second ago
    const clock = new SyncVectorClock('node-1', timestamp);
    expect(clock.getTimestamp()).toBe(timestamp);
  });
  
  test('should update clock values', () => {
    const clock = new SyncVectorClock('node-1');
    clock.updateClockValue('node-1', 5);
    expect(clock.getClockValue('node-1')).toBe(5);
    
    clock.updateClockValue('node-2', 10);
    expect(clock.getClockValue('node-2')).toBe(10);
  });
  
  test('should increment clock values', () => {
    const clock = new SyncVectorClock('node-1');
    expect(clock.incrementClockValue('node-1')).toBe(1);
    expect(clock.getClockValue('node-1')).toBe(1);
    
    expect(clock.incrementClockValue('node-1')).toBe(2);
    expect(clock.getClockValue('node-1')).toBe(2);
    
    expect(clock.incrementClockValue('node-2')).toBe(1);
    expect(clock.getClockValue('node-2')).toBe(1);
  });
  
  test('should merge with another clock', () => {
    const clock1 = new SyncVectorClock('node-1');
    clock1.updateClockValue('node-1', 5);
    clock1.updateClockValue('node-2', 10);
    
    const clock2 = new SyncVectorClock('node-2');
    clock2.updateClockValue('node-1', 3);
    clock2.updateClockValue('node-2', 15);
    clock2.updateClockValue('node-3', 7);
    
    // Merge clock2 into clock1
    clock1.merge(clock2);
    
    // Should take the max values
    expect(clock1.getClockValue('node-1')).toBe(5); // unchanged
    expect(clock1.getClockValue('node-2')).toBe(15); // updated
    expect(clock1.getClockValue('node-3')).toBe(7); // added
  });
  
  test('should serialize and deserialize', () => {
    const originalClock = new SyncVectorClock('node-1');
    originalClock.updateClockValue('node-1', 5);
    originalClock.updateClockValue('node-2', 10);
    
    const serialized = originalClock.serialize();
    expect(serialized).toBeInstanceOf(Uint8Array);
    
    const deserializedClock = SyncVectorClock.deserialize(serialized);
    expect(deserializedClock).toBeInstanceOf(SyncVectorClock);
    expect(deserializedClock.getOriginatorId()).toBe('node-1');
    expect(deserializedClock.getClockValue('node-1')).toBe(5);
    expect(deserializedClock.getClockValue('node-2')).toBe(10);
  });
  
  test('should convert to proto format', () => {
    const clock = new SyncVectorClock('node-1');
    clock.updateClockValue('node-1', 5);
    clock.updateClockValue('node-2', 10);
    
    const proto = clock.toProto();
    expect(proto.originator_id).toBe('node-1');
    expect(proto.clock_values['node-1']).toBe(5);
    expect(proto.clock_values['node-2']).toBe(10);
  });
  
  test('should create from proto format', () => {
    const clock = new SyncVectorClock('node-1');
    clock.updateClockValue('node-1', 5);
    clock.updateClockValue('node-2', 10);
    
    const proto = clock.toProto();
    const fromProto = SyncVectorClock.fromProto(proto);
    
    expect(fromProto.getOriginatorId()).toBe('node-1');
    expect(fromProto.getClockValue('node-1')).toBe(5);
    expect(fromProto.getClockValue('node-2')).toBe(10);
  });
}); 