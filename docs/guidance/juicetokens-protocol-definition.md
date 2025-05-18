# JuiceTokens Protocol Definition Document

## Introduction

This document provides a comprehensive definition of the JuiceTokens Protocol components that will be implemented using Protocol Buffers. The JuiceTokens ecosystem is designed as a layered architecture that enables peer-to-peer value exchange with unique properties such as token denominations, telomere tracking, and a psychosocial development framework.

The protocol is organized into seven distinct layers, each containing specific components that interact to form a complete ecosystem:

1. Foundation Layer: Core Infrastructure
2. Transport Layer: Communication Protocol Stack
3. Core Token Layer: Value Representation
4. Trust and Attestation Layer: Reputation Framework
5. Token Lifecycle Layer: Temporal Value Management
6. Extension Layer: Application Integration Points
7. Governance Layer: System Evolution Framework

This document defines the core components required for each layer, focusing on the first five layers which are essential for initial user testing. Layers 6 and 7 are intentionally defined with minimal specification as they serve primarily as integration points for extensions and user-driven creative expansion of the ecosystem.

## Layer Relationship Clarification

It's important to note that the seven layers exist in both protocol (back-end) and UI (front-end) aspects of the system, with a clear relationship between them. Each protocol layer has corresponding UI components that expose its functionality to users.

The first five layers form the essential core functionality required for initial implementation and testing. These layers are fully specified and structured.

Layers 6 (Extension) and 7 (Governance) are designed to be flexible integration points that enable the ecosystem to evolve based on community needs and innovations. They will not be fully defined from the start, allowing for organic growth and adaptation.

## Layer 1: Foundation Layer (Core Infrastructure)

### 1.1 Hardware Abstraction Layer

#### 1.1.1 TEE Integration Interface

**Purpose**: Securely manage cryptographic operations, key storage, and attestation verification.

**Components to Define**:
- **SecureKeyStorage**: Representation of keys stored in the TEE
- **CryptographicOperationRequest**: Request structure for operations in the TEE
- **CryptographicOperationResponse**: Response structure for operations performed in the TEE
- **AttestationVerificationRequest**: Request structure for verifying attestations
- **AttestationVerificationResponse**: Response structure with verification results

#### 1.1.2 Device Capability Discovery

**Purpose**: Identify and utilize available hardware capabilities.

**Components to Define**:
- **DeviceCapabilities**: Structure representing available device features
- **CommunicationInterface**: Enumeration of available communication methods (BLE, NFC, etc.)
- **StorageCapability**: Structure representing storage options and limitations
- **CryptographicSupport**: Structure describing available cryptographic acceleration

#### 1.1.3 Time Source Management

**Purpose**: Maintain reliable time references across the system, essential for transaction integrity and security.

**Functional Dependencies**:
- Transaction finalization requires verified time integrity
- Tokens with expiry dates depend on reliable time sources
- Attestation validity requires temporally anchored proofs

**Time Status Modes**:
1. **Verified**: Normal operation with GPS or network time, differences in millisecond range. Default operating mode.
2. **Consensus**: When primary time sources are unavailable, system can operate with differences less than ~5 seconds (typical transaction duration).
3. **Inadequate**: Differences more than 5 seconds, requiring synchronization before transactions can be performed.

**Components to Define**:
- **TimeSource**: Enumeration of available time sources (GNSS, NTP, system)
- **TimeConsensus**: Structure representing aggregated time from multiple sources (activates only when standard time sources show inconsistencies for a prolonged period)
- **TimeConfidence**: Metric of time source reliability that directly impacts permissible transaction types
- **SpoofingDetectionResult**: Structure indicating potential time manipulation with appropriate action recommendations

**Implementation Notes**:
- Users can prepare transactions regardless of time verification status
- Transaction finalization will be blocked if time integrity requirements aren't met
- The protocol must provide clear error states that can be surfaced to users through the UI
- Time consensus mechanisms have fallback behaviors for offline scenarios
- Full "post-apocalyptic" time consensus component will be implemented after initial test rounds

### 1.2 Persistence Management

#### 1.2.1 Local Storage Module

**Purpose**: Manage token storage across different platforms.

**Components to Define**:
- **TokenStore**: Structure representing the collection of tokens
- **StorageOperation**: Request structure for token storage operations
- **StorageResult**: Response structure for storage operation results
- **StorageCapacity**: Structure representing available storage space

#### 1.2.2 Distributed Hash Table Interface

**Purpose**: Enable distributed content-addressable storage.

**Components to Define**:
- **DHTEntry**: Structure representing an entry in the distributed hash table
- **DHTQuery**: Request structure for DHT lookups
- **DHTQueryResult**: Response structure for DHT queries
- **S2CellReference**: Structure representing a geospatial index for DHT sharding

#### 1.2.3 Personal Chain of Consistency

