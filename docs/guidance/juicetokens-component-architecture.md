# JuiceTokens Component Architecture Overview

## System Architecture

```
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│         PRODUCTION SETUP            │   │            TEST SETUP               │
│                                     │   │                                     │
│  ┌─────────────┐    ┌─────────────┐ │   │  ┌─────────────┐                   │
│  │   Native    │    │     PWA     │ │   │  │  Test Node  │                   │
│  │     App     │◄───┤             │ │   │  │  Container  │                   │
│  │             │    │             │ │   │  │             │                   │
│  └─────┬───────┘    └─────┬───────┘ │   │  └─────┬───────┘                   │
│        │                  │         │   │        │                           │
│        ▼                  ▼         │   │        ▼                           │
│  ┌─────────────┐    ┌─────────────┐ │   │  ┌─────────────┐                   │
│  │   Native    │    │    WASM     │ │   │  │  JavaScript │                   │
│  │  Libraries  │    │ Token Engine│ │   │  │ Token Engine│                   │
│  └─────┬───────┘    └─────┬───────┘ │   │  └─────┬───────┘                   │
│        │                  │         │   │        │                           │
│        └──────────┬───────┘         │   │        │                           │
│                   │                 │   │        │                           │
│          ┌────────▼─────────┐       │   │ ┌──────▼───────┐                   │
│          │  Core Protocol   │       │   │ │ Core Protocol│                   │
│          │  Implementation  │       │   │ │Implementation│                   │
│          └──────────────────┘       │   │ └──────────────┘                   │
│                                     │   │                                     │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
```

## Component Mapping Table

This table shows how each component is implemented in both the test setup and the final production setup.

### 1. Foundation Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Hardware Abstraction** | JavaScript mock implementations simulating hardware capabilities | Native app modules accessing real hardware via platform APIs |
| **Secure Storage** | JavaScript implementation using filesystem in Docker | WebStorage + IndexedDB in PWA, Keychain/KeyStore in native app |
| **TEE Integration** | JavaScript mock simulating TEE behavior | Real TEE access via native app on supported devices |
| **Persistence** | IndexedDB in browser, filesystem backups in Docker | IndexedDB in PWA with native app backup on disk |
| **DHT Implementation** | Centralized implementation in Docker for testing | True P2P DHT with web and local connectivity |
| **Personal Chain** | Sequential log with verification in centralized store | Fully distributed chain with cryptographic verification and partial sync |
| **Designated Backup** | Simulated backup peers within test network | User-selected backup peers and optional cloud backup |
| **Time Synchronization** | Server time with simulated variations | Multi-source time sync (NTP, device, peer consensus) |
| **Transaction Time Verification** | Basic checks with simulated failure cases | Tiered verification system with fallbacks and appropriate UI feedback |

### 2. Transport Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Pipe Abstraction** | JS implementation with all pipe types | Same JS interface but with native hardware access |
| **QR Kiss Protocol** | Simulated in-memory, or DOM if browser-based testing | PWA camera access + canvas rendering |
| **BLE Protocol** | Simulated connections between test nodes | Native app BLE APIs with WebBluetooth fallback |
| **NFC Protocol** | Simulated in-memory transfers | Native app NFC APIs on supported devices |
| **Web Protocol** | Real HTTP/HTTPS connections between test nodes | Full HTTPS implementation with service worker support |
| **Message Framing** | Full implementation in JavaScript | Same implementation running in PWA |
| **Protocol Negotiation** | Test implementation with predictable scenarios | Production implementation with real-world handling |
| **Native Bridge** | Not needed in test setup | Bi-directional bridge between PWA and native components |

### 3. Token Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Token Engine** | Pure JavaScript implementation | Rust implementation compiled to WASM |
| **Token Model** | Full implementation in JavaScript | Same protocol in Rust/WASM |
| **Telomeer Management** | JavaScript implementation with full tracing | Rust/WASM implementation with optional TEE integration |
| **Transaction Protocol** | Four-packet model in JavaScript | Same four-packet model in Rust/WASM |
| **Atomic Commitment** | Full implementation with simulated failures | Same protocol with real-world failure handling |
| **Denomination System** | Complete 1-2-5 system with wisseltoken | Same system in Rust/WASM |
| **Token Selection** | Basic algorithms in JavaScript | Optimized algorithms in Rust/WASM |
| **Token Storage** | IndexedDB with full logging | IndexedDB + encrypted backup in native app |

### 4. Trust Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Attestation System** | Complete implementation with simulated consensus | Same system with real multi-party consensus |
| **DHT Attestation Storage** | Centralized for testing | Fully distributed P2P storage |
| **Reputation Calculation** | Full algorithm in JavaScript | Same algorithm in mixed JS/Rust |
| **Identity Management** | Complete implementation with simplified security | Same implementation with hardened security |
| **Multi-Context Trust** | Simplified context implementation | Full context implementation |
| **Key Management** | Basic implementation without TEE | Enhanced with TEE support where available |
| **Privacy Controls** | Basic implementation of data minimization | Full implementation with enhanced privacy features |

