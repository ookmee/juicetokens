# Docker Integration Plan

This document outlines the strategy for replacing mock functions with real protocol buffer implementations in the Docker environment. It focuses specifically on functions that can be fully implemented and tested within Docker containers without requiring native device capabilities.

## Implementation Phases

### Phase 1: Core Infrastructure

#### Persistence Layer Functions

##### `mockLocalStorage` → Real Implementation

**Monitoring Strategy:**
- Track read/write operation counts and latency
- Monitor storage size growth over time
- Observe error rates for storage operations

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function performStorageOperation(operation: StorageOperation): Promise<StorageResult> {
  console.debug(`[Storage] Operation: ${operation.type} Key: ${operation.key}`);
  const startTime = performance.now();
  
  return realStorageImplementation(operation)
    .then(result => {
      const duration = performance.now() - startTime;
      console.debug(`[Storage] Operation completed in ${duration.toFixed(2)}ms. Success: ${result.success}`);
      
      // Report metrics
      metrics.recordStorageOperation({
        operationType: operation.type,
        durationMs: duration,
        success: result.success,
        dataSize: operation.data ? JSON.stringify(operation.data).length : 0
      });
      
      return result;
    })
    .catch(error => {
      console.error(`[Storage] Operation failed: ${error.message}`);
      metrics.recordStorageError({
        operationType: operation.type,
        errorType: error.name,
        errorMessage: error.message
      });
      throw error;
    });
}
```

**UI Indicators:**
- Add a storage health indicator in the admin panel
- Display operation success/failure rates
- Show storage utilization metrics

##### `mockDht` → Real Implementation

**Monitoring Strategy:**
- Track DHT node discovery and connection rates
- Monitor key distribution across the network
- Measure lookup operation latency

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function performDhtOperation(operation: DhtOperation): Promise<DhtResult> {
  console.debug(`[DHT] Operation: ${operation.type} Key: ${operation.key}`);
  const startTime = performance.now();
  
  return realDhtImplementation(operation)
    .then(result => {
      const duration = performance.now() - startTime;
      console.debug(`[DHT] Operation completed in ${duration.toFixed(2)}ms. Nodes contacted: ${result.nodesContacted}`);
      
      metrics.recordDhtOperation({
        operationType: operation.type,
        durationMs: duration,
        nodesContacted: result.nodesContacted,
        success: result.success
      });
      
      return result;
    });
}
```

**UI Indicators:**
- Visualize DHT network in the admin panel
- Show connection status between nodes
- Display lookup performance metrics

#### Time Service Functions

##### `mockTimeSource` → Real Implementation

**Monitoring Strategy:**
- Compare different time sources for drift
- Monitor NTP synchronization status
- Track time adjustment events

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function getCurrentTime(options: TimeOptions): Promise<TimeResult> {
  console.debug(`[Time] Getting current time from ${options.sources.join(', ')}`);
  
  return realTimeImplementation(options)
    .then(result => {
      console.debug(`[Time] Current time: ${result.timestamp}, Confidence: ${result.confidence}%`);
      
      // Report metrics for each source
      result.sourcesConsulted.forEach(source => {
        const drift = source.timestamp - result.timestamp;
        console.debug(`[Time] Source ${source.type} drift: ${drift}ms`);
        
        metrics.recordTimeSourceDrift({
          sourceType: source.type,
          driftMs: drift,
          confidence: source.confidence
        });
      });
      
      return result;
    });
}
```

**UI Indicators:**
- Display time synchronization status
- Show confidence level for current time
- Visualize time drift between sources

### Phase 2: Communication Infrastructure

#### Message Layer Functions

##### `mockMessageFraming` → Real Implementation

**Monitoring Strategy:**
- Track frame construction and parsing success rates
- Monitor frame size distribution
- Observe malformed frame detection

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function frameMessage(message: Message): FramedMessage {
  console.debug(`[Framing] Framing message of type: ${message.type}, size: ${JSON.stringify(message).length} bytes`);
  
  const framedMessage = realFramingImplementation(message);
  
  console.debug(`[Framing] Message framed, frame size: ${framedMessage.data.length} bytes`);
  metrics.recordFrameCreation({
    messageType: message.type,
    originalSize: JSON.stringify(message).length,
    framedSize: framedMessage.data.length
  });
  
  return framedMessage;
}

function parseFrame(framedMessage: FramedMessage): Message {
  console.debug(`[Framing] Parsing frame of size: ${framedMessage.data.length} bytes`);
  
  try {
    const message = realParsingImplementation(framedMessage);
    console.debug(`[Framing] Frame parsed successfully, message type: ${message.type}`);
    return message;
  } catch (error) {
    console.error(`[Framing] Frame parsing failed: ${error.message}`);
    metrics.recordParsingError({
      errorType: error.name,
      errorMessage: error.message,
      frameSize: framedMessage.data.length
    });
    throw error;
  }
}
```

