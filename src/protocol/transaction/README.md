# JuiceTokens Transaction Protocol

This module implements the Transaction Protocol for the JuiceTokens system as specified in the protocol definition document. The implementation follows the four-packet transaction model and includes adapters for transaction packets and token denomination optimization.

## Components

### TransactionManager

The `TransactionManager` class handles the complete lifecycle of a transaction, from initiation to final commitment. It implements the atomic commitment protocol to ensure transaction integrity.

### DenominationVectorClock

The `DenominationVectorClock` class optimizes token selection during transactions by tracking token denomination distribution status. It helps ensure an ideal mix of token denominations.

## Transaction Flow

The transaction protocol follows a four-packet model:

1. **TransactionInitiation**: Sender initiates a transaction with context and available tokens
2. **TransactionResponse**: Receiver accepts or rejects, and if accepted, specifies token packages
3. **TransactionConfirmation**: Sender confirms and provides commitment proof
4. **TransactionAcknowledgement**: Receiver acknowledges and provides commitment proof

## Usage Example

```typescript
// Initialize transaction managers for both parties
const senderManager = new TransactionManager();
const receiverManager = new TransactionManager();

// Update vector clocks with current token portfolios
senderManager.updateVectorClock(senderTokens);
receiverManager.updateVectorClock(receiverTokens);

// Step 1: Sender initiates the transaction
const initiation = senderManager.initiateTransaction(
  {
    senderPublicKey,
    transactionType: 'DIRECT',
    purpose: 'payment',
    amount: 25,
    constraints: {
      maxDurationMs: 60000,
      minBalanceAfter: 1,
      allowedDenominations: [1, 2, 5, 10, 20, 50],
      requiredAttestationLevel: 1,
      useWisselToken: false,
      useAfrondingBuffer: false
    }
  },
  senderTokens,
  receiverPublicKey
);

// Step 2: Receiver responds to the transaction
const response = receiverManager.respondToTransaction(
  initiation,
  receiverTokens,
  true // Accept the transaction
);

// Step 3: Sender processes the response
const confirmation = senderManager.processResponse(response);

// Step 4: Receiver processes the confirmation
const acknowledgement = receiverManager.processConfirmation(confirmation);

// Step 5: Sender finalizes the transaction
const finalizedTransaction = senderManager.finalizeTransaction(acknowledgement);
```

## Error Handling

The protocol includes comprehensive error handling for various scenarios:

- Transaction timeouts
- Invalid transaction states
- Validation failures
- Peer rejections
- Insufficient tokens

## Testing

Tests are available in the `tests` directory and demonstrate:

- Complete transaction flow (happy path)
- Transaction rejection flow
- DenominationVectorClock optimization 