# JuiceTokens Protocol - Lifecycle Layer

This module implements the TypeScript adapters for the Token Lifecycle Layer of the JuiceTokens Protocol, specifically focusing on token creation, renewal, and lifecycle management.

## Components

### Token Creation Adapter

The `TokenCreationAdapter` handles the full lifecycle of token creation:

- **Egg Generation**: Creating dormant token potentials
- **Genesis Pool Creation**: Managing trusted groups for token creation
- **Fertilization**: Activating dormant eggs through user activity
- **Maturation Path**: Tracking progress through stages from dormant to active
- **Token Distribution**: Allocating newly created tokens

### Token Renewal Adapter

The `TokenRenewalAdapter` handles all aspects of token renewal:

- **Expiry Notifications**: Alerting users to tokens nearing expiration
- **Renewal Requests**: Processing token renewal requests
- **Facilitation**: Supporting peer-assisted renewal
- **Telomeer Renewal**: Updating ownership information during renewal
- **Reward Calculation**: Calculating incentives for renewal facilitation

## Usage

```typescript
import { TokenCreationAdapter, TokenRenewalAdapter } from '@juicetokens/protocol-lifecycle';

// Create adapters
const creationAdapter = new TokenCreationAdapter();
const renewalAdapter = new TokenRenewalAdapter();

// Generate token eggs
const eggGeneration = {
  // ... egg generation parameters
};
const result = await creationAdapter.generateEggs(eggGeneration);

// Process token renewal
const renewalRequest = {
  // ... renewal request parameters
};
const validationResult = renewalAdapter.validateRenewalRequest(renewalRequest);
```

## Testing

The test suite demonstrates the complete token lifecycle from creation through renewal:

```bash
npm test
```

## Implementation

The adapters follow the protocol definitions in:
- `protos/lifecycle/creation.proto`
- `protos/lifecycle/renewal.proto`

These TypeScript adapters provide a type-safe interface layer above the protocol buffer definitions, with full validation, error handling, and business logic implementation.

## Design Choices

This implementation includes several design choices that extend beyond what's explicitly specified in the protocol documentation:

### Architecture & API Design

1. **Result Pattern with Validation**: Using `IResult<T>` interface with consistent validation and error reporting across all adapter methods.

2. **Strongly-Typed Enums**: Defined TypeScript enums for states like `MaturationStage`, `HatchingConditionType` and `DistributionStrategy` for stronger type safety.

3. **Asynchronous API**: Methods are designed as asynchronous (using Promises) for future-proofing when database or network operations are added.

4. **Stateless Adapter Pattern**: Adapters are implemented in a stateless manner where each method takes all required parameters rather than maintaining internal state.

### Cryptography

1. **SHA256 Hash Stacking**: Used for all commitments and proofs, allowing concatenation of multiple data elements into a single secure commitment.

2. **ED25519 Signatures**: Implemented for all signature operations where non-repudiation is important, such as in token renewal.

3. **Deterministic Signatures for Testing**: Implemented predictable signature generation for testing purposes.

### Business Logic Constants

1. **Maturation Period Timing**:
   - Fertilized stage: 24 hours
   - Incubating stage: 48 hours
   - Hatching stage: 12 hours

2. **Default Expiry Periods**:
   - Dormant eggs: 30 days
   - Renewed tokens: 1 year

3. **Facilitation Rewards**:
   - Default reward: 2% of token value
   - Maximum reward: 5% of token value

4. **Developmental Stage Distribution**:
   - Trust Building: 15%
   - Autonomy Support: 15%
   - Imagination Funding: 15%
   - Competence Reward: 15%
   - Identity Formation: 15%
   - Connection Bridges: 15%
   - Generativity Projects: 10%

These design choices provide a more complete implementation while maintaining alignment with the protocol's intent and are subject to adjustment as the protocol evolves. 