**UI Indicators:**
- Show frame parsing success rate
- Display message size distribution
- Highlight frame errors with error details

##### `mockWebSocketPipe` → Real Implementation

**Monitoring Strategy:**
- Track connection establishment success/failure
- Monitor message delivery latency
- Observe reconnection attempts

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function createWebSocketPipe(config: PipeConfig): Promise<Pipe> {
  console.debug(`[WebSocket] Creating pipe to: ${config.endpoint}`);
  
  return realWebSocketImplementation(config)
    .then(pipe => {
      console.debug(`[WebSocket] Pipe created successfully, id: ${pipe.id}`);
      
      // Add event listeners for monitoring
      pipe.on('message', (message) => {
        console.debug(`[WebSocket] Message received on pipe ${pipe.id}, size: ${message.data.length} bytes`);
      });
      
      pipe.on('error', (error) => {
        console.error(`[WebSocket] Error on pipe ${pipe.id}: ${error.message}`);
      });
      
      pipe.on('close', () => {
        console.debug(`[WebSocket] Pipe ${pipe.id} closed`);
      });
      
      return pipe;
    });
}
```

**UI Indicators:**
- Display connection status for each pipe
- Show message throughput and latency
- Visualize reconnection attempts and success

#### Network Functions

##### `mockPeerDiscovery` → Real Implementation

**Monitoring Strategy:**
- Track discovery requests and responses
- Monitor peer discovery time
- Observe discovery failure rates

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function discoverPeers(options: DiscoveryOptions): Promise<DiscoveryResult> {
  console.debug(`[Network] Starting peer discovery with method: ${options.method}, timeout: ${options.timeoutMs}ms`);
  const startTime = performance.now();
  
  return realPeerDiscoveryImplementation(options)
    .then(result => {
      const duration = performance.now() - startTime;
      console.debug(`[Network] Peer discovery completed in ${duration.toFixed(2)}ms. Found ${result.peers.length} peers`);
      
      metrics.recordPeerDiscovery({
        method: options.method,
        durationMs: duration,
        peersFound: result.peers.length,
        success: result.success
      });
      
      result.peers.forEach((peer, index) => {
        console.debug(`[Network] Peer ${index+1}/${result.peers.length}: ${peer.id}, address: ${peer.address}, type: ${peer.type}`);
      });
      
      return result;
    });
}
```

**UI Indicators:**
- Show active peer count
- Display peer discovery success rate
- Visualize peer connection quality

### Phase 3: Token Operations

#### Token Model Functions

##### `mockTokenCreation` → Real Implementation

