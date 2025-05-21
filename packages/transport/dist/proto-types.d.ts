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
export declare enum PipeType {
    QR_KISS = 0,
    BLE = 1,
    NFC = 2,
    WEB = 3
}
export declare enum FrameType {
    DATA = 0,
    CONTROL = 1,
    HEARTBEAT = 2,
    ERROR = 3,
    ACKNOWLEDGMENT = 4
}
export declare enum CompressionType {
    NONE = 0,
    GZIP = 1,
    LZ4 = 2,
    ZSTD = 3
}
export interface ChunkInfo {
    chunkIndex: number;
    totalChunks: number;
    chunkSize: number;
    chunkHash: Uint8Array;
    completeHash?: Uint8Array;
}
export interface MessageFrame {
    frameId: string;
    type: FrameType;
    payload: Uint8Array;
    headers: {
        [key: string]: string;
    };
    timestampMs: bigint;
    compression: CompressionType;
    chunks: ChunkInfo[];
    protocolVersion: number;
    sequenceNumber: number;
}
export declare namespace MessageFrame {
    function encode(message: MessageFrame): {
        finish(): Uint8Array;
    };
    function decode(data: Uint8Array): MessageFrame;
}
export interface QrKissConfig {
    qrCodeVersion: number;
    errorCorrectionLevel: string;
    chunkSizeBytes: number;
    displaySizePixels: number;
}
export interface BleConfig {
    serviceUuid: string;
    characteristicUuid: string;
    requireBonding: boolean;
    mtuSize: number;
}
export interface NfcConfig {
    aid: string;
    useSecureElement: boolean;
    maxMessageSize: number;
}
export interface WebConfig {
    endpointUrl: string;
    useWebsocket: boolean;
    headers: {
        [key: string]: string;
    };
    useTls: boolean;
}
export interface PipeConfiguration {
    pipeType: PipeType;
    pipeId: string;
    timeoutMs: number;
    typeConfig?: {
        case: 'qrKiss' | 'ble' | 'nfc' | 'web';
        value: QrKissConfig | BleConfig | NfcConfig | WebConfig;
    };
}
export interface PipeStatus {
    pipeId: string;
    pipeType: PipeType;
    state: number;
    errorMessage: string;
    bytesSent: number;
    bytesReceived: number;
    roundTripTimeMs: number;
    uptimeSeconds: number;
}
export interface PipeCapabilities {
    pipeType: PipeType;
    maxMessageSizeBytes: number;
    maxThroughputBytesPerSecond: number;
    supportsBidirectional: boolean;
    requiresUserInteraction: boolean;
    supportsBackgroundOperation: boolean;
    supportedFeatures: string[];
}
export interface PipeDataChunk {
    pipeId: string;
    data: Uint8Array;
    sequenceNumber: number;
    totalChunks: number;
    isLastChunk: boolean;
    messageId: string;
}
export interface Acknowledgment {
    frameId: string;
    success: boolean;
    errorMessage: string;
    timestampMs: bigint;
    receivedChunks: number[];
}
export declare namespace Acknowledgment {
    function encode(ack: Acknowledgment): {
        finish(): Uint8Array;
    };
}
export interface RecoveryRequest {
    frameId: string;
    missingChunks: number[];
    timestampMs: bigint;
    sessionId: string;
}
export declare namespace RecoveryRequest {
    function encode(req: RecoveryRequest): {
        finish(): Uint8Array;
    };
}
export interface TransportError {
    type: number;
    message: string;
    frameId: string;
    timestampMs: bigint;
    context: {
        [key: string]: string;
    };
    recoverable: boolean;
    recoveryHint: string;
}
