import { Component } from './base.js';
import { store, actions } from '../utils/store.js';

export default class Home extends Component {
    constructor(element) {
        super(element);
        this.state = {
            loading: true,
            error: null
        };

        // Subscribe to store updates
        this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    }

    handleStoreUpdate(state) {
        this.setState({
            user: state.user,
            tokens: state.tokens,
            transactions: state.transactions
        });
    }

    render() {
        this.clearElement();

        // Create main container
        const container = this.createElement('div', 'home-container');

        // Add welcome section
        const welcome = this.createElement('div', 'welcome-section');
        const title = this.createElement('h2', 'section-title', 'Welcome to JuiceTokens');
        const description = this.createElement('p', 'section-description',
            'Test environment for the JuiceTokens protocol. Use this interface to explore and test token functionality.'
        );
        welcome.appendChild(title);
        welcome.appendChild(description);

        // Add status section
        const status = this.createElement('div', 'status-section');
        const statusTitle = this.createElement('h3', 'status-title', 'System Status');
        
        const statusItems = [
            { label: 'User', value: this.state.user ? 'Connected' : 'Not connected' },
            { label: 'Tokens', value: this.state.tokens.length },
            { label: 'Transactions', value: this.state.transactions.length }
        ];

        statusItems.forEach(item => {
            const statusItem = this.createElement('div', 'status-item');
            const label = this.createElement('span', 'status-label', item.label);
            const value = this.createElement('span', 'status-value', item.value);
            statusItem.appendChild(label);
            statusItem.appendChild(value);
            status.appendChild(statusItem);
        });

        // Add quick actions
        const actions = this.createElement('div', 'quick-actions');
        const actionsTitle = this.createElement('h3', 'actions-title', 'Quick Actions');
        
        const actionButtons = [
            { label: 'View Tokens', path: '/tokens' },
            { label: 'View Transactions', path: '/transactions' },
            { label: 'Settings', path: '/settings' }
        ];

        actionButtons.forEach(button => {
            const actionButton = this.createElement('button', 'action-button', button.label);
            actionButton.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path: button.path }
                }));
            });
            actions.appendChild(actionButton);
        });

        // Assemble the page
        container.appendChild(welcome);
        container.appendChild(status);
        container.appendChild(actions);
        this.element.appendChild(container);
    }

    // Cleanup
    destroy() {
        this.unsubscribe();
    }
} 