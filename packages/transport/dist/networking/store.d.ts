import { MessageStore, NetworkMessage } from './types';
/**
 * Configuration for the store-and-forward message cache
 */
export interface MessageStoreConfig {
    maxMessages: number;
    deliveryAttemptIntervalMs: number;
    maxDeliveryAttempts: number;
    maxAgeMs: number;
    cleanupIntervalMs: number;
}
/**
 * Implements a store-and-forward message cache for reliable message delivery
 */
export declare class DefaultMessageStore implements MessageStore {
    private messages;
    private metadata;
    private config;
    private cleanupTimer;
    constructor(config?: Partial<MessageStoreConfig>);
    /**
     * Add a message to the store
     */
    add(message: NetworkMessage): void;
    /**
     * Remove a message from the store
     */
    remove(messageId: string): void;
    /**
     * Get a message by ID
     */
    get(messageId: string): NetworkMessage | null;
    /**
     * Get all pending messages that need to be delivered
     */
    getPending(): NetworkMessage[];
    /**
     * Mark a message as delivered
     */
    markDelivered(messageId: string): void;
    /**
     * Clean up old messages
     */
    cleanup(maxAgeMs: number): void;
    /**
     * Stop message store timers
     */
    stop(): void;
}
/**
 * Factory for creating message store instances
 */
export declare class MessageStoreFactory {
    static createDefaultMessageStore(config?: Partial<MessageStoreConfig>): MessageStore;
}
