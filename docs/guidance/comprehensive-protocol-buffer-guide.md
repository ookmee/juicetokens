# Comprehensive JuiceTokens Protocol Buffer Implementation Guide

## Overview

This document provides a complete guide for implementing the Protocol Buffer (protobuf) definitions for the JuiceTokens ecosystem. It includes both the core protocol structure from the original architecture and expanded definitions needed to fulfill the complete vision of the seven-phase developmental system.

## Layer Architecture Clarification

JuiceTokens is structured around seven distinct layers in both its protocol (back-end) and UI (front-end) aspects. Each protocol layer has corresponding UI components that expose its functionality to users:

1. Foundation Layer: Core infrastructure
2. Transport Layer: Communication protocols
3. Core Token Layer: Value representation
4. Trust and Attestation Layer: Reputation framework
5. Token Lifecycle Layer: Temporal value management
6. Extension Layer: Application integration points
7. Governance Layer: System evolution framework

The first five layers form the essential core functionality required for initial implementation and testing. These layers are fully specified and structured.

Layers 6 and 7 are intentionally defined with minimal specifications, as they primarily serve as integration points for extensions and system evolution. These upper layers are designed to allow for creative expansion by users and developers, rather than being fully prescribed from the start.

## Project Structure

The protocol definitions should be organized in a layered structure that mirrors the complete architecture:

```
protos/
├── foundation/
│   ├── hardware.proto          // TEE integration, device capabilities
│   ├── persistence.proto       // Storage, DHT interface
│   ├── time.proto              // Time source management
│   └── monitoring.proto        // System telemetry (NEW)
├── transport/
│   ├── pipe.proto              // Transport abstraction
│   ├── message.proto           // Message framing
│   ├── network.proto           // Network topology
│   └── native_bridge.proto     // Native-web communication (NEW)
├── token/
│   ├── model.proto             // Core token representation
│   ├── telomeer.proto          // Ownership history
│   ├── transaction.proto       // Transaction protocol
│   └── denomination.proto      // Enhanced denomination management (NEW)
├── trust/
│   ├── attestation.proto       // Attestation framework
│   ├── reputation.proto        // Reputation calculation
│   ├── identity.proto          // Identity management
│   └── privacy.proto           // Privacy controls (NEW)
├── lifecycle/
│   ├── creation.proto          // Token creation
│   ├── renewal.proto           // Token renewal
│   ├── future.proto            // Future value
│   └── developmental_stage.proto // User developmental stages (NEW)
├── extension/                  // Application integration points
│   ├── extension_point.proto   // Extension interface definitions
│   └── registry.proto          // Extension registration and discovery
└── governance/                 // System evolution framework
    ├── monitoring.proto        // System monitoring interface
    └── versioning.proto        // Protocol version management
```

## Layer 1: Foundation Layer

### foundation/hardware.proto

```protobuf
syntax = "proto3";

package juicetokens.foundation.hardware;

// TEE Integration Interface
message SecureKeyStorage {
  string key_id = 1;  // Unique identifier for the key
  bytes public_key = 2;  // Public portion of the key
  string storage_location = 3;  // Enum: "TEE", "SE", "SOFTWARE"
  bool exportable = 4;  // Whether the private key can be exported
}

message CryptographicOperationRequest {
  string key_id = 1;  // Key to use for the operation
  enum OperationType {
    SIGN = 0;  // Create a signature
    VERIFY = 1;  // Verify a signature
    ENCRYPT = 2;  // Encrypt data
    DECRYPT = 3;  // Decrypt data
  }
  OperationType operation_type = 2;
  bytes data = 3;  // Data to operate on
  string algorithm = 4;  // Algorithm to use (e.g., "ECDSA_P256")
}

message CryptographicOperationResponse {
  bool success = 1;  // Whether the operation succeeded
  bytes result = 2;  // Result of the operation (e.g., signature)
  string error_message = 3;  // Error message if operation failed
}

// Device Capability Discovery
message DeviceCapabilities {
  repeated CommunicationInterface available_interfaces = 1;
  StorageCapability storage = 2;
  CryptographicSupport crypto = 3;
  bool has_camera = 4;  // For QR code functionality
  bool has_tee = 5;  // Trusted Execution Environment
  bool has_secure_element = 6;  // Hardware security module
}

enum CommunicationInterface {
  BLE = 0;  // Bluetooth Low Energy
  NFC = 1;  // Near Field Communication
  HTTPS = 2;  // Internet connectivity
  WIFI_DIRECT = 3;  // Direct WiFi connection
}

message StorageCapability {
  uint64 available_bytes = 1;  // Available storage space
  bool persistent_storage_available = 2;  // Whether persistent storage is available
  bool encrypted_storage_supported = 3;  // Whether storage can be encrypted
}

message CryptographicSupport {
  bool hardware_acceleration = 1;  // Hardware acceleration for crypto operations
  repeated string supported_algorithms = 2;  // List of supported algorithms
  bool secure_random_available = 3;  // Availability of secure random number generator
}

// Time Source Management
message TimeSource {
  enum SourceType {
    SYSTEM = 0;  // System clock
    NTP = 1;  // Network Time Protocol
    GNSS = 2;  // Global Navigation Satellite System
    RADIO = 3;  // Radio time signals
    CONSENSUS = 4;  // Time consensus from peers
  }
  SourceType source_type = 1;
  int64 timestamp_ms = 2;  // Milliseconds since Unix epoch
  uint32 confidence_score = 3;  // 0-100 confidence score
}

// Time Source Management - Critical for transaction finalization
message TimeIntegrityRequest {
  repeated string time_source_types = 1;  // Requested time source types
  bool require_high_confidence = 2;  // Whether high confidence is required
  bool for_transaction_finalization = 3;  // Whether for transaction finalization
  uint32 required_confidence_level = 4;  // Minimum confidence required (0-100)
}

message TimeConsensus {
  repeated TimeSource sources = 1;  // All available time sources
  int64 consensus_timestamp_ms = 2;  // Agreed-upon timestamp in milliseconds
  uint32 consensus_confidence = 3;  // Overall confidence in the consensus (0-100)
}

message SpoofingDetectionResult {
  bool spoofing_detected = 1;  // Whether time spoofing was detected
  string detection_reason = 2;  // Reason for detection
  int64 expected_time_range_min_ms = 3;  // Expected minimum time
  int64 expected_time_range_max_ms = 4;  // Expected maximum time
  int64 detected_time_ms = 5;  // Detected time
}

message TransactionTimeVerification {
  string transaction_id = 1;  // Transaction identifier
  int64 timestamp_ms = 2;  // Timestamp in milliseconds
  uint32 confidence_score = 3;  // 0-100 confidence score
  bool meets_finalization_requirements = 4;  // Whether requirements are met
  string verification_failure_reason = 5;  // Reason for failure if any
  enum TimeStatus {
    VERIFIED = 0;    // Normal operation with GPS/network time (millisecond differences)
    CONSENSUS = 1;   // Primary sources unavailable, differences < 5 seconds
    INADEQUATE = 2;  // Differences > 5 seconds, requires synchronization
  }
  TimeStatus time_status = 6;  // Current time status
}
```

