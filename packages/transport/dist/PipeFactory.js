"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeFactory = void 0;
const proto_types_1 = require("./proto-types");
const QrKissPipe_1 = require("./adapters/QrKissPipe");
const PipeConfigManager_1 = require("./types/PipeConfigManager");
const uuid_1 = require("uuid");
// Implementing the other pipe types
const BlePipe_1 = require("./adapters/BlePipe");
const NfcPipe_1 = require("./adapters/NfcPipe");
const WebPipe_1 = require("./adapters/WebPipe");
/**
 * Factory class for creating pipe instances
 */
class PipeFactory {
    /**
     * Create a pipe of the specified type
     * @param type Pipe type
     * @param config Optional pipe configuration
     * @returns Pipe instance
     */
    static createPipe(type, config) {
        const pipeId = config?.pipeId ?? (0, uuid_1.v4)();
        switch (type) {
            case proto_types_1.PipeType.QR_KISS:
                return new QrKissPipe_1.QrKissPipe(pipeId, config ?? PipeConfigManager_1.PipeConfigManager.createQrKissConfig({ pipeId }));
            case proto_types_1.PipeType.BLE:
                return new BlePipe_1.BlePipe(pipeId, config ?? PipeConfigManager_1.PipeConfigManager.createBleConfig({ pipeId }));
            case proto_types_1.PipeType.NFC:
                return new NfcPipe_1.NfcPipe(pipeId, config ?? PipeConfigManager_1.PipeConfigManager.createNfcConfig({ pipeId }));
            case proto_types_1.PipeType.WEB:
                return new WebPipe_1.WebPipe(pipeId, config ?? PipeConfigManager_1.PipeConfigManager.createWebConfig({ pipeId }));
            default:
                throw new Error(`Unsupported pipe type: ${type}`);
        }
    }
    /**
     * Create all supported pipe types
     * @returns Array of pipe instances for all supported types
     */
    static createAllPipes() {
        return [
            PipeFactory.createPipe(proto_types_1.PipeType.QR_KISS),
            PipeFactory.createPipe(proto_types_1.PipeType.BLE),
            PipeFactory.createPipe(proto_types_1.PipeType.NFC),
            PipeFactory.createPipe(proto_types_1.PipeType.WEB)
        ];
    }
    /**
     * Get supported pipe types
     * @returns Array of supported pipe types
     */
    static getSupportedPipeTypes() {
        return [
            proto_types_1.PipeType.QR_KISS,
            proto_types_1.PipeType.BLE,
            proto_types_1.PipeType.NFC,
            proto_types_1.PipeType.WEB
        ];
    }
}
exports.PipeFactory = PipeFactory;
//# sourceMappingURL=PipeFactory.js.map