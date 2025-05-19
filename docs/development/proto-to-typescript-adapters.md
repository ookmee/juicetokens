# Protocol Functions and Mock Implementation Reference

This document provides an exhaustive reference of:
1. Protocol buffer functions that TypeScript adapters wrap
2. Mock functions that need to be replaced with real protocol buffer implementations

Both lists are organized by layer (in order of the JuiceTokens layer architecture) and by component within each layer.

## JuiceTokens Layer Architecture

For reference, the JuiceTokens system is organized into seven distinct layers:

```
┌─────────────────────────────┐
│   Layer 7: Governance       │  Monitoring, metrics, system health
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 6: Extension        │  Plugins, extensions, customization
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 5: Lifecycle        │  Token creation, renewal, expiration
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 4: Trust            │  Attestations, verifications, reputation
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 3: Token            │  Token operations, transfers, telomere
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 2: Transport        │  Communication protocols, pipes
└─────────────────────────────┘
┌─────────────────────────────┐
│   Layer 1: Foundation       │  Core infrastructure
└─────────────────────────────┘
```

## 1. Protocol Buffer Functions

This section lists all protocol buffer functions that are wrapped by TypeScript adapters, organized by layer and component.

### Layer 1: Foundation

#### Hardware
- `DetectDeviceCapabilities`: Detects device hardware capabilities
- `CheckTeeAvailability`: Checks if Trusted Execution Environment is available
- `InitializeTee`: Initializes the Trusted Execution Environment
- `ExecuteInTee`: Executes secured operations in TEE
- `VerifyTeeResult`: Verifies the results from TEE operations

#### Persistence
- `PerformStorageOperation`: Executes a storage operation (save, retrieve, delete)
- `QueryStorage`: Queries data in storage with filters
- `SynchronizeStorage`: Synchronizes storage between nodes
- `BackupData`: Creates backup of stored data
- `RestoreData`: Restores data from backup
- `ConfigureStorage`: Configures storage parameters

#### Time
- `GetCurrentTime`: Retrieves current time from available sources
- `GetTimeConsensus`: Gets time consensus from multiple sources
- `DetectTimeSpoofing`: Checks for potential time manipulation
- `StreamTimeUpdates`: Streams time updates from available sources

### Layer 2: Transport

#### Pipe
- `CreatePipe`: Creates a new communication pipe
- `ConnectPipe`: Connects to an existing pipe
- `SendMessage`: Sends a message through a pipe
- `ReceiveMessage`: Receives a message from a pipe
- `ClosePipe`: Closes an active pipe
- `GetPipeStatus`: Gets the status of a pipe

#### Message
- `FrameMessage`: Frames a message for transport
- `ParseFrame`: Parses a received frame
- `EncryptMessage`: Encrypts a message for secure transport
- `DecryptMessage`: Decrypts a received encrypted message
- `SignMessage`: Cryptographically signs a message
- `VerifySignature`: Verifies a message signature

#### Network
- `DiscoverPeers`: Discovers peers on the network
- `EstablishMeshConnection`: Establishes a mesh network connection
- `GetNetworkStatus`: Gets the current network status
- `BroadcastToNetwork`: Broadcasts a message to the network
- `RouteToPeer`: Routes a message to a specific peer
- `MonitorNetworkHealth`: Monitors network health

#### Native Bridge
- `InitiateNativeConnection`: Initiates connection to native device features
- `RequestPermission`: Requests permission for hardware access
- `InvokeNativeFunction`: Invokes a native function
- `HandleNativeEvent`: Handles events from native layer
- `CloseNativeConnection`: Closes native connection

### Layer 3: Token

#### Model
- `CreateToken`: Creates a new token
- `GetToken`: Retrieves a token by ID
- `UpdateToken`: Updates token properties
- `ListTokens`: Lists tokens with optional filters
- `ValidateToken`: Validates token structure and properties
- `BatchTokenOperation`: Performs operations on multiple tokens

#### Telomeer
- `CreateTelomere`: Creates a new telomere for a token
- `TransformTelomere`: Transforms telomere during ownership transfer
- `VerifyTelomere`: Verifies telomere integrity
- `GetTelomereHistory`: Gets history of telomere transformations
- `GetCurrentOwner`: Gets current owner from telomere
- `ValidateTelomereChain`: Validates the entire telomere chain

#### Transaction
- `InitiateTransaction`: Initiates a token transaction
- `PrepareTransaction`: Prepares transaction details
- `ApproveTransaction`: Approves a prepared transaction
- `FinalizeTransaction`: Finalizes an approved transaction
- `CancelTransaction`: Cancels an in-progress transaction
- `GetTransactionStatus`: Gets status of a transaction
- `ListTransactions`: Lists transactions with optional filters