### foundation/persistence.proto

```protobuf
syntax = "proto3";

package juicetokens.foundation.persistence;

import "token/model.proto";  // For TokenId references

// Local Storage Module
message TokenStore {
  repeated juicetokens.token.model.Token tokens = 1;  // Collection of tokens
  map<string, bytes> metadata = 2;  // Arbitrary metadata
  uint64 last_updated_ms = 3;  // Last update timestamp
}

message StorageOperation {
  enum OperationType {
    SAVE = 0;  // Save token(s)
    LOAD = 1;  // Load token(s)
    DELETE = 2;  // Delete token(s)
    UPDATE = 3;  // Update token(s)
    QUERY = 4;  // Query token(s)
  }
  OperationType operation_type = 1;
  repeated juicetokens.token.model.TokenId token_ids = 2;  // Token IDs to operate on
  repeated juicetokens.token.model.Token tokens = 3;  // Tokens to save/update
  string query = 4;  // Query string for QUERY operations
}

message StorageResult {
  bool success = 1;  // Whether the operation succeeded
  repeated juicetokens.token.model.Token tokens = 2;  // Retrieved tokens
  string error_message = 3;  // Error message if operation failed
  uint32 affected_count = 4;  // Number of tokens affected
}

// Distributed Hash Table Interface
message DHTEntry {
  bytes key = 1;  // DHT key (likely a hash)
  bytes value = 2;  // Stored value
  uint64 timestamp_ms = 3;  // When the entry was created/updated
  uint32 ttl_seconds = 4;  // Time-to-live in seconds
  string s2_cell_id = 5;  // Geospatial index for sharding
  bytes previous_entry_hash = 6;  // Hash of user's previous DHT entry
  bytes signature = 7;  // User signature of this entry
  uint64 sequence_number = 8;  // Sequence number in user's personal chain
  string entry_type = 9;  // Type of entry (token, attestation, sync, etc.)
  string user_id = 10;  // User identifier who created this entry
  
  // The previous_entry_hash, signature, and sequence_number form the user's
  // personal chain of DHT contributions, creating a verifiable history
  // that serves as a source of truth for tokens, attestations, and activity
}

message DHTQuery {
  bytes key = 1;  // Key to query
  bool include_metadata = 2;  // Whether to include metadata
  string s2_cell_id = 3;  // Optional geospatial filter
  string user_id = 4;  // Optional filter by user ID (personal chain)
  string entry_type = 5;  // Optional filter by entry type
}

message DHTQueryResult {
  bool found = 1;  // Whether the key was found
  bytes value = 2;  // Retrieved value
  uint64 timestamp_ms = 3;  // When the entry was created/updated
  uint32 remaining_ttl_seconds = 4;  // Remaining time-to-live
}

message S2CellReference {
  string cell_id = 1;  // S2 cell identifier
  uint32 level = 2;  // Cell level (precision)
  double lat = 3;  // Latitude of cell center
  double lng = 4;  // Longitude of cell center
}

// Personal chain management
message PersonalChainInfo {
  string user_id = 1;  // User identifier
  bytes latest_entry_hash = 2;  // Hash of the latest entry
  uint64 latest_sequence_number = 3;  // Latest sequence number
  uint64 chain_start_timestamp_ms = 4;  // When the chain started
  uint64 last_update_timestamp_ms = 5;  // Last update timestamp
  uint32 total_entries = 6;  // Total number of entries
  bytes chain_root_signature = 7;  // Signature of the chain root for verification
  repeated string designated_backup_peers = 8;  // Peers designated for redundancy
  string backup_medium_info = 9;  // Information about user backup medium
}

message PersonalLedger {
  string user_id = 1;  // User identifier
  repeated TokenPortfolioEntry token_entries = 2;  // Token portfolio entries
  repeated AttestationReference attestation_entries = 3;  // Attestation references
  repeated SyncActivityReference sync_entries = 4;  // Sync activity references
  bytes ledger_hash = 5;  // Hash of the entire ledger for verification
  uint64 last_updated_ms = 6;  // Last update timestamp
}

message TokenPortfolioEntry {
  string token_id = 1;  // Token identifier
  bytes dht_entry_hash = 2;  // Hash of the DHT entry containing this token
  uint64 sequence_number = 3;  // Sequence number in the personal chain
  uint64 acquisition_timestamp_ms = 4;  // When the token was acquired
  string acquisition_type = 5;  // How the token was acquired (transaction, creation, etc.)
  string previous_owner_id = 6;  // Previous owner identifier (if applicable)
}

message AttestationReference {
  string attestation_id = 1;  // Attestation identifier
  bytes dht_entry_hash = 2;  // Hash of the DHT entry containing this attestation
  uint64 sequence_number = 3;  // Sequence number in the personal chain
  string attestation_type = 4;  // Type of attestation
  string target_user_id = 5;  // Target user identifier (if given to someone)
  string source_user_id = 6;  // Source user identifier (if received from someone)
}

message SyncActivityReference {
  string sync_id = 1;  // Sync activity identifier
  bytes dht_entry_hash = 2;  // Hash of the DHT entry containing this sync activity
  uint64 sequence_number = 3;  // Sequence number in the personal chain
  string peer_id = 4;  // Peer identifier
  uint64 timestamp_ms = 5;  // Timestamp
  uint32 records_synced = 6;  // Number of records synced
  SyncDirection direction = 7;  // Direction of sync
}

enum SyncDirection {
  OUTGOING = 0;  // Local to peer
  INCOMING = 1;  // Peer to local
  BIDIRECTIONAL = 2;  // Both directions
}

message ChainVerificationRequest {
  string user_id = 1;  // User identifier
  uint64 start_sequence = 2;  // Starting sequence number
  uint64 end_sequence = 3;  // Ending sequence number
  bool include_entry_content = 4;  // Whether to include entry content
  bool verify_portfolio_consistency = 5;  // Whether to verify token portfolio consistency
  bool verify_attestation_consistency = 6;  // Whether to verify attestation consistency
}

message ChainVerificationResult {
  bool chain_valid = 1;  // Whether the chain is valid
  string user_id = 2;  // User identifier
  repeated ChainSegment segments = 3;  // Chain segments
  string verification_error = 4;  // Error if invalid
  float consistency_score = 5;  // Overall consistency score (0.0-1.0)
  PortfolioVerificationResult portfolio_verification = 6;  // Portfolio verification result
  AttestationVerificationResult attestation_verification = 7;  // Attestation verification result
}

message PortfolioVerificationResult {
  bool consistent = 1;  // Whether the portfolio is consistent with the chain
  uint32 tokens_verified = 2;  // Number of tokens verified
  uint32 inconsistencies_found = 3;  // Number of inconsistencies found
  repeated string inconsistent_token_ids = 4;  // List of inconsistent token IDs
}

message AttestationVerificationResult {
  bool consistent = 1;  // Whether attestations are consistent with the chain
  uint32 attestations_verified = 2;  // Number of attestations verified
  uint32 inconsistencies_found = 3;  // Number of inconsistencies found
  repeated string inconsistent_attestation_ids = 4;  // List of inconsistent attestation IDs
}

message ChainSegment {
  uint64 sequence_number = 1;  // Sequence number
  bytes entry_hash = 2;  // Hash of the entry
  bytes previous_hash = 3;  // Hash of the previous entry
  uint64 timestamp_ms = 4;  // Timestamp
  bytes content_hash = 5;  // Hash of the content (if not included)
  bytes content = 6;  // Content (if included)
  string entry_type = 7;  // Type of entry
}

// Synchronization Primitives
message SyncVectorClock {
  map<string, uint64> clock_values = 1;  // Node ID to logical clock value
  uint64 timestamp_ms = 2;  // Timestamp when the clock was updated
  string originator_id = 3;  // ID of the node that originated this clock
  map<string, SlotCategory> slot_categories = 4;  // Categorization of sync slots
  
  // Note: SyncVectorClock is used for creating prioritization for sync data with slot categories:
  // - Essentials: Mostly token related with redundancy between assigned peers
  // - Optionals: Primarily for attestations
  // - Wildcards: For poll-tokens and transparent poll following
  // Slot assignment may shift according to machine learning algorithms as the system evolves.
}

// Categorization of sync slots for prioritization
message SlotCategory {
  enum Category {
    ESSENTIAL = 0;  // Must sync, token-related with peer redundancy
    OPTIONAL = 1;   // Attestations and non-critical data
    WILDCARD = 2;   // Poll-tokens and poll following
  }
  Category category = 1;
  uint32 priority = 2;  // Priority within category (lower is higher priority)
  string reason = 3;    // Reason for categorization
}

message ConflictResolutionRequest {
  juicetokens.token.model.Token local_token = 1;  // Local version of token
  juicetokens.token.model.Token remote_token = 2;  // Remote version of token
  bool force_local = 3;  // Force local version if true
  bool force_remote = 4;  // Force remote version if true
}

message MerkleDifference {
  bytes merkle_root = 1;  // Root hash of the Merkle tree
  repeated bytes missing_hashes = 2;  // Hashes that are missing
  map<string, bytes> hash_to_node_map = 3;  // Map from hash to node data
}

message SynchronizationSession {
  string session_id = 1;  // Unique session identifier
  uint64 started_ms = 2;  // When the session started
  uint64 last_activity_ms = 3;  // Last activity timestamp
  enum SessionState {
    INITIALIZING = 0;
    COMPARING = 1;
    TRANSFERRING = 2;
    RESOLVING_CONFLICTS = 3;
    FINALIZING = 4;
    COMPLETED = 5;
    FAILED = 6;
  }
  SessionState state = 4;
  uint32 progress_percent = 5;  // Progress percentage (0-100)
  string peer_id = 6;  // Identifier of the peer
}
```

