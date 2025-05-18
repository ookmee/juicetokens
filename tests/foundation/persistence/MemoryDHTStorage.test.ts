import { MemoryDHTStorage } from '../../../src/foundation/persistence/adapters/MemoryDHTStorage';
import { DHTEntry } from '../../../src/generated/foundation/persistence';

describe('MemoryDHTStorage', () => {
  let storage: MemoryDHTStorage;
  
  // Sample DHT entry for testing
  const createTestEntry = (id: number): DHTEntry => {
    return DHTEntry.create({
      key: new Uint8Array([id, 1, 2, 3, 4]),
      value: new Uint8Array([5, 6, 7, 8]),
      timestamp_ms: Date.now(),
      ttl_seconds: 3600,
      user_id: `user-${id}`,
      entry_type: id % 2 === 0 ? 'token' : 'attestation',
      sequence_number: id
    });
  };
  
  beforeEach(async () => {
    storage = new MemoryDHTStorage();
    await storage.initialize();
  });
  
  afterEach(async () => {
    await storage.clear();
  });
  
  test('should store and retrieve entries', async () => {
    const entry = createTestEntry(1);
    await storage.put(entry);
    
    const retrieved = await storage.get(entry.key);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.key).toEqual(entry.key);
    expect(retrieved!.value).toEqual(entry.value);
    expect(retrieved!.user_id).toEqual(entry.user_id);
  });
  
  test('should return null for non-existent entries', async () => {
    const nonExistentKey = new Uint8Array([99, 99, 99, 99]);
    const retrieved = await storage.get(nonExistentKey);
    expect(retrieved).toBeNull();
  });
  
  test('should delete entries', async () => {
    const entry = createTestEntry(2);
    await storage.put(entry);
    
    const beforeDelete = await storage.get(entry.key);
    expect(beforeDelete).not.toBeNull();
    
    const deleteResult = await storage.delete(entry.key);
    expect(deleteResult).toBe(true);
    
    const afterDelete = await storage.get(entry.key);
    expect(afterDelete).toBeNull();
  });
  
  test('should list all entries', async () => {
    await storage.put(createTestEntry(1));
    await storage.put(createTestEntry(2));
    await storage.put(createTestEntry(3));
    
    const entries = await storage.list();
    expect(entries.length).toBe(3);
  });
  
  test('should query entries by user', async () => {
    await storage.put(createTestEntry(1)); // user-1
    await storage.put(createTestEntry(2)); // user-2
    await storage.put(createTestEntry(3)); // user-3
    await storage.put(createTestEntry(4)); // user-4
    
    const user1Entries = await storage.queryByUser('user-1');
    expect(user1Entries.length).toBe(1);
    expect(user1Entries[0].user_id).toBe('user-1');
    
    const user2Entries = await storage.queryByUser('user-2');
    expect(user2Entries.length).toBe(1);
    expect(user2Entries[0].user_id).toBe('user-2');
    
    const nonExistentUserEntries = await storage.queryByUser('non-existent');
    expect(nonExistentUserEntries.length).toBe(0);
  });
  
  test('should query entries by type', async () => {
    await storage.put(createTestEntry(1)); // attestation
    await storage.put(createTestEntry(2)); // token
    await storage.put(createTestEntry(3)); // attestation
    await storage.put(createTestEntry(4)); // token
    
    const tokenEntries = await storage.queryByType('token');
    expect(tokenEntries.length).toBe(2);
    tokenEntries.forEach(entry => {
      expect(entry.entry_type).toBe('token');
    });
    
    const attestationEntries = await storage.queryByType('attestation');
    expect(attestationEntries.length).toBe(2);
    attestationEntries.forEach(entry => {
      expect(entry.entry_type).toBe('attestation');
    });
    
    const nonExistentTypeEntries = await storage.queryByType('non-existent');
    expect(nonExistentTypeEntries.length).toBe(0);
  });
}); 