**Monitoring Strategy:**
- Track token creation success/failure rates
- Monitor token creation latency
- Observe token validation errors

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function createToken(request: TokenCreationRequest): Promise<Token> {
  console.debug(`[Token] Creating token with denomination: ${request.denomination}, for: ${request.owner}`);
  
  const startTime = performance.now();
  return realTokenCreationImplementation(request)
    .then(token => {
      const duration = performance.now() - startTime;
      console.debug(`[Token] Token created successfully in ${duration.toFixed(2)}ms, id: ${token.id.fullId}`);
      
      metrics.recordTokenCreation({
        denomination: request.denomination,
        durationMs: duration,
        success: true
      });
      
      return token;
    })
    .catch(error => {
      console.error(`[Token] Token creation failed: ${error.message}`);
      metrics.recordTokenCreation({
        denomination: request.denomination,
        error: error.message,
        success: false
      });
      throw error;
    });
}
```

**UI Indicators:**
- Show token creation success rate
- Display token creation latency
- Visualize token distribution by denomination

#### Telomeer Functions

##### `mockTelomereTransformation` → Real Implementation

**Monitoring Strategy:**
- Track ownership transfer success rates
- Monitor telomere transformation latency
- Observe verification failures

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function transformTelomere(request: TelomereTransformRequest): Promise<TelomereTransformResult> {
  console.debug(`[Telomere] Transforming telomere for token: ${request.tokenId}, from: ${request.previousOwner} to: ${request.newOwner}`);
  
  const startTime = performance.now();
  return realTelomereTransformationImplementation(request)
    .then(result => {
      const duration = performance.now() - startTime;
      console.debug(`[Telomere] Transformation completed in ${duration.toFixed(2)}ms. Success: ${result.success}`);
      
      if (!result.success) {
        console.warn(`[Telomere] Transformation issue: ${result.failureReason}`);
      }
      
      return result;
    });
}
```

**UI Indicators:**
- Show ownership transfer success rate
- Display telomere chain visualization
- Highlight verification failures with details

#### Transaction Functions

##### `mockTransactionInitiation` → Real Implementation

**Monitoring Strategy:**
- Track transaction state transitions
- Monitor transaction completion time
- Observe rollback frequency and causes

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function initiateTransaction(request: TransactionRequest): Promise<Transaction> {
  console.debug(`[Transaction] Initiating transaction from: ${request.senderId} to: ${request.receiverId}, amount: ${request.amount}`);
  
  return realTransactionInitiationImplementation(request)
    .then(transaction => {
      console.debug(`[Transaction] Transaction initiated, id: ${transaction.id}, status: ${transaction.status}`);
      
      // Set up monitoring for state changes
      transactionMonitor.observe(transaction.id, (stateChange) => {
        console.debug(`[Transaction] ${transaction.id} state changed: ${stateChange.previousState} -> ${stateChange.newState}`);
        
        metrics.recordTransactionStateChange({
          transactionId: transaction.id,
          previousState: stateChange.previousState,
          newState: stateChange.newState,
          durationInState: stateChange.durationInState
        });
      });
      
      return transaction;
    });
}
```

**UI Indicators:**
- Display transaction state in real-time
- Show transaction timeline with state transitions
- Visualize transaction success/failure rates

### Phase 4: Trust and Verification

#### Identity Functions

##### `mockIdentityCreation` → Real Implementation

**Monitoring Strategy:**
- Track identity creation success rates
- Monitor identity verification latency
- Observe key generation performance

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function createIdentity(request: IdentityCreationRequest): Promise<Identity> {
  console.debug(`[Identity] Creating identity for: ${request.name}`);
  
  const startTime = performance.now();
  return realIdentityCreationImplementation(request)
    .then(identity => {
      const duration = performance.now() - startTime;
      console.debug(`[Identity] Identity created in ${duration.toFixed(2)}ms, id: ${identity.id}`);
      
      metrics.recordIdentityCreation({
        durationMs: duration,
        success: true
      });
      
      return identity;
    });
}
```

**UI Indicators:**
- Show identity creation success rate
- Display key generation performance
- Visualize identity verification status

#### Attestation Functions

##### `mockAttestationCreation` → Real Implementation

