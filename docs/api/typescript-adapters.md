# TypeScript Adapters API Documentation

This document provides comprehensive API documentation for all TypeScript adapters in the JuiceTokens system. Each layer has its own adapter with specific functionality.

## Table of Contents

1. [Foundation Layer](#foundation-layer)
2. [Transport Layer](#transport-layer)
3. [Token Layer](#token-layer)
4. [Trust Layer](#trust-layer)
5. [Lifecycle Layer](#lifecycle-layer)
6. [Extension Layer](#extension-layer)
7. [Governance Layer](#governance-layer)

## Foundation Layer

The Foundation layer provides core services including storage, cryptography, and time synchronization.

### Storage

```typescript
// Importing the Foundation layer
import { storage } from 'juicetokens/foundation';

// Storage Operations
interface StorageAdapter {
  /**
   * Save data to storage
   * @param key Unique identifier for the data
   * @param data Data to store (will be serialized)
   * @returns Promise resolving to success status
   */
  save(key: string, data: any): Promise<boolean>;
  
  /**
   * Retrieve data from storage
   * @param key Unique identifier for the data
   * @returns Promise resolving to the stored data or null if not found
   */
  retrieve(key: string): Promise<any | null>;
  
  /**
   * Delete data from storage
   * @param key Unique identifier for the data
   * @returns Promise resolving to success status
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Query data in storage
   * @param query Query parameters
   * @returns Promise resolving to matching items
   */
  query(query: StorageQuery): Promise<StorageQueryResult>;
}

// Example usage
const userStorage = storage.getAdapter('user');
await userStorage.save('user-123', { name: 'Alice', tokens: [] });
const user = await userStorage.retrieve('user-123');
```

### Cryptography

```typescript
import { crypto } from 'juicetokens/foundation';

interface CryptoAdapter {
  /**
   * Generate a secure hash of data
   * @param data Data to hash
   * @param algorithm Hash algorithm to use (default: SHA-256)
   * @returns Promise resolving to hash string
   */
  hash(data: string | Buffer, algorithm?: string): Promise<string>;
  
  /**
   * Sign data with a private key
   * @param data Data to sign
   * @param privateKey Private key for signing
   * @returns Promise resolving to signature
   */
  sign(data: string | Buffer, privateKey: string): Promise<string>;
  
  /**
   * Verify a signature
   * @param data Original data
   * @param signature Signature to verify
   * @param publicKey Public key for verification
   * @returns Promise resolving to verification result
   */
  verify(data: string | Buffer, signature: string, publicKey: string): Promise<boolean>;
  
  /**
   * Generate a keypair
   * @returns Promise resolving to keypair object
   */
  generateKeypair(): Promise<CryptoKeypair>;
}

// Example usage
const hash = await crypto.hash('my token data');
const signature = await crypto.sign('transaction data', privateKey);
const isValid = await crypto.verify('transaction data', signature, publicKey);
```

### Time Services

```typescript
import { time } from 'juicetokens/foundation';

interface TimeAdapter {
  /**
   * Get current synchronized time
   * @returns Promise resolving to current time in ISO format
   */
  getCurrentTime(): Promise<string>;
  
  /**
   * Calculate time difference between two timestamps
   * @param time1 First timestamp
   * @param time2 Second timestamp
   * @returns Time difference in milliseconds
   */
  getTimeDifference(time1: string, time2: string): number;
  
  /**
   * Check if a timestamp is expired
   * @param timestamp Timestamp to check
   * @param expiryMs Expiry time in milliseconds
   * @returns True if expired
   */
  isExpired(timestamp: string, expiryMs: number): boolean;
}

// Example usage
const now = await time.getCurrentTime();
const isTokenExpired = time.isExpired(token.timeData.creationTime, 3600000);
```

## Transport Layer

The Transport layer handles communication between JuiceTokens nodes.

### Pipe Management

```typescript
import { pipe } from 'juicetokens/transport';

interface PipeAdapter {
  /**
   * Create a communication pipe
   * @param config Pipe configuration
   * @param targetInfo Target node information
   * @returns Promise resolving to created pipe
   */
  createPipe(config: PipeConfiguration, targetInfo: string): Promise<Pipe>;
  
  /**
   * Get an existing pipe by ID
   * @param pipeId Pipe identifier
   * @returns Promise resolving to pipe or null if not found
   */
  getPipe(pipeId: string): Promise<Pipe | null>;
  
  /**
   * Close a pipe
   * @param pipeId Pipe identifier
   * @returns Promise resolving to success status
   */
  closePipe(pipeId: string): Promise<boolean>;
}

// Pipe interface
interface Pipe {
  id: string;
  type: PipeType;
  status: PipeStatus;
  
  /**
   * Send data through the pipe
   * @param data Data to send
   * @returns Promise resolving when data is sent
   */
  send(data: any): Promise<void>;
  
  /**
   * Receive data from the pipe
   * @returns Promise resolving to received data
   */
  receive(): Promise<any>;
  
  /**
   * Add a data handler
   * @param handler Function to handle incoming data
   */
  onData(handler: (data: any) => void): void;
  
  /**
   * Close the pipe
   * @returns Promise resolving when pipe is closed
   */
  close(): Promise<void>;
}

// Example usage
const qrPipe = await pipe.createPipe({
  pipeType: 'QR_KISS',
  timeoutMs: 30000,
  qrConfig: {
    errorCorrectionLevel: 'M',
    chunkSizeBytes: 256
  }
}, 'receiver-node-id');

qrPipe.onData(data => {
  console.log('Received data:', data);
});

await qrPipe.send({ type: 'TOKEN_TRANSFER', tokens: [...] });
```

### Transport Types

```typescript
// Available transport types
enum PipeType {
  QR_KISS = 'QR_KISS',
  NFC = 'NFC',
  BLE = 'BLE',
  DIRECT = 'DIRECT'
}

// QR KISS Transport
interface QrKissConfig {
  /**
   * Configure QR code transport
   * @param config QR configuration
   * @returns Promise resolving to success status
   */
  configure(config: QrKissConfiguration): Promise<boolean>;
  
  /**
   * Generate QR code data
   * @param data Data to encode
   * @returns Promise resolving to QR code representation
   */
  generateQrCode(data: any): Promise<QrCodeData>;
  
  /**
   * Scan QR code
   * @param imageData Image data containing QR code
   * @returns Promise resolving to decoded data
   */
  scanQrCode(imageData: Buffer): Promise<any>;
}

// NFC Transport
interface NfcAdapter {
  /**
   * Initialize NFC adapter
   * @returns Promise resolving when adapter is ready
   */
  initialize(): Promise<void>;
  
  /**
   * Start NFC discovery
   * @returns Promise resolving when discovery starts
   */
  startDiscovery(): Promise<void>;
  
  /**
   * Stop NFC discovery
   * @returns Promise resolving when discovery stops
   */
  stopDiscovery(): Promise<void>;
  
  /**
   * Register tag handler
   * @param handler Function to handle NFC tag
   */
  onTag(handler: (tag: NfcTag) => void): void;
}

// BLE Transport
interface BleAdapter {
  /**
   * Initialize BLE adapter
   * @returns Promise resolving when adapter is ready
   */
  initialize(): Promise<void>;
  
  /**
   * Scan for BLE devices
   * @param durationMs Scan duration in milliseconds
   * @returns Promise resolving to discovered devices
   */
  scan(durationMs: number): Promise<BleDevice[]>;
  
  /**
   * Connect to BLE device
   * @param deviceId Device identifier
   * @returns Promise resolving to connected device
   */
  connect(deviceId: string): Promise<BleConnection>;
}

// Example usage
// QR code transport
const qrTransport = transport.getTransport('QR_KISS');
const qrCode = await qrTransport.generateQrCode({ tokens: [...] });

// BLE transport
const bleTransport = transport.getTransport('BLE');
await bleTransport.initialize();
const devices = await bleTransport.scan(5000);
const connection = await bleTransport.connect(devices[0].id);
```

## Token Layer

The Token layer manages token operations, telomere handling, and transactions.

### Token Model

```typescript
import { model } from 'juicetokens/token';

interface TokenModelAdapter {
  /**
   * Create a new token
   * @param tokenId Token identifier components
   * @returns Promise resolving to created token
   */
  createToken(tokenId: TokenId): Promise<Token>;
  
  /**
   * Get token by ID
   * @param tokenId Full token identifier
   * @returns Promise resolving to token or null if not found
   */
  getToken(tokenId: string): Promise<Token | null>;
  
  /**
   * Validate token structure
   * @param token Token to validate
   * @returns Promise resolving to validation result
   */
  validateToken(token: Token): Promise<ValidationResult>;
  
  /**
   * Get all tokens owned by a user
   * @param userId User identifier
   * @returns Promise resolving to array of tokens
   */
  getUserTokens(userId: string): Promise<Token[]>;
}

// Token interfaces
interface Token {
  id: TokenId;
  batchId: string;
  meta: TokenMetadata;
  time: TokenTimeData;
  telomere: TokenTelomere;
}

interface TokenId {
  fullId: string;
  location: string;
  reference: string;
  value: number;
  index: number;
}

// Example usage
const token = await model.createToken({
  location: 'nyc',
  reference: 'batch123',
  value: 10,
  index: 1
});

const userTokens = await model.getUserTokens('user-456');
```

### Telomere Management

```typescript
import { telomere } from 'juicetokens/token';

interface TelomereAdapter {
  /**
   * Create a new telomere for a token
   * @param ownerId Initial owner ID
   * @returns Promise resolving to created telomere
   */
  createTelomere(ownerId: string): Promise<TokenTelomere>;
  
  /**
   * Transform telomere during ownership transfer
   * @param tokenId Token identifier
   * @param previousOwner Previous owner ID
   * @param newOwner New owner ID
   * @param transactionId Transaction identifier
   * @returns Promise resolving to transformation result
   */
  transformTelomere(
    tokenId: string,
    previousOwner: string,
    newOwner: string,
    transactionId: string
  ): Promise<TelomereTransformation>;
  
  /**
   * Verify telomere integrity
   * @param token Token with telomere to verify
   * @returns Promise resolving to verification result
   */
  verifyTelomere(token: Token): Promise<TelomereVerification>;
}

// Telomere interfaces
interface TokenTelomere {
  currentOwner: string;
  hashPreviousOwner: string | null;
  hashHistory: string[];
}

// Example usage
const newTelomere = await telomere.createTelomere('user-789');

const transformation = await telomere.transformTelomere(
  'nyc-batch123-10-1',
  'user-789',
  'user-456',
  'txn-123456'
);

const verification = await telomere.verifyTelomere(token);
```

### Transaction Protocol

```typescript
import { transaction } from 'juicetokens/token';

interface TransactionAdapter {
  /**
   * Initiate a transaction
   * @param request Transaction initiation request
   * @returns Promise resolving to created transaction
   */
  initiate(request: TransactionRequest): Promise<Transaction>;
  
  /**
   * Execute a transaction
   * @param transaction Transaction to execute
   * @returns Promise resolving to transaction result
   */
  execute(transaction: Transaction): Promise<TransactionResult>;
  
  /**
   * Get transaction status
   * @param transactionId Transaction identifier
   * @returns Promise resolving to transaction status
   */
  getStatus(transactionId: string): Promise<TransactionStatus>;
  
  /**
   * Cancel a transaction
   * @param transactionId Transaction identifier
   * @returns Promise resolving to cancellation result
   */
  cancel(transactionId: string): Promise<CancellationResult>;
}

// Transaction interfaces
interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  tokens: Token[];
  status: TransactionStatus;
  pipe: any; // Transport pipe
}

// Example usage
const txRequest = {
  senderId: 'user-789',
  receiverId: 'user-456',
  amount: 5
};

const transaction = await transaction.initiate(txRequest);
const result = await transaction.execute(transaction);
```

## Trust Layer

The Trust layer manages attestations, verification, and trust relationships.

### Attestation

```typescript
import { attestation } from 'juicetokens/trust';

interface AttestationAdapter {
  /**
   * Create an attestation
   * @param request Attestation creation request
   * @returns Promise resolving to created attestation
   */
  createAttestation(request: AttestationRequest): Promise<Attestation>;
  
  /**
   * Verify an attestation
   * @param attestation Attestation to verify
   * @returns Promise resolving to verification result
   */
  verifyAttestation(attestation: Attestation): Promise<AttestationVerification>;
  
  /**
   * Revoke an attestation
   * @param attestationId Attestation identifier
   * @returns Promise resolving to revocation result
   */
  revokeAttestation(attestationId: string): Promise<RevocationResult>;
  
  /**
   * Get attestations for a subject
   * @param subjectId Subject identifier
   * @returns Promise resolving to array of attestations
   */
  getAttestations(subjectId: string): Promise<Attestation[]>;
}

// Attestation interfaces
interface Attestation {
  id: string;
  subjectId: string;
  attestorId: string;
  claims: Claim[];
  signature: string;
  creationTime: string;
  expiryTime: string | null;
  status: AttestationStatus;
}

interface Claim {
  type: string;
  value: string;
}

// Example usage
const attestationRequest = {
  subjectId: 'user-456',
  attestorId: 'user-789',
  claims: [
    { type: 'IDENTITY', value: 'VERIFIED' },
    { type: 'REPUTATION', value: '80' }
  ],
  expiryTimeMs: 86400000 // 24 hours
};

const attestation = await attestation.createAttestation(attestationRequest);
const verification = await attestation.verifyAttestation(attestation);
```

### Trust Network

```typescript
import { network } from 'juicetokens/trust';

interface TrustNetworkAdapter {
  /**
   * Get trust level between nodes
   * @param sourceId Source node identifier
   * @param targetId Target node identifier
   * @param options Trust query options
   * @returns Promise resolving to trust level
   */
  getTrustLevel(
    sourceId: string, 
    targetId: string, 
    options?: TrustOptions
  ): Promise<TrustLevel>;
  
  /**
   * Find trust path between nodes
   * @param sourceId Source node identifier
   * @param targetId Target node identifier
   * @param maxDepth Maximum path depth
   * @returns Promise resolving to trust path
   */
  findTrustPath(
    sourceId: string, 
    targetId: string, 
    maxDepth?: number
  ): Promise<TrustPath>;
  
  /**
   * Get trusted nodes for a node
   * @param nodeId Node identifier
   * @param minLevel Minimum trust level
   * @returns Promise resolving to array of trusted nodes
   */
  getTrustedNodes(
    nodeId: string, 
    minLevel?: TrustLevel
  ): Promise<TrustedNode[]>;
}

// Trust interfaces
type TrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

// Example usage
const trustLevel = await network.getTrustLevel('user-789', 'user-456');
const trustPath = await network.findTrustPath('user-789', 'user-456', 3);
const trustedNodes = await network.getTrustedNodes('user-789', 'MEDIUM');
```

## Lifecycle Layer

The Lifecycle layer manages token creation, renewal, and expiration.

### Token Creation

```typescript
import { creation } from 'juicetokens/lifecycle';

interface TokenCreationAdapter {
  /**
   * Create tokens
   * @param request Token creation request
   * @returns Promise resolving to created tokens
   */
  createTokens(request: TokenCreationRequest): Promise<Token[]>;
  
  /**
   * Create a batch of tokens
   * @param request Batch creation request
   * @returns Promise resolving to token batch
   */
  createTokenBatch(request: BatchCreationRequest): Promise<TokenBatch>;
  
  /**
   * Authorize token creation
   * @param request Authorization request
   * @returns Promise resolving to authorization result
   */
  authorizeCreation(request: AuthorizationRequest): Promise<AuthorizationResult>;
}

// Token creation interfaces
interface TokenCreationRequest {
  requester: string;
  amount: number;
  denomination: number;
  metadata?: any;
}

interface TokenBatch {
  batchId: string;
  tokens: Token[];
  metadata: any;
}

// Example usage
const creationRequest = {
  requester: 'user-789',
  amount: 100,
  denomination: 10,
  metadata: {
    purpose: 'employee-rewards',
    expiryTimeMs: 2592000000 // 30 days
  }
};

const tokens = await creation.createTokens(creationRequest);
```

### Token Renewal

```typescript
import { renewal } from 'juicetokens/lifecycle';

interface TokenRenewalAdapter {
  /**
   * Renew tokens
   * @param request Token renewal request
   * @returns Promise resolving to renewed tokens
   */
  renewTokens(request: RenewalRequest): Promise<Token[]>;
  
  /**
   * Check renewal eligibility
   * @param tokens Tokens to check
   * @returns Promise resolving to eligibility result
   */
  checkRenewalEligibility(tokens: Token[]): Promise<EligibilityResult>;
  
  /**
   * Authorize token renewal
   * @param request Authorization request
   * @returns Promise resolving to authorization result
   */
  authorizeRenewal(request: AuthorizationRequest): Promise<AuthorizationResult>;
}

// Token renewal interfaces
interface RenewalRequest {
  requester: string;
  tokens: Token[];
  newExpiryTimeMs: number;
}

// Example usage
const renewalRequest = {
  requester: 'user-789',
  tokens: userTokens,
  newExpiryTimeMs: 2592000000 // 30 days
};

const renewedTokens = await renewal.renewTokens(renewalRequest);
```

### Token Distribution

```typescript
import { distribution } from 'juicetokens/lifecycle';

interface TokenDistributionAdapter {
  /**
   * Distribute tokens to multiple recipients
   * @param request Distribution request
   * @returns Promise resolving to distribution result
   */
  distributeTokens(request: DistributionRequest): Promise<DistributionResult>;
  
  /**
   * Create a distribution plan
   * @param request Plan creation request
   * @returns Promise resolving to distribution plan
   */
  createDistributionPlan(request: PlanRequest): Promise<DistributionPlan>;
  
  /**
   * Execute a distribution plan
   * @param planId Plan identifier
   * @returns Promise resolving to execution result
   */
  executeDistributionPlan(planId: string): Promise<ExecutionResult>;
}

// Distribution interfaces
interface DistributionRequest {
  senderId: string;
  distributions: RecipientDistribution[];
}

interface RecipientDistribution {
  recipientId: string;
  amount: number;
}

// Example usage
const distributionRequest = {
  senderId: 'user-789',
  distributions: [
    { recipientId: 'user-123', amount: 50 },
    { recipientId: 'user-456', amount: 100 },
    { recipientId: 'user-789', amount: 150 }
  ]
};

const result = await distribution.distributeTokens(distributionRequest);
```

## Extension Layer

The Extension layer provides a plugin architecture for extending the system.

### Extension Points

```typescript
import { extension } from 'juicetokens/extension';

interface ExtensionAdapter {
  /**
   * Register an extension point
   * @param extensionPoint Extension point definition
   * @returns Promise resolving to registration result
   */
  registerExtensionPoint(extensionPoint: ExtensionPoint): Promise<RegistrationResult>;
  
  /**
   * Register an extension
   * @param extension Extension definition
   * @returns Promise resolving to registration result
   */
  registerExtension(extension: Extension): Promise<RegistrationResult>;
  
  /**
   * Discover extensions
   * @param request Discovery request
   * @returns Promise resolving to discovered extensions
   */
  discoverExtensions(request: DiscoveryRequest): Promise<DiscoveryResult>;
  
  /**
   * Execute an extension
   * @param extensionId Extension identifier
   * @param params Extension parameters
   * @returns Promise resolving to execution result
   */
  executeExtension(extensionId: string, params: any): Promise<any>;
}

// Extension interfaces
interface ExtensionPoint {
  extensionPointId: string;
  description: string;
  supportedFeatures: string[];
}

interface Extension {
  extensionId: string;
  extensionPointId: string;
  features: string[];
  implementation: any;
}

// Example usage
const extensionPoint = {
  extensionPointId: 'token-validator',
  description: 'Validates tokens before transactions',
  supportedFeatures: ['basic-validation', 'advanced-validation']
};

await extension.registerExtensionPoint(extensionPoint);

const customValidator = {
  extensionId: 'geographic-validator',
  extensionPointId: 'token-validator',
  features: ['basic-validation'],
  implementation: {
    validate: async (token) => {
      // Custom validation logic
      return { valid: true };
    }
  }
};

await extension.registerExtension(customValidator);
```

## Governance Layer

The Governance layer provides monitoring, metrics, and system management.

### Monitoring

```typescript
import { monitoring } from 'juicetokens/governance';

interface MonitoringAdapter {
  /**
   * Enable monitoring
   * @param config Monitoring configuration
   * @returns Promise resolving to success status
   */
  enableMonitoring(config: MonitoringConfig): Promise<boolean>;
  
  /**
   * Collect health metrics
   * @returns Promise resolving to health metrics
   */
  collectHealthMetrics(): Promise<HealthMetrics>;
  
  /**
   * Collect network metrics
   * @returns Promise resolving to network metrics
   */
  collectNetworkMetrics(): Promise<NetworkMetrics>;
  
  /**
   * Check system health
   * @returns Promise resolving to health status
   */
  checkSystemHealth(): Promise<HealthStatus>;
}

// Monitoring interfaces
interface MonitoringConfig {
  metricsInterval: number;
  detailedLogs: boolean;
}

interface HealthMetrics {
  status: SystemStatus;
  components: ComponentStatus[];
}

// Example usage
await monitoring.enableMonitoring({
  metricsInterval: 60000, // 1 minute
  detailedLogs: true
});

const health = await monitoring.checkSystemHealth();
const metrics = await monitoring.collectNetworkMetrics();
```

### System Management

```typescript
import { management } from 'juicetokens/governance';

interface ManagementAdapter {
  /**
   * Get protocol version
   * @returns Promise resolving to version info
   */
  getProtocolVersion(): Promise<VersionInfo>;
  
  /**
   * Apply system update
   * @param update Update package
   * @returns Promise resolving to update result
   */
  applyUpdate(update: UpdatePackage): Promise<UpdateResult>;
  
  /**
   * Configure system
   * @param config System configuration
   * @returns Promise resolving to configuration result
   */
  configure(config: SystemConfig): Promise<ConfigResult>;
}

// Example usage
const version = await management.getProtocolVersion();

const configResult = await management.configure({
  token: {
    defaultExpiry: 604800000 // 7 days
  },
  trust: {
    defaultLevel: 'medium'
  }
});
```

## Common Patterns

### Error Handling

All adapters follow consistent error handling:

```typescript
try {
  const result = await someAdapter.someMethod();
  // Handle success
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof AuthorizationError) {
    // Handle authorization error
  } else if (error instanceof ConnectionError) {
    // Handle connection error
  } else {
    // Handle other errors
  }
}
```

### Events

Many adapters provide event subscriptions:

```typescript
// Subscribe to token events
token.events.on('token.created', (token) => {
  console.log('New token created:', token.id);
});

// Subscribe to transaction events
token.events.on('transaction.completed', (transaction) => {
  console.log('Transaction completed:', transaction.id);
});

// Subscribe to trust events
trust.events.on('attestation.created', (attestation) => {
  console.log('New attestation:', attestation.id);
});
```

### Integration Example

Complete example integrating multiple layers:

```typescript
// Import all layers
import { foundation, transport, token, trust, lifecycle } from 'juicetokens';

// Create a simple token exchange application
async function createTokenExchange() {
  // Initialize system
  await foundation.initialize();
  
  // Create tokens
  const tokens = await lifecycle.creation.createTokens({
    requester: 'admin',
    amount: 100,
    denomination: 10
  });
  
  // Create attestation
  const attestation = await trust.attestation.createAttestation({
    subjectId: 'merchant',
    attestorId: 'admin',
    claims: [{ type: 'MERCHANT_STATUS', value: 'APPROVED' }]
  });
  
  // Create transport pipe
  const pipe = await transport.pipe.createPipe({
    pipeType: 'DIRECT',
    timeoutMs: 30000
  }, 'merchant');
  
  // Create and execute transaction
  const transaction = await token.transaction.initiate({
    senderId: 'admin',
    receiverId: 'merchant',
    tokens: tokens.slice(0, 10),
    pipe
  });
  
  const result = await token.transaction.execute(transaction);
  
  return {
    tokens,
    attestation,
    transaction,
    result
  };
}
``` 