import { Navigation, ConnectionStatus, DebugInfo } from './components/base.js';
import { router } from './utils/router.js';
import { store, actions } from './utils/store.js';

// Initialize navigation
const navElement = document.getElementById('main-nav');
const navigation = new Navigation(navElement);

// Initialize connection status
const connectionElement = document.getElementById('connection-status');
const connectionStatus = new ConnectionStatus(connectionElement);

// Initialize debug info
const debugElement = document.getElementById('debug-info');
const debugInfo = new DebugInfo(debugElement);

// Add some initial debug info
debugInfo.addLog('Application initialized');
debugInfo.addLog('Router loaded successfully');

// Initialize store with some test data
actions.setUser({ id: 'test-user', name: 'Test User' });
actions.setTokens([
    { id: 'token-1', value: 100 },
    { id: 'token-2', value: 200 }
]);
actions.addTransaction({ id: 'tx-1', type: 'test' });

// Update connection status
connectionStatus.setState({
    connected: true,
    lastUpdate: new Date()
});

// Export for debugging
window.debugInfo = debugInfo;
window.store = store;
window.actions = actions; 