### foundation/monitoring.proto (NEW)

```protobuf
syntax = "proto3";

package juicetokens.foundation.monitoring;

// Core telemetry message
message Telemetry {
  string instance_id = 1;              // Instance identifier
  uint64 timestamp_ms = 2;             // Timestamp
  string component = 3;                // Component generating telemetry
  string version = 4;                  // Component version
  string event_type = 5;               // Type of event
  TelemetryLevel level = 6;            // Severity/importance level
  map<string, string> dimensions = 7;  // Dimensions for filtering/aggregation
  map<string, double> metrics = 8;     // Numeric metrics
  repeated string tags = 9;            // Tags for categorization
  bytes payload = 10;                  // Optional additional data
  string user_id = 11;                 // User identifier (if applicable)
  string correlation_id = 12;          // For correlating related events
}

enum TelemetryLevel {
  DEBUG = 0;      // Detailed debugging information
  INFO = 1;       // Normal operational events
  WARN = 2;       // Potential issues that don't disrupt operation
  ERROR = 3;      // Errors that disrupt normal operation
  CRITICAL = 4;   // Critical failures requiring immediate attention
}

// System health monitoring
message SystemHealth {
  string instance_id = 1;              // Instance identifier
  uint64 timestamp_ms = 2;             // Timestamp
  SystemStatus status = 3;             // Overall status
  repeated ComponentStatus components = 4; // Component statuses
  map<string, ResourceMetric> resources = 5; // Resource usage
}

enum SystemStatus {
  HEALTHY = 0;           // System is healthy
  DEGRADED = 1;          // System is degraded but functioning
  CRITICAL = 2;          // System is in critical state
  MAINTENANCE = 3;       // System is in maintenance mode
  INITIALIZING = 4;      // System is initializing
}

message ComponentStatus {
  string component_id = 1;     // Component identifier
  string version = 2;          // Component version
  SystemStatus status = 3;     // Component status
  string status_message = 4;   // Status message
  uint64 uptime_seconds = 5;   // Uptime in seconds
  map<string, string> metrics = 6; // Component-specific metrics
}

message ResourceMetric {
  string resource_id = 1;      // Resource identifier
  float utilization = 2;       // Utilization percentage (0.0-1.0)
  float threshold = 3;         // Threshold for alerts
  string unit = 4;             // Unit of measurement
}
```