#### Denomination
- `ValidateDenomination`: Validates token denomination
- `ListValidDenominations`: Lists all valid denominations
- `CalculateEquivalence`: Calculates denomination equivalence
- `OptimizeDenominations`: Optimizes a set of denominations
- `GetDenominationMetadata`: Gets metadata for a denomination

### Layer 4: Trust

#### Attestation
- `CreateAttestation`: Creates a new attestation
- `VerifyAttestation`: Verifies an attestation's validity
- `PublishAttestation`: Publishes an attestation to the network
- `RetrieveAttestations`: Retrieves attestations for an entity
- `RevokeAttestation`: Revokes a previously created attestation
- `FilterAttestations`: Filters attestations by criteria

#### Identity
- `CreateIdentity`: Creates a new identity
- `VerifyIdentity`: Verifies an identity's validity
- `UpdateIdentity`: Updates identity properties
- `LinkAttestations`: Links attestations to an identity
- `GetIdentityReputation`: Gets reputation for an identity
- `RevokeIdentity`: Revokes an identity

#### Reputation
- `CalculateReputation`: Calculates reputation from attestations
- `UpdateReputationScore`: Updates reputation score
- `GetReputationHistory`: Gets history of reputation changes
- `CompareReputations`: Compares reputations between entities
- `AggregateReputationScores`: Aggregates reputation scores
- `ApplyContextualFactors`: Applies contextual factors to reputation

#### Privacy
- `CreatePrivacyContext`: Creates a privacy context for transactions
- `ApplyPrivacyFilters`: Applies privacy filters to data
- `VerifyDataMinimization`: Verifies data minimization compliance
- `GetPrivacySettings`: Gets privacy settings for an entity
- `UpdatePrivacyPreferences`: Updates privacy preferences
- `AuditPrivacyCompliance`: Audits privacy compliance

### Layer 5: Lifecycle

#### Creation
- `GenerateTokenEggs`: Generates dormant token eggs
- `CreateGenesisPool`: Creates a genesis pool for tokens
- `FertilizeEggs`: Activates dormant eggs through activity
- `TrackMaturation`: Tracks progress through maturation stages
- `DistributeNewTokens`: Distributes newly created tokens
- `AuthorizeCreation`: Authorizes token creation

#### Renewal
- `CheckExpiryStatus`: Checks token expiry status
- `NotifyExpiry`: Notifies about tokens nearing expiration
- `RequestRenewal`: Requests token renewal
- `FacilitateRenewal`: Supports peer-assisted renewal
- `RenewTelomere`: Updates ownership during renewal
- `CalculateRenewalRewards`: Calculates rewards for facilitators

#### Developmental Stage
- `GetDevelopmentalStage`: Gets current developmental stage
- `AdvanceStage`: Advances to next developmental stage
- `VerifyStageRequirements`: Verifies requirements for stage advancement
- `GetStageCapabilities`: Gets capabilities for current stage
- `TrackDevelopmentalMetrics`: Tracks metrics for developmental progress
- `ApplyDevelopmentalRules`: Applies rules based on developmental stage

#### Future
- `CreatePromise`: Creates a future value promise
- `VerifyPromiseFulfillment`: Verifies promise fulfillment
- `ManageEscrow`: Manages escrow for future value
- `CreateCommunalPool`: Creates a communal value pool
- `ContributeToPool`: Contributes to a communal pool
- `DistributePoolResources`: Distributes resources from pool

### Layer 6: Extension

#### Extension Point
- `RegisterExtensionPoint`: Registers an extension point
- `GetExtensionPoint`: Gets information about an extension point
- `ListExtensionPoints`: Lists available extension points
- `UpdateExtensionPoint`: Updates an extension point configuration

#### Registry
- `RegisterExtension`: Registers a new extension
- `DiscoverExtensions`: Discovers available extensions
- `EnableExtension`: Enables an extension
- `DisableExtension`: Disables an extension
- `GetExtensionMetadata`: Gets metadata for an extension

### Layer 7: Governance

#### Monitoring
- `CollectHealthMetrics`: Collects system health metrics
- `ReportSystemStatus`: Reports system status
- `MonitorNetworkActivity`: Monitors network activity
- `CollectUsageStatistics`: Collects anonymous usage statistics
- `DetectAnomalies`: Detects system anomalies
- `TriggerAlerts`: Triggers alerts for critical events

#### Versioning
- `GetProtocolVersion`: Gets current protocol version
- `CheckCompatibility`: Checks compatibility between versions
- `NotifyUpdateAvailable`: Notifies about available updates
- `ApplyProtocolUpdate`: Applies protocol update
- `RollbackUpdate`: Rolls back problematic update

## 2. Mock Functions to Replace

This section lists mock functions that need to be replaced with real protocol buffer implementations, organized by layer and component.

