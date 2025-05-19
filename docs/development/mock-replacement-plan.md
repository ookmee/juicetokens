# Mock Replacement Plan with Debugging Strategies

This document outlines a phased approach for replacing mock functions with real protocol buffer implementations in the Docker environment, focusing on monitoring and debugging strategies for each function replacement.

## Phase 1: Core Infrastructure

### Persistence Layer Functions

#### `mockLocalStorage` → Real Implementation

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

#### `mockDht` → Real Implementation

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

### Time Service Functions

#### `mockTimeSource` → Real Implementation

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

## Phase 2: Communication Infrastructure

### Message Layer Functions

#### `mockMessageFraming` → Real Implementation

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

### Transport Layer Functions

#### `mockWebSocketPipe` → Real Implementation

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

## Phase 3: Token Operations

### Token Model Functions

#### `mockTokenCreation` → Real Implementation

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

### Telomeer Functions

#### `mockTelomereTransformation` → Real Implementation

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

### Transaction Functions

#### `mockTransactionInitiation` → Real Implementation

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

## Phase 4: Trust and Verification

### Identity Functions

#### `mockIdentityCreation` → Real Implementation

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

### Attestation Functions

#### `mockAttestationCreation` → Real Implementation

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

## Phase 5: Lifecycle Management

### Token Creation Functions

#### `mockEggGeneration` → Real Implementation

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

### Renewal Functions

#### `mockRenewalRequest` → Real Implementation

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

## Phase 6: System Enhancement

### Monitoring Functions

#### `mockHealthMetrics` → Real Implementation

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

### Extension Functions

#### `mockExtensionRegistration` → Real Implementation

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

## General Debugging Strategies

### Logging Configuration

Set up hierarchical logging with different verbosity levels:

```typescript
// Configure logging
const logConfig = {
  foundation: { level: 'debug', includeTimestamps: true },
  transport: { level: 'info', includeTimestamps: true },
  token: { level: 'debug', includeTimestamps: true },
  trust: { level: 'info', includeTimestamps: true },
  lifecycle: { level: 'debug', includeTimestamps: true },
  extension: { level: 'info', includeTimestamps: true },
  governance: { level: 'info', includeTimestamps: true }
};

// Function to get a configured logger
function getLogger(module) {
  return new Logger(module, logConfig[module] || { level: 'info', includeTimestamps: true });
}

// Usage
const tokenLogger = getLogger('token');
tokenLogger.debug('Creating token...');
```

### Metrics Collection

Set up a standardized metrics collection system:

```typescript
// Metrics collection singleton
class Metrics {
  private static instance: Metrics;
  private metricsBuffer: any[] = [];
  private flushInterval: NodeJS.Timeout;
  
  private constructor() {
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }
  
  static getInstance(): Metrics {
    if (!Metrics.instance) {
      Metrics.instance = new Metrics();
    }
    return Metrics.instance;
  }
  
  record(metric: any) {
    metric.timestamp = Date.now();
    this.metricsBuffer.push(metric);
  }
  
  private flush() {
    if (this.metricsBuffer.length === 0) return;
    
    // Send metrics to collection endpoint
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(this.metricsBuffer),
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      this.metricsBuffer = [];
    }).catch(error => {
      console.error('Failed to send metrics:', error);
    });
  }
}

// Usage
const metrics = Metrics.getInstance();
metrics.record({
  type: 'TOKEN_CREATION',
  success: true,
  durationMs: 120
});
```

### UI Dashboard Components

Create reusable dashboard components for monitoring:

```typescript
// React component for monitoring metrics
function MetricsPanel({ metricType, title }) {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch(`/api/metrics/${metricType}`);
      const data = await response.json();
      setMetrics(data);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [metricType]);
  
  return (
    <div className="metrics-panel">
      <h3>{title}</h3>
      <div className="metrics-content">
        {/* Render metrics based on type */}
        {metrics.map(metric => (
          <div key={metric.id} className="metric-item">
            {/* Metric visualization */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Verification Strategy

For each function replacement, follow this verification process:

1. **Unit Test Verification**
   - Ensure unit tests pass with the same inputs
   - Verify identical outputs between mock and real implementation
   - Test edge cases specific to the real implementation

2. **Integration Test Verification**
   - Test interaction with dependent components
   - Verify system behavior during transition period
   - Ensure backward compatibility

3. **Performance Comparison**
   - Compare latency between mock and real implementation
   - Monitor resource utilization
   - Identify performance bottlenecks

4. **Gradual Rollout**
   - Start with non-critical paths
   - Use feature flags to control adoption
   - Enable monitoring before full replacement

By following this phased approach with proper monitoring and debugging capabilities, we can systematically replace mock functions with real implementations while maintaining system stability and observability.