# Protobuf Integration and Mock Hardware Testing Plan (Docker Environment)

## 1. Overview

This document details the plan for integrating the implemented Protocol Buffer (protobuf) definitions into the JuiceTokens system and testing the core protocol functionality, particularly the transaction flow, within a Docker environment using mock hardware capabilities. This serves as a critical step before attempting integration with actual physical hardware.

The primary goals are:
- Replace existing mock service implementations with real protobuf-based logic.
- Verify the correctness of data structures and communication flows as defined by the protobufs.
- Test the Four-Packet Transaction Model end-to-end between Docker containers.
- Ensure the system behaves as expected under various scenarios, including simulated failures, using mock hardware adapters.

This plan builds upon the existing `docker/test-environment.md` and leverages the detailed service replacement strategy outlined in `docs/development/docker-integration-plan.md`.

## 2. Prerequisites

- All JuiceTokens protocol buffer definitions (`.proto` files) are complete and compilable to TypeScript.
- The Docker test environment (`docker-compose.yml`, `Dockerfile`, `test-env-entrypoint.sh`) is functional, including dynamic container spawning via the Container Manager service.
- The `ServiceProvider` (`public/js/service-provider.js`) is fully implemented and capable of managing and serving both `MOCK` and `REAL` (protobuf-based) service implementations, including Docker-awareness.
- A functional `MongoDBDHTStorage` adapter is in place and integrated.

## 3. Implementation Phases

### Phase 3.1: Mock Hardware Abstraction Layer (HAL) Implementation

**Objective**: Create mock implementations for all hardware-dependent services that the core protocol logic will interact with. These mocks will run within Docker and simulate hardware behavior.

**Tasks**:

1.  **Define/Review Hardware Service Interfaces**:
    *   Based on `docs/architecture/system-architecture.md` (Layer 1) and `docs/guidance/juicetokens-protocol-definition.md` (Section 1.1).
    *   Ensure clear TypeScript interfaces exist for:
        *   TEE Operations (secure key storage, cryptographic operations, attestation verification).
        *   Device Capability Discovery (reporting mock capabilities).
        *   Time Source Management (providing simulated time, consensus status, spoofing detection results).
    *   Refer to `docs/api/typescript-adapters.md` and update/create as necessary.

2.  **Implement Mock TEE Adapter**:
    *   Simulate secure key generation, storage, and retrieval (in-memory or using a simple file within the container for mock persistence if needed).
    *   Mock cryptographic operations (e.g., signing, hashing) – can return pre-calculated values or perform actual crypto using a JS library but without real TEE involvement.
    *   Mock attestation verification logic.
    *   Allow configuration for simulating success/failure of operations.

3.  **Implement Mock Device Capability Adapter**:
    *   Return a predefined set of device capabilities relevant for testing (e.g., simulated presence of NFC, BLE, specific crypto support).

4.  **Implement Mock Time Source Adapter**:
    *   Provide methods to get current (simulated) time.
    *   Simulate different `TimeStatusModes` (Verified, Consensus, Inadequate).
    *   Allow test configurations to drift time, simulate spoofing, or control consensus outcomes.

5.  **Register Mock HAL with ServiceProvider**:
    *   All mock hardware adapters should be registered with the `ServiceProvider` and be configurable to be the active "REAL" implementation for these hardware-level services during testing.

### Phase 3.2: Protobuf-Based Service Implementation (Layer by Layer)

**Objective**: Sequentially replace mock business logic with real implementations using generated protobuf TypeScript code. Each new service will interact with already implemented real services or the Mock HAL via the `ServiceProvider`.

**General Workflow for Each Service/Component**:

1.  **Identify Target Service**: Pick a service from `docs/development/docker-integration-plan.md` (e.g., `mockTimeSource` in Foundation, `mockMessageFraming` in Transport, `mockTokenCreation` in Token Layer).
2.  **Generate/Verify Protobuf TypeScript Code**: Ensure the relevant `.proto` messages are compiled and TypeScript types are available.
3.  **Implement "REAL" Service Logic**:
    *   Write the TypeScript class/module for the service.
    *   Use generated protobuf types for all inputs, outputs, and internal data structures.
    *   Interact with dependent services (e.g., `MongoDBDHTStorage`, Mock TEE Adapter) via `ServiceProvider.getService()`.
    *   Implement the detailed logging and metrics hooks as specified in `docker-integration-plan.md`.
4.  **Unit Test the Service**: Write Jest unit tests. Mock all external dependencies using `jest.mock()` to isolate the service logic.
5.  **Register with ServiceProvider**: Add the new "REAL" implementation to the `ServiceProvider`.

**Priority Order for Service Implementation**:

1.  **Foundation Layer Services**:
    *   **Time Service**: Uses protobufs for `TimeSource`, `TimeConsensus`, etc. Interacts with Mock Time Source Adapter.
    *   **Cryptographic Service**: Wraps calls to the Mock TEE Adapter, using protobufs for request/response if defined for crypto ops.
    *   *(Persistence `MongoDBDHTStorage` is assumed complete)*

2.  **Transport Layer Services**:
    *   **Message Framing Service**: Implements `MessageFrame` (protobuf) logic for serialization/deserialization and chunking.
    *   **Inter-Container Pipe Service (e.g., WebSocket-based)**: Replaces `mockWebSocketPipe`. This service will establish communication between Docker containers (e.g., Node A to Node B). It will use protobufs like `PipeConfiguration`, `PipeStatus`, and transmit framed (protobuf) messages.

