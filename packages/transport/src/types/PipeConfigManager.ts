import {
  PipeConfiguration,
  PipeType,
  QrKissConfig,
  BleConfig,
  NfcConfig,
  WebConfig
} from '../proto-types';
import { v4 as uuidv4 } from 'uuid';

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
export class PipeConfigManager {
  /**
   * Create a pipe configuration for QR KISS
   * @param options Options for pipe configuration
   * @returns Pipe configuration for QR KISS
   */
  static createQrKissConfig(options?: PipeConfigOptions): PipeConfiguration {
    const id = options?.pipeId ?? uuidv4();
    
    const qrOptions = options?.qrKiss ?? {};
    
    const config: PipeConfiguration = {
      pipeId: id,
      pipeType: PipeType.QR_KISS,
      timeoutMs: options?.timeoutMs ?? 30000,
      typeConfig: {
        case: 'qrKiss',
        value: {} as any // Will be properly filled below
      }
    };
    
    // QR KISS specific configuration
    const qrConfig: QrKissConfig = {
      qrCodeVersion: qrOptions.qrCodeVersion ?? 5,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel ?? 'M',
      chunkSizeBytes: qrOptions.chunkSizeBytes ?? 256,
      displaySizePixels: qrOptions.displaySizePixels ?? 300
    };
    
    // Set the proper value
    config.typeConfig!.value = qrConfig;
    
    return config;
  }
  
  /**
   * Create a pipe configuration for BLE
   * @param options Options for pipe configuration
   * @returns Pipe configuration for BLE
   */
  static createBleConfig(options?: PipeConfigOptions): PipeConfiguration {
    const id = options?.pipeId ?? uuidv4();
    
    const bleOptions = options?.ble ?? {};
    
    const config: PipeConfiguration = {
      pipeId: id,
      pipeType: PipeType.BLE,
      timeoutMs: options?.timeoutMs ?? 10000,
      typeConfig: {
        case: 'ble',
        value: {} as any // Will be properly filled below
      }
    };
    
    // BLE specific configuration
    const bleConfig: BleConfig = {
      serviceUuid: bleOptions.serviceUuid ?? '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      characteristicUuid: bleOptions.characteristicUuid ?? '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
      requireBonding: bleOptions.requireBonding ?? false,
      mtuSize: bleOptions.mtuSize ?? 512
    };
    
    // Set the proper value
    config.typeConfig!.value = bleConfig;
    
    return config;
  }
  
  /**
   * Create a pipe configuration for NFC
   * @param options Options for pipe configuration
   * @returns Pipe configuration for NFC
   */
  static createNfcConfig(options?: PipeConfigOptions): PipeConfiguration {
    const id = options?.pipeId ?? uuidv4();
    
    const nfcOptions = options?.nfc ?? {};
    
    const config: PipeConfiguration = {
      pipeId: id,
      pipeType: PipeType.NFC,
      timeoutMs: options?.timeoutMs ?? 5000,
      typeConfig: {
        case: 'nfc',
        value: {} as any // Will be properly filled below
      }
    };
    
    // NFC specific configuration
    const nfcConfig: NfcConfig = {
      aid: nfcOptions.aid ?? 'F0010203040506',
      useSecureElement: nfcOptions.useSecureElement ?? false,
      maxMessageSize: nfcOptions.maxMessageSize ?? 1024
    };
    
    // Set the proper value
    config.typeConfig!.value = nfcConfig;
    
    return config;
  }
  
  /**
   * Create a pipe configuration for Web
   * @param options Options for pipe configuration
   * @returns Pipe configuration for Web
   */
  static createWebConfig(options?: PipeConfigOptions): PipeConfiguration {
    const id = options?.pipeId ?? uuidv4();
    
    const webOptions = options?.web ?? {};
    
    const config: PipeConfiguration = {
      pipeId: id,
      pipeType: PipeType.WEB,
      timeoutMs: options?.timeoutMs ?? 15000,
      typeConfig: {
        case: 'web',
        value: {} as any // Will be properly filled below
      }
    };
    
    // Web specific configuration
    const webConfig: WebConfig = {
      endpointUrl: webOptions.endpointUrl ?? 'https://example.com/api/message',
      useWebsocket: webOptions.useWebsocket ?? true,
      headers: webOptions.headers ?? {},
      useTls: webOptions.useTls ?? true
    };
    
    // Set the proper value
    config.typeConfig!.value = webConfig;
    
    return config;
  }
  
  /**
   * Create a pipe configuration
   * @param type Pipe type
   * @param options Configuration options
   * @returns Pipe configuration
   */
  static createConfig(type: PipeType, options?: PipeConfigOptions): PipeConfiguration {
    switch (type) {
      case PipeType.QR_KISS:
        return PipeConfigManager.createQrKissConfig(options);
      case PipeType.BLE:
        return PipeConfigManager.createBleConfig(options);
      case PipeType.NFC:
        return PipeConfigManager.createNfcConfig(options);
      case PipeType.WEB:
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
  static validateConfig(config: PipeConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check common properties
    if (!config.pipeId) {
      errors.push('Pipe ID is required');
    }
    
    if (config.timeoutMs <= 0) {
      errors.push('Timeout must be greater than 0');
    }
    
    // Check type-specific configuration
    switch (config.pipeType) {
      case PipeType.QR_KISS:
        if (!config.typeConfig || config.typeConfig.case !== 'qrKiss') {
          errors.push('QR KISS configuration is required for QR KISS pipe type');
        } else {
          const qrConfig = config.typeConfig.value;
          if (qrConfig.chunkSizeBytes <= 0) {
            errors.push('QR chunk size must be greater than 0');
          }
        }
        break;
        
      case PipeType.BLE:
        if (!config.typeConfig || config.typeConfig.case !== 'ble') {
          errors.push('BLE configuration is required for BLE pipe type');
        } else {
          const bleConfig = config.typeConfig.value;
          if (!bleConfig.serviceUuid) {
            errors.push('BLE service UUID is required');
          }
          if (!bleConfig.characteristicUuid) {
            errors.push('BLE characteristic UUID is required');
          }
        }
        break;
        
      case PipeType.NFC:
        if (!config.typeConfig || config.typeConfig.case !== 'nfc') {
          errors.push('NFC configuration is required for NFC pipe type');
        } else {
          const nfcConfig = config.typeConfig.value;
          if (!nfcConfig.aid) {
            errors.push('NFC AID is required');
          }
        }
        break;
        
      case PipeType.WEB:
        if (!config.typeConfig || config.typeConfig.case !== 'web') {
          errors.push('Web configuration is required for Web pipe type');
        } else {
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
  static mergeConfigs(base: PipeConfiguration, override: Partial<PipeConfiguration>): PipeConfiguration {
    const result: PipeConfiguration = { ...base };
    
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
      } else if (override.typeConfig.case) {
        // Replace the entire type config
        result.typeConfig = override.typeConfig;
      }
    }
    
    return result;
  }
} 