**Monitoring Strategy:**
- Track attestation creation and verification rates
- Monitor attestation distribution coverage
- Observe verification performance

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function createAttestation(request: AttestationRequest): Promise<Attestation> {
  console.debug(`[Attestation] Creating attestation by: ${request.attesterId} for: ${request.subjectId}, type: ${request.type}`);
  
  return realAttestationCreationImplementation(request)
    .then(attestation => {
      console.debug(`[Attestation] Attestation created, id: ${attestation.id}`);
      
      metrics.recordAttestationCreation({
        type: request.type,
        success: true
      });
      
      return attestation;
    });
}
```

**UI Indicators:**
- Show attestation creation success rate
- Display attestation verification status
- Visualize attestation distribution metrics

### Phase 5: Lifecycle Management

#### Token Creation Functions

##### `mockEggGeneration` → Real Implementation

**Monitoring Strategy:**
- Track egg generation success rates
- Monitor egg activation events
- Observe maturation progression

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function generateTokenEggs(request: EggGenerationRequest): Promise<EggGenerationResult> {
  console.debug(`[Lifecycle] Generating ${request.count} token eggs with potential: ${request.potentialValue}`);
  
  return realEggGenerationImplementation(request)
    .then(result => {
      console.debug(`[Lifecycle] Generated ${result.eggs.length} eggs, batch id: ${result.batchId}`);
      
      // Log each egg
      result.eggs.forEach((egg, index) => {
        console.debug(`[Lifecycle] Egg ${index + 1}/${result.eggs.length}: id=${egg.id}, dormancy=${egg.dormancyPeriod}days`);
      });
      
      return result;
    });
}
```

**UI Indicators:**
- Show egg generation success rate
- Display egg maturation progress
- Visualize token lifecycle stages

#### Renewal Functions

##### `mockRenewalRequest` → Real Implementation

**Monitoring Strategy:**
- Track renewal request success rates
- Monitor renewal facilitation frequency
- Observe renewal latency and processing time

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function requestRenewal(request: RenewalRequest): Promise<RenewalResult> {
  console.debug(`[Renewal] Requesting renewal for token: ${request.tokenId}, requested by: ${request.requesterId}`);
  
  const startTime = performance.now();
  return realRenewalRequestImplementation(request)
    .then(result => {
      const duration = performance.now() - startTime;
      console.debug(`[Renewal] Renewal request processed in ${duration.toFixed(2)}ms. Success: ${result.success}`);
      
      if (result.facilitated) {
        console.debug(`[Renewal] Renewal was facilitated by: ${result.facilitatorId}`);
      }
      
      return result;
    });
}
```

**UI Indicators:**
- Show renewal success rate by token age
- Display facilitation metrics
- Visualize renewal processing time

### Phase 6: System Enhancement

#### Monitoring Functions

##### `mockHealthMetrics` → Real Implementation

**Monitoring Strategy:**
- Track system component health states
- Monitor resource utilization trends
- Observe anomaly detection accuracy

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function collectHealthMetrics(): Promise<HealthMetrics> {
  console.debug('[Monitoring] Collecting system health metrics');
  
  return realHealthMetricsImplementation()
    .then(metrics => {
      console.debug(`[Monitoring] Health metrics collected, overall status: ${metrics.status.overall}`);
      
      // Log detailed component status
      metrics.components.forEach(component => {
        console.debug(`[Monitoring] Component: ${component.name}, status: ${component.status}, load: ${component.load}%`);
      });
      
      return metrics;
    });
}
```

**UI Indicators:**
- Show system health dashboard
- Display component status with visual indicators
- Visualize resource utilization trends

#### Extension Functions

##### `mockExtensionRegistration` → Real Implementation

**Monitoring Strategy:**
- Track extension registration and activation success
- Monitor extension usage patterns
- Observe extension performance impact

**Debugging Verbosity:**
```typescript
// Add to the real implementation
function registerExtension(request: ExtensionRegistrationRequest): Promise<ExtensionRegistrationResult> {
  console.debug(`[Extension] Registering extension: ${request.name}, version: ${request.version}`);
  
  return realExtensionRegistrationImplementation(request)
    .then(result => {
      console.debug(`[Extension] Extension registered, id: ${result.extensionId}, status: ${result.status}`);
      
      // Log capability details
      result.capabilities.forEach(capability => {
        console.debug(`[Extension] Capability: ${capability.name}, impactLevel: ${capability.impactLevel}`);
      });
      
      return result;
    });
}
```

