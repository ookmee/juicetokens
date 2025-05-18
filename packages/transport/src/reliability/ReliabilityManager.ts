import { Observable, Subject, timer } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  MessageFrame,
  FrameType,
  Acknowledgment,
  RecoveryRequest,
  TransportError
} from '../proto-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for the reliability manager
 */
export interface ReliabilityConfig {
  /**
   * Maximum retry attempts
   */
  maxRetries?: number;
  
  /**
   * Base timeout in milliseconds
   */
  baseTimeoutMs?: number;
  
  /**
   * Whether to use exponential backoff for retries
   */
  useExponentialBackoff?: boolean;
  
  /**
   * Maximum timeout in milliseconds
   */
  maxTimeoutMs?: number;
  
  /**
   * Whether to require acknowledgments for all messages
   */
  requireAcknowledgments?: boolean;
}

/**
 * Result of message transmission
 */
export interface TransmissionResult {
  /**
   * Whether transmission was successful
   */
  success: boolean;
  
  /**
   * Error message if unsuccessful
   */
  errorMessage?: string;
  
  /**
   * Retry count if retries were needed
   */
  retryCount?: number;
  
  /**
   * Transmission time in milliseconds
   */
  transmissionTimeMs?: number;
}

/**
 * Session state for resumption
 */
export interface SessionState {
  /**
   * Session identifier
   */
  sessionId: string;
  
  /**
   * Resumption token
   */
  resumptionToken: string;
  
  /**
   * Last successfully processed sequence number
   */
  lastSequence: number;
  
  /**
   * Session expiration timestamp
   */
  expiresAt: number;
  
  /**
   * Additional session state
   */
  stateData: Record<string, string>;
}

/**
 * Message transmission options
 */
export interface MessageSendOptions {
  /**
   * Whether to require acknowledgment
   */
  requireAck?: boolean;
  
  /**
   * Timeout in milliseconds
   */
  timeoutMs?: number;
  
  /**
   * Maximum retry attempts
   */
  maxRetries?: number;
}

/**
 * ReliabilityManager implements reliability and recovery mechanisms for message transmission
 */
export class ReliabilityManager {
  private config: Required<ReliabilityConfig>;
  private pendingMessages: Map<string, {
    message: MessageFrame,
    attempt: number,
    startTime: number,
    timeoutId: any
  }> = new Map();
  
  private ackSubject = new Subject<Acknowledgment>();
  private errorSubject = new Subject<TransportError>();
  private recoverySubject = new Subject<RecoveryRequest>();
  private sessionSubject = new Subject<SessionState>();
  
  private currentSession: SessionState | null = null;
  
  /**
   * Constructor
   * @param sendCallback Callback to send messages
   * @param config Reliability configuration
   */
  constructor(
    private sendCallback: (message: MessageFrame) => Promise<void>,
    config?: ReliabilityConfig
  ) {
    this.config = {
      maxRetries: config?.maxRetries ?? 3,
      baseTimeoutMs: config?.baseTimeoutMs ?? 5000,
      useExponentialBackoff: config?.useExponentialBackoff ?? true,
      maxTimeoutMs: config?.maxTimeoutMs ?? 30000,
      requireAcknowledgments: config?.requireAcknowledgments ?? true
    };
  }
  