## Layer 2: Transport Layer

### transport/pipe.proto

```protobuf
syntax = "proto3";

package juicetokens.transport.pipe;

// Transport Protocol Handlers
enum PipeType {
  QR_KISS = 0;  // Visual QR code exchange
  BLE = 1;      // Bluetooth Low Energy
  NFC = 2;      // Near Field Communication
  WEB = 3;      // Web-based (HTTPS)
}

message PipeConfiguration {
  PipeType pipe_type = 1;
  // Common configuration
  string pipe_id = 2;  // Unique identifier for this pipe
  uint32 timeout_ms = 3;  // Timeout in milliseconds
    
  // Type-specific configuration
  oneof type_config {
    QrKissConfig qr_kiss = 4;
    BleConfig ble = 5;
    NfcConfig nfc = 6;
    WebConfig web = 7;
  }
}

message QrKissConfig {
  uint32 qr_code_version = 1;  // QR code version
  string error_correction_level = 2;  // L, M, Q, H
  uint32 chunk_size_bytes = 3;  // Size of each chunk in bytes
  uint32 display_size_pixels = 4;  // Display size in pixels
}

message BleConfig {
  string service_uuid = 1;  // BLE service UUID
  string characteristic_uuid = 2;  // BLE characteristic UUID
  bool require_bonding = 3;  // Whether bonding is required
}

message NfcConfig {
  string aid = 1;  // Application identifier
  bool use_secure_element = 2;  // Whether to use secure element
}

message WebConfig {
  string endpoint_url = 1;  // Endpoint URL
  bool use_websocket = 2;  // Whether to use WebSocket
  map<string, string> headers = 3;  // HTTP headers
}

message PipeStatus {
  string pipe_id = 1;  // Pipe identifier
  PipeType pipe_type = 2;  // Type of pipe
  enum State {
    INITIALIZING = 0;
    READY = 1;
    CONNECTED = 2;
    TRANSFERRING = 3;
    DISCONNECTED = 4;
    ERROR = 5;
  }
  State state = 3;
  string error_message = 4;  // Error message if state is ERROR
  uint64 bytes_sent = 5;  // Number of bytes sent
  uint64 bytes_received = 6;  // Number of bytes received
  uint32 round_trip_time_ms = 7;  // Average round-trip time
}

message PipeCapabilities {
  PipeType pipe_type = 1;  // Type of pipe
  uint32 max_message_size_bytes = 2;  // Maximum message size
  uint32 max_throughput_bytes_per_second = 3;  // Maximum throughput
  bool supports_bidirectional = 4;  // Whether bidirectional communication is supported
  bool requires_user_interaction = 5;  // Whether user interaction is required
  bool supports_background_operation = 6;  // Whether background operation is supported
}

// Pipe operations
message PipeCreateRequest {
  PipeConfiguration configuration = 1;  // Pipe configuration
  string target_info = 2;  // Target information (e.g., device ID, URL)
}

message PipeCreateResponse {
  bool success = 1;  // Whether creation succeeded
  string pipe_id = 2;  // Pipe identifier
  PipeStatus status = 3;  // Initial status
  PipeCapabilities capabilities = 4;  // Pipe capabilities
  string error_message = 5;  // Error message if creation failed
}

message PipeCloseRequest {
  string pipe_id = 1;  // Pipe identifier
}

message PipeCloseResponse {
  bool success = 1;  // Whether close succeeded
  string error_message = 2;  // Error message if close failed
}

message PipeStatusRequest {
  string pipe_id = 1;  // Pipe identifier
}

message PipeStatusResponse {
  PipeStatus status = 1;  // Pipe status
  map<string, string> metrics = 2;  // Additional metrics
}
```

