import { Observable } from 'rxjs';
import { PipeType, PipeConfiguration, PipeStatus, PipeCapabilities } from '@juicetokens/proto';
import { MessageFrame } from '@juicetokens/proto';
/**
 * Interface for all transport pipe types (QR, BLE, NFC, Web)
 * Based on pipe.proto protocol definition
 */
export interface Pipe {
    /**
     * Pipe identifier
     */
    readonly id: string;
    /**
     * Pipe type
     */
    readonly type: PipeType;
    /**
     * Current pipe configuration
     */
    readonly configuration: PipeConfiguration;
    /**
     * Current pipe status
     */
    readonly status: PipeStatus;
    /**
     * Pipe capabilities
     */
    readonly capabilities: PipeCapabilities;
    /**
     * Initialize the pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., device ID, URL)
     * @returns Promise resolving when pipe is initialized
     */
    initialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the pipe
     * @param isInitiator Whether this side initiates the connection
     * @returns Promise resolving when pipe is connected
     */
    connect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the pipe
     * @param force Whether to force disconnection
     * @returns Promise resolving when pipe is disconnected
     */
    disconnect(force?: boolean): Promise<void>;
    /**
     * Send a message through the pipe
     * @param message Message to send
     * @returns Promise resolving when message is sent
     */
    sendMessage(message: MessageFrame): Promise<void>;
    /**
     * Receive messages from the pipe
     * @returns Observable of received messages
     */
    receiveMessages(): Observable<MessageFrame>;
    /**
     * Send raw data through the pipe
     * @param data Raw data to send
     * @returns Promise resolving when data is sent
     */
    sendData(data: Uint8Array): Promise<void>;
    /**
     * Receive raw data from the pipe
     * @returns Observable of received data
     */
    receiveData(): Observable<Uint8Array>;
    /**
     * Get the current status of the pipe
     * @returns Promise resolving with current pipe status
     */
    getStatus(): Promise<PipeStatus>;
}
