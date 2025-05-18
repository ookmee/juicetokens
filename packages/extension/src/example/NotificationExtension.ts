import { Extension, ExtensionCapability, ExtensionContext, ExtensionMessage } from '../types';

/**
 * Notification Extension
 * Example extension that provides notification services to other extensions
 */
export class NotificationExtension implements Extension {
  // Extension identity
  id = 'juicetokens-notification-extension';
  name = 'Notification Service';
  version = '1.0.0';
  description = 'Provides notification services for JuiceTokens';
  
  // Extension capabilities
  capabilities: ExtensionCapability[] = [
    {
      name: 'notifications',
      description: 'Show notifications to the user',
      permissions: ['notify']
    }
  ];
  
  // Extension context provided during initialization
  private context!: ExtensionContext;
  
  /**
   * Initialize the extension
   */
  async onInitialize(context: ExtensionContext): Promise<void> {
    this.context = context;
    this.context.logger.info('Notification extension initialized');
    
    // Load configuration
    const config = this.context.getConfig();
    this.context.logger.debug('Loaded configuration:', config);
  }
  
  /**
   * Activate the extension
   */
  async onActivate(): Promise<void> {
    this.context.logger.info('Notification extension activated');
  }
  
  /**
   * Deactivate the extension
   */
  async onDeactivate(): Promise<void> {
    this.context.logger.info('Notification extension deactivated');
  }
  
  /**
   * Handle incoming messages
   */
  async onMessage(message: ExtensionMessage): Promise<any> {
    this.context.logger.debug('Received message:', message);
    
    // Handle different actions
    switch (message.action) {
      case 'notify':
        return this.handleNotification(message);
      
      default:
        this.context.logger.warn(`Unknown action: ${message.action}`);
        return { success: false, error: 'Unknown action' };
    }
  }
  
  /**
   * Handle a notification request
   */
  private async handleNotification(message: ExtensionMessage): Promise<any> {
    const { title, body, type } = message.payload || {};
    
    if (!title || !body) {
      return { success: false, error: 'Missing required fields (title, body)' };
    }
    
    this.context.logger.info(`Notification: ${title} - ${body} (${type || 'info'})`);
    
    // In a real implementation, this would display a notification to the user
    // For this example, we just log it
    
    return { success: true, id: `notification-${Date.now()}` };
  }
} 