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
 * Message metadata for the store
 */
interface MessageMetadata {
  added: number;
  attempts: number;
  lastAttempt: number;
  delivered: boolean;
}

/**
 * Implements a store-and-forward message cache for reliable message delivery
 */
export class DefaultMessageStore implements MessageStore {
  private messages: Map<string, NetworkMessage> = new Map();
  private metadata: Map<string, MessageMetadata> = new Map();
  private config: MessageStoreConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MessageStoreConfig>) {
    const defaultConfig: MessageStoreConfig = {
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
  add(message: NetworkMessage): void {
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
  remove(messageId: string): void {
    this.messages.delete(messageId);
    this.metadata.delete(messageId);
  }

  /**
   * Get a message by ID
   */
  get(messageId: string): NetworkMessage | null {
    return this.messages.get(messageId) || null;
  }

  /**
   * Get all pending messages that need to be delivered
   */
  getPending(): NetworkMessage[] {
    const now = Date.now();
    const deliveryThreshold = now - this.config.deliveryAttemptIntervalMs;
    const pending: NetworkMessage[] = [];

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
  markDelivered(messageId: string): void {
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
  cleanup(maxAgeMs: number): void {
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
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

/**
 * Factory for creating message store instances
 */
export class MessageStoreFactory {
  static createDefaultMessageStore(config?: Partial<MessageStoreConfig>): MessageStore {
    return new DefaultMessageStore(config);
  }
} 