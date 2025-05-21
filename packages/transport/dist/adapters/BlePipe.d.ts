import { BasePipe } from './BasePipe';
import { PipeConfiguration } from '../proto-types';
/**
 * Bluetooth Low Energy pipe implementation
 */
export declare class BlePipe extends BasePipe {
    private bluetoothDevice;
    private gattServer;
    private characteristic;
    private messageFramer;
    private reliabilityManager;
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id: string, config?: PipeConfiguration);
    /**
     * Initialize the BLE pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., device ID)
     */
    protected doInitialize(config: PipeConfiguration, target?: string): Promise<void>;
    /**
     * Connect the BLE pipe
     * @param isInitiator Whether this side initiates the connection
     */
    protected doConnect(isInitiator: boolean): Promise<void>;
    /**
     * Disconnect the BLE pipe
     * @param force Whether to force disconnection
     */
    protected doDisconnect(force: boolean): Promise<void>;
    /**
     * Send data through the BLE pipe
     * @param data Data to send
     */
    protected doSendData(data: Uint8Array): Promise<void>;
}