### 5. Lifecycle Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Token Creation** | Egg/fertilization metaphor fully implemented | Same model with enhanced security |
| **Renewal System** | Complete implementation with accelerated timeframes | Same system with real-world timeframes |
| **Expiry Management** | Full implementation with shortened periods | Same system with standard periods |
| **Future Promise Protocol** | Basic implementation | Enhanced implementation with more validation |
| **Escrow Mechanisms** | Simple implementation of core features | Full implementation with advanced features |
| **Developmental Stage Tracking** | Basic implementation tracking user developmental progress | Full implementation with richer metrics |

### 6. Extension Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **Extension Points** | Minimal implementation with placeholders | Full implementation with extension API |
| **Application Hooks** | Basic hook implementation | Complete hook system with versioning |
| **Extension Registry** | Simple registry for testing | Production registry with verification |
| **Permission Management** | Basic permission checks | Advanced permission system with user controls |

### 7. Governance Layer

| Component | Test Setup (Docker) | Production Setup (PWA + Native) |
|-----------|--------------------|-----------------------------|
| **System Monitoring** | Prometheus/Grafana integration | Cloud-based monitoring with privacy controls |
| **Health Reporting** | Basic health metrics | Comprehensive health tracking |
| **Protocol Versioning** | Simple version tracking | Full version management system |
| **Update Mechanism** | Update discovery mock | Production update notification system |

## Key Architectural Differences

### 1. Token Engine Implementation

**Test Setup:**
- Pure JavaScript implementation
- Easier to debug with standard JS tools
- Direct access to all internal state
- Allows step-by-step debugging, variable inspection
- No compilation step during development cycle

**Production Setup:**
- Rust implementation compiled to WebAssembly
- Better performance and security
- Memory-safe implementation
- More complex debugging requiring WASM tools
- Requires compilation step for changes

### 2. Hardware Access

**Test Setup:**
- Simulated hardware capabilities
- Mock implementations of TEE, BLE, NFC
- No real hardware dependencies
- Predictable behavior for testing

**Production Setup:**
- Real hardware access via native app
- TEE integration on supported devices
- Actual BLE, NFC hardware communication
- Fallbacks for devices without specific capabilities
- Bridge between PWA and native hardware access

### 3. Network Architecture

**Test Setup:**
- Docker containers on same network
- Predictable network conditions
- Option to simulate various network scenarios
- Centralized DHT for simplicity
- Controlled message routing

**Production Setup:**
- True peer-to-peer architecture
- Multiple transport mechanisms
- Resilience to real-world network conditions
- Fully distributed DHT implementation
- Mesh network with dynamic routing

### 4. Storage Architecture

**Test Setup:**
- Primarily in-memory with filesystem persistence
- Docker volumes for persistence between runs (ensuring database state is preserved across test sessions)
- Simplified backup and recovery
- Faster operations for testing

**Production Setup:**
- IndexedDB in PWA
- Native secure storage on device
- Encrypted backups
- Multiple persistence layers with fallbacks
- Optimized for mobile device constraints

**Synchronization Concepts:**
- **SyncVectorClock**: Used to create prioritization for relevant data during synchronization. Contains slots for:
  - Essentials: Primarily token-related data with redundancy between assigned peers
  - Optionals: Mostly attestation data
  - Wildcards: For poll-tokens and transparent poll following
  - Slot assignment may shift according to machine learning as the system evolves
  
- **DenominationVectorClock**: Used during transactions to optimize token selection by:
  - Calculating ideal token denomination distribution (approximately five tokens of each denomination with fewer high-value tokens)
  - Communicating status for each denomination using a 2-bit code: 
    - 00: Lack (shortage)
    - 01: Slightly wanting
    - 10: Good (optimal)
    - 11: Abundance (excess)

- **MerkleDifference**: Efficient comparison of data sets to identify what needs to be synchronized

*Note: SyncVectorClock and DenominationVectorClock serve entirely different purposes - one for synchronization prioritization and the other for denomination optimization during transactions. Docker volume persistence is unrelated to these synchronization mechanisms.*

## Development and Testing Strategy

### Phase 1: Core Protocol Implementation

Focus on implementing the Foundation and Transport layers in the test environment:
- Protocols and interfaces
- Pure JavaScript implementations
- Comprehensive testing framework
- Mock hardware interfaces

### Phase 2: Token System Implementation

Implement the Token Layer in test environment:
- JavaScript token engine
- Four-packet transaction model
- Complete test coverage for edge cases
- Simulated real-world scenarios

### Phase 3: Trust and Lifecycle Implementation

Add Trust and Lifecycle layers:
- Attestation and reputation systems
- Token creation and renewal
- User developmental stage tracking
- Future value representation

