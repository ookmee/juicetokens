import { MessageFrame, FrameType, CompressionType } from '../proto-types';
/**
 * Options for message framing
 */
export interface MessageFramerOptions {
    /**
     * Maximum chunk size in bytes
     */
    maxChunkSize?: number;
    /**
     * Compression type to use
     */
    compressionType?: CompressionType;
    /**
     * Protocol version
     */
    protocolVersion?: number;
}
/**
 * Result of frame assembly
 */
export interface FrameAssemblyResult {
    /**
     * Whether the frame is complete
     */
    isComplete: boolean;
    /**
     * The assembled message frame (if complete)
     */
    frame?: MessageFrame;
    /**
     * Missing chunk indices (if incomplete)
     */
    missingChunks?: number[];
    /**
     * Whether there was an error during assembly
     */
    hasError: boolean;
    /**
     * Error message (if hasError is true)
     */
    errorMessage?: string;
}
/**
 * MessageFramer handles the framing of messages for transmission
 * It implements chunking, compression, and sequencing
 */
export declare class MessageFramer {
    private options;
    private sequenceCounter;
    private frameStore;
    private frameMetadata;
    /**
     * Constructor
     * @param options Options for message framing
     */
    constructor(options?: MessageFramerOptions);
    /**
     * Create a message frame
     * @param payload Payload data
     * @param type Frame type
     * @param headers Optional headers
     * @returns Array of chunked message frames
     */
    createFrame(payload: Uint8Array, type?: FrameType, headers?: {
        [key: string]: string;
    }): MessageFrame[];
    /**
     * Process a received message frame chunk
     * @param frame Received message frame
     * @returns Frame assembly result
     */
    processFrame(frame: MessageFrame): FrameAssemblyResult;
    /**
     * Get the next sequence number
     * @returns Next sequence number
     */
    private nextSequence;
}