**Legend**:
- 🐳 Can be replaced in Docker test environment
- 📱 Requires native app integration

### Layer 1: Foundation

#### Hardware
- `mockDetectDeviceCapabilities`: 📱 Requires native app integration
- `mockTeeAvailability`: 📱 Requires native app integration
- `mockTeeExecution`: 📱 Requires native app integration
- `mockSecureStorage`: 📱 Requires native app integration
- `mockHardwareRng`: 📱 Requires native app integration

#### Persistence
- `mockLocalStorage`: 🐳 Can be replaced in Docker
- `mockDht`: 🐳 Can be replaced in Docker
- `mockStorageSynchronization`: 🐳 Can be replaced in Docker
- `mockBackupAndRestore`: 🐳 Can be replaced in Docker
- `mockEncryptedStorage`: 🐳 Can be replaced in Docker

#### Time
- `mockTimeSource`: 🐳 Can be replaced in Docker
- `mockTimeConsensus`: 🐳 Can be replaced in Docker
- `mockTimeSpoofingDetection`: 🐳 Can be replaced in Docker
- `mockTimeVerification`: 🐳 Can be replaced in Docker

### Layer 2: Transport

#### Pipe
- `mockPipeCreation`: 🐳 Can be replaced in Docker
- `mockPipeConnection`: 🐳 Can be replaced in Docker
- `mockQrKissPipe`: 📱 Requires native app integration (camera access)
- `mockNfcPipe`: 📱 Requires native app integration
- `mockBluetoothPipe`: 📱 Requires native app integration
- `mockWebSocketPipe`: 🐳 Can be replaced in Docker

#### Message
- `mockMessageFraming`: 🐳 Can be replaced in Docker
- `mockMessageEncryption`: 🐳 Can be replaced in Docker
- `mockMessageSigning`: 🐳 Can be replaced in Docker
- `mockMessageVerification`: 🐳 Can be replaced in Docker
- `mockMessageRouting`: 🐳 Can be replaced in Docker

#### Network
- `mockPeerDiscovery`: 🐳 Can be replaced in Docker
- `mockMeshNetworking`: 🐳 Can be replaced in Docker
- `mockNetworkTopology`: 🐳 Can be replaced in Docker
- `mockConnectionReliability`: 🐳 Can be replaced in Docker
- `mockNetworkPartitioning`: 🐳 Can be replaced in Docker

#### Native Bridge
- `mockNativeBridge`: 📱 Requires native app integration
- `mockBleConnection`: 📱 Requires native app integration
- `mockNfcConnection`: 📱 Requires native app integration
- `mockCameraAccess`: 📱 Requires native app integration
- `mockBiometricVerification`: 📱 Requires native app integration

### Layer 3: Token

#### Model
- `mockTokenCreation`: 🐳 Can be replaced in Docker
- `mockTokenValidation`: 🐳 Can be replaced in Docker
- `mockTokenQuerying`: 🐳 Can be replaced in Docker
- `mockTokenBatching`: 🐳 Can be replaced in Docker
- `mockTokenStructure`: 🐳 Can be replaced in Docker

#### Telomeer
- `mockTelomereCreation`: 🐳 Can be replaced in Docker
- `mockTelomereTransformation`: 🐳 Can be replaced in Docker
- `mockTelomereVerification`: 🐳 Can be replaced in Docker
- `mockOwnershipTracking`: 🐳 Can be replaced in Docker
- `mockTelomereHistory`: 🐳 Can be replaced in Docker

#### Transaction
- `mockTransactionInitiation`: 🐳 Can be replaced in Docker
- `mockTransactionPreparation`: 🐳 Can be replaced in Docker
- `mockTransactionApproval`: 🐳 Can be replaced in Docker
- `mockTransactionFinalization`: 🐳 Can be replaced in Docker
- `mockTransactionRollback`: 🐳 Can be replaced in Docker
- `mockTransactionValidation`: 🐳 Can be replaced in Docker

#### Denomination
- `mockDenominationValidation`: 🐳 Can be replaced in Docker
- `mockDenominationEquivalence`: 🐳 Can be replaced in Docker
- `mockDenominationOptimization`: 🐳 Can be replaced in Docker
- `mockDenominationMetadata`: 🐳 Can be replaced in Docker

### Layer 4: Trust

#### Attestation
- `mockAttestationCreation`: 🐳 Can be replaced in Docker
- `mockAttestationVerification`: 🐳 Can be replaced in Docker
- `mockAttestationDistribution`: 🐳 Can be replaced in Docker
- `mockAttestationRevocation`: 🐳 Can be replaced in Docker
- `mockAttestationQuery`: 🐳 Can be replaced in Docker

