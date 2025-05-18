import { BasePipe } from './BasePipe';
import { MessageFrame, PipeConfiguration, PipeType, NfcConfig } from '../proto-types';
import { MessageFramer } from '../framing/MessageFramer';
import { ReliabilityManager } from '../reliability/ReliabilityManager';

/**
 * Near Field Communication pipe implementation
 */
export class NfcPipe extends BasePipe {
  private nfcAdapter: any = null;
  private ndefReader: any = null;
  private messageFramer: MessageFramer;
  private reliabilityManager: ReliabilityManager;
  private isReading: boolean = false;
  
  /**
   * Constructor
   * @param id Pipe identifier
   * @param config Pipe configuration
   */
  constructor(id: string, config?: PipeConfiguration) {
    super(id, PipeType.NFC);
    
    // Initialize with provided config if available
    if (config) {
      this._configuration = config;
    }
    
    // Set up message framer
    const nfcConfig = this._configuration.typeConfig?.case === 'nfc' ? 
      (this._configuration.typeConfig.value as unknown as NfcConfig) : undefined;
    
    this.messageFramer = new MessageFramer({
      maxChunkSize: nfcConfig?.maxMessageSize ?? 1024,
      compressionType: 1, // GZIP
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
        maxRetries: 2,
        baseTimeoutMs: 3000,
        useExponentialBackoff: false
      }
    );
    
    // Set capabilities based on NFC limitations
    this._capabilities = {
      pipeType: PipeType.NFC,
      maxMessageSizeBytes: nfcConfig?.maxMessageSize ?? 1024,
      maxThroughputBytesPerSecond: 5000, // ~5KB/s (conservative estimate for NFC)
      supportsBidirectional: true,
      requiresUserInteraction: true, // User needs to tap devices
      supportsBackgroundOperation: false,
      supportedFeatures: ['proximity-based', 'low-power', 'secure-element']
    };
  }
  
  /**
   * Initialize the NFC pipe
   * @param config Pipe configuration
   * @param target Optional target information
   */
  protected async doInitialize(config: PipeConfiguration, target?: string): Promise<void> {
    this._configuration = config;
    
    // Check if Web NFC API is available
    if (typeof navigator === 'undefined' || !('nfc' in navigator)) {
      throw new Error('NFC API not available in this environment');
    }
    
    // Store the NFC adapter for later use
    this.nfcAdapter = (navigator as any).nfc;
    
    console.log(`NFC pipe initialized with ID: ${this.id}`);
  }
  
  /**
   * Connect the NFC pipe
   * @param isInitiator Whether this side initiates the connection
   */
  protected async doConnect(isInitiator: boolean): Promise<void> {
    try {
      const nfcConfig = this._configuration.typeConfig?.case === 'nfc' ? 
        this._configuration.typeConfig.value : undefined;
      
      if (!nfcConfig) {
        throw new Error('NFC configuration missing');
      }
      
      if (isInitiator) {
        // Wait for NFC write capability - in real implementation this would
        // involve setting up proper NFC write mode
        console.log('NFC pipe ready to write data');
      } else {
        // Set up NFC reader
        this.ndefReader = new (window as any).NDEFReader();
        
        // Set up reading
        await this.startReading();
      }
      
      console.log(`NFC pipe connected as ${isInitiator ? 'initiator' : 'receiver'}`);
    } catch (error) {
      console.error('NFC connection error:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect the NFC pipe
   * @param force Whether to force disconnection
   */
  protected async doDisconnect(force: boolean): Promise<void> {
    // Stop reading if active
    if (this.isReading) {
      await this.stopReading();
    }
    
    this.ndefReader = null;
    
    console.log(`NFC pipe disconnected (force=${force})`);
  }
  
  /**
   * Send data through the NFC pipe
   * @param data Data to send
   */
  protected async doSendData(data: Uint8Array): Promise<void> {
    if (!this.nfcAdapter) {
      throw new Error('NFC pipe not initialized');
    }
    
    try {
      // In a real implementation, this would use the Web NFC API to write data
      // This is a mock implementation for demonstration
      const nfcConfig = this._configuration.typeConfig?.case === 'nfc' ? 
        this._configuration.typeConfig.value : undefined;
      
      if (!nfcConfig) {
        throw new Error('NFC configuration missing');
      }
      
      // Convert data to string for NDEF message
      const textEncoder = new TextEncoder();
      const textDecoder = new TextDecoder();
      
      // Create an NDEF message with the data
      const message = {
        records: [{
          recordType: "mime",
          mediaType: "application/x-juicetokens",
          data: data
        }]
      };
      
      // Write the message (mock operation)
      console.log(`NFC write: ${data.length} bytes`);
      
      // Simulate successful write with a delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('NFC write error:', error);
      throw error;
    }
  }
  
  /**
   * Start reading NFC messages
   */
  private async startReading(): Promise<void> {
    if (!this.ndefReader) {
      throw new Error('NFC reader not initialized');
    }
    
    try {
      // In a real implementation, this would use the Web NFC API to read data
      this.isReading = true;
      
      // Mock implementation - simulate reading in a real implementation
      console.log('NFC reading started');
      
      // Set up a mock reader that periodically "receives" data
      const mockReadInterval = setInterval(() => {
        if (!this.isReading) {
          clearInterval(mockReadInterval);
          return;
        }
        
        // Generate mock data
        const mockData = new Uint8Array(10);
        for (let i = 0; i < mockData.length; i++) {
          mockData[i] = Math.floor(Math.random() * 256);
        }
        
        // Process the received data
        this.handleReceivedData(mockData);
      }, 5000); // Every 5 seconds
      
      // Store interval ID for cleanup
      (this as any).mockReadInterval = mockReadInterval;
      
    } catch (error) {
      this.isReading = false;
      console.error('NFC reading error:', error);
      throw error;
    }
  }
  
  /**
   * Stop reading NFC messages
   */
  private async stopReading(): Promise<void> {
    this.isReading = false;
    
    // Clear the mock reading interval
    if ((this as any).mockReadInterval) {
      clearInterval((this as any).mockReadInterval);
      (this as any).mockReadInterval = null;
    }
    
    console.log('NFC reading stopped');
  }
} 