### Phase 4: Rust/WASM Development

Begin parallel development of the Rust/WASM token engine:
- Initially focus on core token functionality
- Ensure compatibility with JS implementation
- Add telomeer management
- Implement transaction protocol

### Phase 5: Native Bridge Development

Develop native app components and bridge:
- Hardware access modules
- TEE integration
- Communication bridge
- Security features

### Phase 6: Progressive UI and Instrumentation

Implement final layers:
- User developmental stage tracking
- Educational content
- Comprehensive instrumentation
- Crisis detection

## Layer Relationship Clarification

It's important to note that the seven layers of the JuiceTokens architecture exist in both the UI (front-end) and protocol (back-end) aspects of the system, with a clear relationship between them. Each protocol layer has corresponding UI components that expose its functionality to users.

The first five layers (Foundation, Transport, Token, Trust, and Lifecycle) form the essential core functionality required for initial implementation and testing. These layers are fully specified and structured.

Layers 6 (Extension) and 7 (Governance) are intentionally defined with less rigidity, as they primarily serve as integration points for extensions and system evolution. These upper layers are designed to allow for creative expansion by users and developers, rather than being fully prescribed from the start. This approach enables the ecosystem to evolve organically based on community needs and innovations.

## Monorepo Structure

```
juicetokens/
├── proto/                      # Protocol definitions (shared)
├── packages/
│   ├── core/                   # Core implementations (shared)
│   │   ├── foundation/
│   │   ├── transport/
│   │   ├── token/
│   │   ├── trust/
│   │   ├── lifecycle/
│   │   ├── extension/
│   │   └── governance/
│   ├── test-server/            # Test implementation
│   │   ├── src/
│   │   │   ├── adapters/       # Test-specific adapters
│   │   │   ├── engine/         # JS token engine
│   │   │   ├── mocks/          # Mock implementations
│   │   │   └── server/         # Test server setup
│   │   └── docker/             # Docker configuration
│   ├── token-engine-rust/      # Rust token engine for WASM
│   │   ├── src/
│   │   ├── build/              # WASM build output
│   │   └── tests/              # Rust engine tests
│   ├── pwa/                    # Progressive Web App
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── adapters/       # PWA-specific adapters
│   │   │   ├── components/     # UI components
│   │   │   ├── wasm/           # WASM integration
│   │   │   └── app/            # Main application
│   │   └── build/              # PWA build output
│   └── native/                 # Native app components
│       ├── android/
│       ├── ios/
│       └── src/
│           ├── adapters/       # Native-specific adapters
│           ├── bridge/         # Native-PWA bridge
│           └── hardware/       # Hardware access modules
├── tools/                      # Development tools
│   ├── proto-compiler/         # Protocol buffer compiler
│   ├── test-utilities/         # Testing utilities
│   └── perf-testing/           # Performance testing
└── scripts/                    # Build and CI/CD scripts
```

## Adapter Strategy

The adapter pattern is used extensively to provide consistent interfaces across different implementations:

1. **Storage Adapters**: Abstract storage operations for different backends
2. **Transport Adapters**: Provide consistent interfaces for different transport mechanisms
3. **Token Engine Adapters**: Bridge between JS/WASM implementations
4. **Hardware Adapters**: Abstract hardware capabilities
5. **UI Adapters**: Adapt UI for different platforms and user developmental stages

Each adapter follows the same pattern:
1. Define interface in core package
2. Create specific implementations for each environment
3. Use factory pattern to select appropriate implementation
4. Apply dependency injection for testing

## Conclusion

This architecture provides a clear separation between the test environment and production setup while sharing core protocols and interfaces. The JavaScript implementation in the test environment provides easier debugging and faster development cycles, while the Rust/WASM implementation in production offers better performance and security. The native app components provide access to device capabilities that enhance the user experience but aren't strictly required for basic functionality.

By implementing each layer progressively and using the adapter pattern extensively, the system can evolve while maintaining compatibility and testability. The monorepo structure ensures that shared code remains consistent across all environments, while allowing for environment-specific optimizations.

### 1.1 Time Synchronization Dependencies

Time source integrity is a critical dependency for transaction finalization in both test and production environments:

**Test Setup:**
- Simulated time variations to test transaction behavior across all time status modes
- Ability to trigger Consensus and Inadequate statuses for testing
- Mocked error states for UI testing

**Production Setup:**
- Three primary time status modes:
  - **Verified**: Normal operation using system time with GPS/network verification (millisecond differences)
  - **Consensus**: Activated when primary sources are unavailable, allowing operation with differences < 5 seconds
  - **Inadequate**: Triggered when time differences exceed 5 seconds, requiring synchronization before transactions
- Clear error surfacing to UI when time requirements prevent transaction finalization
- Basic consensus mechanisms for initial implementation, with full "post-apocalyptic" time consensus components planned for later development
