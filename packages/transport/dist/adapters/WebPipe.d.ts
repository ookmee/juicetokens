import { BasePipe } from './BasePipe';
import { PipeConfiguration } from '@juicetokens/proto';
/**
 * Web-based pipe implementation using WebSocket or HTTP
 */
export declare class WebPipe extends BasePipe {
    private webSocket;
    private messageFramer;
    private reliabilityManager;
    private abortController;
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id: string, config?: PipeConfiguration);
    /**
     * Initialize the web pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., URL)
     */
    protected doInitialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the web pipe
     * @param isInitiator Whether this side initiates the connection
     */
    protected doConnect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the web pipe
     * @param force Whether to force disconnection
     */
    protected doDisconnect(force: boolean): Promise<void>;
    /**
     * Send data through the web pipe
     * @param data Data to send
     */
    protected doSendData(data: Uint8Array): Promise<void>;
    /**
     * Connect to a WebSocket endpoint
     * @param url WebSocket URL
     */
    private connectWebSocket;
    /**
     * Test HTTP connection by sending a HEAD request
     * @param url Endpoint URL
     */
    private testHttpConnection;
    /**
     * Start polling for data using HTTP
     * @param url Endpoint URL
     */
    private startHttpPolling;
}
