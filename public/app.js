/**
 * JuiceTokens Test User UI
 * Enhanced to support the mock-to-real implementation transition
 * as outlined in docs/development/mock-replacement-plan.md
 */

// Initialize services and UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Set default implementations for initial load
    initializeImplementations();
    
    // Initialize UI components
    await initializeUI();
    
    // Add implementation switcher to the UI
    initializeImplementationSwitcher();
    
    // Register event listeners
    registerEventListeners();
    
    console.log('JuiceTokens UI initialized');
  } catch (err) {
    console.error('Error initializing application:', err);
    showErrorMessage('Failed to initialize application. Please reload the page.');
  }
});

/**
 * Set initial implementation types for services
 */
function initializeImplementations() {
  // Default is to use mock implementations
  const availableServices = ServiceProvider.getRegisteredServices();
  
  console.log('Available services:', availableServices);
  
  // For now, use mock implementations for everything
  availableServices.forEach(serviceName => {
    ServiceProvider.setImplementationType(serviceName, ServiceProvider.ImplementationType.MOCK);
  });
}

/**
 * Initialize UI with user data and token balance
 */
async function initializeUI() {
  try {
    // Fetch user ID - use direct API for now, will be replaced with service
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    document.getElementById('user-id-display').textContent = userData.id;
    
    if (document.getElementById('modal-user-id')) {
      document.getElementById('modal-user-id').textContent = userData.id;
    }
    
    // Store user data for services to use
    window.currentUser = userData;
    
    // Fetch token balance using the token service if available
    let balanceData;
    const tokenCreationService = ServiceProvider.getService('tokenCreation');
    
    if (tokenCreationService) {
      // Use the service to get a balance token
      const balanceToken = await tokenCreationService.createToken({
        denomination: 'balance',
        owner: userData.id
      });
      
      balanceData = { balance: balanceToken.denomination === 'balance' ? 
        Math.floor(Math.random() * 100) + 50 : 0 };
    } else {
      // Fallback to direct API
      const balanceResponse = await fetch('/api/tokens/balance');
      balanceData = await balanceResponse.json();
    }
    
    document.getElementById('token-balance').textContent = balanceData.balance;
    
    // Fetch nearby peers using the WebSocket service if available
    const webSocketService = ServiceProvider.getService('webSocketPipe');
    
    if (webSocketService) {
      // Create a pipe for peer discovery
      const pipe = await webSocketService.createPipe({
        endpoint: '/api/peers/discovery'
      });
      
      // Simulate receiving peer data
      setTimeout(() => {
        const peers = [
          { id: 'peer-1', distance: 15.3, lastSeen: Date.now() - 30000 },
          { id: 'peer-2', distance: 42.7, lastSeen: Date.now() - 60000 },
          { id: 'peer-3', distance: 8.1, lastSeen: Date.now() - 10000 }
        ];
        
        renderPeers(peers);
        
        if (pipe.simulateReceiveMessage) {
          pipe.simulateReceiveMessage({ type: 'peers', data: peers });
        }
      }, 1000);
    } else {
      // Fallback to direct API
      const peersResponse = await fetch('/api/peers/nearby');
      const peersData = await peersResponse.json();
      renderPeers(peersData.peers);
    }
  } catch (err) {
    console.error('Error initializing UI:', err);
    throw err;
  }
}

/**
 * Add implementation switcher UI to allow toggling between mock and real implementations
 */
