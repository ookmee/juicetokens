# JuiceTokens Protocol Buffer Implementation Guide

This document provides structured Protocol Buffer (protobuf) templates and implementation guidance for the JuiceTokens ecosystem. Each section contains:

1. A `.proto` file template with detailed comments
2. Implementation notes for Cursor AI
3. Examples for complex concepts

## Project Structure Recommendation

Organize the protobuf files in a layered structure that mirrors the architecture:

```
protos/
├── foundation/
│   ├── hardware.proto
│   ├── persistence.proto
│   └── time.proto
├── transport/
│   ├── pipe.proto
│   ├── message.proto
│   ├── network.proto
│   └── native_bridge.proto
├── token/
│   ├── model.proto
│   ├── telomeer.proto
│   ├── denomination.proto
│   └── transaction.proto
├── trust/
│   ├── attestation.proto
│   ├── reputation.proto
│   ├── identity.proto
│   └── privacy.proto
├── lifecycle/
│   ├── creation.proto
│   ├── renewal.proto
│   ├── future.proto
│   └── developmental_stage.proto
├── extension/
│   ├── extension_point.proto
│   └── registry.proto
├── governance/
│   ├── versioning.proto
│   └── monitoring.proto
└── tokenengine.proto
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

// Time status verification for transactions
message TimeStatusVerification {
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
```

**Implementation Notes:**
- These messages define the hardware abstraction layer for JuiceTokens
- The TEE Integration Interface is critical for secure key operations
- Device Capability Discovery helps determine available features for progressive enhancement
- Time Source Management is essential for transaction security and expiry handling

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