**Purpose**: Maintain user-specific verifiable history of DHT contributions as a source of truth.

**Components to Define**:
- **PersonalChainEntry**: Structure linking a user's DHT entries into a verifiable chain
- **ChainVerificationRequest**: Structure for verifying integrity of a user's personal chain
- **ChainVerificationResult**: Structure returning verification results
- **TrustableHistory**: Structure representing a user's validated history of contributions
- **PersonalLedger**: Structure that maps a user's token portfolio to chain entries
- **AttestationChainLink**: Structure connecting attestations to the personal chain
- **SyncActivityRecord**: Structure recording peer synchronization events in the chain

#### 1.2.4 Synchronization Primitives

**Purpose**: Maintain data consistency across distributed components.

**Components to Define**:
- **SyncVectorClock**: Structure representing logical timestamps for synchronization prioritization. Contains slots for essentials (mostly token related with redundancy between assigned peers), optionals (primarily for attestations), and wildcards (for poll-tokens and transparent poll following). Slot assignment may shift according to machine learning algorithms as the system evolves.
- **ConflictResolutionRequest**: Structure for resolving data conflicts
- **MerkleDifference**: Structure representing differences between data sets using Merkle trees for efficient comparison
- **SynchronizationSession**: Structure representing a sync operation between peers

## Layer 2: Transport Layer (Communication Protocol Stack)

### 2.1 Pipe Abstraction Layer

#### 2.1.1 Transport Protocol Handlers

**Purpose**: Facilitate data exchange across different communication channels.

**Components to Define**:
- **PipeType**: Enumeration of communication channels (QR Kiss, BLE, NFC, Web)
- **PipeConfiguration**: Structure with channel-specific settings
- **PipeStatus**: Structure representing the current state of a communication channel
- **PipeCapabilities**: Structure describing what a specific pipe can support

#### 2.1.2 Message Framing and Serialization

**Purpose**: Ensure consistent message encoding and framing.

**Components to Define**:
- **MessageFrame**: Container structure for all protocol messages
- **FrameType**: Enumeration of different frame types
- **CompressionType**: Enumeration of compression algorithms
- **ChunkInfo**: Structure for managing message fragmentation and reassembly

#### 2.1.3 Reliability and Recovery

**Purpose**: Ensure reliable data transmission.

**Components to Define**:
- **Acknowledgment**: Structure confirming message receipt
- **SessionResumptionToken**: Structure enabling interrupted sessions to resume
- **RecoveryRequest**: Structure requesting retransmission of data
- **TransportError**: Structure describing communication errors

### 2.2 Network Topology Management

#### 2.2.1 Peer Discovery Module

**Purpose**: Locate and connect to peers in the network.

**Components to Define**:
- **PeerDiscoveryRequest**: Structure for initiating peer discovery
- **PeerInfo**: Structure containing information about discovered peers
- **BootstrapNode**: Structure representing initial connection points
- **ServiceAdvertisement**: Structure announcing available services to others

#### 2.2.2 Mesh Network Formation

**Purpose**: Create resilient peer-to-peer networks.

**Components to Define**:
- **MeshConfiguration**: Structure defining mesh network parameters
- **RoutingTable**: Structure maintaining known routes to peers
- **NetworkHealthMetrics**: Structure with network performance indicators
- **StoreAndForwardRequest**: Structure for offline message delivery

#### 2.2.3 Connection Management

**Purpose**: Establish and maintain peer connections.

**Components to Define**:
- **ConnectionRequest**: Structure for initiating connections
- **ConnectionState**: Structure representing connection status
- **TransportNegotiation**: Structure for selecting optimal transport method
- **QualityOfService**: Structure defining connection performance requirements

## Layer 3: Core Token Layer (Value Representation)

### 3.1 Token Primitives

#### 3.1.1 Token Model

**Purpose**: Define the fundamental token structure.

**Components to Define**:
- **Token**: Core structure representing a token
- **TokenId**: Structure for the token identifier (LOCATION-REFERENCE-VALUE-INDEX)
- **TokenMetadata**: Structure containing token metadata
- **DenominationValue**: Enumeration of valid token denominations (1, 2, 5, 10, 20, 50, 100, 200, 500)

#### 3.1.2 Telomeer Management

**Purpose**: Track token ownership history.

**Components to Define**:
- **Telomeer**: Structure representing ownership information
- **OwnershipProof**: Structure proving rightful ownership
- **TelomeerTransformation**: Structure for ownership transfers
- **HashHistory**: Structure maintaining compressed history of previous owners

#### 3.1.3 Cryptographic Operations

**Purpose**: Secure token operations.

**Components to Define**:
- **SignatureRequest**: Structure for creating cryptographic signatures
- **SignatureVerification**: Structure for verifying signatures
- **HashOperation**: Structure for cryptographic hash operations
- **ZeroKnowledgeProof**: Structure for privacy-preserving verification

