import { Observable, Subject } from 'rxjs';
import { Pipe } from '../types/Pipe';
import { PipeType, PipeConfiguration, PipeStatus, PipeCapabilities, MessageFrame } from '@juicetokens/proto';
/**
 * Base implementation of the Pipe interface with common functionality
 */
export declare abstract class BasePipe implements Pipe {
    protected _id: string;
    protected _type: PipeType;
    protected _configuration: PipeConfiguration;
    protected _status: PipeStatus;
    protected _capabilities: PipeCapabilities;
    protected messageSubject: Subject<MessageFrame>;
    protected dataSubject: Subject<Uint8Array>;
    /**
     * Constructor
     * @param id Pipe identifier
     * @param type Pipe type
     */
    constructor(id: string, type: PipeType);
    /**
     * Get pipe identifier
     */
    get id(): string;
    /**
     * Get pipe type
     */
    get type(): PipeType;
    /**
     * Get current configuration
     */
    get configuration(): PipeConfiguration;
    /**
     * Get current status
     */
    get status(): PipeStatus;
    /**
     * Get pipe capabilities
     */
    get capabilities(): PipeCapabilities;
    /**
     * Initialize the pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., device ID, URL)
     */
    initialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the pipe
     * @param isInitiator Whether this side initiates the connection
     */
    connect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the pipe
     * @param force Whether to force disconnection
     */
    disconnect(force?: boolean): Promise<void>;
    /**
     * Send a message through the pipe
     * @param message Message to send
     */
    sendMessage(message: MessageFrame): Promise<void>;
    /**
     * Receive messages from the pipe
     */
    receiveMessages(): Observable<MessageFrame>;
    /**
     * Send raw data through the pipe
     * @param data Raw data to send
     */
    sendData(data: Uint8Array): Promise<void>;
    /**
     * Receive raw data from the pipe
     */
    receiveData(): Observable<Uint8Array>;
    /**
     * Get the current status of the pipe
     */
    getStatus(): Promise<PipeStatus>;
    /**
     * Update pipe status
     * @param updates Status updates
     */
    protected updateStatus(updates: Partial<PipeStatus>): void;
    /**
     * Handle received data and emit it as a message if valid
     * @param data Received data
     */
    protected handleReceivedData(data: Uint8Array): void;
    /**
     * Handle pipe errors
     * @param error Error to handle
     */
    protected handleError(error: unknown): void;
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
