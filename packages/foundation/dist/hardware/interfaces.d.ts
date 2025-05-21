import { Logger } from '@juicetokens/common';
/**
 * Hardware security capabilities
 */
export declare enum HardwareSecurityCapability {
    TEE = "TEE",// Trusted Execution Environment
    TPM = "TPM",// Trusted Platform Module
    SE = "SE",// Secure Element
    SGX = "SGX",// Intel SGX
    TZ = "TZ",// ARM TrustZone
    HSM = "HSM",// Hardware Security Module
    OTP = "OTP"
}
/**
 * Status of a hardware capability
 */
export interface HardwareCapabilityStatus {
    /**
     * Name of the capability
     */
    capability: HardwareSecurityCapability;
    /**
     * Whether the capability is available
     */
    available: boolean;
    /**
     * Version information (if available)
     */
    version?: string;
    /**
     * Additional details about the capability
     */
    details?: {
        [key: string]: any;
    };
    /**
     * Error message if detection failed
     */
    error?: string;
}
/**
 * Interface for hardware capability detection
 */
export interface IHardwareCapabilityDetector {
    /**
     * Check if a specific capability is available
     * @param capability The capability to check
     * @returns Promise resolving to the status of the capability
     */
    detectCapability(capability: HardwareSecurityCapability): Promise<HardwareCapabilityStatus>;
    /**
     * Detect all supported hardware security capabilities
     * @returns Promise resolving to an array of capability statuses
     */
    detectAllCapabilities(): Promise<HardwareCapabilityStatus[]>;
    /**
     * Get the security level of the device
     * @returns Promise resolving to the security level (0-100)
     */
    getSecurityLevel(): Promise<number>;
}
/**
 * Interface for hardware capability providers
 */
export interface IHardwareCapabilityProvider {
    /**
     * The capability this provider can detect
     */
    readonly capability: HardwareSecurityCapability;
    /**
     * Check if the capability is available
     * @returns Promise resolving to the status of the capability
     */
    detect(): Promise<HardwareCapabilityStatus>;
}
/**
 * Configuration for hardware capability providers
 */
export interface HardwareCapabilityProviderConfig {
    /**
     * Whether to use mock implementations for testing
     */
    mockMode?: boolean;
    /**
     * In mock mode, whether the capability should be reported as available
     */
    mockAvailable?: boolean;
    /**
     * In mock mode, version to report
     */
    mockVersion?: string;
    /**
     * In mock mode, details to include in the report
     */
    mockDetails?: {
        [key: string]: any;
    };
}
/**
 * Factory for creating hardware capability providers
 */
export interface IHardwareCapabilityProviderFactory {
    /**
     * Create a provider for the specified capability
     * @param capability The capability to create a provider for
     * @param logger Logger instance
     * @param config Configuration options
     * @returns Promise resolving to the provider
     */
    createProvider(capability: HardwareSecurityCapability, logger: Logger, config?: HardwareCapabilityProviderConfig): Promise<IHardwareCapabilityProvider>;
    /**
     * List all capabilities that this factory can provide
     * @returns Array of supported capabilities
     */
    getSupportedCapabilities(): HardwareSecurityCapability[];
}
