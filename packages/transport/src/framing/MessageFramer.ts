import { 
  MessageFrame, 
  FrameType, 
  CompressionType, 
  ChunkInfo 
} from '../proto-types';
import { v4 as uuidv4 } from 'uuid';

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
export class MessageFramer {
  private options: Required<MessageFramerOptions>;
  private sequenceCounter: number = 0;
  private frameStore: Map<string, Map<number, Uint8Array>> = new Map();
  private frameMetadata: Map<string, { totalChunks: number, totalSize: number }> = new Map();

  /**
   * Constructor
   * @param options Options for message framing
   */
  constructor(options?: MessageFramerOptions) {
    this.options = {
      maxChunkSize: options?.maxChunkSize ?? 1024,
      compressionType: options?.compressionType ?? CompressionType.NONE,
      protocolVersion: options?.protocolVersion ?? 1
    };
  }

  /**
   * Create a message frame
   * @param payload Payload data
   * @param type Frame type
   * @param headers Optional headers
   * @returns Array of chunked message frames
   */
  createFrame(
    payload: Uint8Array,
    type: FrameType = FrameType.DATA,
    headers: { [key: string]: string } = {}
  ): MessageFrame[] {
    const frameId = uuidv4();
    const timestamp = Date.now();
    const sequenceNumber = this.nextSequence();
    
    // Apply compression if needed (mock implementation)
    let compressedPayload = payload;
    
    // Chunk the payload if necessary
    if (compressedPayload.length <= this.options.maxChunkSize) {
      // Single chunk message
      const frame: MessageFrame = {
        frameId: frameId,
        type: type,
        payload: compressedPayload,
        headers: headers,
        timestampMs: BigInt(timestamp),
        compression: this.options.compressionType,
        chunks: [{
          chunkIndex: 0,
          totalChunks: 1,
          chunkSize: compressedPayload.length,
          chunkHash: new Uint8Array(), // Mock hash
          completeHash: new Uint8Array() // Mock hash
        }],
        protocolVersion: this.options.protocolVersion,
        sequenceNumber: sequenceNumber
      };
      
      return [frame];
    } else {
      // Multi-chunk message
      const chunks: MessageFrame[] = [];
      const totalChunks = Math.ceil(compressedPayload.length / this.options.maxChunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * this.options.maxChunkSize;
        const end = Math.min(start + this.options.maxChunkSize, compressedPayload.length);
        const chunkData = compressedPayload.subarray(start, end);
        
        const chunkInfo: ChunkInfo = {
          chunkIndex: i,
          totalChunks: totalChunks,
          chunkSize: chunkData.length,
          chunkHash: new Uint8Array(), // Mock hash
          completeHash: i === 0 ? new Uint8Array() : undefined // Complete hash only in first chunk
        };
        
        const frame: MessageFrame = {
          frameId: frameId,
          type: type,
          payload: chunkData,
          headers: headers,
          timestampMs: BigInt(timestamp),
          compression: this.options.compressionType,
          chunks: [chunkInfo],
          protocolVersion: this.options.protocolVersion,
          sequenceNumber: sequenceNumber + i
        };
        
        chunks.push(frame);
      }
      
      return chunks;
    }
  }

  /**
   * Process a received message frame chunk
   * @param frame Received message frame
   * @returns Frame assembly result
   */
  processFrame(frame: MessageFrame): FrameAssemblyResult {
    try {
      // Get chunk info
      const chunkInfo = frame.chunks?.[0];
      if (!chunkInfo) {
        return {
          isComplete: true,
          frame: frame,
          hasError: false
        };
      }
      
      const { chunkIndex, totalChunks } = chunkInfo;
      const frameId = frame.frameId;
      
      // Check if this is a single-chunk message
      if (totalChunks === 1) {
        return {
          isComplete: true,
          frame: frame,
          hasError: false
        };
      }
      
      // Initialize frame storage if needed
      if (!this.frameStore.has(frameId)) {
        this.frameStore.set(frameId, new Map());
        this.frameMetadata.set(frameId, { totalChunks, totalSize: 0 });
      }
      
      const chunks = this.frameStore.get(frameId)!;
      
      // Store the chunk
      chunks.set(chunkIndex, frame.payload);
      
      // Update metadata
      const metadata = this.frameMetadata.get(frameId)!;
      metadata.totalSize += frame.payload.length;
      
      // Check if we have all chunks
      if (chunks.size === totalChunks) {
        // Assemble the complete payload
        const completePayload = new Uint8Array(metadata.totalSize);
        let offset = 0;
        
        for (let i = 0; i < totalChunks; i++) {
          const chunk = chunks.get(i);
          if (!chunk) {
            // This shouldn't happen but is handled for safety
            return {
              isComplete: false,
              missingChunks: [i],
              hasError: true,
              errorMessage: `Missing chunk ${i} after size check`
            };
          }
          
          completePayload.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Create the complete frame
        const completeFrame: MessageFrame = {
          ...frame,
          payload: completePayload,
          chunks: [{ ...chunkInfo, chunkIndex: 0, totalChunks: 1 }]
        };
        
        // Clean up
        this.frameStore.delete(frameId);
        this.frameMetadata.delete(frameId);
        
        return {
          isComplete: true,
          frame: completeFrame,
          hasError: false
        };
      }
      
      // Still missing some chunks
      const missingChunks: number[] = [];
      for (let i = 0; i < totalChunks; i++) {
        if (!chunks.has(i)) {
          missingChunks.push(i);
        }
      }
      
      return {
        isComplete: false,
        missingChunks,
        hasError: false
      };
      
    } catch (error) {
      return {
        isComplete: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get the next sequence number
   * @returns Next sequence number
   */
  private nextSequence(): number {
    const current = this.sequenceCounter;
    this.sequenceCounter = (this.sequenceCounter + 1) % 0xFFFFFFFF;
    return current;
  }
} 