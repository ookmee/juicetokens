import { Observable } from 'rxjs';
import { MessageFrame, Acknowledgment, RecoveryRequest, TransportError } from '@juicetokens/proto';
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
export declare class ReliabilityManager {
    private sendCallback;
    private config;
    private pendingMessages;
    private ackSubject;
    private errorSubject;
    private recoverySubject;
    private sessionSubject;
    private currentSession;
    /**
     * Constructor
     * @param sendCallback Callback to send messages
     * @param config Reliability configuration
     */
    constructor(sendCallback: (message: MessageFrame) => Promise<void>, config?: ReliabilityConfig);
    /**
     * Send a message with reliability guarantees
     * @param message Message to send
     * @param options Transmission options
     * @returns Promise that resolves when message is acknowledged or fails
     */
    sendReliableMessage(message: MessageFrame, options?: MessageSendOptions): Promise<TransmissionResult>;
    /**
     * Process an acknowledgment message
     * @param ack Acknowledgment message
     */
    processAcknowledgment(ack: Acknowledgment): void;
    /**
     * Process a transport error
     * @param error Transport error
     */
    processError(error: TransportError): void;
    /**
     * Process a recovery request
     * @param request Recovery request
     */
    processRecoveryRequest(request: RecoveryRequest): Promise<void>;
    /**
     * Create an acknowledgment message
     * @param frameId Frame identifier to acknowledge
     * @param success Whether receipt was successful
     * @param errorMessage Optional error message
     * @param receivedChunks Optional received chunks for partial acknowledgment
     * @returns Acknowledgment message
     */
    createAcknowledgment(frameId: string, success: boolean, errorMessage?: string, receivedChunks?: number[]): MessageFrame;
    /**
     * Create a recovery request message
     * @param frameId Frame identifier to recover
     * @param missingChunks Missing chunk indices
     * @returns Recovery request message
     */
    createRecoveryRequest(frameId: string, missingChunks: number[]): MessageFrame;
    /**
     * Create a new session
     * @returns New session state
     */
    createSession(): SessionState;
    /**
     * Resume a session
     * @param state Session state to resume
     * @returns Whether session was successfully resumed
     */
    resumeSession(state: SessionState): boolean;
    /**
     * Calculate timeout based on retry attempt
     * @param attempt Retry attempt
     * @param baseTimeout Base timeout
     * @returns Calculated timeout
     */
    private calculateTimeout;
    /**
     * Get acknowledgment events
     * @returns Observable of acknowledgment events
     */
    getAcknowledgmentEvents(): Observable<Acknowledgment>;
    /**
     * Get error events
     * @returns Observable of error events
     */
    getErrorEvents(): Observable<TransportError>;
    /**
     * Get recovery request events
     * @returns Observable of recovery request events
     */
    getRecoveryEvents(): Observable<RecoveryRequest>;
    /**
     * Get session events
     * @returns Observable of session events
     */
    getSessionEvents(): Observable<SessionState>;
}
