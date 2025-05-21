"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const foundation_1 = require("@juicetokens/foundation");
// Mock logger for testing
const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
describe('Hardware Capability Detection', () => {
    let mockFactory;
    let hardwareDetector;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create a mock factory
        mockFactory = new foundation_1.MockCapabilityProviderFactory({
            mockAvailable: true,
            mockVersion: '1.0',
            mockDetails: {
                vendor: 'Test Vendor',
                model: 'Test Model'
            }
        });
        // Create hardware detector
        hardwareDetector = new foundation_1.HardwareCapabilityDetector(mockLogger, mockFactory);
    });
    test('Should detect TEE capability', async () => {
        const status = await hardwareDetector.detectCapability(foundation_1.HardwareSecurityCapability.TEE);
        expect(status.capability).toBe(foundation_1.HardwareSecurityCapability.TEE);
        expect(status.available).toBe(true);
        expect(status.version).toBe('1.0');
        expect(status.details).toBeDefined();
        expect(status.details?.vendor).toBe('Test Vendor');
    });
    test('Should detect unavailable capability', async () => {
        // Configure TPM to be unavailable
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.TPM, { mockAvailable: false });
        const status = await hardwareDetector.detectCapability(foundation_1.HardwareSecurityCapability.TPM);
        expect(status.capability).toBe(foundation_1.HardwareSecurityCapability.TPM);
        expect(status.available).toBe(false);
    });
    test('Should detect all capabilities', async () => {
        // Configure some capabilities differently
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.SGX, { mockAvailable: false });
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.HSM, { mockAvailable: true, mockVersion: '2.5' });
        const statuses = await hardwareDetector.detectAllCapabilities();
        // Should have detected all capabilities
        expect(statuses.length).toBe(Object.keys(foundation_1.HardwareSecurityCapability).length);
        // SGX should be unavailable
        const sgxStatus = statuses.find(s => s.capability === foundation_1.HardwareSecurityCapability.SGX);
        expect(sgxStatus).toBeDefined();
        expect(sgxStatus?.available).toBe(false);
        // HSM should have version 2.5
        const hsmStatus = statuses.find(s => s.capability === foundation_1.HardwareSecurityCapability.HSM);
        expect(hsmStatus).toBeDefined();
        expect(hsmStatus?.available).toBe(true);
        expect(hsmStatus?.version).toBe('2.5');
    });
    test('Should calculate security level based on available capabilities', async () => {
        // Configure some capabilities differently
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.TEE, { mockAvailable: true });
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.TPM, { mockAvailable: true });
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.SGX, { mockAvailable: false });
        mockFactory.configureCapability(foundation_1.HardwareSecurityCapability.HSM, { mockAvailable: false });
        // Other capabilities use default (true)
        const securityLevel = await hardwareDetector.getSecurityLevel();
        // Security level should be partial since some capabilities are missing
        expect(securityLevel).toBeGreaterThan(0);
        expect(securityLevel).toBeLessThan(100);
        // Reset the factory to make all capabilities available
        mockFactory = new foundation_1.MockCapabilityProviderFactory({ mockAvailable: true });
        hardwareDetector = new foundation_1.HardwareCapabilityDetector(mockLogger, mockFactory);
        const fullSecurityLevel = await hardwareDetector.getSecurityLevel();
        // Security level should be high with all capabilities
        expect(fullSecurityLevel).toBe(100);
    });
});
//# sourceMappingURL=hardware-detection.test.js.map