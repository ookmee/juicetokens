import { Pipe } from './types/Pipe';
import { PipeType, PipeConfiguration } from './proto-types';
import { QrKissPipe } from './adapters/QrKissPipe';
import { PipeConfigManager } from './types/PipeConfigManager';
import { v4 as uuidv4 } from 'uuid';

// Implementing the other pipe types
import { BlePipe } from './adapters/BlePipe';
import { NfcPipe } from './adapters/NfcPipe';
import { WebPipe } from './adapters/WebPipe';

/**
 * Factory class for creating pipe instances
 */
export class PipeFactory {
  /**
   * Create a pipe of the specified type
   * @param type Pipe type
   * @param config Optional pipe configuration
   * @returns Pipe instance
   */
  static createPipe(type: PipeType, config?: PipeConfiguration): Pipe {
    const pipeId = config?.pipeId ?? uuidv4();
    
    switch (type) {
      case PipeType.QR_KISS:
        return new QrKissPipe(pipeId, config ?? PipeConfigManager.createQrKissConfig({ pipeId }));
        
      case PipeType.BLE:
        return new BlePipe(pipeId, config ?? PipeConfigManager.createBleConfig({ pipeId }));
        
      case PipeType.NFC:
        return new NfcPipe(pipeId, config ?? PipeConfigManager.createNfcConfig({ pipeId }));
        
      case PipeType.WEB:
        return new WebPipe(pipeId, config ?? PipeConfigManager.createWebConfig({ pipeId }));
        
      default:
        throw new Error(`Unsupported pipe type: ${type}`);
    }
  }
  
  /**
   * Create all supported pipe types
   * @returns Array of pipe instances for all supported types
   */
  static createAllPipes(): Pipe[] {
    return [
      PipeFactory.createPipe(PipeType.QR_KISS),
      PipeFactory.createPipe(PipeType.BLE),
      PipeFactory.createPipe(PipeType.NFC),
      PipeFactory.createPipe(PipeType.WEB)
    ];
  }
  
  /**
   * Get supported pipe types
   * @returns Array of supported pipe types
   */
  static getSupportedPipeTypes(): PipeType[] {
    return [
      PipeType.QR_KISS,
      PipeType.BLE,
      PipeType.NFC,
      PipeType.WEB
    ];
  }
} 