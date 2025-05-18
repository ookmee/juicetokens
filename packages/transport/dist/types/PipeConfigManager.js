"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeConfigManager = void 0;
const proto_1 = require("@juicetokens/proto");
const uuid_1 = require("uuid");
/**
 * PipeConfigManager manages configuration for different pipe types
 */
class PipeConfigManager {
    /**
     * Create a pipe configuration for QR KISS
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createQrKissConfig(options) {
        const qrOptions = options?.qrKiss || {};
        const qrKissConfig = {
            qrCodeVersion: qrOptions.qrCodeVersion ?? 5,
            errorCorrectionLevel: qrOptions.errorCorrectionLevel ?? 'M',
            chunkSizeBytes: qrOptions.chunkSizeBytes ?? 256,
            displaySizePixels: qrOptions.displaySizePixels ?? 300
        };
        return {
            pipeType: proto_1.PipeType.QR_KISS,
            pipeId: options?.pipeId ?? (0, uuid_1.v4)(),
            timeoutMs: options?.timeoutMs ?? 30000,
            typeConfig: {
                case: 'qrKiss',
                value: qrKissConfig
            }
        };
    }
    /**
     * Create a pipe configuration for BLE
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createBleConfig(options) {
        const bleOptions = options?.ble || {};
        const bleConfig = {
            serviceUuid: bleOptions.serviceUuid ?? '12345678-1234-1234-1234-123456789abc',
            characteristicUuid: bleOptions.characteristicUuid ?? '87654321-4321-4321-4321-cba987654321',
            requireBonding: bleOptions.requireBonding ?? false,
            mtuSize: bleOptions.mtuSize ?? 512
        };
        return {
            pipeType: proto_1.PipeType.BLE,
            pipeId: options?.pipeId ?? (0, uuid_1.v4)(),
            timeoutMs: options?.timeoutMs ?? 30000,
            typeConfig: {
                case: 'ble',
                value: bleConfig
            }
        };
    }
    /**
     * Create a pipe configuration for NFC
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createNfcConfig(options) {
        const nfcOptions = options?.nfc || {};
        const nfcConfig = {
            aid: nfcOptions.aid ?? 'F0010203040506',
            useSecureElement: nfcOptions.useSecureElement ?? false,
            maxMessageSize: nfcOptions.maxMessageSize ?? 1024
        };
        return {
            pipeType: proto_1.PipeType.NFC,
            pipeId: options?.pipeId ?? (0, uuid_1.v4)(),
            timeoutMs: options?.timeoutMs ?? 10000,
            typeConfig: {
                case: 'nfc',
                value: nfcConfig
            }
        };
    }
    /**
     * Create a pipe configuration for Web
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createWebConfig(options) {
        const webOptions = options?.web || {};
        const webConfig = {
            endpointUrl: webOptions.endpointUrl ?? 'https://api.juicetokens.example.com/transport',
            useWebsocket: webOptions.useWebsocket ?? true,
            headers: webOptions.headers ?? {},
            useTls: webOptions.useTls ?? true
        };
        return {
            pipeType: proto_1.PipeType.WEB,
            pipeId: options?.pipeId ?? (0, uuid_1.v4)(),
            timeoutMs: options?.timeoutMs ?? 30000,
            typeConfig: {
                case: 'web',
                value: webConfig
            }
        };
    }
    /**
     * Create a pipe configuration
     * @param type Pipe type
     * @param options Configuration options
     * @returns Pipe configuration
     */
    static createConfig(type, options) {
        switch (type) {
            case proto_1.PipeType.QR_KISS:
                return PipeConfigManager.createQrKissConfig(options);
            case proto_1.PipeType.BLE:
                return PipeConfigManager.createBleConfig(options);
            case proto_1.PipeType.NFC:
                return PipeConfigManager.createNfcConfig(options);
            case proto_1.PipeType.WEB:
                return PipeConfigManager.createWebConfig(options);
            default:
                throw new Error(`Unsupported pipe type: ${type}`);
        }
    }
    /**
     * Validate a pipe configuration
     * @param config Pipe configuration to validate
     * @returns Validation result
     */
    static validateConfig(config) {
        const errors = [];
        // Check common properties
        if (!config.pipeId) {
            errors.push('Pipe ID is required');
        }
        if (config.timeoutMs <= 0) {
            errors.push('Timeout must be greater than 0');
        }
        // Check type-specific configuration
        switch (config.pipeType) {
            case proto_1.PipeType.QR_KISS:
                if (!config.typeConfig || config.typeConfig.case !== 'qrKiss') {
                    errors.push('QR KISS configuration is required for QR KISS pipe type');
                }
                else {
                    const qrConfig = config.typeConfig.value;
                    if (qrConfig.chunkSizeBytes <= 0) {
                        errors.push('QR chunk size must be greater than 0');
                    }
                }
                break;
            case proto_1.PipeType.BLE:
                if (!config.typeConfig || config.typeConfig.case !== 'ble') {
                    errors.push('BLE configuration is required for BLE pipe type');
                }
                else {
                    const bleConfig = config.typeConfig.value;
                    if (!bleConfig.serviceUuid) {
                        errors.push('BLE service UUID is required');
                    }
                    if (!bleConfig.characteristicUuid) {
                        errors.push('BLE characteristic UUID is required');
                    }
                }
                break;
            case proto_1.PipeType.NFC:
                if (!config.typeConfig || config.typeConfig.case !== 'nfc') {
                    errors.push('NFC configuration is required for NFC pipe type');
                }
                else {
                    const nfcConfig = config.typeConfig.value;
                    if (!nfcConfig.aid) {
                        errors.push('NFC AID is required');
                    }
                }
                break;
            case proto_1.PipeType.WEB:
                if (!config.typeConfig || config.typeConfig.case !== 'web') {
                    errors.push('Web configuration is required for Web pipe type');
                }
                else {
                    const webConfig = config.typeConfig.value;
                    if (!webConfig.endpointUrl) {
                        errors.push('Web endpoint URL is required');
                    }
                }
                break;
            default:
                errors.push(`Unsupported pipe type: ${config.pipeType}`);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Merge pipe configurations
     * @param base Base configuration
     * @param override Configuration to override with
     * @returns Merged configuration
     */
    static mergeConfigs(base, override) {
        const result = { ...base };
        // Merge common properties
        if (override.pipeId) {
            result.pipeId = override.pipeId;
        }
        if (override.timeoutMs !== undefined) {
            result.timeoutMs = override.timeoutMs;
        }
        // Merge type-specific configuration
        if (override.typeConfig) {
            // Only merge if the case matches
            if (result.typeConfig && result.typeConfig.case === override.typeConfig.case) {
                result.typeConfig = {
                    case: result.typeConfig.case,
                    value: { ...result.typeConfig.value, ...override.typeConfig.value }
                };
            }
            else if (override.typeConfig.case) {
                // Replace the entire type config
                result.typeConfig = override.typeConfig;
            }
        }
        return result;
    }
}
exports.PipeConfigManager = PipeConfigManager;
//# sourceMappingURL=PipeConfigManager.js.map