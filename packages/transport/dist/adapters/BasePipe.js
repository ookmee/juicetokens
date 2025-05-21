"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePipe = void 0;
const rxjs_1 = require("rxjs");
const proto_types_1 = require("../proto-types");
/**
 * Base implementation of the Pipe interface with common functionality
 */
class BasePipe {
    /**
     * Constructor
     * @param id Pipe identifier
     * @param type Pipe type
     */
    constructor(id, type) {
        this.messageSubject = new rxjs_1.Subject();
        this.dataSubject = new rxjs_1.Subject();
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
    get id() {
        return this._id;
    }
    /**
     * Get pipe type
     */
    get type() {
        return this._type;
    }
    /**
     * Get current configuration
     */
    get configuration() {
        return this._configuration;
    }
    /**
     * Get current status
     */
    get status() {
        return this._status;
    }
    /**
     * Get pipe capabilities
     */
    get capabilities() {
        return this._capabilities;
    }
    /**
     * Initialize the pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., device ID, URL)
     */
    async initialize(config, target) {
        this._configuration = config;
        this.updateStatus({ state: 0 }); // INITIALIZING
        try {
            await this.doInitialize(config, target);
            this.updateStatus({ state: 1 }); // READY
        }
        catch (error) {
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
    async connect(isInitiator) {
        this.updateStatus({ state: 2 }); // CONNECTING
        try {
            await this.doConnect(isInitiator);
            this.updateStatus({ state: 3 }); // CONNECTED
        }
        catch (error) {
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
    async disconnect(force = false) {
        this.updateStatus({ state: 4 }); // DISCONNECTING
        try {
            await this.doDisconnect(force);
            this.updateStatus({ state: 5 }); // DISCONNECTED
        }
        catch (error) {
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
    async sendMessage(message) {
        try {
            const serialized = proto_types_1.MessageFrame.encode(message).finish();
            await this.sendData(serialized);
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Receive messages from the pipe
     */
    receiveMessages() {
        return this.messageSubject.asObservable();
    }
    /**
     * Send raw data through the pipe
     * @param data Raw data to send
     */
    async sendData(data) {
        try {
            await this.doSendData(data);
            this._status.bytesSent += data.length;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Receive raw data from the pipe
     */
    receiveData() {
        return this.dataSubject.asObservable();
    }
    /**
     * Get the current status of the pipe
     */
    async getStatus() {
        return this._status;
    }
    /**
     * Update pipe status
     * @param updates Status updates
     */
    updateStatus(updates) {
        this._status = { ...this._status, ...updates };
    }
    /**
     * Handle received data and emit it as a message if valid
     * @param data Received data
     */
    handleReceivedData(data) {
        this._status.bytesReceived += data.length;
        this.dataSubject.next(data);
        try {
            const message = proto_types_1.MessageFrame.decode(data);
            this.messageSubject.next(message);
        }
        catch (error) {
            // If decode fails, it's not a valid MessageFrame
            // We already emitted the raw data, so just log the error
            console.error('Failed to decode message:', error);
        }
    }
    /**
     * Handle pipe errors
     * @param error Error to handle
     */
    handleError(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.updateStatus({
            state: 5, // ERROR
            errorMessage
        });
        console.error(`Pipe ${this._id} error:`, errorMessage);
    }
}
exports.BasePipe = BasePipe;
//# sourceMappingURL=BasePipe.js.map