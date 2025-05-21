"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStoreFactory = exports.DefaultMessageStore = void 0;
/**
 * Implements a store-and-forward message cache for reliable message delivery
 */
class DefaultMessageStore {
    constructor(config) {
        this.messages = new Map();
        this.metadata = new Map();
        this.cleanupTimer = null;
        const defaultConfig = {
            maxMessages: 1000,
            deliveryAttemptIntervalMs: 10000, // 10 seconds
            maxDeliveryAttempts: 5,
            maxAgeMs: 300000, // 5 minutes
            cleanupIntervalMs: 60000 // 1 minute
        };
        this.config = { ...defaultConfig, ...config };
        // Start periodic cleanup
        this.cleanupTimer = setInterval(() => this.cleanup(this.config.maxAgeMs), this.config.cleanupIntervalMs);
    }
    /**
     * Add a message to the store
     */
    add(message) {
        // Check if we're at capacity, remove oldest if needed
        if (this.messages.size >= this.config.maxMessages) {
            let oldestId = '';
            let oldestTime = Date.now();
            for (const [id, meta] of this.metadata.entries()) {
                if (meta.added < oldestTime) {
                    oldestTime = meta.added;
                    oldestId = id;
                }
            }
            if (oldestId) {
                this.remove(oldestId);
            }
        }
        // Add the message
        this.messages.set(message.id, message);
        this.metadata.set(message.id, {
            added: Date.now(),
            attempts: 0,
            lastAttempt: 0,
            delivered: false
        });
    }
    /**
     * Remove a message from the store
     */
    remove(messageId) {
        this.messages.delete(messageId);
        this.metadata.delete(messageId);
    }
    /**
     * Get a message by ID
     */
    get(messageId) {
        return this.messages.get(messageId) || null;
    }
    /**
     * Get all pending messages that need to be delivered
     */
    getPending() {
        const now = Date.now();
        const deliveryThreshold = now - this.config.deliveryAttemptIntervalMs;
        const pending = [];
        for (const [id, message] of this.messages.entries()) {
            const meta = this.metadata.get(id);
            if (meta &&
                !meta.delivered &&
                meta.attempts < this.config.maxDeliveryAttempts &&
                meta.lastAttempt < deliveryThreshold) {
                // Update attempt count and time
                this.metadata.set(id, {
                    ...meta,
                    attempts: meta.attempts + 1,
                    lastAttempt: now
                });
                pending.push(message);
            }
        }
        return pending;
    }
    /**
     * Mark a message as delivered
     */
    markDelivered(messageId) {
        const meta = this.metadata.get(messageId);
        if (meta) {
            this.metadata.set(messageId, {
                ...meta,
                delivered: true
            });
        }
    }
    /**
     * Clean up old messages
     */
    cleanup(maxAgeMs) {
        const now = Date.now();
        const expireThreshold = now - maxAgeMs;
        for (const [id, meta] of this.metadata.entries()) {
            // Remove messages that are:
            // 1. Too old
            // 2. Delivered and older than half the max age
            // 3. Have exceeded max delivery attempts
            if (meta.added < expireThreshold ||
                (meta.delivered && meta.added < now - (maxAgeMs / 2)) ||
                (meta.attempts >= this.config.maxDeliveryAttempts)) {
                this.remove(id);
            }
        }
    }
    /**
     * Stop message store timers
     */
    stop() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
}
exports.DefaultMessageStore = DefaultMessageStore;
/**
 * Factory for creating message store instances
 */
class MessageStoreFactory {
    static createDefaultMessageStore(config) {
        return new DefaultMessageStore(config);
    }
}
exports.MessageStoreFactory = MessageStoreFactory;
//# sourceMappingURL=store.js.map