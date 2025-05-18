import { BasePipe } from './BasePipe';
import { MessageFrame, PipeConfiguration, PipeType, BleConfig } from '../proto-types';
import { MessageFramer } from '../framing/MessageFramer';
import { ReliabilityManager } from '../reliability/ReliabilityManager';

/**
 * Bluetooth Low Energy pipe implementation
 */
export class BlePipe extends BasePipe {
  private bluetoothDevice: any = null;
  private gattServer: any = null;
  private characteristic: any = null;
  private messageFramer: MessageFramer;
  private reliabilityManager: ReliabilityManager;
  
  /**
   * Constructor
   * @param id Pipe identifier
   * @param config Pipe configuration
   */
  constructor(id: string, config?: PipeConfiguration) {
    super(id, PipeType.BLE);
    
    // Initialize with provided config if available
    if (config) {
      this._configuration = config;
    }
    
    // Set up message framer
    const bleConfig = this._configuration.typeConfig?.case === 'ble' ? 
      (this._configuration.typeConfig.value as unknown as BleConfig) : undefined;
    
    this.messageFramer = new MessageFramer({
      maxChunkSize: bleConfig?.mtuSize ? bleConfig.mtuSize - 3 : 509, // MTU - 3 bytes overhead
      compressionType: 0, // NONE (compression often not beneficial for small BLE packets)
      protocolVersion: 1
    });
    
    // Set up reliability manager
    this.reliabilityManager = new ReliabilityManager(
      async (message) => {
        const frames = this.messageFramer.createFrame(message.payload, message.type, message.headers);
        for (const frame of frames) {
          const encoded = MessageFrame.encode(frame).finish();
          await this.doSendData(encoded);
        }
      },
      {
        maxRetries: 3,
        baseTimeoutMs: 2000, // Faster timeout for BLE
        useExponentialBackoff: true
      }
    );
    
    // Set capabilities based on BLE limitations
    this._capabilities = {
      pipeType: PipeType.BLE,
      maxMessageSizeBytes: 65536, // 64KB (larger messages will be chunked)
      maxThroughputBytesPerSecond: 20000, // ~20KB/s (typical BLE throughput)
      supportsBidirectional: true,
      requiresUserInteraction: true, // User needs to accept pairing
      supportsBackgroundOperation: true,
      supportedFeatures: ['low-power', 'proximity-based']
    };
  }
  
  /**
   * Initialize the BLE pipe
   * @param config Pipe configuration
   * @param target Optional target information (e.g., device ID)
   */
  protected async doInitialize(config: PipeConfiguration, target?: string): Promise<void> {
    this._configuration = config;
    
    // Check if Web Bluetooth API is available
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      throw new Error('Bluetooth API not available in this environment');
    }
    
    console.log(`BLE pipe initialized with ID: ${this.id}`);
  }
  
  /**
   * Connect the BLE pipe
   * @param isInitiator Whether this side initiates the connection
   */
  protected async doConnect(isInitiator: boolean): Promise<void> {
    if (!isInitiator) {
      throw new Error('BLE pipe can only be used as initiator in this implementation');
    }
    
    try {
      const bleConfig = this._configuration.typeConfig?.case === 'ble' ? 
        this._configuration.typeConfig.value : undefined;
      
      if (!bleConfig) {
        throw new Error('BLE configuration missing');
      }
      
      // Request device with specified service UUID
      this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [(bleConfig as BleConfig).serviceUuid] }]
      });
      
      // Connect to GATT server
      this.gattServer = await this.bluetoothDevice.gatt.connect();
      
      // Get the service
      const service = await this.gattServer.getPrimaryService((bleConfig as BleConfig).serviceUuid);
      
      // Get the characteristic
      this.characteristic = await service.getCharacteristic((bleConfig as BleConfig).characteristicUuid);
      
      // Set up notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const buffer = new Uint8Array(value.buffer);
        this.handleReceivedData(buffer);
      });
      
      // Add disconnect listener
      this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        this.updateStatus({ 
          state: 4, // DISCONNECTED
          errorMessage: 'BLE device disconnected'
        });
      });
      
      console.log(`BLE pipe connected to device: ${this.bluetoothDevice.name}`);
    } catch (error) {
      console.error('BLE connection error:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect the BLE pipe
   * @param force Whether to force disconnection
   */
  protected async doDisconnect(force: boolean): Promise<void> {
    if (this.characteristic) {
      try {
        await this.characteristic.stopNotifications();
      } catch (error) {
        console.warn('Error stopping notifications:', error);
      }
    }
    
    if (this.gattServer && this.gattServer.connected) {
      this.gattServer.disconnect();
    }
    
    this.bluetoothDevice = null;
    this.gattServer = null;
    this.characteristic = null;
    
    console.log(`BLE pipe disconnected (force=${force})`);
  }
  
  /**
   * Send data through the BLE pipe
   * @param data Data to send
   */
  protected async doSendData(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error('BLE pipe not connected');
    }
    
    try {
      await this.characteristic.writeValue(data);
    } catch (error) {
      console.error('BLE write error:', error);
      throw error;
    }
  }
} 