3.  **Core Token Layer Services**:
    *   **Token Management Service** (replaces `mockTokenCreation`):
        *   Handles creation, validation of `Token` (protobuf), `TokenId` (protobuf).
        *   Interacts with Cryptographic Service for any signing/verification.
    *   **Telomere Management Service** (replaces `mockTelomereTransformation`):
        *   Manages `Telomeer` (protobuf) updates, `OwnershipProof` (protobuf).
    *   **Transaction Protocol Service** (replaces `mockTransactionInitiation`):
        *   **Crucial Implementation**: Implements the state machine for the Four-Packet Transaction Model.
        *   Uses `ExoPak` (protobuf), `RetroPak` (protobuf), `TransactionContext` (protobuf).
        *   Orchestrates the exchange of these packets with a peer container via the Inter-Container Pipe Service.
        *   Relies heavily on Time Service (for timestamps, consensus) and Cryptographic Service (for signatures on packets).

4.  **Trust and Attestation Layer (Basic Services)**:
    *   **Attestation Service**: Handles creation and DHT storage of `SystemAttestation` (protobuf), `PeerAttestation` (protobuf). Uses `MongoDBDHTStorage`.
    *   **Identity Service**: Basic management of `KeyPair` (protobuf), `IdentityProof` (protobuf), interacting with Mock TEE for key operations.

5.  **Token Lifecycle Layer (Basic Services)**:
    *   **Token Creation Protocol Service** (replaces `mockEggGeneration`): Manages `EggGeneration` (protobuf), `HatchingCondition` (protobuf).

### Phase 3.3: Integration Testing in Docker Environment

**Objective**: Verify that the integrated protobuf-based services function correctly together, especially for end-to-end transactions, within the multi-container Docker setup.

**Tasks**:

1.  **Develop Integration Test Suite**: Create a new suite of integration tests (e.g., using Jest, potentially with a helper library to interact with the container manager API and individual container APIs if exposed).

2.  **Test Scenario: Two-Party Transaction (Happy Path)**:
    *   Container Manager spawns two containers (User A, User B).
    *   Configure `ServiceProvider` in both to use "REAL" implementations for Foundation, Transport, Token, and basic Trust/Lifecycle layers, and the Mock HAL.
    *   User A initiates a token transfer to User B.
    *   **Verify**: 
        *   Correct Four-Packet exchange sequence using protobuf messages over the Inter-Container Pipe.
        *   Successful validation of packets (timestamps, mock signatures) at each step.
        *   `Token` ownership updates correctly in `MongoDBDHTStorage` for both users (Telomere updates).
        *   Relevant `SystemAttestation` (e.g., for transaction completion) is created.
        *   Logs and metrics reflect the expected flow.

3.  **Test Scenario: Transaction with Simulated Failures & Rollback**:
    *   **Connection Drop**: During the Four-Packet exchange, simulate a drop in the Inter-Container Pipe. Verify that the `TimeoutManager` (part of Transaction Protocol Service) triggers, and RetroPaks are (conceptually, or via mock state change) used for rollback. Both parties should revert to a consistent pre-transaction state.
    *   **Signature Verification Failure**: Configure the Mock TEE Adapter in one container to return a signature failure at a specific point in the transaction. Verify the transaction aborts cleanly.
    *   **Time Consensus Failure**: Configure the Mock Time Source Adapter to indicate `TimeStatusMode.Inadequate` before finalization. Verify the transaction is blocked or rolled back as per protocol rules.

4.  **Test Scenario: Other Core Operations**:
    *   **Token Creation**: User A creates new tokens. Verify correct `Token` (protobuf) structure in `MongoDBDHTStorage`.
    *   **Attestation**: User A attests to User B. Verify `PeerAttestation` (protobuf) is created and stored.
    *   **Egg Hatching**: Simulate conditions for `EggGeneration` and `HatchingCondition` to verify new token potential is correctly managed.

5.  **Data Persistence Tests**:
    *   Perform operations, then stop and restart user containers. Verify that state (tokens, attestations) loaded from `MongoDBDHTStorage` is consistent.

6.  **Concurrency (Basic)**:
    *   If feasible with the test framework, initiate multiple near-simultaneous transactions to observe basic handling, though full concurrency testing might be a later phase.

### Phase 3.4: Debugging, Monitoring, and Refinement

**Objective**: Utilize the built-in logging and metrics, along with Docker tools, to debug issues and refine implementations.

**Tasks**:

1.  **Active Monitoring**: During integration tests, monitor container logs (for the debug messages planned in `docker-integration-plan.md`) and any collected metrics.
2.  **Docker Tools**: Use `docker logs <container_id>`, `docker exec -it <container_id> sh`, and Docker Desktop/Portainer for inspection.
3.  **Iterative Refinement**: Based on test failures or unexpected behavior:
    *   Debug individual service logic.
    *   Adjust Mock HAL adapter behavior or configuration options to better facilitate testing complex scenarios.
    *   Refine protobuf definitions if structural issues are found (this should be rare if .proto files are considered stable).

## 4. Deliverables

-   Fully implemented and unit-tested Mock Hardware Abstraction Layer adapters.
-   Real, protobuf-based implementations for all targeted services in the Foundation, Transport, Core Token, and basic Trust/Lifecycle layers.
-   A comprehensive suite of integration tests demonstrating correct end-to-end functionality (especially transactions) and failure handling within the Docker environment.
-   Updated documentation (`system-architecture.md`, `typescript-adapters.md`, etc.) reflecting the integrated protobuf services and mock hardware testing setup.
-   A report summarizing test results, any significant issues encountered, and confirmations of protocol behavior.

## 5. Next Steps (Post-Integration)

-   Performance benchmarking of the protobuf-based services in Docker.
-   Planning for integration with actual native hardware capabilities, replacing the Mock HAL components one by one.
-   Expanding test coverage for more complex scenarios and edge cases. 