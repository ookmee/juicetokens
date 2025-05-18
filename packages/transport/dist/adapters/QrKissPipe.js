"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrKissPipe = void 0;
const BasePipe_1 = require("./BasePipe");
const proto_1 = require("@juicetokens/proto");
const MessageFramer_1 = require("../framing/MessageFramer");
const ReliabilityManager_1 = require("../reliability/ReliabilityManager");
/**
 * QR KISS (Keep It Simple & Secure) pipe implementation
 * Uses QR codes for visual data transfer
 */
class QrKissPipe extends BasePipe_1.BasePipe {
    /**
     * Constructor
     * @param id Pipe identifier
     * @param config Pipe configuration
     */
    constructor(id, config) {
        super(id, proto_1.PipeType.QR_KISS);
        this.frameQueue = [];
        this.isTransmitting = false;
        this.qrElement = null;
        this.scannerElement = null;
        // Initialize with provided config if available
        if (config) {
            this._configuration = config;
        }
        // Set up message framer with QR-specific options
        const qrConfig = this._configuration.typeConfig?.case === 'qrKiss' ?
            this._configuration.typeConfig.value : undefined;
        this.messageFramer = new MessageFramer_1.MessageFramer({
            maxChunkSize: qrConfig?.chunkSizeBytes ?? 256,
            compressionType: 1, // GZIP
            protocolVersion: 1
        });
        // Set up reliability manager
        this.reliabilityManager = new ReliabilityManager_1.ReliabilityManager(async (message) => {
            const frames = this.messageFramer.createFrame(message.payload, message.type, message.headers);
            for (const frame of frames) {
                const encoded = proto_1.MessageFrame.encode(frame).finish();
                await this.queueData(encoded);
            }
        }, {
            maxRetries: 3,
            baseTimeoutMs: 5000,
            useExponentialBackoff: true
        });
        // Set capabilities based on QR limitations
        this._capabilities = {
            pipeType: proto_1.PipeType.QR_KISS,
            maxMessageSizeBytes: 4096, // Reasonable size for QR codes
            maxThroughputBytesPerSecond: 1024, // Relatively slow
            supportsBidirectional: true,
            requiresUserInteraction: true,
            supportsBackgroundOperation: false,
            supportedFeatures: ['visual-confirmation']
        };
    }
    /**
     * Initialize the QR KISS pipe
     * @param config Pipe configuration
     * @param target Optional target information
     */
    async doInitialize(config, target) {
        this._configuration = config;
        // Reset state
        this.frameQueue = [];
        this.isTransmitting = false;
        // Initialize QR code display element
        if (typeof window !== 'undefined') {
            this.qrElement = document.getElementById('qr-code-display');
            this.scannerElement = document.getElementById('qr-code-scanner');
            if (!this.qrElement) {
                this.qrElement = document.createElement('div');
                this.qrElement.id = 'qr-code-display';
                document.body.appendChild(this.qrElement);
            }
            if (!this.scannerElement) {
                this.scannerElement = document.createElement('div');
                this.scannerElement.id = 'qr-code-scanner';
                document.body.appendChild(this.scannerElement);
            }
        }
        console.log(`QR KISS pipe initialized with ID: ${this.id}`);
    }
    /**
     * Connect the QR KISS pipe
     * @param isInitiator Whether this side initiates the connection
     */
    async doConnect(isInitiator) {
        // For QR, the initiator displays codes and the receiver scans
        if (isInitiator) {
            // Prepare for displaying QR codes
            await this.setupQrDisplay();
        }
        else {
            // Prepare for scanning QR codes
            await this.setupQrScanner();
        }
        console.log(`QR KISS pipe connected as ${isInitiator ? 'initiator' : 'receiver'}`);
    }
    /**
     * Disconnect the QR KISS pipe
     * @param force Whether to force disconnection
     */
    async doDisconnect(force) {
        // Clean up QR code display and scanner
        if (this.qrElement) {
            this.qrElement.innerHTML = '';
        }
        if (this.scannerElement) {
            this.scannerElement.innerHTML = '';
        }
        // Clear state
        this.frameQueue = [];
        this.isTransmitting = false;
        console.log(`QR KISS pipe disconnected (force=${force})`);
    }
    /**
     * Send data through the QR KISS pipe
     * @param data Data to send
     */
    async doSendData(data) {
        // Queue data for transmission
        await this.queueData(data);
    }
    /**
     * Queue data for transmission
     * @param data Data to queue
     */
    async queueData(data) {
        this.frameQueue.push(data);
        // Start transmitting if not already
        if (!this.isTransmitting) {
            this.isTransmitting = true;
            await this.transmitNextFrame();
        }
    }
    /**
     * Transmit the next frame in the queue
     */
    async transmitNextFrame() {
        if (this.frameQueue.length === 0) {
            this.isTransmitting = false;
            return;
        }
        const data = this.frameQueue.shift();
        // Generate and display QR code
        await this.displayQrCode(data);
        // Wait for a brief period before showing the next code
        setTimeout(() => {
            this.transmitNextFrame();
        }, 1000); // 1 second between frames
    }
    /**
     * Set up QR code display
     */
    async setupQrDisplay() {
        if (!this.qrElement) {
            throw new Error('QR display element not found');
        }
        // In a real implementation, this would set up the QR code display
        this.qrElement.style.width = '300px';
        this.qrElement.style.height = '300px';
        this.qrElement.style.border = '1px solid black';
        this.qrElement.style.margin = '20px';
        this.qrElement.style.display = 'flex';
        this.qrElement.style.alignItems = 'center';
        this.qrElement.style.justifyContent = 'center';
        this.qrElement.innerHTML = '<div>QR Display Ready</div>';
    }
    /**
     * Set up QR code scanner
     */
    async setupQrScanner() {
        if (!this.scannerElement) {
            throw new Error('QR scanner element not found');
        }
        // In a real implementation, this would set up the QR code scanner
        this.scannerElement.style.width = '300px';
        this.scannerElement.style.height = '300px';
        this.scannerElement.style.border = '1px solid black';
        this.scannerElement.style.margin = '20px';
        this.scannerElement.style.display = 'flex';
        this.scannerElement.style.alignItems = 'center';
        this.scannerElement.style.justifyContent = 'center';
        this.scannerElement.innerHTML = '<div>QR Scanner Ready</div>';
        // Mock QR code scanning (for demonstration)
        // In a real implementation, this would use the device camera
        const mockScanInterval = setInterval(() => {
            // Generate mock data
            const mockData = new Uint8Array(10);
            window.crypto.getRandomValues(mockData);
            // Process the received data
            this.handleReceivedData(mockData);
        }, 5000); // Every 5 seconds
        // Store interval ID for cleanup
        this.mockScanInterval = mockScanInterval;
    }
    /**
     * Display a QR code
     * @param data Data to encode in QR code
     */
    async displayQrCode(data) {
        if (!this.qrElement) {
            throw new Error('QR display element not found');
        }
        // Convert data to base64 for display
        const base64Data = btoa(String.fromCharCode.apply(null, Array.from(data)));
        // In a real implementation, this would generate an actual QR code
        this.qrElement.innerHTML = `
      <div style="text-align: center;">
        <div style="background-color: #ccc; width: 200px; height: 200px; margin: auto;">
          <div style="padding-top: 90px;">QR Code</div>
        </div>
        <div style="font-size: 10px; margin-top: 10px; word-break: break-all;">
          ${base64Data.substring(0, 20)}...
        </div>
      </div>
    `;
        // In a real implementation, we would wait for the QR code to be scanned
        // For now, just resolve after a delay
        return new Promise(resolve => setTimeout(resolve, 500));
    }
}
exports.QrKissPipe = QrKissPipe;
//# sourceMappingURL=QrKissPipe.js.map