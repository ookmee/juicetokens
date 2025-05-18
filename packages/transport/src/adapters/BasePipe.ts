import { Observable, Subject } from 'rxjs';
import { Pipe } from '../types/Pipe';
import { 
  PipeType, 
  PipeConfiguration, 
  PipeStatus, 
  PipeCapabilities, 
  PipeDataChunk, 
  MessageFrame 
} from '../proto-types';

/**
 * Base implementation of the Pipe interface with common functionality
 */
export abstract class BasePipe implements Pipe {
  protected _id: string;
  protected _type: PipeType;
  protected _configuration: PipeConfiguration;
  protected _status: PipeStatus;
  protected _capabilities: PipeCapabilities;
  
  protected messageSubject: Subject<MessageFrame> = new Subject<MessageFrame>();
  protected dataSubject: Subject<Uint8Array> = new Subject<Uint8Array>();
  
  /**
   * Constructor
   * @param id Pipe identifier
   * @param type Pipe type
   */
  constructor(id: string, type: PipeType) {
    this._id = id;
    this._type = type;
    
    // Initialize default status
    this._status = {
      pipeId: id,
      pipeType: type,
      state: 0, // INITIALIZING
      errorMessage: '',
      bytesSent: 0,
      bytesReceived: 0,
      roundTripTimeMs: 0,
      uptimeSeconds: 0
    };
    
    // Initialize default capabilities
    this._capabilities = {
      pipeType: type,
      maxMessageSizeBytes: 0,
      maxThroughputBytesPerSecond: 0,
      supportsBidirectional: false,
      requiresUserInteraction: false,
      supportsBackgroundOperation: false,
      supportedFeatures: []
    };
    
    // Initialize default configuration
    this._configuration = {
      pipeType: type,
      pipeId: id,
      timeoutMs: 30000
    };
  }
  
  /**
   * Get pipe identifier
   */
  get id(): string {
    return this._id;
  }
  
  /**
   * Get pipe type
   */
  get type(): PipeType {
    return this._type;
  }
  
  /**
   * Get current configuration
   */
  get configuration(): PipeConfiguration {
    return this._configuration;
  }
  
  /**
   * Get current status
   */
  get status(): PipeStatus {
    return this._status;
  }
  
  /**
   * Get pipe capabilities
   */
  get capabilities(): PipeCapabilities {
    return this._capabilities;
  }
  
  /**
   * Initialize the pipe
   * @param config Pipe configuration
   * @param target Optional target information (e.g., device ID, URL)
   */
  async initialize(config: PipeConfiguration, target?: string): Promise<void> {
    this._configuration = config;
    this.updateStatus({ state: 0 }); // INITIALIZING
    
    try {
      await this.doInitialize(config, target);
      this.updateStatus({ state: 1 }); // READY
    } catch (error) {
      this.updateStatus({
        state: 5, // ERROR
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * Connect the pipe
   * @param isInitiator Whether this side initiates the connection
   */
  async connect(isInitiator: boolean): Promise<void> {
    this.updateStatus({ state: 2 }); // CONNECTING
    
    try {
      await this.doConnect(isInitiator);
      this.updateStatus({ state: 3 }); // CONNECTED
    } catch (error) {
      this.updateStatus({
        state: 5, // ERROR
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * Disconnect the pipe
   * @param force Whether to force disconnection
   */
  async disconnect(force: boolean = false): Promise<void> {
    this.updateStatus({ state: 4 }); // DISCONNECTING
    
    try {
      await this.doDisconnect(force);
      this.updateStatus({ state: 5 }); // DISCONNECTED
    } catch (error) {
      this.updateStatus({
        state: 5, // ERROR
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * Send a message through the pipe
   * @param message Message to send
   */
  async sendMessage(message: MessageFrame): Promise<void> {
    try {
      const serialized = MessageFrame.encode(message).finish();
      await this.sendData(serialized);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Receive messages from the pipe
   */
  receiveMessages(): Observable<MessageFrame> {
    return this.messageSubject.asObservable();
  }
  
  /**
   * Send raw data through the pipe
   * @param data Raw data to send
   */
  async sendData(data: Uint8Array): Promise<void> {
    try {
      await this.doSendData(data);
      this._status.bytesSent += data.length;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Receive raw data from the pipe
   */
  receiveData(): Observable<Uint8Array> {
    return this.dataSubject.asObservable();
  }
  
  /**
   * Get the current status of the pipe
   */
  async getStatus(): Promise<PipeStatus> {
    return this._status;
  }
  
  /**
   * Update pipe status
   * @param updates Status updates
   */
  protected updateStatus(updates: Partial<PipeStatus>): void {
    this._status = { ...this._status, ...updates };
  }
  
  /**
   * Handle received data and emit it as a message if valid
   * @param data Received data
   */
  protected handleReceivedData(data: Uint8Array): void {
    this._status.bytesReceived += data.length;
    this.dataSubject.next(data);
    
    try {
      const message = MessageFrame.decode(data);
      this.messageSubject.next(message);
    } catch (error) {
      // If decode fails, it's not a valid MessageFrame
      // We already emitted the raw data, so just log the error
      console.error('Failed to decode message:', error);
    }
  }
  
  /**
   * Handle pipe errors
   * @param error Error to handle
   */
  protected handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.updateStatus({
      state: 5, // ERROR
      errorMessage
    });
    console.error(`Pipe ${this._id} error:`, errorMessage);
  }
  
  /**
   * Initialize the pipe implementation
   * @param config Pipe configuration
   * @param target Optional target information (e.g., device ID, URL)
   */
  protected abstract doInitialize(config: PipeConfiguration, target?: string): Promise<void>;
  
  /**
   * Connect the pipe implementation
   * @param isInitiator Whether this side initiates the connection
   */
  protected abstract doConnect(isInitiator: boolean): Promise<void>;
  
  /**
   * Disconnect the pipe implementation
   * @param force Whether to force disconnection
   */
  protected abstract doDisconnect(force: boolean): Promise<void>;
  
  /**
   * Send raw data through the pipe implementation
   * @param data Raw data to send
   */
  protected abstract doSendData(data: Uint8Array): Promise<void>;
} 