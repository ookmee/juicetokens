import { Logger } from '@juicetokens/common';
import { 
  HardwareCapabilityDetector,
  HardwareSecurityCapability,
  MockCapabilityProviderFactory
} from '@juicetokens/foundation';

// Mock logger for testing
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('Hardware Capability Detection', () => {
  let mockFactory: MockCapabilityProviderFactory;
  let hardwareDetector: HardwareCapabilityDetector;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a mock factory
    mockFactory = new MockCapabilityProviderFactory({
      mockAvailable: true,
      mockVersion: '1.0',
      mockDetails: {
        vendor: 'Test Vendor',
        model: 'Test Model'
      }
    });
    
    // Create hardware detector
    hardwareDetector = new HardwareCapabilityDetector(mockLogger, mockFactory);
  });
  
  test('Should detect TEE capability', async () => {
    const status = await hardwareDetector.detectCapability(HardwareSecurityCapability.TEE);
    
    expect(status.capability).toBe(HardwareSecurityCapability.TEE);
    expect(status.available).toBe(true);
    expect(status.version).toBe('1.0');
    expect(status.details).toBeDefined();
    expect(status.details?.vendor).toBe('Test Vendor');
  });
  
  test('Should detect unavailable capability', async () => {
    // Configure TPM to be unavailable
    mockFactory.configureCapability(
      HardwareSecurityCapability.TPM, 
      { mockAvailable: false }
    );
    
    const status = await hardwareDetector.detectCapability(HardwareSecurityCapability.TPM);
    
    expect(status.capability).toBe(HardwareSecurityCapability.TPM);
    expect(status.available).toBe(false);
  });
  
  test('Should detect all capabilities', async () => {
    // Configure some capabilities differently
    mockFactory.configureCapability(
      HardwareSecurityCapability.SGX, 
      { mockAvailable: false }
    );
    
    mockFactory.configureCapability(
      HardwareSecurityCapability.HSM, 
      { mockAvailable: true, mockVersion: '2.5' }
    );
    
    const statuses = await hardwareDetector.detectAllCapabilities();
    
    // Should have detected all capabilities
    expect(statuses.length).toBe(Object.keys(HardwareSecurityCapability).length);
    
    // SGX should be unavailable
    const sgxStatus = statuses.find(s => s.capability === HardwareSecurityCapability.SGX);
    expect(sgxStatus).toBeDefined();
    expect(sgxStatus?.available).toBe(false);
    
    // HSM should have version 2.5
    const hsmStatus = statuses.find(s => s.capability === HardwareSecurityCapability.HSM);
    expect(hsmStatus).toBeDefined();
    expect(hsmStatus?.available).toBe(true);
    expect(hsmStatus?.version).toBe('2.5');
  });
  
  test('Should calculate security level based on available capabilities', async () => {
    // Configure some capabilities differently
    mockFactory.configureCapability(
      HardwareSecurityCapability.TEE, 
      { mockAvailable: true }
    );
    
    mockFactory.configureCapability(
      HardwareSecurityCapability.TPM, 
      { mockAvailable: true }
    );
    
    mockFactory.configureCapability(
      HardwareSecurityCapability.SGX, 
      { mockAvailable: false }
    );
    
    mockFactory.configureCapability(
      HardwareSecurityCapability.HSM, 
      { mockAvailable: false }
    );
    
    // Other capabilities use default (true)
    
    const securityLevel = await hardwareDetector.getSecurityLevel();
    
    // Security level should be partial since some capabilities are missing
    expect(securityLevel).toBeGreaterThan(0);
    expect(securityLevel).toBeLessThan(100);
    
    // Reset the factory to make all capabilities available
    mockFactory = new MockCapabilityProviderFactory({ mockAvailable: true });
    hardwareDetector = new HardwareCapabilityDetector(mockLogger, mockFactory);
    
    const fullSecurityLevel = await hardwareDetector.getSecurityLevel();
    
    // Security level should be high with all capabilities
    expect(fullSecurityLevel).toBe(100);
  });
}); 