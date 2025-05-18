import { Logger } from '@juicetokens/common';
import { TeeSimulator } from '../../src';

// Mock logger for testing
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('TEE Simulator', () => {
  let teeSimulator: TeeSimulator;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create TEE simulator with no delays for faster tests
    teeSimulator = new TeeSimulator(mockLogger, {
      simulateDelays: false,
      securityLevel: 2,
      teeType: 'Test TEE',
      teeVersion: '1.0.0'
    });
  });
  
  afterEach(() => {
    // Reset simulator state
    teeSimulator.reset();
  });
  
  test('TEE simulator should always be available', async () => {
    const available = await teeSimulator.isTeeAvailable();
    expect(available).toBe(true);
  });
  
  test('Should generate attestation with challenge', async () => {
    // Create a challenge
    const challenge = new Uint8Array([1, 2, 3, 4, 5]);
    
    // Get attestation with challenge
    const attestation1 = await teeSimulator.getAttestation(challenge);
    
    // Attestation should be successful
    expect(attestation1.success).toBe(true);
    expect(attestation1.attestationData).toBeDefined();
    expect(attestation1.attestationData!.length).toBe(32);
    
    // TEE info should match configuration
    expect(attestation1.teeInfo).toBeDefined();
    expect(attestation1.teeInfo!.type).toBe('Test TEE');
    expect(attestation1.teeInfo!.version).toBe('1.0.0');
    expect(attestation1.teeInfo!.securityLevel).toBe(2);
    
    // Different challenge should produce different attestation
    const challenge2 = new Uint8Array([5, 4, 3, 2, 1]);
    const attestation2 = await teeSimulator.getAttestation(challenge2);
    
    expect(attestation2.success).toBe(true);
    expect(attestation2.attestationData).toBeDefined();
    
    // The attestations should be different due to different challenges
    expect(attestation1.attestationData).not.toEqual(attestation2.attestationData);
  });
  
  test('Should handle attestation failure', async () => {
    // Create a simulator configured to fail attestation
    const failingSimulator = new TeeSimulator(mockLogger, {
      simulateDelays: false,
      attestationSuccess: false
    });
    
    // Attestation should fail
    const attestation = await failingSimulator.getAttestation();
    
    expect(attestation.success).toBe(false);
    expect(attestation.error).toBeDefined();
    expect(attestation.attestationData).toBeUndefined();
  });
  
  test('Should execute secure functions', async () => {
    // Random bytes generation
    const randomBytes = await teeSimulator.executeSecureFunction('generateRandomBytes', [16]);
    expect(randomBytes).toBeInstanceOf(Uint8Array);
    expect(randomBytes.length).toBe(16);
    
    // Hash function
    const hash = await teeSimulator.executeSecureFunction('hash', ['data to hash']);
    expect(hash).toBeInstanceOf(Uint8Array);
    expect(hash.length).toBe(32);
    
    // Sign function
    const signature = await teeSimulator.executeSecureFunction('sign', ['data to sign']);
    expect(signature).toBeInstanceOf(Uint8Array);
    expect(signature.length).toBe(64);
  });
  
  test('Should reject unknown functions', async () => {
    await expect(
      teeSimulator.executeSecureFunction('unknownFunction', [])
    ).rejects.toThrow();
  });
  
  test('Should allow configuring function results', async () => {
    // Configure a custom function result
    const customResult = { custom: 'result', value: 42 };
    teeSimulator.setFunctionResult('customFunction', customResult);
    
    // Execute the function
    const result = await teeSimulator.executeSecureFunction('customFunction', []);
    
    // Result should match configured value
    expect(result).toEqual(customResult);
    
    // Configure a function that processes arguments
    teeSimulator.setFunctionResult('add', (a: number, b: number) => a + b);
    
    // Execute with arguments
    const sum = await teeSimulator.executeSecureFunction('add', [5, 7]);
    expect(sum).toBe(12);
  });
  
  test('Should store and retrieve secure data', async () => {
    // Data to store
    const key = 'test-key';
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    
    // Store data
    const storeResult = await teeSimulator.storeSecureData(key, data);
    expect(storeResult).toBe(true);
    
    // Retrieve data
    const retrievedData = await teeSimulator.retrieveSecureData(key);
    
    // Data should match
    expect(retrievedData).toBeInstanceOf(Uint8Array);
    expect(retrievedData).toEqual(data);
    
    // Non-existent key should return null
    const nonExistentData = await teeSimulator.retrieveSecureData('non-existent');
    expect(nonExistentData).toBeNull();
  });
}); 