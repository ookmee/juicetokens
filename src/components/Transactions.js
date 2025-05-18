import { Component } from './base.js';
import { store, actions } from '../utils/store.js';

export default class Transactions extends Component {
    constructor(element) {
        super(element);
        this.state = {
            transactions: []
        };

        // Subscribe to store updates
        this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    }

    handleStoreUpdate(state) {
        this.setState({
            transactions: state.transactions
        });
    }

    render() {
        this.clearElement();

        const container = this.createElement('div', 'transactions-container');
        const title = this.createElement('h2', 'section-title', 'Transactions');
        
        const transactionList = this.createElement('div', 'transaction-list');
        
        if (this.state.transactions.length === 0) {
            const emptyMessage = this.createElement('p', 'empty-message', 'No transactions available');
            transactionList.appendChild(emptyMessage);
        } else {
            this.state.transactions.forEach(transaction => {
                const transactionElement = this.createElement('div', 'transaction-item');
                transactionElement.textContent = `Transaction: ${transaction.id}`;
                transactionList.appendChild(transactionElement);
            });
        }

        container.appendChild(title);
        container.appendChild(transactionList);
        this.element.appendChild(container);
    }

    destroy() {
        this.unsubscribe();
    }
} 