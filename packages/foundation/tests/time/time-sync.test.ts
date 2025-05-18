import { Logger } from '@juicetokens/common';
import { 
  NTPTimeSource, 
  SystemTimeSource, 
  TimeConsensusManager, 
  TimeSourceManager, 
  TimeSourceType 
} from '../../src';

// Mock logger for testing
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('Time Synchronization', () => {
  let timeSourceManager: TimeSourceManager;
  let consensusManager: TimeConsensusManager;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a time source manager with system time
    timeSourceManager = new TimeSourceManager(mockLogger, {
      includeSystemTimeSource: true,
      systemTimeSourceId: 'system-time-test'
    });
    
    // Create a consensus manager
    consensusManager = new TimeConsensusManager(mockLogger);
  });
  
  afterEach(() => {
    // Clean up
    timeSourceManager.dispose();
    consensusManager.dispose();
  });
  
  test('System time source should be available', async () => {
    const systemSources = timeSourceManager.getTimeSourcesByType(TimeSourceType.SYSTEM);
    expect(systemSources.length).toBe(1);
    
    const systemSource = systemSources[0];
    expect(systemSource).toBeInstanceOf(SystemTimeSource);
    expect(await systemSource.isAvailable()).toBe(true);
  });
  
  test('Should get time from system source', async () => {
    const now = Date.now();
    const time = await timeSourceManager.getCurrentTime();
    
    // Time should be close to current time (within 1 second)
    expect(time).toBeGreaterThanOrEqual(now - 1000);
    expect(time).toBeLessThanOrEqual(now + 1000);
  });
  
  test('Should add NTP source with mock mode', async () => {
    // Create a mock NTP source
    const ntpSource = new NTPTimeSource('ntp-test', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: 1000, // 1 second ahead of system time
      mockAvailable: true
    });
    
    // Add to manager
    timeSourceManager.addTimeSource(ntpSource);
    
    // Should now have NTP sources
    const ntpSources = timeSourceManager.getTimeSourcesByType(TimeSourceType.NTP);
    expect(ntpSources.length).toBe(1);
    
    // NTP source should be available
    expect(await ntpSource.isAvailable()).toBe(true);
    
    // Get time from NTP source directly
    const systemTime = Date.now();
    const ntpTime = await ntpSource.getCurrentTime();
    
    // NTP time should be about 1 second ahead
    expect(ntpTime).toBeGreaterThanOrEqual(systemTime + 900); // Allow for small variations
    expect(ntpTime).toBeLessThanOrEqual(systemTime + 1100);
  });
  
  test('Should use highest confidence source for time', async () => {
    // Create a mock NTP source with high confidence
    const ntpSource = new NTPTimeSource('ntp-test', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: 1000, // 1 second ahead of system time
      mockAvailable: true
    });
    
    // Set NTP confidence higher than system
    (ntpSource as any).updateConfidenceScore(95);
    
    // Add to manager
    timeSourceManager.addTimeSource(ntpSource);
    
    // Get time - should use NTP since it has higher confidence
    const systemTime = Date.now();
    const managerTime = await timeSourceManager.getCurrentTime();
    
    // Time should be closer to NTP time than system time
    expect(managerTime).toBeGreaterThanOrEqual(systemTime + 900);
    expect(managerTime).toBeLessThanOrEqual(systemTime + 1100);
  });
  
  test('Should calculate consensus time from multiple sources', async () => {
    // Create mock NTP sources with different offsets
    const ntpSource1 = new NTPTimeSource('ntp-test-1', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: 500, // 0.5 seconds ahead
      mockAvailable: true
    });
    
    const ntpSource2 = new NTPTimeSource('ntp-test-2', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: -500, // 0.5 seconds behind
      mockAvailable: true
    });
    
    // Add to managers
    timeSourceManager.addTimeSource(ntpSource1);
    timeSourceManager.addTimeSource(ntpSource2);
    
    // Add all sources to consensus manager
    const systemSources = timeSourceManager.getTimeSourcesByType(TimeSourceType.SYSTEM);
    for (const source of systemSources) {
      consensusManager.addTimeSource(source);
    }
    
    consensusManager.addTimeSource(ntpSource1);
    consensusManager.addTimeSource(ntpSource2);
    
    // Calculate consensus
    const consensus = await consensusManager.recalculateConsensus();
    
    // Consensus should have 3 contributing sources
    expect(consensus.contributingSources).toBe(3);
    
    // Calculate expected time bounds
    const systemTime = Date.now();
    const minExpected = systemTime - 600; // Allow some test execution time
    const maxExpected = systemTime + 600;
    
    // Consensus time should be close to system time (since median of -500, 0, +500 is 0)
    expect(consensus.consensusTimestamp).toBeGreaterThanOrEqual(minExpected);
    expect(consensus.consensusTimestamp).toBeLessThanOrEqual(maxExpected);
    
    // Confidence should be good with 3 sources
    expect(consensus.consensusConfidence).toBeGreaterThan(60);
  });
  
  test('Should exclude sources with large deviations from consensus', async () => {
    // Create mock NTP sources with different offsets
    const ntpSource1 = new NTPTimeSource('ntp-test-1', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: 500, // 0.5 seconds ahead - reasonable
      mockAvailable: true
    });
    
    const ntpSource2 = new NTPTimeSource('ntp-test-2', mockLogger, {
      mockMode: true,
      mockTimeOffsetMs: 10000, // 10 seconds ahead - too far off
      mockAvailable: true
    });
    
    // Add to consensus manager
    const systemSources = timeSourceManager.getTimeSourcesByType(TimeSourceType.SYSTEM);
    for (const source of systemSources) {
      consensusManager.addTimeSource(source);
    }
    
    consensusManager.addTimeSource(ntpSource1);
    consensusManager.addTimeSource(ntpSource2);
    
    // Calculate consensus
    const consensus = await consensusManager.recalculateConsensus();
    
    // Only 2 sources should contribute (system and ntpSource1)
    // ntpSource2 should be excluded due to large deviation
    expect(consensus.contributingSources).toBe(2);
    
    // Consensus time should be closer to system time than the extreme outlier
    const systemTime = Date.now();
    const minExpected = systemTime - 600;
    const maxExpected = systemTime + 600;
    
    expect(consensus.consensusTimestamp).toBeGreaterThanOrEqual(minExpected);
    expect(consensus.consensusTimestamp).toBeLessThanOrEqual(maxExpected);
  });
}); 