"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenWatcherExtension = void 0;
/**
 * Token Watcher Extension
 * Example extension that monitors tokens and sends notifications
 */
class TokenWatcherExtension {
    constructor() {
        // Extension identity
        this.id = 'juicetokens-token-watcher';
        this.name = 'Token Watcher';
        this.version = '1.0.0';
        this.description = 'Monitors tokens and sends notifications for important events';
        // Extension capabilities
        this.capabilities = [
            {
                name: 'token-monitoring',
                description: 'Monitor token lifecycle events',
                permissions: ['tokens:read']
            }
        ];
    }
    /**
     * Initialize the extension
     */
    async onInitialize(context) {
        this.context = context;
        this.context.logger.info('Token Watcher extension initialized');
        // Load configuration
        const config = this.context.getConfig();
        // Set default configuration if not already set
        if (!config.settings.watchIntervalSeconds) {
            await this.context.updateConfig({
                watchIntervalSeconds: 60,
                notifyExpiringTokens: true,
                expiryWarningDays: 7
            });
        }
    }
    /**
     * Activate the extension
     */
    async onActivate() {
        this.context.logger.info('Token Watcher extension activated');
        // Get the current configuration
        const config = this.context.getConfig();
        const intervalSeconds = config.settings.watchIntervalSeconds || 60;
        // Start the token watching process
        this.startWatching(intervalSeconds);
    }
    /**
     * Deactivate the extension
     */
    async onDeactivate() {
        this.context.logger.info('Token Watcher extension deactivated');
        // Stop the token watching process
        this.stopWatching();
    }
    /**
     * Handle incoming messages
     */
    async onMessage(message) {
        this.context.logger.debug('Received message:', message);
        // Handle different actions
        switch (message.action) {
            case 'checkNow':
                return this.checkTokens();
            case 'updateInterval':
                const { intervalSeconds } = message.payload || {};
                if (typeof intervalSeconds === 'number') {
                    return this.updateWatchInterval(intervalSeconds);
                }
                return { success: false, error: 'Invalid interval' };
            default:
                this.context.logger.warn(`Unknown action: ${message.action}`);
                return { success: false, error: 'Unknown action' };
        }
    }
    /**
     * Start the token watching process
     */
    startWatching(intervalSeconds) {
        // Stop any existing watch process
        this.stopWatching();
        this.context.logger.info(`Starting token watcher (interval: ${intervalSeconds}s)`);
        // Set up a regular check interval
        this.watchIntervalId = setInterval(() => {
            this.checkTokens()
                .catch(error => this.context.logger.error('Error checking tokens:', error));
        }, intervalSeconds * 1000);
        // Do an immediate check
        this.checkTokens()
            .catch(error => this.context.logger.error('Error in initial token check:', error));
    }
    /**
     * Stop the token watching process
     */
    stopWatching() {
        if (this.watchIntervalId) {
            clearInterval(this.watchIntervalId);
            this.watchIntervalId = undefined;
            this.context.logger.info('Stopped token watcher');
        }
    }
    /**
     * Update the watch interval
     */
    async updateWatchInterval(intervalSeconds) {
        // Update configuration
        await this.context.updateConfig({ watchIntervalSeconds: intervalSeconds });
        // Restart the watcher with the new interval
        this.startWatching(intervalSeconds);
        return { success: true, intervalSeconds };
    }
    /**
     * Check tokens for issues and send notifications
     */
    async checkTokens() {
        this.context.logger.debug('Checking tokens...');
        // In a real implementation, this would query the token system for tokens
        // For this example, we'll simulate finding an expiring token
        const config = this.context.getConfig();
        if (!config.settings.notifyExpiringTokens) {
            return { success: true, tokensChecked: 0 };
        }
        // Simulate finding an expiring token (in a real system, we'd check actual tokens)
        const simulateExpiringToken = Math.random() < 0.2; // 20% chance to simulate
        if (simulateExpiringToken) {
            // Send a notification
            try {
                await this.sendNotification('Token Expiry Warning', 'You have tokens that will expire soon. Please renew them to maintain value.', 'warning');
            }
            catch (error) {
                this.context.logger.error('Failed to send notification:', error);
            }
        }
        return { success: true, tokensChecked: 10, expiringFound: simulateExpiringToken ? 1 : 0 };
    }
    /**
     * Send a notification using the notification extension
     */
    async sendNotification(title, body, type = 'info') {
        await this.context.sendMessage({
            target: 'juicetokens-notification-extension',
            action: 'notify',
            payload: { title, body, type }
        });
    }
}
exports.TokenWatcherExtension = TokenWatcherExtension;
//# sourceMappingURL=TokenWatcherExtension.js.map