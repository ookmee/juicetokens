"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationExtension = void 0;
/**
 * Notification Extension
 * Example extension that provides notification services to other extensions
 */
class NotificationExtension {
    constructor() {
        // Extension identity
        this.id = 'juicetokens-notification-extension';
        this.name = 'Notification Service';
        this.version = '1.0.0';
        this.description = 'Provides notification services for JuiceTokens';
        // Extension capabilities
        this.capabilities = [
            {
                name: 'notifications',
                description: 'Show notifications to the user',
                permissions: ['notify']
            }
        ];
    }
    /**
     * Initialize the extension
     */
    async onInitialize(context) {
        this.context = context;
        this.context.logger.info('Notification extension initialized');
        // Load configuration
        const config = this.context.getConfig();
        this.context.logger.debug('Loaded configuration:', config);
    }
    /**
     * Activate the extension
     */
    async onActivate() {
        this.context.logger.info('Notification extension activated');
    }
    /**
     * Deactivate the extension
     */
    async onDeactivate() {
        this.context.logger.info('Notification extension deactivated');
    }
    /**
     * Handle incoming messages
     */
    async onMessage(message) {
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
    async handleNotification(message) {
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
exports.NotificationExtension = NotificationExtension;
//# sourceMappingURL=NotificationExtension.js.map