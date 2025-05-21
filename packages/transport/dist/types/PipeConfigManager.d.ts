import { PipeConfiguration, PipeType } from '../proto-types';
/**
 * Options for QR KISS configuration
 */
export interface QrKissConfigOptions {
    qrCodeVersion?: number;
    errorCorrectionLevel?: string;
    chunkSizeBytes?: number;
    displaySizePixels?: number;
}
/**
 * Options for BLE configuration
 */
export interface BleConfigOptions {
    serviceUuid?: string;
    characteristicUuid?: string;
    requireBonding?: boolean;
    mtuSize?: number;
}
/**
 * Options for NFC configuration
 */
export interface NfcConfigOptions {
    aid?: string;
    useSecureElement?: boolean;
    maxMessageSize?: number;
}
/**
 * Options for Web configuration
 */
export interface WebConfigOptions {
    endpointUrl?: string;
    useWebsocket?: boolean;
    headers?: Record<string, string>;
    useTls?: boolean;
}
/**
 * Options for pipe configuration
 */
export interface PipeConfigOptions {
    pipeId?: string;
    timeoutMs?: number;
    qrKiss?: QrKissConfigOptions;
    ble?: BleConfigOptions;
    nfc?: NfcConfigOptions;
    web?: WebConfigOptions;
}
/**
 * PipeConfigManager manages configuration for different pipe types
 */
export declare class PipeConfigManager {
    /**
     * Create a pipe configuration for QR KISS
     * @param options Options for pipe configuration
     * @returns Pipe configuration for QR KISS
     */
    static createQrKissConfig(options?: PipeConfigOptions): PipeConfiguration;
    /**
     * Create a pipe configuration for BLE
     * @param options Options for pipe configuration
     * @returns Pipe configuration for BLE
     */
    static createBleConfig(options?: PipeConfigOptions): PipeConfiguration;
    /**
     * Create a pipe configuration for NFC
     * @param options Options for pipe configuration
     * @returns Pipe configuration for NFC
     */
    static createNfcConfig(options?: PipeConfigOptions): PipeConfiguration;
    /**
     * Create a pipe configuration for Web
     * @param options Options for pipe configuration
     * @returns Pipe configuration for Web
     */
    static createWebConfig(options?: PipeConfigOptions): PipeConfiguration;
    /**
     * Create a pipe configuration
     * @param type Pipe type
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createConfig(type: PipeType, options?: PipeConfigOptions): PipeConfiguration;
    /**
     * Validate a pipe configuration
     * @param config Pipe configuration to validate
     * @returns Validation result
     */
    static validateConfig(config: PipeConfiguration): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Merge pipe configurations
     * @param base Base configuration
     * @param override Configuration to override with
     * @returns Merged configuration
     */
    static mergeConfigs(base: PipeConfiguration, override: Partial<PipeConfiguration>): PipeConfiguration;
}