### 3.2 Transaction Protocol

#### 3.2.1 Four-Packet Transaction Model

**Purpose**: Facilitate secure token exchanges.

**Components to Define**:
- **ExoPak**: Structure for tokens sent to the other party (sExo-pak, rExo-pak)
- **RetroPak**: Structure for tokens retained for rollback safety (sRetro-pak, rRetro-pak)
- **PakStatus**: Structure representing the state of a token package
- **TransactionContext**: Structure with transaction metadata

#### 3.2.2 Atomic Commitment Protocol

**Purpose**: Ensure transaction integrity.

**Components to Define**:
- **TransactionInitiation**: Structure for starting a transaction
- **TransactionPreparation**: Structure for the validation phase
- **TransactionCommitment**: Structure for finalizing a transaction
- **TransactionAbort**: Structure for canceling a transaction

#### 3.2.3 Token Flow Management

**Purpose**: Optimize token selection and exchange.

**Components to Define**:
- **BalanceVerification**: Structure confirming available tokens
- **TokenSelectionStrategy**: Structure defining how tokens are chosen for transactions
- **TokenSelectionConstraint**: Structure enforcing minimum account balance and protecting the last tokens of an issuance
- **ChangeCalculation**: Structure for computing appropriate change
- **WisselToken**: Special structure for the single exchange token each user owns. Contains important constraints:
  - Becomes unspendable if it's the last token (or one of the last two tokens) left from an issuance in a user's portfolio
  - Enforces an "all or nothing" rule for the final tokens
  - Requires a minimum account balance (>2) to ensure there's always a token to log back updated fractional values
  - Prevents issues with tracking a floating fractional buffer without a token to attach it to
- **AfrondingBuffer**: Structure representing the fractional value buffer (0-0.99)
- **DenominationVectorClock**: Structure for communicating token denomination distribution status during transactions. Performs two key functions: calculating the ideal token denomination distribution (approximately five tokens of each denomination with fewer high-value tokens), and sharing status codes for each denomination (00=lack, 01=slightly wanting, 10=good, 11=abundance) to optimize token selection between peers.

## Layer 4: Trust and Attestation Layer (Reputation Framework)

### 4.1 DHT-Based Attestation System

#### 4.1.1 Attestation Record Format

**Purpose**: Store and retrieve reputation information.

**Components to Define**:
- **SystemAttestation**: Structure for automatically generated attestations
- **PeerAttestation**: Structure for explicit user-to-user attestations
- **CommunityAttestation**: Structure for group consensus attestations
- **AttestationMetadata**: Structure with attestation context information

#### 4.1.2 Distribution and Storage Mechanisms

**Purpose**: Manage attestation data across the network.

**Components to Define**:
- **GeospatialShard**: Structure mapping attestations to geographic regions
- **AttestationExpiry**: Structure defining attestation lifetimes
- **PrivacyPreservingLookup**: Structure for querying attestations without revealing identities
- **AttestationStorage**: Structure for storing attestation records

#### 4.1.3 Identity and Authentication

**Purpose**: Secure identity management.

**Components to Define**:
- **KeyPair**: Structure representing cryptographic identity
- **IdentityProof**: Structure proving control of an identity
- **KeyRotation**: Structure for updating identity keys
- **RevocationCertificate**: Structure invalidating previous keys or attestations

### 4.2 Reputation Calculation Engine

#### 4.2.1 Multi-dimensional Scoring

**Purpose**: Calculate comprehensive reputation metrics.

**Components to Define**:
- **ReputationMetric**: Structure representing a specific aspect of reputation
- **ReliabilityScore**: Structure quantifying transaction reliability
- **ContributionScore**: Structure quantifying network contributions
- **ValidationScore**: Structure quantifying community validation

#### 4.2.2 Contextual Analysis

**Purpose**: Consider environmental factors in reputation.

**Components to Define**:
- **EnvironmentalContext**: Structure representing external conditions (e.g., crisis)
- **GeographicContext**: Structure representing location-specific factors
- **TemporalPattern**: Structure representing time-based patterns
- **ContextualAdjustment**: Structure modifying reputation based on context

#### 4.2.3 Attestation Oracle Protocol

**Purpose**: Facilitate trusted third-party attestations.

**Components to Define**:
- **WitnessSelection**: Structure for choosing attestation validators
- **ThresholdSignature**: Structure requiring multiple signers for validity
- **VerificationCircuit**: Structure defining zero-knowledge verification rules
- **TemporalSecurity**: Structure anchoring attestations to verifiable timestamps

## Layer 5: Token Lifecycle Layer (Temporal Value Management)

### 5.1 Token Creation and Renewal

#### 5.1.1 Token Creation Protocol

**Purpose**: Generate new tokens.

