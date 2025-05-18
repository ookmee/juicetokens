# JuiceTokens Transport Layer

The Transport Layer for the JuiceTokens protocol provides a set of adapters and abstractions for different communication methods (QR, BLE, NFC, Web).

## Overview

The transport layer provides:

- A consistent interface for different communication methods
- Message framing and chunking for larger payloads
- Reliability mechanisms including acknowledgment and retransmission
- Configuration management for different transport types

## Important Note: Temporary Mock Types

This package currently uses temporary mock types defined in `src/proto-types.ts` to simulate the Protocol Buffer generated types. These mock types should be replaced with the actual generated types once the protocol buffer compilation process is functioning correctly.

The current build system is looking for non-existent proto files (e.g., `extension_point.proto`), causing the compilation process to fail. Once these issues are fixed, all imports should be updated to use `@juicetokens/proto` instead of the local mock types.

## Architecture

The transport layer is organized as follows:

```
src/
├── adapters/         # Concrete pipe implementations
│   ├── BasePipe.ts   # Abstract base pipe implementation
│   ├── QrKissPipe.ts # QR KISS pipe implementation
│   ├── BlePipe.ts    # BLE pipe implementation
│   ├── NfcPipe.ts    # NFC pipe implementation
│   └── WebPipe.ts    # Web-based pipe implementation
├── framing/          # Message framing components
│   └── MessageFramer.ts # Handles message chunking and reassembly
├── reliability/      # Reliability mechanisms
│   └── ReliabilityManager.ts # Handles acknowledgments and retransmission
├── types/            # Type definitions
│   ├── Pipe.ts       # The core Pipe interface
│   └── PipeConfigManager.ts # Configuration management for pipes
├── PipeFactory.ts    # Factory for creating pipe instances
└── index.ts          # Package exports
```

## Using the Transport Layer

### Creating a Pipe

```typescript
import { PipeFactory, PipeType, PipeConfigManager } from '@juicetokens/transport';

// Create a pipe with default configuration
const qrPipe = PipeFactory.createPipe(PipeType.QR_KISS);

// Create a pipe with custom configuration
const config = PipeConfigManager.createBleConfig({
  ble: {
    serviceUuid: '12345678-1234-1234-1234-123456789abc',
    characteristicUuid: '87654321-4321-4321-4321-cba987654321'
  }
});
const blePipe = PipeFactory.createPipe(PipeType.BLE, config);
```

### Using a Pipe

```typescript
import { MessageFrame, FrameType } from '@juicetokens/proto';

// Initialize the pipe
await pipe.initialize(config);

// Connect the pipe
await pipe.connect(true); // true for initiator, false for responder

// Send a message
const message: MessageFrame = {
  frameId: 'unique-id',
  type: FrameType.DATA,
  payload: new Uint8Array([1, 2, 3, 4]),
  headers: { 'content-type': 'application/octet-stream' },
  timestampMs: BigInt(Date.now()),
  compression: 0, // NONE
  chunks: [{
    chunkIndex: 0,
    totalChunks: 1,
    chunkSize: 4,
    chunkHash: new Uint8Array(),
    completeHash: new Uint8Array()
  }],
  protocolVersion: 1,
  sequenceNumber: 0
};

await pipe.sendMessage(message);

// Receive messages
pipe.receiveMessages().subscribe(message => {
  console.log('Received message:', message);
});

// Disconnect when done
await pipe.disconnect();
```

## Protocol Adapters

### QR KISS Pipe

The QR KISS (Keep It Simple & Secure) pipe uses QR codes for visual data transfer. It's useful for offline transfers between devices.

### BLE Pipe

The BLE (Bluetooth Low Energy) pipe uses Bluetooth for direct device-to-device communication. It's energy-efficient and works well for nearby devices.

### NFC Pipe

The NFC (Near Field Communication) pipe enables very close-range communication between devices. It's useful for tap-to-transfer scenarios.

### Web Pipe

The Web pipe uses HTTP or WebSockets for long-distance communication over the internet.

## Advanced Usage

### Message Framing

```typescript
import { MessageFramer, FrameType } from '@juicetokens/transport';

const framer = new MessageFramer({
  maxChunkSize: 1024, // 1KB chunks
  compressionType: 1, // GZIP
  protocolVersion: 1
});

// Create a message (possibly chunked if large)
const data = new Uint8Array(largeData);
const frames = framer.createFrame(data, FrameType.DATA, { 'content-type': 'application/octet-stream' });

// Send each frame
for (const frame of frames) {
  await pipe.sendMessage(frame);
}

// Process received frames
pipe.receiveMessages().subscribe(frame => {
  const result = framer.processFrame(frame);
  if (result.isComplete) {
    console.log('Complete message received:', result.frame);
  } else if (result.missingChunks) {
    console.log('Waiting for chunks:', result.missingChunks);
  }
});
```

### Reliability Management

```typescript
import { ReliabilityManager } from '@juicetokens/transport';

const manager = new ReliabilityManager(
  async (message) => {
    // Send function - called for initial send and retries
    await pipe.sendMessage(message);
  },
  {
    maxRetries: 3,
    baseTimeoutMs: 5000,
    useExponentialBackoff: true
  }
);

// Send with reliability guarantees
const result = await manager.sendReliableMessage(message);
if (result.success) {
  console.log(`Message sent successfully after ${result.retryCount} retries`);
} else {
  console.error(`Failed to send message: ${result.errorMessage}`);
}
```

## License

Copyright © JuiceTokens Protocol 