// Synchronization Primitives
message SyncVectorClock {
  map<string, uint64> clock_values = 1;  // Node ID to logical clock value
  uint64 timestamp_ms = 2;  // Timestamp when the clock was updated
  string originator_id = 3;  // ID of the node that originated this clock
  
  // Note: SyncVectorClock is used for creating fuzzy memberships to prioritize
  // relevant data during synchronization. It is entirely separate from
  // DenominationVectorClock used for token denomination optimization.
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

// Personal Chain Management
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
```

**Implementation Notes:**
- The TokenStore is the primary local storage mechanism for JuiceTokens
- The Distributed Hash Table (DHT) enables decentralized content-addressable storage
- S2CellReference provides geospatial indexing for location-based features
- SyncVectorClock is particularly important for token denomination optimization
- In JuiceTokens, the SyncVectorClock is used to represent token denomination distribution status
- Personal Chain Management allows users to maintain a verifiable history of their DHT contributions

### foundation/time.proto

```protobuf
syntax = "proto3";

package juicetokens.foundation.time;

// Additional time-related messages beyond those in hardware.proto
message TimeIntegrityRequest {
  repeated string time_source_types = 1;  // Requested time source types
  bool require_high_confidence = 2;  // Whether high confidence is required
}

message TimeIntegrityResponse {
  int64 timestamp_ms = 1;  // Current timestamp in milliseconds
  uint32 confidence_score = 2;  // 0-100 confidence score
  repeated TimeSourceStatus sources = 3;  // Status of all time sources
  bool integrity_verified = 4;  // Whether time integrity is verified
}

message TimeSourceStatus {
  string source_type = 1;  // Type of time source
  bool available = 2;  // Whether the source is available
  int64 reported_time_ms = 3;  // Time reported by this source
  uint32 confidence_score = 4;  // 0-100 confidence score
  int64 deviation_ms = 5;  // Deviation from consensus in milliseconds
}

message TimestampProof {
  int64 timestamp_ms = 1;  // Timestamp in milliseconds
  bytes signature = 2;  // Cryptographic signature of the timestamp
  string signing_authority = 3;  // Who signed the timestamp
  bytes additional_proof = 4;  // Additional proof data (e.g., TSA response)
}
```

**Implementation Notes:**
- Time integrity is crucial for secure transactions and preventing replay attacks
- The system should use multiple time sources for verification when available
- TimestampProof can be used for non-repudiation in transaction finalization

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

**Implementation Notes:**
- The Pipe abstraction provides a unified interface for different communication methods
- QR Kiss Protocol is particularly important for offline operation
- Each pipe type has specific configuration needs
- The pipe API is uniform regardless of the underlying transport

### transport/message.proto

```protobuf
syntax = "proto3";

package juicetokens.transport.message;

// Message Framing and Serialization
message MessageFrame {
  uint32 protocol_version = 1;  // Protocol version
  string message_id = 2;  // Unique message identifier
  FrameType frame_type = 3;  // Type of frame
  uint64 timestamp_ms = 4;  // Timestamp in milliseconds
  
  // Optional fields
  uint32 chunk_index = 5;  // Index of this chunk (if chunked)
  uint32 total_chunks = 6;  // Total number of chunks (if chunked)
  uint32 sequence_number = 7;  // Sequence number for ordering
  CompressionType compression = 8;  // Compression algorithm used
  
  // Actual message payload
  bytes payload = 9;  // Message payload (protobuf encoded)
  string payload_type = 10;  // Type of payload (fully qualified protobuf name)
  
  // Integrity and authentication
  bytes signature = 11;  // Signature of the payload
  string signer_id = 12;  // Identifier of the signer
}

enum FrameType {
  DATA = 0;            // Regular data frame
  CONTROL = 1;         // Control frame (e.g., ACK, NAK)
  HANDSHAKE = 2;       // Connection establishment
  CLOSE = 3;           // Connection termination
  FRAGMENT = 4;        // Fragment of a larger message
  KEEPALIVE = 5;       // Keep-alive ping
}

enum CompressionType {
  NONE = 0;            // No compression
  GZIP = 1;            // GZIP compression
  LZ4 = 2;             // LZ4 compression
  ZSTD = 3;            // Zstandard compression
}

message ChunkInfo {
  string original_message_id = 1;  // ID of the original message
  uint32 total_chunks = 2;  // Total number of chunks
  uint32 chunk_size_bytes = 3;  // Size of each chunk in bytes
  uint64 total_size_bytes = 4;  // Total size in bytes
  bytes checksum = 5;  // Checksum of the complete message
}

// Reliability and Recovery
message Acknowledgment {
  string message_id = 1;  // ID of the acknowledged message
  bool success = 2;  // Whether processing succeeded
  string error_message = 3;  // Error message if processing failed
  uint64 timestamp_ms = 4;  // Timestamp of acknowledgment
}

message SessionResumptionToken {
  string session_id = 1;  // Unique session identifier
  uint64 timestamp_ms = 2;  // Timestamp when token was created
  uint32 last_sequence_number = 3;  // Last successfully processed sequence number
  bytes session_key = 4;  // Encrypted session key
  uint32 expiry_seconds = 5;  // Seconds until token expires
  bytes signature = 6;  // Signature for verification
}

message RecoveryRequest {
  string session_id = 1;  // Session identifier
  uint32 from_sequence_number = 2;  // Sequence number to resume from
  SessionResumptionToken resumption_token = 3;  // Resumption token
}

message TransportError {
  enum ErrorType {
    NETWORK = 0;       // Network-related error
    PROTOCOL = 1;      // Protocol-related error
    SECURITY = 2;      // Security-related error
    RESOURCE = 3;      // Resource-related error
    TIMEOUT = 4;       // Timeout error
    INTERNAL = 5;      // Internal error
  }
  ErrorType error_type = 1;
  string error_code = 2;  // Specific error code
  string error_message = 3;  // Human-readable error message
  bool recoverable = 4;  // Whether the error is recoverable
  string recovery_hint = 5;  // Hint for recovery
}
```

**Implementation Notes:**
- The MessageFrame is the core container for all protocol messages
- Chunking support is critical for transports with size limitations (like QR codes)
- Compression options help optimize bandwidth usage
- Recovery mechanisms are essential for reliability in spotty connectivity
- The session resumption token enables recovery after disconnections

### transport/network.proto

```protobuf
syntax = "proto3";

package juicetokens.transport.network;

// Peer Discovery Module
message PeerDiscoveryRequest {
  repeated string discovery_methods = 1;  // Methods to use for discovery
  uint32 max_results = 2;  // Maximum number of results
  uint32 timeout_ms = 3;  // Timeout in milliseconds
  bytes discovery_token = 4;  // Optional token for authenticated discovery
}

message PeerInfo {
  string peer_id = 1;  // Unique peer identifier
  repeated string supported_pipe_types = 2;  // Supported pipe types
  string display_name = 3;  // Human-readable name
  bytes public_key = 4;  // Public key for authentication
  uint32 protocol_version = 5;  // Protocol version
  float signal_strength = 6;  // Signal strength (0.0-1.0)
  uint32 distance_estimate_meters = 7;  // Estimated distance
}

message BootstrapNode {
  string node_id = 1;  // Node identifier
  string address = 2;  // Address (URL, IP, etc.)
  uint64 last_seen_ms = 3;  // When the node was last seen
  bool verified = 4;  // Whether the node is verified
}

message ServiceAdvertisement {
  string service_id = 1;  // Service identifier
  string service_name = 2;  // Human-readable name
  string service_description = 3;  // Human-readable description
  map<string, string> service_metadata = 4;  // Service metadata
  repeated string supported_pipe_types = 5;  // Supported pipe types
  uint64 expiry_time_ms = 6;  // When the advertisement expires
  bytes signature = 7;  // Signature for verification
}

// Mesh Network Formation
message MeshConfiguration {
  string mesh_id = 1;  // Unique mesh identifier
  string mesh_name = 2;  // Human-readable name
  uint32 protocol_version = 3;  // Protocol version
  uint32 max_hops = 4;  // Maximum number of hops
  uint32 ttl_seconds = 5;  // Time-to-live in seconds
  bool enable_store_and_forward = 6;  // Whether to enable store-and-forward
  uint32 max_peers = 7;  // Maximum number of peers
}

message RoutingTable {
  message Route {
    string destination_id = 1;  // Destination identifier
    string next_hop_id = 2;  // Next hop identifier
    uint32 hop_count = 3;  // Number of hops
    uint32 estimated_latency_ms = 4;  // Estimated latency
    uint64 last_updated_ms = 5;  // When the route was last updated
  }
  repeated Route routes = 1;  // Available routes
  string local_node_id = 2;  // Local node identifier
  uint64 timestamp_ms = 3;  // Timestamp of the routing table
}

message NetworkHealthMetrics {
  uint32 connected_peers = 1;  // Number of connected peers
  float packet_loss_rate = 2;  // Packet loss rate (0.0-1.0)
  uint32 average_latency_ms = 3;  // Average latency in milliseconds
  uint32 routes_count = 4;  // Number of available routes
  uint64 bytes_transmitted = 5;  // Number of bytes transmitted
  uint64 bytes_received = 6;  // Number of bytes received
  float battery_drain_rate = 7;  // Battery drain rate (0.0-1.0)
}

message StoreAndForwardRequest {
  string message_id = 1;  // Message identifier
  string destination_id = 2;  // Destination identifier
  uint64 expiry_time_ms = 3;  // When the message expires
  uint32 priority = 4;  // Message priority (0-100)
  bytes encrypted_payload = 5;  // Encrypted message payload
  bool require_delivery_confirmation = 6;  // Whether delivery confirmation is required
}

// Connection Management
message ConnectionRequest {
  string peer_id = 1;  // Peer identifier
  repeated string preferred_pipe_types = 2;  // Preferred pipe types in order
  bytes authentication_token = 3;  // Optional authentication token
  map<string, string> connection_metadata = 4;  // Connection metadata
}

message ConnectionState {
  string connection_id = 1;  // Unique connection identifier
  string peer_id = 2;  // Peer identifier
  enum State {
    INITIALIZING = 0;
    AUTHENTICATING = 1;
    ESTABLISHED = 2;
    DEGRADED = 3;
    DISCONNECTED = 4;
    FAILED = 5;
  }
  State state = 3;
  string active_pipe_type = 4;  // Active pipe type
  uint64 established_time_ms = 5;  // When the connection was established
  uint64 last_activity_time_ms = 6;  // Last activity timestamp
  string error_message = 7;  // Error message if state is FAILED
}

message TransportNegotiation {
  string connection_id = 1;  // Connection identifier
  repeated string available_transports = 2;  // Available transport methods
  string selected_transport = 3;  // Selected transport method
  map<string, string> transport_parameters = 4;  // Transport-specific parameters
}

message QualityOfService {
  uint32 min_bandwidth_kbps = 1;  // Minimum bandwidth in kbps
  uint32 max_latency_ms = 2;  // Maximum latency in milliseconds
  float max_packet_loss = 3;  // Maximum packet loss (0.0-1.0)
  bool require_encryption = 4;  // Whether encryption is required
  bool allow_background_operation = 5;  // Whether background operation is allowed
  uint32 power_preference = 6;  // Power consumption preference (0=low, 100=high)
}
```

**Implementation Notes:**
- Peer discovery enables finding nearby devices for transactions
- The mesh network formation enables resilient communication even without internet
- Store-and-forward is crucial for offline operation
- Connection management handles the establishment and maintenance of peer connections
- Quality of service helps optimize the user experience based on device capabilities

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
  // 
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

**Implementation Notes:**
- The Token structure defines the fundamental value unit in the system
- The TokenId format (LOCATION-REFERENCE-VALUE-INDEX) encodes important information
- The WisselToken is a special token each user has exactly one of
- The afrondingsbuffer handles fractional values (0.0-0.99) that can't be represented by token denominations
- This buffer is critical for exact payments without rounding

### token/telomeer.proto

```protobuf
syntax = "proto3";

package juicetokens.token.telomeer;

import "token/model.proto";

// Telomeer Management
message Telomeer {
  string current_owner = 1;  // Public key of current owner
  string hash_previous_owner = 2;  // Hash of previous owner's public key
  repeated string hash_history = 3;  // Compressed history chain
  
  // Note: The telomeer is the ownership tracking mechanism
  // It acts as a "self-composting tail" that maintains a cryptographic
  // record of ownership without indefinite growth
}

message OwnershipProof {
  juicetokens.token.model.TokenId token_id = 1;  // Token ID
  bytes owner_signature = 2;  // Signature by the owner
  bytes tee_attestation = 3;  // TEE attestation (if available)
  uint64 timestamp_ms = 4;  // Timestamp of the proof
}

message TelomeerTransformation {
  juicetokens.token.model.TokenId token_id = 1;  // Token ID
  string previous_owner = 2;  // Current owner (will become previous)
  string new_owner = 3;  // New owner
  string transaction_id = 4;  // Associated transaction ID
  uint64 timestamp_ms = 5;  // Timestamp of transformation
  TransformationStatus status = 6;  // Status of the transformation
  bytes transformation_signature = 7;  // Cryptographic signature
}

enum TransformationStatus {
  PROVISIONAL = 0;  // Provisional transformation (not finalized)
  FINALIZED = 1;    // Finalized transformation
  REVERTED = 2;     // Reverted transformation
}

message TransformationRequest {
  juicetokens.token.model.TokenId token_id = 1;  // Token ID
  string new_owner = 2;  // New owner public key
  string transaction_id = 3;  // Transaction ID
  uint64 timestamp_ms = 4;  // Timestamp of request
}

message TransformationSignature {
  bytes signature = 1;  // TEE-generated signature
  bytes proof = 2;  // Proof of TEE authenticity
  uint64 timestamp_ms = 3;  // Timestamp of signature
  string tee_identity = 4;  // Identity of the TEE
}

message HashHistory {
  juicetokens.token.model.TokenId token_id = 1;  // Token ID
  repeated HistoryEntry entries = 2;  // History entries
}

message HistoryEntry {
  string owner_hash = 1;  // Hash of owner public key
  uint64 timestamp_ms = 2;  // Timestamp of ownership
}
```

**Implementation Notes:**
- The Telomeer is a critical concept in JuiceTokens, tracking ownership history
- It acts as a "self-composting tail" - maintaining a cryptographic history without indefinite growth
- The transformation process is how ownership changes, with provisional and finalized states
- TEE integration for signing transformations provides security

### token/transaction.proto

```protobuf
syntax = "proto3";

package juicetokens.token.transaction;

import "token/model.proto";

// Four-Packet Transaction Model
message ExoPak {
  string pak_id = 1;  // Unique package identifier
  string sender_id = 2;  // Sender's identifier
  string receiver_id = 3;  // Receiver's identifier
  repeated juicetokens.token.model.Token tokens = 4;  // Tokens in the package
  TransactionContext context = 5;  // Transaction context
  PakType pak_type = 6;  // Type of package
  PakStatus status = 7;  // Status of the package
}

enum PakType {
  S_EXO_PAK = 0;  // Sender to receiver (payment)
  R_EXO_PAK = 1;  // Receiver to sender (change)
  S_RETRO_PAK = 2;  // Sender to sender (rollback safety)
  R_RETRO_PAK = 3;  // Receiver to receiver (rollback safety)
}

enum PakStatus {
  CREATED = 0;     // Package created
  SENT = 1;        // Package sent
  RECEIVED = 2;    // Package received
  ACCEPTED = 3;    // Package accepted
  REJECTED = 4;    // Package rejected
  FINALIZED = 5;   // Package finalized
  CANCELED = 6;    // Package canceled
  TIMEDOUT = 7;    // Package timed out
}

message TransactionContext {
  string transaction_id = 1;  // Unique transaction identifier
  uint64 timestamp_ms = 2;  // Timestamp of transaction
  string message = 3;  // Optional message
  map<string, string> metadata = 4;  // Additional metadata
  uint32 timeout_seconds = 5;  // Transaction timeout
}

message RetroPak {
  string pak_id = 1;  // Unique package identifier
  string owner_id = 2;  // Owner's identifier
  repeated juicetokens.token.model.Token tokens = 3;  // Tokens in the package
  TransactionContext context = 4;  // Transaction context
  PakType pak_type = 5;  // Type of package (S_RETRO_PAK or R_RETRO_PAK)
  PakStatus status = 6;  // Status of the package
}

// Atomic Commitment Protocol
message TransactionInitiation {
  string transaction_id = 1;  // Transaction identifier
  string sender_id = 2;  // Sender identifier
  string receiver_id = 3;  // Receiver identifier
  uint64 amount = 4;  // Transaction amount
  juicetokens.token.model.WisselToken wisseltoken = 5;  // WisselToken for exact amount
  DenominationVectorClock vector_clock = 6;  // Denomination status for optimization
}

message DenominationVectorClock {
  map<uint32, uint32> denomination_status = 1;  // Denomination to status mapping
  string user_id = 2;  // User identifier
  uint64 timestamp_ms = 3;  // Timestamp when the clock was updated
  
  // Key: Denomination value (1, 2, 5, 10, 20, 50, 100, 200, 500)
  // Value: Status code using 2-bit encoding:
  //   00 (0) = Lack (shortage)
  //   01 (1) = Slightly wanting
  //   10 (2) = Good (optimal)
  //   11 (3) = Excess (abundance)
  
  // Note: DenominationVectorClock is used for optimizing token selection during transactions
  // by communicating denomination differentials. It calculates the ideal distribution
  // (approximately five tokens of each denomination with fewer high-value tokens)
  // and helps peers make better token selection decisions during transactions.
}

message TransactionPreparation {
  string transaction_id = 1;  // Transaction identifier
  bool sender_prepared = 2;  // Whether sender is prepared
  bool receiver_prepared = 3;  // Whether receiver is prepared
  string s_exo_pak_id = 4;  // Sender's exo-pak identifier
  string r_exo_pak_id = 5;  // Receiver's exo-pak identifier
  string s_retro_pak_id = 6;  // Sender's retro-pak identifier
  string r_retro_pak_id = 7;  // Receiver's retro-pak identifier
}

message TransactionCommitment {
  string transaction_id = 1;  // Transaction identifier
  uint64 finalization_timestamp_ms = 2;  // Finalization timestamp
  bytes sender_finalization_signature = 3;  // Sender's finalization signature
  bytes receiver_finalization_signature = 4;  // Receiver's finalization signature
  bool success = 5;  // Whether commitment succeeded
}

message TransactionAbort {
  string transaction_id = 1;  // Transaction identifier
  string reason = 2;  // Reason for abortion
  uint64 abort_timestamp_ms = 3;  // Abort timestamp
  bool sender_acknowledged = 4;  // Whether sender acknowledged
  bool receiver_acknowledged = 5;  // Whether receiver acknowledged
}

// Token Flow Management
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

message TokenSelectionStrategy {
  enum Strategy {
    MINIMIZE_TOKENS = 0;  // Use largest denominations first
    OPTIMIZE_DISTRIBUTION = 1;  // Balance denomination distribution
    EXACT_MATCH = 2;  // Try to find exact denomination matches
    FAVOR_EXPIRING = 3;  // Prioritize soon-to-expire tokens
  }
  Strategy strategy = 1;  // Selected strategy
  map<uint32, float> denomination_weights = 2;  // Custom weights by denomination
  TokenSelectionConstraint constraints = 3;  // Account balance and spending constraints
}

message ChangeCalculation {
  uint64 total_amount = 1;  // Total amount to pay
  uint64 payment_amount = 2;  // Amount covered by payment tokens
  uint64 change_amount = 3;  // Amount to return as change
  float buffer_amount = 4;  // Amount for the afrondingsbuffer (0.0-0.99)
  repeated DenominationCount payment_denominations = 5;  // Payment denomination breakdown
  repeated DenominationCount change_denominations = 6;  // Change denomination breakdown
}

// Special fields for test implementation
message TestTokenGeneration {
  string test_user_id = 1;  // Test user identifier
  uint64 total_value = 2;  // Total value to generate
  repeated DenominationCount denomination_distribution = 3;  // Desired distribution
}
```

**Implementation Notes:**
- The four-packet transaction model is core to the JuiceTokens system
- sExo-pak: Sender to receiver (payment tokens)
- rExo-pak: Receiver to sender (change tokens)
- sRetro-pak: Sender's safety net for rollback
- rRetro-pak: Receiver's safety net for rollback
- The atomic commitment protocol ensures transactions are all-or-nothing
- TokenSelectionStrategy optimizes which tokens to use in transactions
- The DenominationVectorClock is crucial for denomination optimization between peers

## Layer 4: Trust and Attestation Layer

### trust/attestation.proto

```protobuf
syntax = "proto3";

package juicetokens.trust.attestation;

// Attestation Record Format
message SystemAttestation {
  string attestation_id = 1;  // Unique attestation identifier
  string subject_id = 2;  // Subject being attested
  string attestation_type = 3;  // Type of attestation
  bytes evidence = 4;  // Cryptographic evidence
  uint64 timestamp_ms = 5;  // Timestamp of attestation
  uint32 confidence_score = 6;  // Confidence score (0-100)
  string system_source = 7;  // Source system
}

message PeerAttestation {
  string attestation_id = 1;  // Unique attestation identifier
  string subject_id = 2;  // Subject being attested
  string attester_id = 3;  // Peer making the attestation
  string attestation_type = 4;  // Type of attestation
  string attestation_content = 5;  // Content of attestation
  uint32 strength = 6;  // Strength of attestation (0-100)
  uint64 timestamp_ms = 7;  // Timestamp of attestation
  bytes signature = 8;  // Signature by attester
}

message CommunityAttestation {
  string attestation_id = 1;  // Unique attestation identifier
  string subject_id = 2;  // Subject being attested
  string community_id = 3;  // Community making the attestation
  string attestation_type = 4;  // Type of attestation
  string attestation_content = 5;  // Content of attestation
  uint32 approval_count = 6;  // Number of approvals
  uint32 threshold = 7;  // Threshold for validity
  uint64 timestamp_ms = 8;  // Timestamp of attestation
  bytes community_signature = 9;  // Collective signature
}

message AttestationMetadata {
  string context = 1;  // Context of the attestation
  string geographic_region = 2;  // Geographic region
  string cultural_context = 3;  // Cultural context
  uint64 valid_from_ms = 4;  // Validity start time
  uint64 valid_until_ms = 5;  // Validity end time
  repeated string tags = 6;  // Tags for categorization
}

// Distribution and Storage Mechanisms
message GeospatialShard {
  string s2_cell_id = 1;  // S2 cell identifier
  uint32 level = 2;  // Cell level (precision)
  repeated string contained_attestation_ids = 3;  // Contained attestations
  bytes merkle_root = 4;  // Merkle root of attestations
  uint64 last_updated_ms = 5;  // Last update timestamp
}

message AttestationExpiry {
  string attestation_id = 1;  // Attestation identifier
  uint64 creation_ms = 2;  // Creation timestamp
  uint64 expiry_ms = 3;  // Expiry timestamp
  bool auto_renew = 4;  // Whether to auto-renew
  string renewal_policy = 5;  // Renewal policy
}

message PrivacyPreservingLookup {
  bytes blinded_query = 1;  // Blinded query
  string query_type = 2;  // Type of query
  bytes query_parameters = 3;  // Additional parameters
  bool reveal_metadata = 4;  // Whether to reveal metadata
}

message AttestationStorage {
  enum StorageType {
    LOCAL = 0;  // Local storage only
    DHT = 1;    // Distributed hash table
    BOTH = 2;   // Both local and DHT
  }
  StorageType storage_type = 1;
  bool encrypted = 2;  // Whether the attestation is encrypted
  string encryption_scheme = 3;  // Encryption scheme
  repeated string authorized_viewers = 4;  // Authorized viewers
}

// Identity and Authentication
message KeyPair {
  string key_id = 1;  // Key identifier
  bytes public_key = 2;  // Public key
  // Note: private key is never included in messages
  string algorithm = 3;  // Algorithm (e.g., "Ed25519")
  uint64 creation_ms = 4;  // Creation timestamp
  uint64 expiry_ms = 5;  // Expiry timestamp
}

message IdentityProof {
  string identity_id = 1;  // Identity identifier
  bytes challenge = 2;  // Challenge data
  bytes response = 3;  // Response proving control
  uint64 timestamp_ms = 4;  // Timestamp of proof
  string proof_type = 5;  // Type of proof
}

message KeyRotation {
  string identity_id = 1;  // Identity identifier
  string old_key_id = 2;  // Old key identifier
  string new_key_id = 3;  // New key identifier
  bytes rotation_proof = 4;  // Proof of rotation right
  uint64 rotation_timestamp_ms = 5;  // Rotation timestamp
}

message RevocationCertificate {
  string revoked_id = 1;  // ID being revoked
  enum RevocationType {
    KEY = 0;        // Key revocation
    ATTESTATION = 1;  // Attestation revocation
    IDENTITY = 2;   // Identity revocation
  }
  RevocationType revocation_type = 2;
  string reason = 3;  // Reason for revocation
  uint64 revocation_timestamp_ms = 4;  // Revocation timestamp
  bytes authorizing_signature = 5;  // Signature authorizing revocation
}
```

**Implementation Notes:**
- The attestation system builds trust in the network through different attestation types
- System attestations are automatically generated based on observed behavior
- Peer attestations are explicit statements from one user about another
- Community attestations represent group consensus
- The geospatial sharding enables effective storage and retrieval of attestations
- Privacy-preserving lookups protect user privacy while enabling verification
- Key management (rotation, revocation) is essential for security

### trust/reputation.proto

```protobuf
syntax = "proto3";

package juicetokens.trust.reputation;

// Multi-dimensional Scoring
message ReputationMetric {
  string metric_id = 1;  // Unique metric identifier
  string name = 2;  // Human-readable name
  string description = 3;  // Description of the metric
  float value = 4;  // Current value (0.0-1.0)
  float confidence = 5;  // Confidence in the value (0.0-1.0)
  repeated string contributing_attestations = 6;  // Contributing attestations
}

message ReliabilityScore {
  float successful_transactions_rate = 1;  // Rate of successful transactions
  float on_time_completion_rate = 2;  // Rate of on-time completions
  float average_response_time_seconds = 3;  // Average response time
  uint32 transaction_count = 4;  // Number of transactions
  float score = 5;  // Overall score (0.0-1.0)
}

message ContributionScore {
  float renewal_facilitation_rate = 1;  // Rate of helping with renewals
  float attestation_contribution_rate = 2;  // Rate of providing attestations
  float network_relay_contribution = 3;  // Contribution to the mesh network
  uint32 contribution_count = 4;  // Number of contributions
  float score = 5;  // Overall score (0.0-1.0)
}

message ValidationScore {
  float community_consensus_alignment = 1;  // Alignment with community consensus
  float attestation_verification_rate = 2;  // Rate of verified attestations
  float false_attestation_rate = 3;  // Rate of false attestations
  uint32 validation_count = 4;  // Number of validations
  float score = 5;  // Overall score (0.0-1.0)
}

// Contextual Analysis
message EnvironmentalContext {
  bool crisis_mode = 1;  // Whether there is a crisis
  string crisis_type = 2;  // Type of crisis
  float severity = 3;  // Severity (0.0-1.0)
  uint64 detected_at_ms = 4;  // When the context was detected
  map<string, float> adjusted_thresholds = 5;  // Adjusted thresholds
}

message GeographicContext {
  string s2_cell_id = 1;  // S2 cell identifier
  string region_name = 2;  // Region name
  float population_density = 3;  // Population density
  float connectivity_index = 4;  // Connectivity index (0.0-1.0)
  map<string, float> regional_factors = 5;  // Regional adjustment factors
}

message TemporalPattern {
  enum PatternType {
    CYCLICAL = 0;  // Repeating pattern
    TREND = 1;     // Directional trend
    SEASONAL = 2;  // Seasonal pattern
    EVENT = 3;     // Event-related pattern
  }
  PatternType pattern_type = 1;
  string metric_id = 2;  // Affected metric
  float significance = 3;  // Significance (0.0-1.0)
  string description = 4;  // Description of the pattern
  map<string, float> temporal_adjustment_factors = 5;  // Temporal adjustment factors
}

message ContextualAdjustment {
  string metric_id = 1;  // Affected metric
  float base_value = 2;  // Base value before adjustment
  float adjusted_value = 3;  // Value after adjustment
  map<string, float> adjustment_factors = 4;  // Applied adjustment factors
  string adjustment_rationale = 5;  // Explanation for the adjustment
}

// Attestation Oracle Protocol
message WitnessSelection {
  string attestation_id = 1;  // Attestation identifier
  repeated string candidate_witnesses = 2;  // Candidate witnesses
  repeated string selected_witnesses = 3;  // Selected witnesses
  string selection_algorithm = 4;  // Algorithm used for selection
  uint32 minimum_witnesses = 5;  // Minimum required witnesses
  bytes selection_seed = 6;  // Seed used for selection (for verifiability)
}

message ThresholdSignature {
  bytes message_hash = 1;  // Hash of the message
  uint32 threshold = 2;  // Threshold for validity
  repeated bytes signature_shares = 3;  // Individual signature shares
  bytes combined_signature = 4;  // Combined threshold signature
  repeated string signers = 5;  // Identities of the signers
}

message VerificationCircuit {
  bytes circuit_description = 1;  // ZK circuit description
  bytes public_inputs = 2;  // Public inputs to the circuit
  bytes proof = 3;  // Zero-knowledge proof
  bool verification_result = 4;  // Verification result
  string circuit_type = 5;  // Type of circuit
}

message TemporalSecurity {
  uint64 attestation_timestamp_ms = 1;  // Attestation timestamp
  bytes timestamp_proof = 2;  // Proof of timestamp validity
  repeated string time_sources = 3;  // Sources used for time verification
  float time_confidence = 4;  // Confidence in the timestamp (0.0-1.0)
}
```

**Implementation Notes:**
- Reputation is calculated across multiple dimensions (reliability, contribution, validation)
- The system considers context when evaluating reputation (crisis situations, geographic factors)
- The witness selection process ensures reliable attestations
- Threshold signatures require multiple parties to agree
- Zero-knowledge verification circuits protect privacy
- Temporal security anchors attestations to verifiable timestamps

### trust/identity.proto

```protobuf
syntax = "proto3";

package juicetokens.trust.identity;

// Identity Management
message Identity {
  string identity_id = 1;  // Unique identity identifier
  repeated string public_keys = 2;  // Associated public keys
  string active_key_id = 3;  // Currently active key ID
  string display_name = 4;  // Human-readable name
  repeated IdentityAttribute attributes = 5;  // Identity attributes
  uint64 creation_time_ms = 6;  // Creation timestamp
}

message IdentityAttribute {
  string attribute_name = 1;  // Attribute name
  string attribute_value = 2;  // Attribute value
  bool self_attested = 3;  // Whether self-attested
  repeated string attestation_ids = 4;  // Supporting attestation IDs
  bool public = 5;  // Whether the attribute is public
}

message IdentityCreation {
  bytes initial_public_key = 1;  // Initial public key
  string display_name = 2;  // Human-readable name
  map<string, string> initial_attributes = 3;  // Initial attributes
  bytes signature = 4;  // Signature of creation data
}

message IdentityUpdate {
  string identity_id = 1;  // Identity identifier
  string updated_field = 2;  // Field being updated
  bytes new_value = 3;  // New value
  uint64 timestamp_ms = 4;  // Update timestamp
  bytes signature = 5;  // Signature by active key
}

message IdentityLink {
  string source_identity_id = 1;  // Source identity
  string target_identity_id = 2;  // Target identity
  enum LinkType {
    KNOWS = 0;     // General connection
    TRUSTS = 1;    // Trust relationship
    ENDORSES = 2;  // Professional endorsement
  }
  LinkType link_type = 3;
  uint32 strength = 4;  // Strength of link (0-100)
  string description = 5;  // Description of the link
  uint64 timestamp_ms = 6;  // When the link was created
  bytes signature = 7;  // Signature by source identity
}

message DIDDocument {
  string id = 1;  // Decentralized Identifier
  repeated VerificationMethod verification_methods = 2;  // Verification methods
  repeated string authentication = 3;  // Authentication references
  repeated string assertion_method = 4;  // Assertion method references
  repeated Service services = 5;  // Services
}

message VerificationMethod {
  string id = 1;  // Method identifier
  string type = 2;  // Verification method type
  string controller = 3;  // Controller DID
  bytes public_key_multibase = 4;  // Multibase-encoded public key
}

message Service {
  string id = 1;  // Service identifier
  string type = 2;  // Service type
  string service_endpoint = 3;  // Service endpoint URL
}
```

**Implementation Notes:**
- Identity management provides a way to establish persistent identities
- Attributes can be self-attested or verified by others
- Identity links establish relationships between identities
- The system supports DID (Decentralized Identifier) standards
- Identity is separate from keys to allow for key rotation

## Layer 5: Token Lifecycle Layer

### lifecycle/creation.proto

```protobuf
syntax = "proto3";

package juicetokens.lifecycle.creation;

import "token/model.proto";

// Token Creation Protocol
message EggGeneration {
  string egg_id = 1;  // Unique egg identifier
  string batch_reference = 2;  // Batch reference
  uint32 denomination = 3;  // Denomination
  uint32 count = 4;  // Number of eggs to generate
  repeated string generator_ids = 5;  // Egg generators
  bytes entropy_commitment = 6;  // Commitment to entropy
  uint64 generation_timestamp_ms = 7;  // Generation timestamp
}

message HatchingCondition {
  string egg_id = 1;  // Egg identifier
  enum ConditionType {
    ATTESTATION_THRESHOLD = 0;  // Requires sufficient attestations
    ACTIVITY_COMPLETION = 1;    // Requires specific activity
    TEMPORAL_TRIGGER = 2;       // Time-based trigger
    MULTI_PARTY_AGREEMENT = 3;  // Requires multiple parties to agree
  }
  ConditionType condition_type = 2;
  bytes condition_parameters = 3;  // Serialized parameters
  uint64 expiry_ms = 4;  // When the condition expires
}

message TokenDistribution {
  string batch_id = 1;  // Batch identifier
  enum DistributionStrategy {
    EQUAL = 0;      // Equal distribution
    WEIGHTED = 1;   // Weighted by contribution
    MERIT_BASED = 2;  // Based on merit
    NEED_BASED = 3;   // Based on need
  }
  DistributionStrategy strategy = 2;
  map<string, float> recipient_weights = 3;  // Weights by recipient
  repeated juicetokens.token.model.Token tokens = 4;  // Tokens to distribute
}

message GenesisPool {
  string pool_id = 1;  // Pool identifier
  repeated string member_ids = 2;  // Member identifiers
  map<string, float> attestation_strengths = 3;  // Attestation strength by member
  float combined_strength = 4;  // Combined attestation strength
  uint64 formation_timestamp_ms = 5;  // Formation timestamp
}

// Egg Dormancy System
message DormantEgg {
  string egg_id = 1;  // Egg identifier
  uint32 denomination = 2;  // Denomination value
  string owner_id = 3;  // Owner identifier
  bytes dormancy_seal = 4;  // Cryptographic seal
  HatchingCondition hatching_condition = 5;  // Conditions for hatching
  uint64 creation_timestamp_ms = 6;  // Creation timestamp
  uint64 dormancy_expires_ms = 7;  // When dormancy expires
}

message FertilizationTrigger {
  string egg_id = 1;  // Egg identifier
  string activator_id = 2;  // User triggering fertilization
  string activity_reference = 3;  // Reference to qualifying activity
  bytes proof_of_activity = 4;  // Proof of the activity
  uint64 trigger_timestamp_ms = 5;  // Trigger timestamp
}

message MaturationPath {
  string egg_id = 1;  // Egg identifier
  enum MaturationStage {
    DORMANT = 0;      // Initial dormant state
    FERTILIZED = 1;   // Successfully fertilized
    INCUBATING = 2;   // In incubation period
    HATCHING = 3;     // Hatching process
    ACTIVE = 4;       // Fully active token
  }
  MaturationStage current_stage = 2;
  uint64 stage_entered_ms = 3;  // When the current stage was entered
  uint64 estimated_completion_ms = 4;  // Estimated completion time
  float completion_percentage = 5;  // Completion percentage
}

message EggComponent {
  string component_id = 1;  // Component identifier
  uint32 denomination = 2;  // Denomination value
  string issuer_id = 3;  // Issuer identifier
  bytes issuer_commitment = 4;  // Issuer's cryptographic commitment
  uint64 creation_timestamp_ms = 5;  // Creation timestamp
  repeated string authorized_fertilizers = 6;  // Authorized fertilizers
}

message SpermComponent {
  string component_id = 1;  // Component identifier
  string activity_type = 2;  // Type of generative activity
  uint32 potency_level = 3;  // Potency level (0-100)
  string generator_id = 4;  // Generator identifier
  bytes activity_proof = 5;  // Proof of activity
  uint64 generation_timestamp_ms = 6;  // Generation timestamp
  uint64 viability_expires_ms = 7;  // When viability expires
}

message FertilizationEvent {
  string fertilization_id = 1;  // Fertilization identifier
  string egg_component_id = 2;  // Egg component identifier
  string sperm_component_id = 3;  // Sperm component identifier
  bytes compatibility_proof = 4;  // Proof of compatibility
  uint64 fertilization_timestamp_ms = 5;  // Fertilization timestamp
  uint32 maturation_period_hours = 6;  // Maturation period in hours
  repeated string witnesses = 7;  // Witnesses to the fertilization
}
```

**Implementation Notes:**
- The token creation protocol uses a biological metaphor (eggs, fertilization, hatching)
- EggGeneration creates dormant token potential
- HatchingCondition defines what activates an egg
- GenesisPool represents the trusted group that can generate eggs
- FertilizationTrigger activates dormant tokens
- The MaturationPath tracks the progress from dormant to active
- This design ensures controlled token creation tied to valuable system activity

### lifecycle/renewal.proto

```protobuf
syntax = "proto3";

package juicetokens.lifecycle.renewal;

import "token/model.proto";

// Renewal Management
message ExpiryNotification {
  repeated juicetokens.token.model.TokenId expiring_tokens = 1;  // Expiring tokens
  uint64 expiry_timestamp_ms = 2;  // Expiry timestamp
  uint64 notification_timestamp_ms = 3;  // Notification timestamp
  uint32 days_remaining = 4;  // Days remaining until expiry
  bool requires_action = 5;  // Whether action is required
}

message RenewalRequest {
  repeated juicetokens.token.model.TokenId tokens_to_renew = 1;  // Tokens to renew
  string requester_id = 2;  // Requester identifier
  uint64 request_timestamp_ms = 3;  // Request timestamp
  bool request_facilitation = 4;  // Whether facilitation is requested
  string message = 5;  // Optional message
}

message RenewalFacilitation {
  string facilitation_id = 1;  // Facilitation identifier
  string facilitator_id = 2;  // Facilitator identifier
  string requestor_id = 3;  // Requestor identifier
  repeated juicetokens.token.model.TokenId facilitated_tokens = 4;  // Facilitated tokens
  uint64 facilitation_timestamp_ms = 5;  // Facilitation timestamp
  RenewalReward reward = 6;  // Reward for facilitation
}

message RenewalReward {
  uint64 expired_value_processed = 1;  // Expired value processed
  uint64 base_facilitation_reward = 2;  // Base facilitation reward
  float economic_activity_multiplier = 3;  // Economic activity multiplier
  repeated juicetokens.token.model.TokenId new_tokens = 4;  // New tokens created as reward
  
  // Distribution across developmental stages
  uint64 trust_building = 5;
  uint64 autonomy_support = 6;
  uint64 imagination_funding = 7;
  uint64 competence_reward = 8;
  uint64 identity_formation = 9;
  uint64 connection_bridges = 10;
  uint64 generativity_projects = 11;
}

message TelomeerRenewalTransformation {
  juicetokens.token.model.TokenId old_token_id = 1;  // Old token ID
  juicetokens.token.model.TokenId new_token_id = 2;  // New token ID
  string owner_id = 3;  // Owner identifier
  bytes renewal_signature = 4;  // Renewal signature
  uint64 renewal_timestamp_ms = 5;  // Renewal timestamp
  uint64 new_expiry_ms = 6;  // New expiry timestamp
}
```

**Implementation Notes:**
- Renewal management handles the process of renewing tokens before they expire
- ExpiryNotification alerts users to upcoming expirations
- RenewalRequest allows users to request renewal
- RenewalFacilitation enables users to help each other with renewals
- RenewalReward is the economic incentive for facilitating renewals
- This creates a natural, community-driven monetary expansion mechanism

### lifecycle/future.proto

```protobuf
syntax = "proto3";

package juicetokens.lifecycle.future;

import "token/model.proto";

// Future Promise Protocol
message PromiseCreation {
  string promise_id = 1;  // Unique promise identifier
  string creator_id = 2;  // Creator identifier
  string beneficiary_id = 3;  // Beneficiary identifier
  string promise_description = 4;  // Description of the promise
  uint64 value_amount = 5;  // Value amount
  uint64 due_date_ms = 6;  // Due date
  repeated VerificationRequirement verification_requirements = 7;  // Verification requirements
  bytes creator_signature = 8;  // Creator's signature
}

message VerificationRequirement {
  string requirement_id = 1;  // Requirement identifier
  string description = 2;  // Description
  enum RequirementType {
    ATTESTATION = 0;   // Requires attestation
    EVIDENCE = 1;      // Requires evidence
    TIMELOCK = 2;      // Time-based requirement
    CONDITIONAL = 3;   // Condition-based requirement
  }
  RequirementType requirement_type = 3;
  bytes requirement_parameters = 4;  // Serialized parameters
  bool optional = 5;  // Whether optional
  uint32 weight = 6;  // Weight (for partial fulfillment)
}

message FulfillmentTracking {
  string promise_id = 1;  // Promise identifier
  repeated RequirementStatus requirement_statuses = 2;  // Requirement statuses
  float overall_completion_percentage = 3;  // Overall completion percentage
  uint64 last_update_ms = 4;  // Last update timestamp
  enum FulfillmentState {
    NOT_STARTED = 0;
    IN_PROGRESS = 1;
    PARTIALLY_FULFILLED = 2;
    FULFILLED = 3;
    DISPUTED = 4;
    CANCELED = 5;
  }
  FulfillmentState state = 5;
}

message RequirementStatus {
  string requirement_id = 1;  // Requirement identifier
  float completion_percentage = 2;  // Completion percentage
  string status_description = 3;  // Status description
  repeated string evidence_references = 4;  // Evidence references
  uint64 last_update_ms = 5;  // Last update timestamp
}

message PromiseMetadata {
  string promise_id = 1;  // Promise identifier
  string category = 2;  // Category
  string context = 3;  // Context
  repeated string tags = 4;  // Tags
  bool public = 5;  // Whether public
  map<string, string> custom_attributes = 6;  // Custom attributes
}

// Escrow Mechanisms
message EscrowCondition {
  string condition_id = 1;  // Condition identifier
  string description = 2;  // Description
  enum ConditionType {
    TIME_BASED = 0;    // Time-based condition
    EVENT_BASED = 1;   // Event-based condition
    MULTI_SIG = 2;     // Multi-signature condition
    ORACLE_BASED = 3;  // Oracle-based condition
  }
  ConditionType condition_type = 3;
  bytes condition_parameters = 4;  // Serialized parameters
  bool negated = 5;  // Whether the condition is negated
}

message MultiSignatureRequirement {
  string requirement_id = 1;  // Requirement identifier
  repeated string required_signers = 2;  // Required signers
  uint32 threshold = 3;  // Threshold (M-of-N)
  uint32 timeout_hours = 4;  // Timeout in hours
  bool allow_delegation = 5;  // Whether delegation is allowed
}

message TimeBasedTrigger {
  string trigger_id = 1;  // Trigger identifier
  uint64 trigger_time_ms = 2;  // Trigger time
  bool release_on_trigger = 3;  // Whether to release on trigger
  bool recurring = 4;  // Whether recurring
  uint32 recurrence_interval_hours = 5;  // Recurrence interval
  uint32 max_recurrences = 6;  // Maximum recurrences
}

message EscrowStatus {
  string escrow_id = 1;  // Escrow identifier
  repeated juicetokens.token.model.TokenId escrowed_tokens = 2;  // Escrowed tokens
  string depositor_id = 3;  // Depositor identifier
  string recipient_id = 4;  // Recipient identifier
  repeated EscrowCondition conditions = 5;  // Conditions
  enum Status {
    ACTIVE = 0;      // Active escrow
    FULFILLED = 1;   // Fulfilled (tokens released)
    REFUNDED = 2;    // Refunded to depositor
    DISPUTED = 3;    // In dispute
    EXPIRED = 4;     // Expired
  }
  Status status = 6;
  uint64 creation_ms = 7;  // Creation timestamp
  uint64 last_update_ms = 8;  // Last update timestamp
}

// Communal Pooling System
message GroupCommitment {
  string commitment_id = 1;  // Commitment identifier
  string group_id = 2;  // Group identifier
  string commitment_purpose = 3;  // Purpose
  repeated string participant_ids = 4;  // Participants
  map<string, uint64> contributions = 5;  // Contributions by participant
  uint64 total_value = 6;  // Total value
  uint64 creation_ms = 7;  // Creation timestamp
  uint64 fulfillment_deadline_ms = 8;  // Fulfillment deadline
}

message RiskDistribution {
  string distribution_id = 1;  // Distribution identifier
  string parent_commitment_id = 2;  // Parent commitment
  map<string, float> risk_weights = 3;  // Risk weights by participant
  enum RiskStrategy {
    EQUAL = 0;       // Equal distribution
    PROPORTIONAL = 1;  // Proportional to contribution
    CUSTOM = 2;      // Custom distribution
  }
  RiskStrategy strategy = 4;
  bytes distribution_rules = 5;  // Serialized distribution rules
}

message CollectiveFulfillment {
  string fulfillment_id = 1;  // Fulfillment identifier
  string parent_commitment_id = 2;  // Parent commitment
  repeated string verifier_ids = 3;  // Verifiers
  uint32 verification_threshold = 4;  // Verification threshold
  repeated VerificationVote votes = 5;  // Verification votes
  enum FulfillmentStatus {
    PENDING = 0;     // Pending verification
    VERIFIED = 1;    // Verified
    REJECTED = 2;    // Rejected
    DISPUTED = 3;    // In dispute
  }
  FulfillmentStatus status = 6;
  uint64 last_update_ms = 7;  // Last update timestamp
}

message VerificationVote {
  string verifier_id = 1;  // Verifier identifier
  bool approved = 2;  // Whether approved
  string comment = 3;  // Comment
  uint64 vote_timestamp_ms = 4;  // Vote timestamp
  bytes signature = 5;  // Signature
}

message PoolMetadata {
  string pool_id = 1;  // Pool identifier
  string name = 2;  // Name
  string description = 3;  // Description
  string category = 4;  // Category
  repeated string tags = 5;  // Tags
  bool public = 6;  // Whether public
  map<string, string> custom_attributes = 7;  // Custom attributes
}
```

**Implementation Notes:**
- The Future Promise Protocol enables representation of future value
- PromiseCreation establishes a promise to deliver value in the future
- FulfillmentTracking monitors progress toward fulfillment
- Escrow mechanisms provide security for conditional transfers
- The Communal Pooling System enables group-based token management
- This layer enables economic activity beyond simple present-value exchange

## Layer 6: Extension Layer

### extension/extension_point.proto

```protobuf
syntax = "proto3";

package juicetokens.extension;

// Extension point registration
message ExtensionPoint {
  string extension_point_id = 1;  // Unique identifier
  string description = 2;  // Human readable description
  repeated string supported_actions = 3;  // Actions supported at this extension point
  map<string, string> parameters = 4;  // Expected parameters for this extension point
}

// Extension registration
message ExtensionRegistration {
  string extension_id = 1;  // Unique identifier for the extension
  string name = 2;  // Human readable name
  string description = 3;  // Description of the extension
  string version = 4;  // Version of the extension
  repeated string extension_points = 5;  // Extension points implemented
  map<string, string> capabilities = 6;  // Extension capabilities
}

// Permission request for extension
message PermissionRequest {
  string extension_id = 1;  // Extension requesting permission
  repeated string requested_permissions = 2;  // Permissions requested
  string reason = 3;  // Reason for request
}

// Permission response
message PermissionResponse {
  string extension_id = 1;  // Extension requesting permission
  repeated string granted_permissions = 2;  // Permissions granted
  repeated string denied_permissions = 3;  // Permissions denied
  uint64 expiry_timestamp_ms = 4;  // When permissions expire
}
```

**Implementation Notes:**
- The Extension Layer provides minimal interfaces for extending the JuiceTokens ecosystem
- Extensions register capabilities and can be discovered by users
- The permission system allows for secure integration of third-party extensions
- This minimal implementation focuses on the essential interfaces, leaving specific extension functionality open-ended

## Layer 7: Governance Layer

### governance/versioning.proto

```protobuf
syntax = "proto3";

package juicetokens.governance;

// Protocol version information
message ProtocolVersion {
  string version = 1;  // Semantic version (e.g., "1.0.0")
  string release_notes = 2;  // Human readable release notes
  uint64 release_timestamp_ms = 3;  // When version was released
  repeated string changed_components = 4;  // Components changed in this version
  bool backwards_compatible = 5;  // Whether backwards compatible with previous version
}

// Health metrics for system monitoring
message HealthMetric {
  string metric_id = 1;  // Identifier for the metric
  string component = 2;  // Component being measured
  string metric_type = 3;  // Type of metric (counter, gauge, histogram)
  double value = 4;  // Current value
  string unit = 5;  // Unit of measurement
  uint64 timestamp_ms = 6;  // When metric was collected
  uint32 severity = 7;  // Severity level (0-3: info, warning, error, critical)
}

// System monitoring information
message SystemHealth {
  string instance_id = 1;  // Identifier for this instance
  string version = 2;  // Protocol version in use
  uint64 timestamp_ms = 3;  // When health data was collected
  map<string, HealthMetric> metrics = 4;  // Health metrics by id
  SystemStatus status = 5;  // Overall system status
}

// System status enumeration
enum SystemStatus {
  HEALTHY = 0;  // System is functioning normally
  DEGRADED = 1;  // System is degraded but operational
  CRITICAL = 2;  // System has critical issues
  MAINTENANCE = 3;  // System is in maintenance mode
}
```

**Implementation Notes:**
- The Governance Layer focuses on essential system health and versioning
- Protocol versioning allows for controlled evolution of the system
- Health metrics provide basic monitoring capabilities
- This minimal implementation enables essential governance functionality without overspecification
- The design allows for future expansion as governance needs evolve

## Implementation Strategy

When implementing these Protocol Buffers, follow this strategy:

1. Start with the foundation layer and work upward
2. Implement one layer completely before moving to the next
3. Write thorough tests for each layer
4. Document all messages and fields
5. Add any language-specific helpers alongside the .proto files

For the test implementation:
1. Each user instance runs in a Docker container
2. The Docker container hosts the backend protocol implementation
3. The PWA provides the UI layer
4. Use Prometheus and Grafana for monitoring

## Key Concepts Reference

For Cursor AI, here are explanations of key concepts:

### Afrondingsbuffer
The afrondingsbuffer is a fractional value buffer (0.0-0.99) associated with each user's single WisselToken. Since the JuiceTokens system uses discrete token denominations (1, 2, 5, 10, etc.), the afrondingsbuffer stores values less than 1.0 that cannot be represented by tokens. This enables exact payments without rounding.

### Four-Packet Transaction Model
The transaction system uses four token packages:
- **sExo-pak**: Sent from sender to receiver (payment tokens)
- **rExo-pak**: Sent from receiver to sender (change tokens)
- **sRetro-pak**: Held by sender as rollback safety
- **rRetro-pak**: Held by receiver as rollback safety

This design ensures atomic transactions (all-or-nothing) even with connection failures.

### Telomeer
The telomeer is the ownership tracking mechanism in tokens. It acts as a "self-composting tail" that maintains a cryptographic record of ownership history without indefinite growth. It contains:
- Current owner (public key)
- Hash of previous owner
- Compressed history chain

### S2 Cell References
The system uses S2 geospatial cells (from Google's S2 library) for location referencing. This provides efficient geospatial indexing for DHT sharding and location-based features.

### Token Creation (Egg/Fertilization Metaphor)
Token creation uses a biological metaphor:
- **Eggs**: Dormant token potential generated by trusted groups
- **Fertilization**: Activation through valuable system activities
- **Hatching**: Process of becoming a fully active token

This ensures controlled monetary expansion tied to genuine system-building activities.