### transport/native_bridge.proto (NEW)

```protobuf
syntax = "proto3";

package juicetokens.transport.native_bridge;

// Serves as bridge between PWA and native components
message NativeBridgeRequest {
  string request_id = 1;         // Unique request identifier
  RequestType request_type = 2;  // Type of request
  bytes payload = 3;             // Request payload
  uint32 timeout_ms = 4;         // Request timeout
  bool requires_tee = 5;         // Whether TEE is required
}

enum RequestType {
  SECURE_STORAGE = 0;      // Access secure storage
  CRYPTO_OPERATION = 1;    // Perform cryptographic operation
  CONNECTIVITY = 2;        // Access connectivity features (BLE, NFC)
  SENSOR = 3;              // Access device sensors
  NOTIFICATION = 4;        // Manage notifications
  SECURE_DISPLAY = 5;      // Request secure UI display
}

message NativeBridgeResponse {
  string request_id = 1;       // Matching request identifier
  bool success = 2;            // Whether the request succeeded
  bytes response_data = 3;     // Response data
  string error_message = 4;    // Error message if unsuccessful
  repeated Capability detected_capabilities = 5; // Discovered device capabilities
}

message Capability {
  string capability_id = 1;    // Capability identifier
  string display_name = 2;     // Human-readable name
  bool available = 3;          // Whether available
  map<string, string> parameters = 4; // Capability-specific parameters
}

// TEE (Trusted Execution Environment) integration
message TeeRequest {
  string operation = 1;        // Operation to perform
  bytes input_data = 2;        // Input data
  string key_identifier = 3;   // Key identifier if needed
  bytes authentication_data = 4; // Data for TEE authentication
}

message TeeResponse {
  bool success = 1;            // Whether the operation succeeded
  bytes output_data = 2;       // Output data
  bytes attestation = 3;       // TEE attestation
  string error_code = 4;       // Error code if unsuccessful
}
```

### transport/message.proto and transport/network.proto

These follow the same pattern as shown in the original Protocol Buffer Implementation Guide document. For brevity, they are not reproduced here, but should be implemented based on the original specifications.

## Layer 3: Core Token Layer

### token/model.proto

```protobuf
syntax = "proto3";

package juicetokens.token.model;

// Token Model
message TokenId {
  string full_id = 1;  // Complete token ID: LOCATION-REFERENCE-VALUE-INDEX
    
  // Parsed components
  string location = 2;  // S2 cell ID (e.g., "89c258")
  string reference = 3;  // Unique reference ID (e.g., "REF123")
  uint32 value = 4;  // Denomination value (e.g., 50)
  uint32 index = 5;  // Sequence number (e.g., 1)
}

message Token {
  TokenId id = 1;  // Token identifier
  string batch_id = 2;  // Batch identifier (LOCATION-REFERENCE)
    
  TokenMetadata meta = 3;  // Token metadata
  TokenTime time = 4;  // Time-related information
  Telomeer telomere = 5;  // Ownership information
}

message TokenMetadata {
  string scenario = 1;  // Usage scenario, default: "default"
  string asset = 2;  // Asset type, default: "default"
  string expiry = 3;  // Optional expiry date (ISO format)
  map<string, string> custom_attributes = 4;  // Custom attributes
}

message TokenTime {
  string creation_time = 1;  // When the token was created (ISO format)
  string last_transaction_time = 2;  // Last transaction time (ISO format)
  string expiry_time = 3;  // Expiry time (ISO format), if applicable
}

// Denomination system
enum DenominationValue {
  ONE = 1;
  TWO = 2;
  FIVE = 5;
  TEN = 10;
  TWENTY = 20;
  FIFTY = 50;
  ONE_HUNDRED = 100;
  TWO_HUNDRED = 200;
  FIVE_HUNDRED = 500;
}

// Special token types
message WisselToken {
  Token token = 1;  // Base token (always denomination ONE)
  float afrondingsbuffer = 2;  // Fractional value buffer (0.0-0.99)
  bool is_wisseltoken = 3;  // Always true, for validation
  
  // Note: Each user has exactly ONE wisseltoken that handles fractional amounts
  // The afrondingsbuffer stores values less than 1.0 that cannot be represented
  // by the discrete token denominations
  // IMPORTANT: WisselToken and afrondingsbuffer are ONLY used for immediate transactions
  // Escrows and other smart token actions always use round numbers
  
  // IMPORTANT CONSTRAINTS:
  // 1. The Wisseltoken becomes unspendable if it's the last token (or one of the last two tokens)
  //    left from an issuance in a user's portfolio
  // 2. This enforces an "all or nothing" rule for the final tokens - you either spend your
  //    whole Wisseltoken including afrondingsbuffer or you keep it
  // 3. The system enforces a minimum account balance (>2) to ensure there's always a token
  //    to log back the updated afrondingsbuffer after small transactions
  // 4. This prevents issues with trying to track a floating afrondingsbuffer without a
  //    token to attach it to
}

// Utility functions (to be implemented in code, not protobuf)
// parseTokenId(string) -> TokenId
// getTokenValue(string) -> uint32
// formatTokenId(string) -> string
```

