# Mesh Network Transport Layer

This package implements a complete transport layer with peer discovery, mesh networking, routing table management, and store-and-forward functionality. It's designed to allow applications to communicate in a distributed, resilient manner without relying on central servers.

## Features

- **Peer Discovery**: Automatic peer discovery using UDP broadcasts
- **Mesh Network**: Connect peers in a dynamic mesh topology
- **Distance Vector Routing**: Maintain efficient routing tables for message delivery
- **Store and Forward**: Reliable message delivery with retry mechanisms
- **Network Resilience**: Adaptive to changing network conditions
- **Simple API**: Clean, promise-based API for ease of use
- **CLI Tool**: Interactive command-line tool for testing and demonstration

## Architecture

The network implementation consists of several modular components:

- `discovery.ts`: UDP-based peer discovery
- `mesh.ts`: WebSocket mesh network implementation
- `routing.ts`: Distance vector routing table
- `store.ts`: Store-and-forward message cache
- `types.ts`: Interface definitions
- `cli/mesh-node.ts`: Command-line tool for testing

## Usage

### Basic Usage

```typescript
import { 
  createPeerAddress, 
  PeerDiscoveryFactory, 
  MeshNetworkFactory 
} from '@juicetokens/transport/networking';

// Create a local peer address
const localAddress = createPeerAddress('127.0.0.1', 44301);

// Create discovery and mesh network
const discovery = PeerDiscoveryFactory.createUdpDiscovery();
const network = MeshNetworkFactory.createWebSocketMeshNetwork(
  localAddress,
  discovery
);

// Start the network
await network.start();

// Send a message to a peer
await network.send({
  id: 'message-id',
  source: localAddress,
  destination: targetPeer,
  payload: new TextEncoder().encode('Hello, world!'),
  ttl: 10,
  timestamp: Date.now()
});

// Receive messages
network.onMessage().subscribe(message => {
  console.log('Received message:', new TextDecoder().decode(message.payload));
});

// Broadcast to all peers
await network.broadcast({
  id: 'broadcast-id',
  source: localAddress,
  destination: { id: 'broadcast', host: '255.255.255.255', port: 0 },
  payload: new TextEncoder().encode('Hello, everyone!'),
  ttl: 5,
  timestamp: Date.now()
});

// Stop the network when done
await network.stop();
```

### Using the CLI Tool

Run multiple instances of the CLI tool to test the mesh network:

```bash
# Terminal 1 - Run on port 44301
npx ts-node src/networking/cli/mesh-node.ts 44301

# Terminal 2 - Run on port 44302
npx ts-node src/networking/cli/mesh-node.ts 44302

# Terminal 3 - Run on port 44303
npx ts-node src/networking/cli/mesh-node.ts 44303
```

Once started, you can use the following commands in each terminal:

- `peers`: List connected peers
- `routes`: Show the routing table
- `send <peer_id> <message>`: Send a message to a specific peer
- `broadcast <message>`: Broadcast a message to all peers
- `help`: Show available commands
- `exit`: Exit the application

## Implementation Details

### Peer Discovery

The peer discovery uses UDP broadcasts to find other peers on the local network. Each peer periodically advertises its presence and listens for advertisements from other peers.

### Mesh Network

The mesh network implementation uses WebSockets for direct peer-to-peer communication. It establishes connections between peers and manages connection lifecycle.

### Routing Table

The routing table implements a distance vector algorithm (similar to RIP) to maintain efficient routes to all known peers. It periodically exchanges routing information with neighbors.

### Store and Forward

The message store caches messages that need to be delivered and handles retries for failed deliveries. It also manages message lifecycle and cleanup.

## Testing

The implementation includes comprehensive tests that simulate a small network of peers:

- Testing peer discovery
- Testing mesh network formation
- Testing message routing and delivery
- Testing broadcast functionality

To run the tests:

```bash
npm test
```

## Future Improvements

- Add support for NAT traversal
- Implement secure communication with encryption
- Add bandwidth management and congestion control
- Support for multicast groups
- Persistence for offline message storage 