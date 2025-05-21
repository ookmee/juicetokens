"use strict";
/**
 * TEMPORARY MOCK TYPE DECLARATIONS
 *
 * These type declarations are temporary mocks that simulate the Protocol Buffer generated types.
 * They should be replaced with the actual generated types once the Protocol Buffer compilation
 * process is working correctly.
 *
 * Current issues:
 * - The build system is looking for non-existent proto files (extension_point.proto)
 * - The proto compilation process fails due to these missing dependencies
 *
 * To use the actual generated types:
 * 1. Fix the proto compilation process in the build system
 * 2. Replace all imports from '../proto-types' with '@juicetokens/proto'
 * 3. Remove this file
 *
 * These mock types mirror the structure defined in:
 * - /protos/transport/message.proto
 * - /protos/transport/pipe.proto
 * - /protos/transport/network.proto
 * - /protos/transport/native_bridge.proto
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryRequest = exports.Acknowledgment = exports.MessageFrame = exports.CompressionType = exports.FrameType = exports.PipeType = void 0;
var PipeType;
(function (PipeType) {
    PipeType[PipeType["QR_KISS"] = 0] = "QR_KISS";
    PipeType[PipeType["BLE"] = 1] = "BLE";
    PipeType[PipeType["NFC"] = 2] = "NFC";
    PipeType[PipeType["WEB"] = 3] = "WEB";
})(PipeType || (exports.PipeType = PipeType = {}));
var FrameType;
(function (FrameType) {
    FrameType[FrameType["DATA"] = 0] = "DATA";
    FrameType[FrameType["CONTROL"] = 1] = "CONTROL";
    FrameType[FrameType["HEARTBEAT"] = 2] = "HEARTBEAT";
    FrameType[FrameType["ERROR"] = 3] = "ERROR";
    FrameType[FrameType["ACKNOWLEDGMENT"] = 4] = "ACKNOWLEDGMENT";
})(FrameType || (exports.FrameType = FrameType = {}));
var CompressionType;
(function (CompressionType) {
    CompressionType[CompressionType["NONE"] = 0] = "NONE";
    CompressionType[CompressionType["GZIP"] = 1] = "GZIP";
    CompressionType[CompressionType["LZ4"] = 2] = "LZ4";
    CompressionType[CompressionType["ZSTD"] = 3] = "ZSTD";
})(CompressionType || (exports.CompressionType = CompressionType = {}));
// Static methods for MessageFrame
var MessageFrame;
(function (MessageFrame) {
    function encode(message) {
        return {
            finish: () => new Uint8Array(0)
        };
    }
    MessageFrame.encode = encode;
    function decode(data) {
        return {
            frameId: '',
            type: FrameType.DATA,
            payload: new Uint8Array(0),
            headers: {},
            timestampMs: BigInt(0),
            compression: CompressionType.NONE,
            chunks: [],
            protocolVersion: 1,
            sequenceNumber: 0
        };
    }
    MessageFrame.decode = decode;
})(MessageFrame || (exports.MessageFrame = MessageFrame = {}));
// Static methods for Acknowledgment
var Acknowledgment;
(function (Acknowledgment) {
    function encode(ack) {
        return {
            finish: () => new Uint8Array(0)
        };
    }
    Acknowledgment.encode = encode;
})(Acknowledgment || (exports.Acknowledgment = Acknowledgment = {}));
// Static methods for RecoveryRequest
var RecoveryRequest;
(function (RecoveryRequest) {
    function encode(req) {
        return {
            finish: () => new Uint8Array(0)
        };
    }
    RecoveryRequest.encode = encode;
})(RecoveryRequest || (exports.RecoveryRequest = RecoveryRequest = {}));
//# sourceMappingURL=proto-types.js.map