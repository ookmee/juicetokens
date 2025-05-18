import { BasePipe } from './BasePipe';
import { PipeConfiguration } from '@juicetokens/proto';
/**
 * Near Field Communication pipe implementation
 */
export declare class NfcPipe extends BasePipe {
    private nfcAdapter;
    private ndefReader;
    private messageFramer;
    private reliabilityManager;
    private isReading;
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id: string, config?: PipeConfiguration);
    /**
     * Initialize the NFC pipe
     * @param config Pipe configuration
     * @param target Optional target information
     */
    protected doInitialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the NFC pipe
     * @param isInitiator Whether this side initiates the connection
     */
    protected doConnect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the NFC pipe
     * @param force Whether to force disconnection
     */
    protected doDisconnect(force: boolean): Promise<void>;
    /**
     * Send data through the NFC pipe
     * @param data Data to send
     */
    protected doSendData(data: Uint8Array): Promise<void>;
    /**
     * Start reading NFC messages
     */
    private startReading;
    /**
     * Stop reading NFC messages
     */
    private stopReading;
}
