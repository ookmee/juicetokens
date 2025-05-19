# Service Provider Architecture

## Overview

The JuiceTokens project implements a Service Provider pattern as a foundational architecture. This document outlines this architecture as implemented in `public/js/service-provider.js`.

## Core Concepts

### 1. Service Registry

The Service Provider maintains a centralized registry of all available services:

```javascript
// Simplified representation of the internal service registry
{
  "storage": {
    "mock": mockLocalStorage,
    "real": realLocalStorage,
    "active": "mock",  // Current implementation type
    "metrics": {...}   // Performance and reliability metrics
  },
  "dht": {
    "mock": mockDht,
    "real": realDht,
    "active": "mock",
    "metrics": {...}
  },
  // Additional services...
}
```

### 2. Implementation Types

Each service has distinct implementation types:

- **Mock**: Simplified implementations for development/testing
- **Real**: Full protocol buffer implementations for production

This approach enables:
- Controlled progressive rollout
- A/B testing between implementation types
- Graceful fallback to mocks when needed

### 3. Service Resolution

Services are accessed through a resolution mechanism that:
1. Checks if the requested service exists
2. Determines the active implementation type (mock/real)
3. Returns the appropriate implementation
4. Records metrics about the service usage

## Architectural Components

### Service Registration

```javascript
// Registration pattern
ServiceProvider.registerService({
  name: 'serviceName',           // Unique identifier
  mockImplementation: {...},     // Development implementation
  realImplementation: {...},     // Production implementation
  defaultType: 'mock'            // Starting implementation type
});
```

This pattern allows services to self-register with the system while maintaining clear boundaries.

### Service Resolution

```javascript
// Resolution pattern
const service = ServiceProvider.getService('serviceName');

// Usage
await service.someMethod(params);
```

Resolution is implementation-agnostic - consumer code doesn't need to know which implementation type is active.

### Implementation Toggling

```javascript
// Toggle between implementations
ServiceProvider.setImplementationType('serviceName', 'real');
```

This mechanism supports runtime switching between implementation types without service interruption.

### Metrics Collection

The Service Provider automatically collects metrics for each service:

```javascript
// Sample metrics structure
{
  invocations: 42,            // Total call count
  errors: 3,                  // Error count
  errorRate: 0.071,           // Error percentage
  averageLatency: 12.5,       // Average response time (ms)
  p95Latency: 18.2,           // 95th percentile latency
  implementationType: 'mock', // Current implementation
  lastInvoked: 1616161616161  // Timestamp
}
```

## Layered Architecture

Services are organized in a layered architecture:

1. **Foundation Layer**
   - Storage
   - DHT (Distributed Hash Table)
   - Time

2. **Communication Layer**
   - Message Framing
   - WebSocket Pipe

3. **Token Operations Layer**
   - Token Creation
   - Telomere Transformation
   - Transaction

Each layer builds upon the services provided by layers below it.

## Service Lifecycle Management

The Service Provider handles the complete lifecycle of services:

1. **Registration**: Service implementation recorded in registry
2. **Initialization**: Service prepared for first use
3. **Resolution**: Service instance returned to consumers
4. **Metrics Collection**: Usage patterns recorded
5. **Implementation Change**: Switching between mock/real
6. **Shutdown**: Graceful termination of resources

## Key Architectural Benefits

1. **Modular Replacement**: Individual services can be upgraded independently
2. **Implementation Isolation**: Mock and real implementations are cleanly separated
3. **Observable Behavior**: Built-in metrics provide visibility into performance
4. **Feature Flagging**: Services can be toggled between implementations
5. **Graceful Degradation**: Services can fall back to mock implementations

## Example Service Flow

A typical service interaction flows as follows:

1. Client code requests a service: `getService('storage')`
2. Service Provider checks the registry for 'storage'
3. Provider determines the active implementation ('mock' or 'real')
4. Provider returns the appropriate implementation
5. Client code interacts with the service API
6. Provider records metrics about the interaction
7. Results are returned to the client code

## Integration with Mock Replacement Strategy

This architecture directly supports the phased replacement of mock implementations with real protocol buffer implementations as outlined in the Mock Replacement Plan:

1. Each service can be individually toggled between mock and real
2. Metrics track the performance and reliability of each implementation
3. Gradual rollout is possible by switching one service at a time
4. Automated testing can verify both implementations

## Conclusion

The Service Provider pattern offers a flexible, observable architecture that enables gradual evolution from mock implementations to production-ready protocol buffer implementations while maintaining system stability and clear separation of concerns. 