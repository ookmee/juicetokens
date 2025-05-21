"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPipe = void 0;
const BasePipe_1 = require("./BasePipe");
const proto_types_1 = require("../proto-types");
const MessageFramer_1 = require("../framing/MessageFramer");
const ReliabilityManager_1 = require("../reliability/ReliabilityManager");
/**
 * Web-based pipe implementation using WebSocket or HTTP
 */
class WebPipe extends BasePipe_1.BasePipe {
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id, config) {
        super(id, proto_types_1.PipeType.WEB);
        this.webSocket = null;
        this.abortController = null;
        // Initialize with provided config if available
        if (config) {
            this._configuration = config;
        }
        // Set up message framer
        this.messageFramer = new MessageFramer_1.MessageFramer({
            maxChunkSize: 1024 * 16, // 16KB chunks for web (can be larger)
            compressionType: 1, // GZIP
            protocolVersion: 1
        });
        // Set up reliability manager
        this.reliabilityManager = new ReliabilityManager_1.ReliabilityManager(async (message) => {
            const frames = this.messageFramer.createFrame(message.payload, message.type, message.headers);
            for (const frame of frames) {
                const encoded = proto_types_1.MessageFrame.encode(frame).finish();
                await this.doSendData(encoded);
            }
        }, {
            maxRetries: 5,
            baseTimeoutMs: 10000,
            useExponentialBackoff: true
        });
        // Set capabilities based on web connection
        this._capabilities = {
            pipeType: proto_types_1.PipeType.WEB,
            maxMessageSizeBytes: 1024 * 1024 * 10, // 10MB (arbitrary large size)
            maxThroughputBytesPerSecond: 1024 * 1024, // 1MB/s (conservative for average connection)
            supportsBidirectional: true,
            requiresUserInteraction: false,
            supportsBackgroundOperation: true,
            supportedFeatures: ['high-throughput', 'long-distance', 'tls-encrypted']
        };
    }
    /**
     * Initialize the web pipe
     * @param config Pipe configuration
     * @param target Optional target information (e.g., URL)
     */
    async doInitialize(config, target) {
        this._configuration = config;
        // Check for fetch API availability
        if (typeof fetch === 'undefined') {
            throw new Error('Fetch API not available in this environment');
        }
        // Initialize abort controller for fetch requests
        this.abortController = new AbortController();
        console.log(`Web pipe initialized with ID: ${this.id}`);
    }
    /**
     * Connect the web pipe
     * @param isInitiator Whether this side initiates the connection
     */
    async doConnect(isInitiator) {
        try {
            const webConfig = this._configuration.typeConfig?.case === 'web' ?
                this._configuration.typeConfig.value : undefined;
            if (!webConfig) {
                throw new Error('Web configuration missing');
            }
            // Use WebSocket or HTTP based on configuration
            if (webConfig.useWebsocket) {
                await this.connectWebSocket(webConfig.endpointUrl);
            }
            else {
                await this.testHttpConnection(webConfig.endpointUrl);
            }
            console.log(`Web pipe connected to: ${webConfig.endpointUrl}`);
        }
        catch (error) {
            console.error('Web connection error:', error);
            throw error;
        }
    }
    /**
     * Disconnect the web pipe
     * @param force Whether to force disconnection
     */
    async doDisconnect(force) {
        // Close WebSocket if open
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
        }
        // Abort any ongoing fetch requests
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = new AbortController();
        }
        console.log(`Web pipe disconnected (force=${force})`);
    }
    /**
     * Send data through the web pipe
     * @param data Data to send
     */
    async doSendData(data) {
        const webConfig = this._configuration.typeConfig?.case === 'web' ?
            this._configuration.typeConfig.value : undefined;
        if (!webConfig) {
            throw new Error('Web configuration missing');
        }
        try {
            if (webConfig.useWebsocket) {
                // Send via WebSocket
                if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
                    throw new Error('WebSocket not connected');
                }
                this.webSocket.send(data);
            }
            else {
                // Send via HTTP POST
                const headers = new Headers();
                headers.append('Content-Type', 'application/octet-stream');
                // Add custom headers from configuration
                Object.entries(webConfig.headers || {}).forEach(([key, value]) => {
                    headers.append(key, value);
                });
                const response = await fetch(webConfig.endpointUrl, {
                    method: 'POST',
                    headers,
                    body: data,
                    signal: this.abortController?.signal
                });
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
                }
            }
        }
        catch (error) {
            console.error('Web send error:', error);
            throw error;
        }
    }
    /**
     * Connect to a WebSocket endpoint
     * @param url WebSocket URL
     */
    async connectWebSocket(url) {
        return new Promise((resolve, reject) => {
            // Ensure WebSocket URL starts with ws:// or wss://
            const wsUrl = url.replace(/^http/, 'ws');
            this.webSocket = new WebSocket(wsUrl);
            this.webSocket.onopen = () => {
                console.log('WebSocket connected');
                resolve();
            };
            this.webSocket.onmessage = (event) => {
                // Handle received message
                if (event.data instanceof Blob) {
                    // Convert Blob to ArrayBuffer
                    event.data.arrayBuffer().then((buffer) => {
                        const data = new Uint8Array(buffer);
                        this.handleReceivedData(data);
                    });
                }
                else if (event.data instanceof ArrayBuffer) {
                    const data = new Uint8Array(event.data);
                    this.handleReceivedData(data);
                }
            };
            this.webSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(new Error('WebSocket connection error'));
            };
            this.webSocket.onclose = () => {
                console.log('WebSocket closed');
                // If we're still in connected state, update status
                if (this.status.state === 3) { // CONNECTED
                    this.updateStatus({
                        state: 4, // DISCONNECTED
                        errorMessage: 'WebSocket connection closed'
                    });
                }
            };
            // Set a connection timeout
            const timeout = setTimeout(() => {
                if (this.webSocket?.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket connection timeout'));
                    if (this.webSocket) {
                        this.webSocket.close();
                        this.webSocket = null;
                    }
                }
            }, this._configuration.timeoutMs);
            // Clear timeout once connected
            this.webSocket.onopen = () => {
                clearTimeout(timeout);
                resolve();
            };
        });
    }
    /**
     * Test HTTP connection by sending a HEAD request
     * @param url Endpoint URL
     */
    async testHttpConnection(url) {
        try {
            const webConfig = this._configuration.typeConfig?.case === 'web' ?
                this._configuration.typeConfig.value : undefined;
            if (!webConfig) {
                throw new Error('Web configuration missing');
            }
            const headers = new Headers();
            // Add custom headers from configuration
            Object.entries(webConfig.headers || {}).forEach(([key, value]) => {
                headers.append(key, value);
            });
            const response = await fetch(url, {
                method: 'HEAD',
                headers,
                signal: this.abortController?.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            // Set up a polling mechanism for HTTP connections to check for data
            if (!webConfig.useWebsocket) {
                this.startHttpPolling(url);
            }
        }
        catch (error) {
            console.error('HTTP connection test error:', error);
            throw error;
        }
    }
    /**
     * Start polling for data using HTTP
     * @param url Endpoint URL
     */
    startHttpPolling(url) {
        const pollInterval = 5000; // 5 seconds
        const poll = async () => {
            try {
                const webConfig = this._configuration.typeConfig?.case === 'web' ?
                    this._configuration.typeConfig.value : undefined;
                if (!webConfig || this.status.state !== 3) { // If not CONNECTED, stop polling
                    return;
                }
                const headers = new Headers();
                // Add custom headers from configuration
                Object.entries(webConfig.headers || {}).forEach(([key, value]) => {
                    headers.append(key, value);
                });
                // Add header to indicate this is a poll request
                headers.append('X-Poll-Request', 'true');
                const response = await fetch(url, {
                    method: 'GET',
                    headers,
                    signal: this.abortController?.signal
                });
                if (response.ok && response.headers.get('Content-Length') !== '0') {
                    const buffer = await response.arrayBuffer();
                    const data = new Uint8Array(buffer);
                    this.handleReceivedData(data);
                }
                // Schedule next poll if still connected
                if (this.status.state === 3) { // CONNECTED
                    setTimeout(poll, pollInterval);
                }
            }
            catch (error) {
                console.error('HTTP polling error:', error);
                // Schedule next poll even if there was an error, but with exponential backoff
                if (this.status.state === 3) { // CONNECTED
                    setTimeout(poll, pollInterval * 2);
                }
            }
        };
        // Start polling
        setTimeout(poll, pollInterval);
    }
}
exports.WebPipe = WebPipe;
//# sourceMappingURL=WebPipe.js.map