// Store class for state management
export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Create store with initial state
const initialState = {
    user: null,
    tokens: [],
    transactions: [],
    settings: {
        debugMode: false,
        connectionType: 'test'
    }
};

export const store = new Store(initialState);

// Action creators
export const actions = {
    setUser: (user) => {
        store.setState({ user });
    },
    
    setTokens: (tokens) => {
        store.setState({ tokens });
    },
    
    addTransaction: (transaction) => {
        const { transactions } = store.getState();
        store.setState({ 
            transactions: [...transactions, transaction]
        });
    },
    
    updateSettings: (settings) => {
        const { settings: currentSettings } = store.getState();
        store.setState({ 
            settings: { ...currentSettings, ...settings }
        });
    }
};
