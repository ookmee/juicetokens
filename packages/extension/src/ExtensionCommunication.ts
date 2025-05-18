import { ExtensionMessage, IExtensionCommunication } from './types';

/**
 * Extension Communication
 * Handles message passing between extensions
 */
export class ExtensionCommunication implements IExtensionCommunication {
  // Message handlers map
  private handlers: Map<string, (message: ExtensionMessage) => Promise<any>> = new Map();
  
  /**
   * Send a message to an extension
   */
  async sendMessage(message: ExtensionMessage): Promise<any> {
    if (!message.target) {
      throw new Error('Message must specify a target extension');
    }
    
    // Find the target extension handler
    const handler = this.handlers.get(message.target);
    if (!handler) {
      throw new Error(`No handler registered for extension: ${message.target}`);
    }
    
    // Deliver the message
    try {
      return await handler(message);
    } catch (error) {
      console.error(`Error in message handler for ${message.target}:`, error);
      throw error;
    }
  }
  
  /**
   * Register a message handler for an extension
   */
  registerHandler(
    extensionId: string, 
    handler: (message: ExtensionMessage) => Promise<any>
  ): void {
    if (this.handlers.has(extensionId)) {
      console.warn(`Replacing existing message handler for extension: ${extensionId}`);
    }
    
    this.handlers.set(extensionId, handler);
  }
  
  /**
   * Unregister a message handler for an extension
   */
  unregisterHandler(extensionId: string): void {
    this.handlers.delete(extensionId);
  }
} 