#### Identity
- `mockIdentityCreation`: 🐳 Can be replaced in Docker
- `mockIdentityVerification`: 🐳 Can be replaced in Docker
- `mockIdentityUpdating`: 🐳 Can be replaced in Docker
- `mockIdentityRevocation`: 🐳 Can be replaced in Docker
- `mockIdentityLinking`: 🐳 Can be replaced in Docker

#### Reputation
- `mockReputationCalculation`: 🐳 Can be replaced in Docker
- `mockReputationHistory`: 🐳 Can be replaced in Docker
- `mockReputationComparison`: 🐳 Can be replaced in Docker
- `mockReputationAggregation`: 🐳 Can be replaced in Docker
- `mockContextualFactors`: 🐳 Can be replaced in Docker

#### Privacy
- `mockPrivacyContexts`: 🐳 Can be replaced in Docker
- `mockPrivacyFilters`: 🐳 Can be replaced in Docker
- `mockDataMinimization`: 🐳 Can be replaced in Docker
- `mockPrivacyAuditing`: 🐳 Can be replaced in Docker
- `mockPrivacyPreferences`: 🐳 Can be replaced in Docker

### Layer 5: Lifecycle

#### Creation
- `mockEggGeneration`: 🐳 Can be replaced in Docker
- `mockGenesisPoolCreation`: 🐳 Can be replaced in Docker
- `mockEggFertilization`: 🐳 Can be replaced in Docker
- `mockMaturationTracking`: 🐳 Can be replaced in Docker
- `mockTokenDistribution`: 🐳 Can be replaced in Docker
- `mockCreationAuthorization`: 🐳 Can be replaced in Docker

#### Renewal
- `mockExpiryNotification`: 🐳 Can be replaced in Docker
- `mockRenewalRequest`: 🐳 Can be replaced in Docker
- `mockRenewalFacilitation`: 🐳 Can be replaced in Docker
- `mockTelomereRenewal`: 🐳 Can be replaced in Docker
- `mockRewardCalculation`: 🐳 Can be replaced in Docker

#### Developmental Stage
- `mockDevelopmentalStages`: 🐳 Can be replaced in Docker
- `mockStageAdvancement`: 🐳 Can be replaced in Docker
- `mockRequirementVerification`: 🐳 Can be replaced in Docker
- `mockCapabilityManagement`: 🐳 Can be replaced in Docker
- `mockDevelopmentalMetrics`: 🐳 Can be replaced in Docker
- `mockDevelopmentalRules`: 🐳 Can be replaced in Docker

#### Future
- `mockPromiseCreation`: 🐳 Can be replaced in Docker
- `mockPromiseFulfillment`: 🐳 Can be replaced in Docker
- `mockEscrowManagement`: 🐳 Can be replaced in Docker
- `mockCommunalPooling`: 🐳 Can be replaced in Docker
- `mockResourceDistribution`: 🐳 Can be replaced in Docker

### Layer 6: Extension

#### Extension Point
- `mockExtensionPointRegistration`: 🐳 Can be replaced in Docker
- `mockExtensionPointDiscovery`: 🐳 Can be replaced in Docker
- `mockExtensionPointConfiguration`: 🐳 Can be replaced in Docker

#### Registry
- `mockExtensionRegistration`: 🐳 Can be replaced in Docker
- `mockExtensionDiscovery`: 🐳 Can be replaced in Docker
- `mockExtensionLifecycle`: 🐳 Can be replaced in Docker
- `mockExtensionMetadata`: 🐳 Can be replaced in Docker

### Layer 7: Governance

#### Monitoring
- `mockHealthMetrics`: 🐳 Can be replaced in Docker
- `mockStatusReporting`: 🐳 Can be replaced in Docker
- `mockNetworkMonitoring`: 🐳 Can be replaced in Docker
- `mockUsageStatistics`: 🐳 Can be replaced in Docker
- `mockAnomalyDetection`: 🐳 Can be replaced in Docker
- `mockAlertSystem`: 🐳 Can be replaced in Docker

#### Versioning
- `mockVersionChecking`: 🐳 Can be replaced in Docker
- `mockCompatibilityVerification`: 🐳 Can be replaced in Docker
- `mockUpdateNotification`: 🐳 Can be replaced in Docker
- `mockUpdateApplication`: 🐳 Can be replaced in Docker
- `mockUpdateRollback`: 🐳 Can be replaced in Docker

## Implementation Priority for Docker Environment

Based on the above flagging, the following represents the most critical mock functions to prioritize replacing within the Docker test environment:

1. Foundation Layer - Persistence & Time functions
2. Transport Layer - WebSocket pipes, message handling, network topology
3. Token Layer - All token operations (model, telomeer, transactions)
4. Trust Layer - All trust functions
5. Lifecycle Layer - All lifecycle functions

Functions requiring native app integration can remain mocked in the Docker environment with appropriate simulation capabilities until they can be properly integrated in the native implementation.