### token/denomination.proto (NEW)

```protobuf
syntax = "proto3";

package juicetokens.token.denomination;

import "token/model.proto";

// Enhanced denomination management
message DenominationDistribution {
  string user_id = 1;                    // User identifier
  map<uint32, uint32> counts = 2;        // Map of denomination to count
  float distribution_score = 3;          // Optimality score (0.0-1.0)
  repeated DenominationStatus statuses = 4; // Detailed status by denomination
}

message DenominationStatus {
  uint32 value = 1;                      // Denomination value
  uint32 count = 2;                      // Number of tokens
  enum Status {
    SHORTAGE = 0;          // Too few of this denomination
    OPTIMAL = 1;           // Optimal number
    SMALL_RESERVE = 2;     // Slightly more than needed
    EXCESS = 3;            // Far more than needed
  }
  Status status = 3;                     // Current status
  uint32 optimal_count = 4;              // Calculated optimal count
}

message DenominationOptimizationRequest {
  string user_id = 1;                    // User identifier
  map<uint32, uint32> current_counts = 2; // Current distribution
  repeated uint32 typical_transaction_amounts = 3; // Typical transaction amounts
  bool include_recommendations = 4;      // Whether to include recommendations
}

message DenominationOptimizationResponse {
  DenominationDistribution current = 1;  // Current distribution
  DenominationDistribution optimal = 2;  // Optimal distribution
  repeated DenominationSwap recommended_swaps = 3; // Recommended swaps
}

message DenominationSwap {
  repeated uint32 give_denominations = 1; // Denominations to give
  repeated uint32 receive_denominations = 2; // Denominations to receive
  float improvement_score = 3;           // Expected improvement (0.0-1.0)
}

// Vector clock specifically for denomination optimization
message DenominationVectorClock {
  map<uint32, uint32> status_codes = 1;  // Denomination to status code mapping
  uint64 timestamp_ms = 2;               // Timestamp of the vector clock
  string user_id = 3;                    // User identifier
  bytes signature = 4;                   // Signature for verification
  
  // Key: Denomination value (1, 2, 5, 10, 20, 50, 100, 200, 500)
  // Value: Status code using 2-bit encoding:
  //   00 (0) = Lack (shortage)
  //   01 (1) = Slightly wanting
  //   10 (2) = Good (optimal)
  //   11 (3) = Excess (abundance)
  
  // Functions:
  // 1. Calculates ideal token denomination distribution (approx. five tokens of each
  //    denomination with fewer high-value tokens unless balance > 4440)
  // 2. Shares denomination status to optimize token exchange during transactions
  // This mechanism helps peers select optimal tokens to exchange, improving
  // overall system-wide denomination distribution.
  
  // Note: DenominationVectorClock is used for optimizing token selection during transactions
  // by communicating denomination differentials. It is entirely separate from
  // SyncVectorClock used for synchronization prioritization.
}
```

### token/telomeer.proto and token/transaction.proto

These follow the same pattern as shown in the original Protocol Buffer Implementation Guide document. For brevity, they are not reproduced here, but should be implemented based on the original specifications.

## Layer 4: Trust and Attestation Layer

The trust protocol files (attestation.proto, reputation.proto, identity.proto) follow the same pattern as shown in the original Protocol Buffer Implementation Guide. For brevity, they are not reproduced here, but should be implemented based on the original specifications.

### trust/privacy.proto (NEW)

```protobuf
syntax = "proto3";

package juicetokens.trust.privacy;

// User privacy preferences and controls
message PrivacyPreferences {
  string user_id = 1;               // User identifier
  DataSharingLevel data_sharing = 2; // Data sharing level
  map<string, SharingPreference> feature_preferences = 3; // Per-feature preferences
  repeated DataMinimizationRule minimization_rules = 4; // Data minimization rules
  uint64 last_updated_ms = 5;       // Last update timestamp
}

enum DataSharingLevel {
  MINIMAL = 0;        // Share only what's needed for basic functionality
  STANDARD = 1;       // Standard data sharing
  EXTENSIVE = 2;      // Share additional data for enhanced functionality
  FULL = 3;           // Share all data (development/debugging)
}

message SharingPreference {
  string feature_id = 1;        // Feature identifier
  bool enabled = 2;             // Whether the feature is enabled
  DataSharingLevel level = 3;   // Sharing level for this feature
  bool allow_storage = 4;       // Whether data can be stored
  uint32 retention_days = 5;    // Data retention period in days
}

message DataMinimizationRule {
  string rule_id = 1;           // Rule identifier
  string data_category = 2;     // Category of data
  MinimizationAction action = 3; // Action to take
  string target_field = 4;      // Target field
  bytes transformation_parameters = 5; // Parameters for transformation
}

enum MinimizationAction {
  REDACT = 0;         // Completely redact the data
  TRUNCATE = 1;       // Truncate to minimal length
  HASH = 2;           // Replace with hash
  GENERALIZE = 3;     // Replace with more general category
  DIFFERENTIAL_PRIVACY = 4; // Apply differential privacy
}

// Consent management
message ConsentRecord {
  string user_id = 1;           // User identifier
  string consent_type = 2;      // Type of consent
  string scope = 3;             // Scope of consent
  bool granted = 4;             // Whether consent was granted
  uint64 timestamp_ms = 5;      // When consent was recorded
  string version = 6;           // Version of consent agreement
  bytes signature = 7;          // Cryptographic signature
}
```