**UI Indicators:**
- Show extension registry with status
- Display extension capability impact
- Visualize extension usage metrics

## Docker-Specific Implementation Considerations

### Networking Configuration

When implementing protocols within Docker:

1. **Container Network Setup**
   - Configure container-to-container communication through Docker networks
   - Use hostname resolution for discovering services
   - Set up proper network segmentation for security testing

2. **Simulating Network Conditions**
   - Use Docker network tools to simulate latency, packet loss
   - Test protocol resilience with network disruptions
   - Configure bandwidth limitations to test performance under constraints

```bash
# Example: Add network delay between containers
docker exec -it juicetokens-network-sim tc qdisc add dev eth0 root netem delay 100ms 20ms
```

### Volume Management for Persistence

Configure Docker volumes for persistence testing:

1. **Volume Configuration**
   - Mount dedicated volumes for each node's persistent storage
   - Configure backup volumes for testing recovery
   - Set appropriate permissions for mounted volumes

2. **Data Persistence Verification**
   - Test container restarts to verify data persistence
   - Simulate storage failures to test recovery
   - Monitor volume usage and performance

```yaml
# Example docker-compose volume configuration
volumes:
  node1_data:
    driver: local
  node2_data:
    driver: local
```

### Inter-Container Communication

For proper multi-node testing:

1. **Service Discovery**
   - Implement service discovery using Docker DNS
   - Configure proper hostnames and DNS resolution
   - Test dynamic discovery of containers

2. **Messaging Pattern Implementation**
   - Implement request-response patterns via HTTP/gRPC
   - Set up message queues for asynchronous communication
   - Configure proper timeout handling for inter-service calls

## Testing Strategies for Docker Environment

### Automated Integration Tests

Create dedicated tests for Docker-specific integrations:

```typescript
// Example Docker integration test
describe('Docker Environment Token Transfer', () => {
  it('should successfully transfer tokens between containers', async () => {
    // Setup test containers
    const node1Client = createNodeClient('node1');
    const node2Client = createNodeClient('node2');
    
    // Create test token
    const token = await node1Client.createToken({ denomination: 10 });
    
    // Perform cross-container transfer
    const transferResult = await node1Client.transferToken({
      tokenId: token.id,
      toNode: 'node2',
      toUser: 'test-user'
    });
    
    // Verify token exists on node2
    const node2Token = await node2Client.getToken(token.id);
    expect(node2Token).toBeDefined();
    expect(node2Token.owner).toBe('test-user');
  });
});
```

### Performance Benchmarking

Implement performance tests specific to containerized environments:

```typescript
// Example performance benchmark
describe('Token Creation Performance', () => {
  it('should create tokens within acceptable time limits', async () => {
    const results = [];
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await tokenClient.createToken({ denomination: 10 });
      const duration = performance.now() - start;
      results.push(duration);
    }
    
    const average = results.reduce((sum, val) => sum + val, 0) / results.length;
    console.log(`Average token creation time: ${average.toFixed(2)}ms`);
    
    expect(average).toBeLessThan(50); // 50ms max acceptable time
  });
});
```

### Debugging and Monitoring Tools

Utilize Docker-specific tools for debugging and monitoring:

1. **Docker Logs**
   - Configure structured logging for container outputs
   - Set up log aggregation across containers
   - Implement log rotation and retention policies

2. **Container Metrics**
   - Monitor CPU, memory, and network usage
   - Collect container startup and restart metrics
   - Track container resource limits and usage

3. **Health Checks**
   - Implement Docker health checks for each service
   - Monitor container health status
   - Configure proper restart policies

```yaml
# Example health check configuration
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

## Conclusion

This Docker integration plan provides a comprehensive approach to implementing real protocol buffer functions within a containerized environment. By focusing on the functions that can be effectively tested in Docker, we can create a robust foundation for the JuiceTokens system while deferring hardware-dependent implementations for native integration.