function initializeImplementationSwitcher() {
  const availableServices = ServiceProvider.getRegisteredServices();
  
  if (availableServices.length === 0) {
    console.warn('No services registered for implementation switching');
    return;
  }
  
  // Create a container for the implementation switcher
  const container = document.createElement('div');
  container.className = 'implementation-switcher';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.background = 'white';
  container.style.padding = '10px';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  container.style.zIndex = '1000';
  container.style.maxWidth = '300px';
  container.style.maxHeight = '400px';
  container.style.overflowY = 'auto';
  
  // Add a header
  const header = document.createElement('div');
  header.textContent = 'Mock Implementation Switcher';
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '10px';
  container.appendChild(header);
  
  // Add toggles for each service
  availableServices.forEach(serviceName => {
    const serviceContainer = document.createElement('div');
    serviceContainer.style.display = 'flex';
    serviceContainer.style.justifyContent = 'space-between';
    serviceContainer.style.alignItems = 'center';
    serviceContainer.style.marginBottom = '5px';
    
    const label = document.createElement('label');
    label.textContent = serviceName;
    label.style.marginRight = '10px';
    
    const select = document.createElement('select');
    select.id = `impl-select-${serviceName}`;
    
    // Add options
    const mockOption = document.createElement('option');
    mockOption.value = ServiceProvider.ImplementationType.MOCK;
    mockOption.textContent = 'Mock';
    select.appendChild(mockOption);
    
    const realOption = document.createElement('option');
    realOption.value = ServiceProvider.ImplementationType.REAL;
    realOption.textContent = 'Real';
    select.appendChild(realOption);
    
    // Set current value
    select.value = ServiceProvider.getImplementationType(serviceName);
    
    // Add change listener
    select.addEventListener('change', () => {
      const newType = select.value;
      ServiceProvider.setImplementationType(serviceName, newType);
      
      // Update metrics display
      updateServiceMetrics(serviceName);
      
      console.log(`Changed ${serviceName} implementation to ${newType}`);
    });
    
    serviceContainer.appendChild(label);
    serviceContainer.appendChild(select);
    
    // Add metrics container
    const metricsContainer = document.createElement('div');
    metricsContainer.id = `metrics-${serviceName}`;
    metricsContainer.style.fontSize = '0.8em';
    metricsContainer.style.marginTop = '2px';
    metricsContainer.style.marginBottom = '8px';
    
    updateServiceMetrics(serviceName, metricsContainer);
    
    container.appendChild(serviceContainer);
    container.appendChild(metricsContainer);
  });
  
  // Add to body
  document.body.appendChild(container);
  
  // Set up metrics update interval
  setInterval(() => {
    availableServices.forEach(serviceName => {
      updateServiceMetrics(serviceName);
    });
  }, 5000);
}

/**
 * Update service metrics display
 */
function updateServiceMetrics(serviceName, container) {
  const metrics = ServiceProvider.getServiceMetrics(serviceName);
  const metricsContainer = container || document.getElementById(`metrics-${serviceName}`);
  
  if (!metricsContainer) return;
  
  metricsContainer.innerHTML = `
    Type: <span style="color: ${metrics.implementationType === 'mock' ? 'orange' : 'green'}">${metrics.implementationType}</span> | 
    Calls: ${metrics.invocations} | 
    Errors: ${metrics.errors} |
    Avg Latency: ${metrics.averageLatency.toFixed(2)}ms
  `;
}

/**
 * Register event listeners for UI interactions
 */
function registerEventListeners() {
  document.getElementById('send-btn')?.addEventListener('click', handleSend);
  document.getElementById('receive-btn')?.addEventListener('click', handleReceive);
  document.getElementById('more-btn')?.addEventListener('click', handleMore);
  
  // Add click listeners to all feature items for demonstration
  document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('click', () => handleFeatureClick(item.textContent.trim()));
  });
}

/**
 * Render peers in the UI
 */
function renderPeers(peers) {
  const peersContainer = document.getElementById('peers-container');
  if (!peersContainer) return;
  
  peersContainer.innerHTML = '';
  
  if (peers && peers.length > 0) {
    peers.forEach(peer => {
      const peerElement = document.createElement('div');
      peerElement.className = 'peer-item';
      peerElement.style.padding = '8px';
      peerElement.style.margin = '4px 0';
      peerElement.style.backgroundColor = '#f5f5f5';
      peerElement.style.borderRadius = '4px';
      
      const distance = parseFloat(peer.distance).toFixed(1);
      const lastSeen = new Date(peer.lastSeen).toLocaleTimeString();
      
      peerElement.innerHTML = `
        <div>ID: ${peer.id}</div>
        <div>Distance: ${distance}m</div>
        <div>Last seen: ${lastSeen}</div>
      `;
      
      peersContainer.appendChild(peerElement);
    });
  } else {
    peersContainer.innerHTML = '<div>No peers nearby</div>';
  }
}

/**
 * Handle Send button click - uses Transaction Service
 */