  /**
   * Send a message with reliability guarantees
   * @param message Message to send
   * @param options Transmission options
   * @returns Promise that resolves when message is acknowledged or fails
   */
  async sendReliableMessage(
    message: MessageFrame,
    options?: MessageSendOptions
  ): Promise<TransmissionResult> {
    const requireAck = options?.requireAck ?? this.config.requireAcknowledgments;
    const timeoutMs = options?.timeoutMs ?? this.config.baseTimeoutMs;
    const maxRetries = options?.maxRetries ?? this.config.maxRetries;
    
    // If no acknowledgment required, just send the message
    if (!requireAck) {
      const startTime = Date.now();
      try {
        await this.sendCallback(message);
        return {
          success: true,
          transmissionTimeMs: Date.now() - startTime
        };
      } catch (error) {
        return {
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    return new Promise<TransmissionResult>((resolve) => {
      const frameId = message.frameId;
      const startTime = Date.now();
      let attempt = 0;
      
      // Set up acknowledgment listener
      const ackSubscription = this.ackSubject
        .pipe(filter(ack => ack.frameId === frameId))
        .subscribe(ack => {
          // Cleanup
          this.pendingMessages.delete(frameId);
          ackSubscription.unsubscribe();
          errorSubscription.unsubscribe();
          
          if (ack.success) {
            resolve({
              success: true,
              retryCount: attempt,
              transmissionTimeMs: Date.now() - startTime
            });
          } else {
            resolve({
              success: false,
              errorMessage: ack.errorMessage || 'Message acknowledged with error',
              retryCount: attempt,
              transmissionTimeMs: Date.now() - startTime
            });
          }
        });
      
      // Set up error listener
      const errorSubscription = this.errorSubject
        .pipe(filter(error => error.frameId === frameId))
        .subscribe(error => {
          // Only handle non-recoverable errors here
          if (!error.recoverable) {
            // Cleanup
            this.pendingMessages.delete(frameId);
            ackSubscription.unsubscribe();
            errorSubscription.unsubscribe();
            
            resolve({
              success: false,
              errorMessage: error.message || 'Unknown error',
              retryCount: attempt,
              transmissionTimeMs: Date.now() - startTime
            });
          }
        });
      
      // Function to send or retry the message
      const sendAttempt = async () => {
        try {
          await this.sendCallback(message);
          
          // Set timeout for acknowledgment
          const retryTimeout = this.calculateTimeout(attempt, timeoutMs);
          const timeoutId = setTimeout(() => {
            attempt++;
            
            if (attempt <= maxRetries) {
              // Retry
              sendAttempt();
            } else {
              // Max retries reached
              this.pendingMessages.delete(frameId);
              ackSubscription.unsubscribe();
              errorSubscription.unsubscribe();
              
              resolve({
                success: false,
                errorMessage: 'Max retries reached without acknowledgment',
                retryCount: attempt - 1,
                transmissionTimeMs: Date.now() - startTime
              });
            }
          }, retryTimeout);
          
          // Store pending message
          this.pendingMessages.set(frameId, {
            message,
            attempt,
            startTime,
            timeoutId
          });
        } catch (error) {
          resolve({
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error),
            retryCount: attempt,
            transmissionTimeMs: Date.now() - startTime
          });
        }
      };
      
      // Start sending
      sendAttempt();
    });
  }
  
  /**
   * Process an acknowledgment message
   * @param ack Acknowledgment message
   */
  processAcknowledgment(ack: Acknowledgment): void {
    this.ackSubject.next(ack);
  }
  
  /**
   * Process a transport error
   * @param error Transport error
   */
  processError(error: TransportError): void {
    this.errorSubject.next(error);
  }
  
  /**
   * Process a recovery request
   * @param request Recovery request
   */
  async processRecoveryRequest(request: RecoveryRequest): Promise<void> {
    this.recoverySubject.next(request);
    
    // Handle missing chunks recovery
    const pendingMessage = this.pendingMessages.get(request.frameId);
    if (pendingMessage && request.missingChunks.length > 0) {
      // Retransmit the message
      try {
        await this.sendCallback(pendingMessage.message);
      } catch (error) {
        console.error('Failed to retransmit message:', error);
      }
    }
  }
  
  /**
   * Create an acknowledgment message
   * @param frameId Frame identifier to acknowledge
   * @param success Whether receipt was successful
   * @param errorMessage Optional error message
   * @param receivedChunks Optional received chunks for partial acknowledgment
   * @returns Acknowledgment message
   */
  createAcknowledgment(
    frameId: string,
    success: boolean,
    errorMessage?: string,
    receivedChunks?: number[]
  ): MessageFrame {
    const ack: Acknowledgment = {
      frameId,
      success,
      errorMessage: errorMessage || '',
      timestampMs: BigInt(Date.now()),
      receivedChunks: receivedChunks || []
    };
    
    return {
      frameId: uuidv4(),
      type: FrameType.ACKNOWLEDGMENT,
      payload: Acknowledgment.encode(ack).finish(),
      headers: {},
      timestampMs: BigInt(Date.now()),
      compression: 0, // NONE
      chunks: [{
        chunkIndex: 0,
        totalChunks: 1,
        chunkSize: 0, // Will be set correctly when serialized
        chunkHash: new Uint8Array(),
        completeHash: new Uint8Array()
      }],
      protocolVersion: 1,
      sequenceNumber: 0
    };
  }
  
  /**
   * Create a recovery request message
   * @param frameId Frame identifier to recover
   * @param missingChunks Missing chunk indices
   * @returns Recovery request message
   */
  createRecoveryRequest(frameId: string, missingChunks: number[]): MessageFrame {
    const request: RecoveryRequest = {
      frameId,
      missingChunks,
      timestampMs: BigInt(Date.now()),
      sessionId: this.currentSession?.sessionId || ''
    };
    
    return {
      frameId: uuidv4(),
      type: FrameType.CONTROL,
      payload: RecoveryRequest.encode(request).finish(),
      headers: { 'message-type': 'recovery-request' },
      timestampMs: BigInt(Date.now()),
      compression: 0, // NONE
      chunks: [{
        chunkIndex: 0,
        totalChunks: 1,
        chunkSize: 0, // Will be set correctly when serialized
        chunkHash: new Uint8Array(),
        completeHash: new Uint8Array()
      }],
      protocolVersion: 1,
      sequenceNumber: 0
    };
  }
  
  /**
   * Create a new session
   * @returns New session state
   */
  createSession(): SessionState {
    const sessionId = uuidv4();
    const resumptionToken = uuidv4();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    this.currentSession = {
      sessionId,
      resumptionToken,
      lastSequence: 0,
      expiresAt,
      stateData: {}
    };
    
    this.sessionSubject.next(this.currentSession);
    return this.currentSession;
  }
  
  /**
   * Resume a session
   * @param state Session state to resume
   * @returns Whether session was successfully resumed
   */
  resumeSession(state: SessionState): boolean {
    // Check if session is expired
    if (state.expiresAt < Date.now()) {
      return false;
    }
    
    this.currentSession = state;
    this.sessionSubject.next(this.currentSession);
    return true;
  }
  
  /**
   * Calculate timeout based on retry attempt
   * @param attempt Retry attempt
   * @param baseTimeout Base timeout
   * @returns Calculated timeout
   */
  private calculateTimeout(attempt: number, baseTimeout: number): number {
    if (this.config.useExponentialBackoff) {
      const timeout = baseTimeout * Math.pow(2, attempt);
      return Math.min(timeout, this.config.maxTimeoutMs);
    }
    return baseTimeout;
  }
  
  /**
   * Get acknowledgment events
   * @returns Observable of acknowledgment events
   */
  getAcknowledgmentEvents(): Observable<Acknowledgment> {
    return this.ackSubject.asObservable();
  }
  
  /**
   * Get error events
   * @returns Observable of error events
   */
  getErrorEvents(): Observable<TransportError> {
    return this.errorSubject.asObservable();
  }
  
  /**
   * Get recovery request events
   * @returns Observable of recovery request events
   */
  getRecoveryEvents(): Observable<RecoveryRequest> {
    return this.recoverySubject.asObservable();
  }
  
  /**
   * Get session events
   * @returns Observable of session events
   */
  getSessionEvents(): Observable<SessionState> {
    return this.sessionSubject.asObservable();
  }
} 