## Layer 5: Token Lifecycle Layer

The lifecycle protocol files (creation.proto, renewal.proto, future.proto) follow the same pattern as shown in the original Protocol Buffer Implementation Guide. For brevity, they are not reproduced here, but should be implemented based on the original specifications.

### lifecycle/developmental_stage.proto (NEW)

```protobuf
syntax = "proto3";

package juicetokens.lifecycle.developmental_stage;

// Tracks user developmental stages as described in the 
// "De Zeven Fasen van Technologische Transcendentie" document
message UserDevelopmentalStageStatus {
  string user_id = 1;                    // User identifier
  DevelopmentalStageLevel current_stage = 2;          // Current stage
  float stage_progression = 3;           // Progress within stage (0.0-1.0)
  map<string, StageMetric> stage_metrics = 4; // Metrics by category
  uint64 stage_entered_ms = 5;           // When user entered current stage
  repeated StageTransition transitions = 6; // History of stage transitions
}

enum DevelopmentalStageLevel {
  TRUST = 0;              // Stage 1: The Source of Trust
  AUTONOMY = 1;           // Stage 2: The Seed of Autonomy
  IMAGINATION = 2;        // Stage 3: The Wings of Imagination
  COMPETENCE = 3;         // Stage 4: The Ground of Competence
  IDENTITY = 4;           // Stage 5: The Mirror of Identity
  CONNECTION = 5;         // Stage 6: The Bridge of Connection
  GENERATIVITY = 6;       // Stage 7: The Harvest of Generativity
}

message StageMetric {
  string metric_name = 1;        // Name of the metric
  float value = 2;               // Current value
  float threshold = 3;           // Threshold for advancement
  string description = 4;        // Human-readable description
}

message StageTransition {
  DevelopmentalStageLevel from_stage = 1;     // Starting stage
  DevelopmentalStageLevel to_stage = 2;       // Destination stage
  uint64 timestamp_ms = 3;       // When the transition occurred
  string trigger_event = 4;      // What triggered the transition
  repeated string attestations = 5; // Attestations supporting transition
}

// Stage-specific metrics for each developmental stage
message TrustStageMetrics {
  uint32 successful_connections = 1;     // Number of successful connections
  uint32 unique_connections = 2;         // Number of unique connections
  uint32 small_transactions_completed = 3; // Small transactions completed
  uint64 tokens_received = 4;            // Tokens received
  uint32 welcome_attestations_received = 5; // Welcome attestations received
}

message AutonomyStageMetrics {
  uint32 boundary_setting_actions = 1;   // Boundary-setting actions
  uint32 preferences_customized = 2;     // Preferences customized
  float profile_completeness = 3;        // Profile completeness (0.0-1.0)
  float identity_consistency = 4;        // Identity consistency (0.0-1.0)
  uint32 independent_decisions = 5;      // Independent decisions made
  uint32 transaction_initiations = 6;    // Transaction initiations
}

// Additional stage-specific metrics would be defined for each stage
```

## Layer 6: Extension Layer (NEW)

### extension/extension_point.proto

```protobuf
syntax = "proto3";

package juicetokens.extension.extension_point;

// Defines the interface for extension points
message ExtensionPoint {
  string extension_point_id = 1;  // Unique identifier for the extension point
  string description = 2;          // Description of the extension point
  repeated string supported_features = 3; // Features supported by the extension point
}
```

### extension/registry.proto

```protobuf
syntax = "proto3";

package juicetokens.extension.registry;

// Defines the interface for extension registration and discovery
message ExtensionRegistration {
  string extension_id = 1;        // Unique identifier for the extension
  string name = 2;                // Name of the extension
  string description = 3;          // Description of the extension
  repeated string supported_features = 4; // Features supported by the extension
}

message ExtensionDiscoveryRequest {
  string query = 1;                // Query string for extension discovery
  repeated string supported_features = 2; // Features required by the extension
}

message ExtensionDiscoveryResponse {
  repeated ExtensionRegistration registered_extensions = 1; // Registered extensions
}
```

## Layer 7: Governance Layer (NEW)

### governance/monitoring.proto

```protobuf
syntax = "proto3";

package juicetokens.governance.monitoring;

// System monitoring interface
message SystemMonitoring {
  string instance_id = 1;              // Instance identifier
  uint64 timestamp_ms = 2;             // Timestamp
  SystemStatus status = 3;             // Overall status
  repeated ComponentStatus components = 4; // Component statuses
  map<string, ResourceMetric> resources = 5; // Resource usage
}

enum SystemStatus {
  HEALTHY = 0;           // System is healthy
  DEGRADED = 1;          // System is degraded but functioning
  CRITICAL = 2;          // System is in critical state
  MAINTENANCE = 3;       // System is in maintenance mode
  INITIALIZING = 4;      // System is initializing
}

message ComponentStatus {
  string component_id = 1;     // Component identifier
  string version = 2;          // Component version
  SystemStatus status = 3;     // Component status
  string status_message = 4;   // Status message
  uint64 uptime_seconds = 5;   // Uptime in seconds
  map<string, string> metrics = 6; // Component-specific metrics
}

message ResourceMetric {
  string resource_id = 1;      // Resource identifier
  float utilization = 2;       // Utilization percentage (0.0-1.0)
  float threshold = 3;         // Threshold for alerts
  string unit = 4;             // Unit of measurement
}
```