async function handleSend() {
  console.log('Send button clicked');
  
  try {
    // Check if transaction service is available
    const transactionService = ServiceProvider.getService('transaction');
    
    if (transactionService) {
      // Get recipient and amount from user
      const recipientId = prompt('Enter recipient ID:');
      if (!recipientId) return;
      
      const amount = parseInt(prompt('Enter amount:'), 10);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      
      // Initialize transaction
      const transaction = await transactionService.initiateTransaction({
        senderId: window.currentUser.id,
        receiverId: recipientId,
        amount: amount
      });
      
      alert(`Transaction initiated with ID: ${transaction.id}`);
      
      // Check status after a delay
      setTimeout(async () => {
        const status = await transactionService.getTransactionStatus(transaction.id);
        alert(`Transaction ${transaction.id} status: ${status.status}`);
        
        // Refresh balance on completion
        if (status.status === 'completed') {
          const balanceResponse = await fetch('/api/tokens/balance');
          const balanceData = await balanceResponse.json();
          document.getElementById('token-balance').textContent = balanceData.balance;
        }
      }, 3000);
    } else {
      // Fallback behavior
      alert('Send functionality: This would open a modal to send tokens to another user');
    }
  } catch (error) {
    console.error('Error handling send:', error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * Handle Receive button click - uses Token Creation Service
 */
async function handleReceive() {
  console.log('Receive button clicked');
  
  try {
    // Check if token creation service is available
    const tokenCreationService = ServiceProvider.getService('tokenCreation');
    
    if (tokenCreationService) {
      // Generate a receive token
      const receiveToken = await tokenCreationService.createToken({
        denomination: 'receive',
        owner: window.currentUser.id,
        createdBy: 'user-action'
      });
      
      alert(`Your receive code: ${receiveToken.id.fullId}`);
    } else {
      // Fallback behavior
      alert('Receive functionality: This would display your receive code or QR code');
    }
  } catch (error) {
    console.error('Error handling receive:', error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * Handle More button click
 */
function handleMore() {
  console.log('More button clicked');
  
  // Show service metrics in a more readable format
  const metrics = {};
  ServiceProvider.getRegisteredServices().forEach(serviceName => {
    metrics[serviceName] = ServiceProvider.getServiceMetrics(serviceName);
  });
  
  alert('Service Metrics: ' + JSON.stringify(metrics, null, 2));
}

/**
 * Handle feature item clicks to demonstrate different services
 */
async function handleFeatureClick(featureName) {
  console.log(`Feature clicked: ${featureName}`);
  
  try {
    switch (featureName) {
      case 'Time Source Status':
        // Demonstrate the time service
        const timeService = ServiceProvider.getService('time');
        if (timeService) {
          const time = await timeService.getConsensusTime();
          alert(`Current consensus time: ${new Date(time.timestamp).toLocaleString()}\nConfidence: ${time.confidence}%\nSource: ${time.source}`);
        } else {
          alert('Time service not available');
        }
        break;
        
      case 'Device Capabilities':
        // Fake device capabilities report
        alert('Device Capabilities:\n- Camera: Available\n- BLE: Available\n- NFC: Not Available\n- Secure Storage: Available');
        break;
        
      case 'Storage Usage':
        // Demonstrate the storage service
        const storageService = ServiceProvider.getService('storage');
        if (storageService) {
          const testData = { test: 'data', timestamp: Date.now() };
          await storageService.setItem('test-data', testData);
          const retrieved = await storageService.getItem('test-data');
          alert(`Storage test successful!\nStored: ${JSON.stringify(testData)}\nRetrieved: ${JSON.stringify(retrieved)}`);
        } else {
          alert('Storage service not available');
        }
        break;
        
      default:
        alert(`Feature "${featureName}" clicked. Implementation coming soon!`);
    }
  } catch (error) {
    console.error(`Error handling feature ${featureName}:`, error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * Show error message in the UI
 */
function showErrorMessage(message) {
  const errorContainer = document.createElement('div');
  errorContainer.style.padding = '10px';
  errorContainer.style.margin = '10px 0';
  errorContainer.style.backgroundColor = '#ffeeee';
  errorContainer.style.border = '1px solid #ff8888';
  errorContainer.style.borderRadius = '4px';
  errorContainer.textContent = message;
  
  document.body.insertBefore(errorContainer, document.body.firstChild);
}

// Export key functions to global scope for debugging
window.ServiceProvider = ServiceProvider;
window.handleSend = handleSend;
window.handleReceive = handleReceive;
window.handleMore = handleMore;
