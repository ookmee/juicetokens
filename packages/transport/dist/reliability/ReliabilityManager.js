"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityManager = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const proto_types_1 = require("../proto-types");
const uuid_1 = require("uuid");
/**
 * ReliabilityManager implements reliability and recovery mechanisms for message transmission
 */
class ReliabilityManager {
    /**
     * Constructor
     * @param sendCallback Callback to send messages
     * @param config Reliability configuration
     */
    constructor(sendCallback, config) {
        this.sendCallback = sendCallback;
        this.pendingMessages = new Map();
        this.ackSubject = new rxjs_1.Subject();
        this.errorSubject = new rxjs_1.Subject();
        this.recoverySubject = new rxjs_1.Subject();
        this.sessionSubject = new rxjs_1.Subject();
        this.currentSession = null;
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
    async sendReliableMessage(message, options) {
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
            }
            catch (error) {
                return {
                    success: false,
                    errorMessage: error instanceof Error ? error.message : String(error)
                };
            }
        }
        return new Promise((resolve) => {
            const frameId = message.frameId;
            const startTime = Date.now();
            let attempt = 0;
            // Set up acknowledgment listener
            const ackSubscription = this.ackSubject
                .pipe((0, operators_1.filter)(ack => ack.frameId === frameId))
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
                }
                else {
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
                .pipe((0, operators_1.filter)(error => error.frameId === frameId))
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
                        }
                        else {
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
                }
                catch (error) {
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
    processAcknowledgment(ack) {
        this.ackSubject.next(ack);
    }
    /**
     * Process a transport error
     * @param error Transport error
     */
    processError(error) {
        this.errorSubject.next(error);
    }
    /**
     * Process a recovery request
     * @param request Recovery request
     */
    async processRecoveryRequest(request) {
        this.recoverySubject.next(request);
        // Handle missing chunks recovery
        const pendingMessage = this.pendingMessages.get(request.frameId);
        if (pendingMessage && request.missingChunks.length > 0) {
            // Retransmit the message
            try {
                await this.sendCallback(pendingMessage.message);
            }
            catch (error) {
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
    createAcknowledgment(frameId, success, errorMessage, receivedChunks) {
        const ack = {
            frameId,
            success,
            errorMessage: errorMessage || '',
            timestampMs: BigInt(Date.now()),
            receivedChunks: receivedChunks || []
        };
        return {
            frameId: (0, uuid_1.v4)(),
            type: proto_types_1.FrameType.ACKNOWLEDGMENT,
            payload: proto_types_1.Acknowledgment.encode(ack).finish(),
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
    createRecoveryRequest(frameId, missingChunks) {
        const request = {
            frameId,
            missingChunks,
            timestampMs: BigInt(Date.now()),
            sessionId: this.currentSession?.sessionId || ''
        };
        return {
            frameId: (0, uuid_1.v4)(),
            type: proto_types_1.FrameType.CONTROL,
            payload: proto_types_1.RecoveryRequest.encode(request).finish(),
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
    createSession() {
        const sessionId = (0, uuid_1.v4)();
        const resumptionToken = (0, uuid_1.v4)();
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
    resumeSession(state) {
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
    calculateTimeout(attempt, baseTimeout) {
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
    getAcknowledgmentEvents() {
        return this.ackSubject.asObservable();
    }
    /**
     * Get error events
     * @returns Observable of error events
     */
    getErrorEvents() {
        return this.errorSubject.asObservable();
    }
    /**
     * Get recovery request events
     * @returns Observable of recovery request events
     */
    getRecoveryEvents() {
        return this.recoverySubject.asObservable();
    }
    /**
     * Get session events
     * @returns Observable of session events
     */
    getSessionEvents() {
        return this.sessionSubject.asObservable();
    }
}
exports.ReliabilityManager = ReliabilityManager;
//# sourceMappingURL=ReliabilityManager.js.map