**Components to Define**:
- **EggGeneration**: Structure for creating dormant token potential
- **HatchingCondition**: Structure defining activation requirements
- **TokenDistribution**: Structure defining how new tokens are allocated
- **GenesisPool**: Structure representing the trusted group for creating token potential

#### 5.1.2 Renewal Management

**Purpose**: Manage token expiration and renewal.

**Components to Define**:
- **ExpiryNotification**: Structure alerting users to expiring tokens
- **RenewalRequest**: Structure for initiating token renewal
- **RenewalFacilitation**: Structure for assisting others with renewals
- **TelomeerRenewalTransformation**: Structure for updating telomeers during renewal

#### 5.1.3 Egg Dormancy System

**Purpose**: Manage potential but inactive tokens.

**Components to Define**:
- **DormantEgg**: Structure representing potential but inactive tokens
- **FertilizationTrigger**: Structure defining activation conditions
- **MaturationPath**: Structure defining the stages from dormant to active
- **EggComponent**: Structure containing the issuer portion of token activation
- **SpermComponent**: Structure containing the activity-generated portion of token activation

### 5.2 Future Value Representation

#### 5.2.1 Future Promise Protocol

**Purpose**: Enable representation of future value.

**Components to Define**:
- **PromiseCreation**: Structure for creating value promises
- **VerificationRequirement**: Structure defining conditions for promise validity
- **FulfillmentTracking**: Structure monitoring progress toward fulfillment
- **PromiseMetadata**: Structure with contextual information about the promise

#### 5.2.2 Escrow Mechanisms

**Purpose**: Facilitate conditional token transfers.

**Components to Define**:
- **EscrowCondition**: Structure defining conditions for token release
- **MultiSignatureRequirement**: Structure requiring multiple approvals
- **TimeBasedTrigger**: Structure releasing tokens based on time conditions
- **EscrowStatus**: Structure representing the current state of escrowed tokens

#### 5.2.3 Communal Pooling System

**Purpose**: Enable group-based token management.

**Components to Define**:
- **GroupCommitment**: Structure representing collective token promises
- **RiskDistribution**: Structure spreading risk across participants
- **CollectiveFulfillment**: Structure for group verification of deliverables
- **PoolMetadata**: Structure with information about the communal pool

### 5.3 User Developmental Stages

#### 5.3.1 Developmental Stage Tracking

**Purpose**: Track and facilitate user progression through the developmental stages.

**Components to Define**:
- **UserDevelopmentalStageStatus**: Structure tracking user progress through developmental stages
- **DevelopmentalStageLevel**: Enumeration of the seven developmental stages (Trust, Autonomy, Imagination, Competence, Identity, Connection, Generativity)
- **StageMetric**: Structure containing metrics for each developmental stage
- **StageTransition**: Structure recording transitions between developmental stages
- **DevelopmentalStageActivity**: Structure defining activities that contribute to stage progression
- **ActivityCompletion**: Structure recording completion of developmental activities
- **StageProgressionRecommendation**: Structure for suggesting actions to advance in current stage
- **DevelopmentalStageChallenge**: Structure defining challenges for stage advancement
- **StageMilestone**: Structure representing milestones within each developmental stage

## Layer 6: Extension Layer (Application Integration Points)

### 6.1 Extension Interface

**Purpose**: Define integration points for applications and extensions.

**Components to Define**:
- **ExtensionPoint**: Minimal structure defining interface points for extensions
- **ApplicationHook**: Simple hook mechanism for application integration
- **DataExchange**: Basic data exchange format for extensions

### 6.2 Extension Registry

**Purpose**: Manage available extensions and capabilities.

**Components to Define**:
- **ExtensionManifest**: Simple structure defining extension capabilities
- **PermissionRequest**: Basic structure for permission management

## Layer 7: Governance Layer (System Evolution Framework)

### 7.1 Monitoring Interface

**Purpose**: Enable system monitoring and health tracking.

**Components to Define**:
- **MonitoringHook**: Simple structure for monitoring integration
- **HealthMetric**: Basic structure for health reporting

### 7.2 Protocol Evolution

**Purpose**: Support protocol updates and governance.

**Components to Define**:
- **ProtocolVersion**: Structure defining protocol version information
- **UpdateMechanism**: Simple structure for protocol update discovery

## Conclusion

This document outlines the core components required for implementing the JuiceTokens protocol using Protocol Buffers. Each component has been defined with its purpose and structure to ensure a comprehensive understanding of the system prior to implementation.

The next steps involve:
1. Converting these definitions into Protocol Buffer (.proto) files
2. Implementing each layer sequentially, starting with the Foundation Layer
3. Thoroughly testing each layer before progressing to the next
4. Integrating the layers to create a cohesive system

This modular approach allows for focused development while maintaining the integrity of the overall system design and philosophy.
