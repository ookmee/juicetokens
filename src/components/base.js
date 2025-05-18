// Base Component class
export class Component {
    constructor(element) {
        this.element = element;
        this.state = {};
        this.props = {};
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    setProps(newProps) {
        this.props = { ...this.props, ...newProps };
        this.render();
    }

    render() {
        // To be implemented by child classes
    }

    // Utility methods
    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    clearElement() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }
}

// Navigation Component
export class Navigation extends Component {
    constructor(element) {
        super(element);
        this.state = {
            currentRoute: '/',
            routes: [
                { path: '/', label: 'Home' },
                { path: '/tokens', label: 'Tokens' },
                { path: '/transactions', label: 'Transactions' },
                { path: '/settings', label: 'Settings' }
            ]
        };
    }

    render() {
        this.clearElement();
        const nav = this.createElement('nav', 'main-nav');
        
        this.state.routes.forEach(route => {
            const link = this.createElement('a', 
                `nav-link ${this.state.currentRoute === route.path ? 'active' : ''}`,
                route.label
            );
            link.href = route.path;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path: route.path }
                }));
            });
            nav.appendChild(link);
        });

        this.element.appendChild(nav);
    }
}

// Connection Status Component
export class ConnectionStatus extends Component {
    constructor(element) {
        super(element);
        this.state = {
            connected: false,
            lastUpdate: null
        };
    }

    render() {
        this.clearElement();
        const status = this.createElement('div', 
            `connection-status ${this.state.connected ? 'connected' : 'disconnected'}`,
            `Status: ${this.state.connected ? 'Connected' : 'Disconnected'}`
        );
        
        if (this.state.lastUpdate) {
            const update = this.createElement('div', 'last-update',
                `Last update: ${new Date(this.state.lastUpdate).toLocaleTimeString()}`
            );
            status.appendChild(update);
        }

        this.element.appendChild(status);
    }
}

// Debug Info Component
export class DebugInfo extends Component {
    constructor(element) {
        super(element);
        this.state = {
            logs: []
        };
    }

    addLog(message) {
        this.state.logs = [...this.state.logs, {
            timestamp: new Date(),
            message
        }].slice(-10); // Keep last 10 logs
        this.render();
    }

    render() {
        this.clearElement();
        const container = this.createElement('div', 'debug-container');
        
        this.state.logs.forEach(log => {
            const logEntry = this.createElement('div', 'debug-log',
                `[${log.timestamp.toLocaleTimeString()}] ${log.message}`
            );
            container.appendChild(logEntry);
        });

        this.element.appendChild(container);
    }
}
