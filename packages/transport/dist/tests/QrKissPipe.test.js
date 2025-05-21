"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QrKissPipe_1 = require("../adapters/QrKissPipe");
const PipeConfigManager_1 = require("../types/PipeConfigManager");
const proto_types_1 = require("../proto-types");
describe('QrKissPipe', () => {
    // Mock document and window for testing
    global.document = {
        getElementById: jest.fn(() => null),
        createElement: jest.fn(() => ({
            style: {},
            id: '',
            innerHTML: ''
        })),
        body: {
            appendChild: jest.fn()
        }
    };
    global.window = {
        crypto: {
            getRandomValues: jest.fn((arr) => arr)
        }
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should initialize correctly', async () => {
        // Create a QR KISS pipe
        const pipeId = 'test-qr-pipe';
        const config = PipeConfigManager_1.PipeConfigManager.createQrKissConfig({ pipeId });
        const pipe = new QrKissPipe_1.QrKissPipe(pipeId, config);
        // Check initial state
        expect(pipe.id).toBe(pipeId);
        expect(pipe.type).toBe(proto_types_1.PipeType.QR_KISS);
        // Initialize the pipe
        await pipe.initialize(config);
        // Check if document methods were called
        expect(global.document.getElementById).toHaveBeenCalledWith('qr-code-display');
        expect(global.document.getElementById).toHaveBeenCalledWith('qr-code-scanner');
        expect(global.document.createElement).toHaveBeenCalledTimes(2);
        expect(global.document.body.appendChild).toHaveBeenCalledTimes(2);
        // Check status after initialization
        expect(pipe.status.state).toBe(1); // READY
        expect(pipe.status.pipeId).toBe(pipeId);
    });
    it('should connect as initiator', async () => {
        const pipe = new QrKissPipe_1.QrKissPipe('test-pipe');
        await pipe.initialize(PipeConfigManager_1.PipeConfigManager.createQrKissConfig());
        // Connect as initiator
        await pipe.connect(true);
        // Check status after connection
        expect(pipe.status.state).toBe(3); // CONNECTED
    });
    it('should connect as receiver', async () => {
        const pipe = new QrKissPipe_1.QrKissPipe('test-pipe');
        await pipe.initialize(PipeConfigManager_1.PipeConfigManager.createQrKissConfig());
        // Connect as receiver
        await pipe.connect(false);
        // Check status after connection
        expect(pipe.status.state).toBe(3); // CONNECTED
    });
    it('should disconnect', async () => {
        const pipe = new QrKissPipe_1.QrKissPipe('test-pipe');
        await pipe.initialize(PipeConfigManager_1.PipeConfigManager.createQrKissConfig());
        await pipe.connect(true);
        // Disconnect
        await pipe.disconnect();
        // Check status after disconnection
        expect(pipe.status.state).toBe(5); // DISCONNECTED
    });
    it('should send data', async () => {
        const pipe = new QrKissPipe_1.QrKissPipe('test-pipe');
        await pipe.initialize(PipeConfigManager_1.PipeConfigManager.createQrKissConfig());
        await pipe.connect(true);
        // Create test data
        const testData = new Uint8Array([1, 2, 3, 4, 5]);
        // Send data
        await pipe.sendData(testData);
        // Check bytes sent
        expect(pipe.status.bytesSent).toBe(testData.length);
    });
});
//# sourceMappingURL=QrKissPipe.test.js.map