### governance/versioning.proto

```protobuf
syntax = "proto3";

package juicetokens.governance.versioning;

// Protocol version management
message ProtocolVersion {
  string version = 1;          // Protocol version
  string description = 2;      // Description of the protocol version
  uint64 timestamp_ms = 3;     // Timestamp of the version
}

message VersionDiscoveryRequest {
  string query = 1;            // Query string for version discovery
}

message VersionDiscoveryResponse {
  repeated ProtocolVersion available_versions = 1; // Available protocol versions
}
```

## MonoRepo Integration

The protocol buffer definitions should be structured in a monorepo setup that supports both the Docker test environment and the final PWA + native app implementation:

```
juicetokens/
├── proto/                      # Protocol definitions (shared)
│   ├── foundation/
│   ├── transport/
│   ├── token/
│   ├── trust/
│   ├── lifecycle/
│   ├── extension/              # NEW
│   └── governance/             # NEW
├── packages/
│   ├── core/                   # Core implementations (shared)
│   │   ├── foundation/
│   │   ├── transport/
│   │   ├── token/
│   │   ├── trust/
│   │   ├── lifecycle/
│   │   ├── extension/          # NEW
│   │   └── governance/         # NEW
│   ├── test-server/            # Docker test implementation
│   ├── pwa/                    # Progressive Web App
│   └── native/                 # Native app components
├── tools/
│   ├── proto-compiler/         # Protocol buffer compiler
│   └── test-utilities/         # Testing utilities
└── scripts/                    # Build and CI/CD scripts
```

## Implementation Priorities

For the initial five layers needed for first user testing, focus implementation in this order:

1. **Foundation Layer**: Complete base implementation including new monitoring protocol
   - Hardware abstraction layer for device capabilities
   - Persistence mechanisms with TokenStore and DHT
   - Time synchronization and spoofing detection
   - Basic monitoring capabilities

2. **Transport Layer**: Implement core transport with native bridge for hardware access
   - Pipe abstraction with QR Kiss, BLE, NFC support
   - Message framing and reliability
   - Native bridge for hardware access
   - Network topology and peer discovery

3. **Token Layer**: Implement token model, telomeer, and transaction protocols
   - Core token model with denomination system
   - Telomeer ownership tracking
   - Four-packet transaction model
   - Atomic commitment protocol

4. **Trust Layer**: Implement basic trust, reputation, and identity protocols
   - Attestation system with DHT storage
   - Reputation calculation
   - Identity management with key rotation
   - Basic privacy controls

5. **Lifecycle Layer**: Implement creation and renewal
   - Token creation with egg/fertilization metaphor
   - Renewal and expiry management
   - Basic developmental stage tracking for user development
   - Future value representation

Later phases can implement the extension and governance layers, along with additional features of the core layers.

## Testing Strategy

Each protocol component should be tested with:

1. **Serialization Tests**: Verify proper serialization/deserialization
2. **Validation Tests**: Confirm field constraints and relationships
3. **Edge Case Tests**: Handle minimum/maximum values
4. **Evolution Tests**: Ensure backward compatibility
5. **Integration Tests**: Verify interaction between protocol components

## Implementation Tooling

Use the following tooling for efficient protocol implementation:

```bash
# Generate TypeScript interfaces from protocol buffers
npm run generate-proto-types

# Validate protocol buffer definitions
npm run validate-protos

# Generate documentation from protocol buffers
npm run generate-proto-docs
```

## Next Steps

1. Generate TypeScript/JavaScript interfaces from protocol definitions
2. Implement serialization/deserialization utilities
3. Create mock implementations for testing
4. Develop validation utilities for each protocol message
5. Set up continuous testing for protocol compatibility

This guide provides a comprehensive framework for implementing the complete protocol buffer structure for the JuiceTokens ecosystem, including the expanded definitions needed to fulfill the seven-phase developmental model.

## Token Flow Management

message BalanceVerification {
  string owner_id = 1;  // Owner identifier
  uint64 total_value = 2;  // Total value of tokens
  repeated DenominationCount denomination_counts = 3;  // Counts by denomination
  bool sufficient_for_amount = 4;  // Whether sufficient for specified amount
  uint64 requested_amount = 5;  // Requested amount
}

// Rules enforcing minimum balance and token spending constraints
message TokenSelectionConstraint {
  bool enforce_min_account_balance = 1;  // Whether to enforce minimum account balance
  uint32 min_tokens_required = 2;  // Minimum tokens required (default: 2)
  bool protect_last_issuance_tokens = 3;  // Whether to protect last tokens of an issuance
  string issuance_id = 4;  // Issuance identifier (LOCATION-REFERENCE)
  uint32 issuance_min_tokens = 5;  // Minimum tokens per issuance (default: 2)
  
  // When a user tries to spend tokens from their portfolio, these constraints
  // ensure that:
  // 1. A minimum account balance is maintained (typically >2 tokens)
  // 2. The Wisseltoken is protected from being spent if it would leave fewer
  //    than the specified minimum tokens from a given issuance
  // 3. This creates an "all or nothing" rule for the final tokens of an issuance
}

message DenominationCount {
  uint32 denomination = 1;  // Denomination value
  uint32 count = 2;  // Number of tokens
}
