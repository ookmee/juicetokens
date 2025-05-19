# Mock Replacement Action Plan

This document outlines concrete actions to implement the phased approach from `mock-replacement-plan.md`, structured to facilitate automated implementation by agentic AI systems.

## Overview

The JuiceTokens project currently uses mock implementations for core services. This action plan provides specific steps to gradually replace these mocks with real protocol buffer implementations while maintaining system stability.

## Service Architecture

All services follow the Service Provider architecture implemented in `public/js/service-provider.js` with:

- Each service having both `mock` and `real` implementations
- A service registry that manages active implementations
- Metrics collection for monitoring performance

## Phased Implementation Actions

### Phase 1: Foundation Layer Integration

#### Action 1.1: Integrate Storage Service
```javascript
// Location: public/js/services/foundation-services.js
// Task: Replace the mockLocalStorage implementation with real implementation

// Connect to Protocol Buffer implementation - modify realLocalStorage
realLocalStorage: {
  setItem: async function(key, value) {
    try {
      // Import actual implementation from TypeScript
      const { StorageService } = require('@juicetokens/foundation/persistence');
      
      // Use protocol buffer serialization
      const pbData = StorageService.serialize(value);
      
      // Store using real implementation
      const result = await StorageService.store(key, pbData);
      
      // Return standardized result with metrics
      return {
        success: result.success,
        key,
        size: pbData.length,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`[RealStorage] Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  // Similarly modify getItem, removeItem, clear methods
}
```

#### Action 1.2: Integrate DHT Service
```javascript
// Location: public/js/services/foundation-services.js
// Task: Replace the mockDht implementation with real implementation

