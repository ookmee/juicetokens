import { Component } from './base.js';
import { store, actions } from '../utils/store.js';

export default class Tokens extends Component {
    constructor(element) {
        super(element);
        this.state = {
            tokens: []
        };

        // Subscribe to store updates
        this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    }

    handleStoreUpdate(state) {
        this.setState({
            tokens: state.tokens
        });
    }

    render() {
        this.clearElement();

        const container = this.createElement('div', 'tokens-container');
        const title = this.createElement('h2', 'section-title', 'Tokens');
        
        const tokenList = this.createElement('div', 'token-list');
        
        if (this.state.tokens.length === 0) {
            const emptyMessage = this.createElement('p', 'empty-message', 'No tokens available');
            tokenList.appendChild(emptyMessage);
        } else {
            this.state.tokens.forEach(token => {
                const tokenElement = this.createElement('div', 'token-item');
                tokenElement.textContent = `Token: ${token.id}`;
                tokenList.appendChild(tokenElement);
            });
        }

        container.appendChild(title);
        container.appendChild(tokenList);
        this.element.appendChild(container);
    }

    destroy() {
        this.unsubscribe();
    }
} 