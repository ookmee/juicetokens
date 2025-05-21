import { BasePipe } from './BasePipe';
import { PipeConfiguration } from '../proto-types';
/**
 * QR KISS (Keep It Simple & Secure) pipe implementation
 * Uses QR codes for visual data transfer
 */
export declare class QrKissPipe extends BasePipe {
    private frameQueue;
    private isTransmitting;
    private messageFramer;
    private reliabilityManager;
    private qrElement;
    private scannerElement;
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id: string, config?: PipeConfiguration);
    /**
     * Initialize the QR KISS pipe
     * @param config Pipe configuration
     * @param target Optional target information
     */
    protected doInitialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the QR KISS pipe
     * @param isInitiator Whether this side initiates the connection
     */
    protected doConnect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the QR KISS pipe
     * @param force Whether to force disconnection
     */
    protected doDisconnect(force: boolean): Promise<void>;
    /**
     * Send data through the QR KISS pipe
     * @param data Data to send
     */
    protected doSendData(data: Uint8Array): Promise<void>;
    /**
     * Queue data for transmission
     * @param data Data to queue
     */
    private queueData;
    /**
     * Transmit the next frame in the queue
     */
    private transmitNextFrame;
    /**
     * Set up QR code display
     */
    private setupQrDisplay;
    /**
     * Set up QR code scanner
     */
    private setupQrScanner;
    /**
     * Display a QR code
     * @param data Data to encode in QR code
     */
    private displayQrCode;
}