// Connect to Protocol Buffer implementation - modify realDht
realDht: {
  put: async function(key, value) {
    try {
      // Import actual implementation
      const { DHTService } = require('@juicetokens/foundation/dht');
      
      // Use protocol buffer serialization
      const pbData = DHTService.serialize(value);
      
      // Store in DHT with replication
      const result = await DHTService.put(key, pbData);
      
      return {
        success: result.success,
        key,
        replicationCount: result.replicationCount,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`[RealDHT] Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  // Similarly modify get, remove methods
}
```

#### Action 1.3: Integrate Time Service
```javascript
// Location: public/js/services/foundation-services.js
// Task: Replace the mockTimeSource implementation with real implementation

// Connect to Protocol Buffer implementation - modify realTimeSource
realTimeSource: {
  getConsensusTime: async function() {
    try {
      // Import actual implementation
      const { TimeService } = require('@juicetokens/foundation/time');
      
      // Get consensus time from multiple sources
      const result = await TimeService.getConsensusTime();
      
      return {
        timestamp: result.timestamp,
        source: 'consensus',
        confidence: result.confidence,
        sourcesConsulted: result.sources
      };
    } catch (error) {
      console.error(`[RealTime] Error: ${error.message}`);
      return {
        timestamp: Date.now(),
        source: 'local-fallback',
        confidence: 60,
        error: error.message
      };
    }
  }
}
```

### Phase 2: Communication Layer Integration

#### Action 2.1: Integrate Message Framing Service
```javascript
// Location: public/js/services/communication-services.js
// Task: Replace mockMessageFraming with real implementation

// Connect to Protocol Buffer implementation - modify realMessageFraming
realMessageFraming: {
  frameMessage: function(message) {
    try {
      // Import actual implementation
      const { FramingService } = require('@juicetokens/transport/framing');
      
      // Use protocol buffer serialization
      const framedMessage = FramingService.frameMessage(message);
      
      return framedMessage;
    } catch (error) {
      console.error(`[RealFraming] Error: ${error.message}`);
      throw error;
    }
  },
  
  // Similarly modify parseFrame method
}
```

#### Action 2.2: Integrate WebSocket Pipe
```javascript
// Location: public/js/services/communication-services.js
// Task: Replace mockWebSocketPipe with real implementation

// Connect to Protocol Buffer implementation - modify realWebSocketPipe
realWebSocketPipe: {
  createPipe: async function(config) {
    try {
      // Import actual implementation
      const { PipeService } = require('@juicetokens/transport/pipes');
      
      // Create real pipe connection
      const pipe = await PipeService.createWebSocketPipe(config);
      
      // Return standardized pipe object
      return {
        id: pipe.id,
        endpoint: config.endpoint,
        isConnected: pipe.isConnected,
        send: pipe.send.bind(pipe),
        close: pipe.close.bind(pipe),
        on: pipe.on.bind(pipe)
      };
    } catch (error) {
      console.error(`[RealWebSocket] Error: ${error.message}`);
      throw error;
    }
  }
}
```

### Phase 3: Token Operations Integration

#### Action 3.1: Integrate Token Creation Service
```javascript
// Location: public/js/services/token-services.js
// Task: Replace mockTokenCreation with real implementation

// Connect to Protocol Buffer implementation - modify realTokenCreation
realTokenCreation: {
  createToken: async function(request) {
    try {
      // Import actual implementation
      const { TokenService } = require('@juicetokens/token/creation');
      
      // Create token with cryptographic proofs
      const token = await TokenService.createToken({
        denomination: request.denomination,
        owner: request.owner,
        metadata: request.metadata
      });
      
      return token;
    } catch (error) {
      console.error(`[RealToken] Error: ${error.message}`);
      throw error;
    }
  }
}
```

#### Action 3.2: Integrate Telomere Transformation
```javascript
// Location: public/js/services/token-services.js
// Task: Replace mockTelomereTransformation with real implementation

// Connect to Protocol Buffer implementation - modify realTelomereTransformation
realTelomereTransformation: {
  transformTelomere: async function(request) {
    try {
      // Import actual implementation
      const { TelomereService } = require('@juicetokens/token/telomere');
      
      // Transform telomere with proper verification
      const result = await TelomereService.transformTelomere({
        tokenId: request.tokenId,
        previousOwner: request.previousOwner,
        newOwner: request.newOwner,
        authorization: request.authorization
      });
      
      return result;
    } catch (error) {
      console.error(`[RealTelomere] Error: ${error.message}`);
      return {
        success: false,
        failureReason: error.message
      };
    }
  }
}
```

#### Action 3.3: Integrate Transaction Service
```javascript
// Location: public/js/services/token-services.js
// Task: Replace mockTransactionInitiation with real implementation

// Connect to Protocol Buffer implementation - modify realTransactionInitiation
realTransactionInitiation: {
  initiateTransaction: async function(request) {
    try {
      // Import actual implementation
      const { TransactionService } = require('@juicetokens/token/transaction');
      
      // Initiate real transaction with state machine
      const transaction = await TransactionService.initiateTransaction({
        senderId: request.senderId,
        receiverId: request.receiverId,
        amount: request.amount
      });
      
      return transaction;
    } catch (error) {
      console.error(`[RealTransaction] Error: ${error.message}`);
      throw error;
    }
  }
}
```

## Implementation Tools

### Service Configuration File
Create a service configuration file to manage feature flags:

```javascript
// File: public/js/service-config.js
// Purpose: Manage service implementation selection

const ServiceConfig = {
  // Default service configuration
  config: {
    "storage": {
      "implementation": "mock", // Options: "mock", "real"
      "enabled": true
    },
    "dht": {
      "implementation": "mock",
      "enabled": true
    },
    "time": {
      "implementation": "mock",
      "enabled": true
    },
    "messageFraming": {
      "implementation": "mock",
      "enabled": true
    },
    "webSocketPipe": {
      "implementation": "mock",
      "enabled": true
    },
    "tokenCreation": {
      "implementation": "mock",
      "enabled": true
    },
    "telomere": {
      "implementation": "mock",
      "enabled": true
    },
    "transaction": {
      "implementation": "mock",
      "enabled": true
    }
  },
  
  // Helper to get active implementation for a service
  getImplementation: function(serviceName) {
    if (!this.config[serviceName]) {
      return "mock";
    }
    return this.config[serviceName].implementation;
  },
  
  // Helper to check if service is enabled
  isEnabled: function(serviceName) {
    if (!this.config[serviceName]) {
      return false;
    }
    return this.config[serviceName].enabled;
  },
  
  // Set implementation for a service
  setImplementation: function(serviceName, implementation) {
    if (!this.config[serviceName]) {
      this.config[serviceName] = {
        enabled: true
      };
    }
    this.config[serviceName].implementation = implementation;
    
    // Persist configuration
    localStorage.setItem('serviceConfig', JSON.stringify(this.config));
    
    // Notify service provider to update
    if (window.ServiceProvider) {
      window.ServiceProvider.setImplementationType(serviceName, implementation);
    }
  },
  
  // Load configuration from storage
  loadConfig: function() {
    const storedConfig = localStorage.getItem('serviceConfig');
    if (storedConfig) {
      try {
        this.config = JSON.parse(storedConfig);
      } catch (error) {
        console.error('Failed to parse stored service configuration');
      }
    }
  },
  
  // Apply configuration to service provider
  applyConfig: function() {
    if (!window.ServiceProvider) {
      console.warn('ServiceProvider not available');
      return;
    }
    
    Object.keys(this.config).forEach(serviceName => {
      if (this.config[serviceName].enabled) {
        window.ServiceProvider.setImplementationType(
          serviceName, 
          this.config[serviceName].implementation
        );
      }
    });
  }
};

// Initialize configuration
document.addEventListener('DOMContentLoaded', () => {
  ServiceConfig.loadConfig();
  ServiceConfig.applyConfig();
});

// Export to global scope
window.ServiceConfig = ServiceConfig;
```

### CLI Tools for Managing Services

Create a `toggle-service.sh` script for toggling between mock and real implementations:

```bash
#!/bin/bash

# Script: toggle-service.sh
# Purpose: Toggle between mock and real implementations for testing

SERVICE=$1
IMPLEMENTATION=$2

if [ -z "$SERVICE" ] || [ -z "$IMPLEMENTATION" ]; then
  echo "Usage: $0 <service-name> <mock|real>"
  echo "Available services:"
  echo "  - storage"
  echo "  - dht"
  echo "  - time"
  echo "  - messageFraming"
  echo "  - webSocketPipe"
  echo "  - tokenCreation"
  echo "  - telomere"
  echo "  - transaction"
  exit 1
fi

if [ "$IMPLEMENTATION" != "mock" ] && [ "$IMPLEMENTATION" != "real" ]; then
  echo "Implementation must be 'mock' or 'real'"
  exit 1
fi

# Update the service configuration script
echo "Updating service configuration..."
sed -i "s/\"$SERVICE\": {\"implementation\": \"[^\"]*\"/\"$SERVICE\": {\"implementation\": \"$IMPLEMENTATION\"/" public/js/service-config.js

# Deploy changes to test users
./scripts/deploy-test-ui.sh

echo "Service $SERVICE implementation set to $IMPLEMENTATION"
```

## Validation Metrics

For each service integration, collect the following metrics to validate the real implementation:

1. **Performance Metrics**:
   - Operation latency (ms)
   - Memory usage (KB)
   - CPU usage (%)
   - Network requests count

2. **Reliability Metrics**:
   - Success rate (%)
   - Error rate (%)
   - Timeout rate (%)
   - Retry count

3. **Functional Verification**:
   - Data integrity checks
   - Operation completeness
   - Security validation
   - Protocol compliance

## Success Criteria

A service implementation is considered successfully replaced when:

1. Real implementation functions at 98%+ reliability
2. Performance is within 120% of mock implementation
3. All integration tests pass
4. No regressions in dependent services
5. Metrics show stable operation for 72+ hours

## Test Coverage Required

For each integration, ensure the following test types are implemented:

1. **Unit Tests**:
   - Direct functional validation
   - Edge case handling
   - Error path testing

2. **Integration Tests**:
   - Service interaction validation
   - End-to-end operation flows
   - Cross-service dependencies

3. **Performance Tests**:
   - Latency benchmarks
   - Throughput measurements
   - Resource utilization profiling

## Monitoring Dashboard Implementation

Implement a metrics dashboard by creating the following files:

```javascript
// File: public/js/metrics-dashboard.js
// Purpose: Visualize service metrics

class MetricsDashboard {
  constructor() {
    this.metrics = {};
    this.container = null;
  }
  
  initialize() {
    // Create dashboard container
    this.container = document.createElement('div');
    this.container.className = 'metrics-dashboard';
    this.container.style.position = 'fixed';
    this.container.style.top = '10px';
    this.container.style.right = '10px';
    this.container.style.width = '300px';
    this.container.style.maxHeight = '80vh';
    this.container.style.overflowY = 'auto';
    this.container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    this.container.style.color = 'white';
    this.container.style.padding = '10px';
    this.container.style.borderRadius = '5px';
    this.container.style.zIndex = 9999;
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Service Metrics';
    title.style.margin = '0 0 10px 0';
    this.container.appendChild(title);
    
    // Add metrics container
    this.metricsEl = document.createElement('div');
    this.container.appendChild(this.metricsEl);
    
    // Add to document
    document.body.appendChild(this.container);
    
    // Start metrics collection
    this.startCollection();
  }
  
  startCollection() {
    // Collect metrics every 2 seconds
    setInterval(() => this.updateMetrics(), 2000);
  }
  
  updateMetrics() {
    if (!window.ServiceProvider) return;
    
    // Get all services
    const services = window.ServiceProvider.getRegisteredServices();
    
    // Update metrics for each service
    services.forEach(serviceName => {
      const metrics = window.ServiceProvider.getServiceMetrics(serviceName);
      this.metrics[serviceName] = metrics;
    });
    
    // Update UI
    this.renderMetrics();
  }
  
  renderMetrics() {
    this.metricsEl.innerHTML = '';
    
    Object.keys(this.metrics).forEach(serviceName => {
      const metrics = this.metrics[serviceName];
      const serviceEl = document.createElement('div');
      serviceEl.className = 'service-metrics';
      serviceEl.style.marginBottom = '10px';
      serviceEl.style.padding = '8px';
      serviceEl.style.backgroundColor = 'rgba(255,255,255,0.1)';
      serviceEl.style.borderRadius = '3px';
      
      // Service name and type
      const nameEl = document.createElement('div');
      nameEl.style.fontWeight = 'bold';
      nameEl.style.marginBottom = '5px';
      nameEl.innerHTML = `${serviceName} <span style="color: ${metrics.implementationType === 'mock' ? 'orange' : 'lightgreen'}">(${metrics.implementationType})</span>`;
      serviceEl.appendChild(nameEl);
      
      // Metrics
      const metricsEl = document.createElement('div');
      metricsEl.style.fontSize = '0.9em';
      metricsEl.innerHTML = `
        Calls: ${metrics.invocations} | 
        Errors: ${metrics.errors} | 
        Error Rate: ${(metrics.errorRate * 100).toFixed(1)}% | 
        Avg Latency: ${metrics.averageLatency.toFixed(2)}ms
      `;
      serviceEl.appendChild(metricsEl);
      
      this.metricsEl.appendChild(serviceEl);
    });
  }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new MetricsDashboard();
  dashboard.initialize();
});
```

## Automated Test Suite

Implement an automated test suite by creating the following files:

```javascript
// File: public/js/service-test-suite.js
// Purpose: Automatically test service implementations

class ServiceTestSuite {
  constructor() {
    this.testResults = {};
    this.runningTests = false;
  }
  
  async runTestsForService(serviceName) {
    if (this.runningTests) return;
    this.runningTests = true;
    
    console.log(`[TestSuite] Running tests for ${serviceName}`);
    this.testResults[serviceName] = {
      startTime: Date.now(),
      tests: [],
      passed: 0,
      failed: 0,
      errors: []
    };
    
    try {
      // Run appropriate tests based on service type
      switch (serviceName) {
        case 'storage':
          await this.runStorageTests();
          break;
        case 'dht':
          await this.runDhtTests();
          break;
        case 'time':
          await this.runTimeTests();
          break;
        case 'messageFraming':
          await this.runMessageFramingTests();
          break;
        case 'webSocketPipe':
          await this.runWebSocketTests();
          break;
        case 'tokenCreation':
          await this.runTokenCreationTests();
          break;
        case 'telomere':
          await this.runTelomereTests();
          break;
        case 'transaction':
          await this.runTransactionTests();
          break;
        default:
          console.warn(`[TestSuite] No tests defined for ${serviceName}`);
      }
    } catch (error) {
      console.error(`[TestSuite] Error running tests for ${serviceName}:`, error);
      this.testResults[serviceName].errors.push(error.message);
    }
    
    this.testResults[serviceName].endTime = Date.now();
    this.testResults[serviceName].duration = 
      this.testResults[serviceName].endTime - this.testResults[serviceName].startTime;
    
    console.log(`[TestSuite] Completed tests for ${serviceName}:`, 
      `${this.testResults[serviceName].passed} passed, ${this.testResults[serviceName].failed} failed`);
    
    this.runningTests = false;
    return this.testResults[serviceName];
  }
  
  // Test runner helper
  async runTest(serviceName, testName, testFn) {
    try {
      console.log(`[TestSuite] Running test: ${testName}`);
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      
      this.testResults[serviceName].tests.push({
        name: testName,
        passed: true,
        duration
      });
      this.testResults[serviceName].passed++;
      
      console.log(`[TestSuite] Test passed: ${testName} (${duration}ms)`);
      return true;
    } catch (error) {
      console.error(`[TestSuite] Test failed: ${testName}:`, error);
      
      this.testResults[serviceName].tests.push({
        name: testName,
        passed: false,
        error: error.message
      });
      this.testResults[serviceName].failed++;
      this.testResults[serviceName].errors.push(`${testName}: ${error.message}`);
      
      return false;
    }
  }
  
  // Storage Tests
  async runStorageTests() {
    const storage = window.ServiceProvider.getService('storage');
    if (!storage) throw new Error('Storage service not available');
    
    // Test setItem
    await this.runTest('storage', 'setItem - basic string', async () => {
      const result = await storage.setItem('test-key', 'test-value');
      if (!result.success) throw new Error('setItem failed');
    });
    
    // Test getItem
    await this.runTest('storage', 'getItem - retrieve stored value', async () => {
      const value = await storage.getItem('test-key');
      if (value !== 'test-value') throw new Error(`Expected 'test-value', got '${value}'`);
    });
    
    // Test object storage
    await this.runTest('storage', 'setItem/getItem - object value', async () => {
      const testObj = { foo: 'bar', num: 42, arr: [1, 2, 3] };
      await storage.setItem('test-obj', testObj);
      const retrieved = await storage.getItem('test-obj');
      if (!retrieved || retrieved.foo !== 'bar' || retrieved.num !== 42)
        throw new Error('Object not stored/retrieved correctly');
    });
    
    // Test removeItem
    await this.runTest('storage', 'removeItem - delete stored value', async () => {
      await storage.removeItem('test-key');
      const value = await storage.getItem('test-key');
      if (value !== null) throw new Error('Value not removed');
    });
  }
  
  // Implement similar test functions for other services
  // ...
}

// Initialize test suite on page load
window.ServiceTestSuite = new ServiceTestSuite();
```

## Implementation Schedule

The following schedule is recommended for integrating real implementations:

1. **Week 1-2**: Foundation Layer
   - Day 1-3: Storage Service
   - Day 4-7: DHT Service
   - Day 8-10: Time Service

2. **Week 3-4**: Communication Layer
   - Day 1-5: Message Framing
   - Day 6-10: WebSocket Pipe

3. **Week 5-6**: Token Operations
   - Day 1-3: Token Creation
   - Day 4-7: Telomere Transformation
   - Day 8-10: Transaction Service

For each service:
- Day 1: Integration coding
- Day 2: Unit testing
- Day 3-4: Functional testing
- Day 5+: Monitoring and stabilization 