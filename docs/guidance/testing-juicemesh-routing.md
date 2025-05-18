# Testing JuiceMesh Routing

## Introduction

The JuiceTokens Transport Layer implements a robust peer-to-peer mesh network responsible for routing messages between nodes in a resilient and efficient manner. This document outlines strategies for effectively building, testing, and debugging the mesh network implementation. The mesh network consists of several key components:

- **Peer Discovery**: UDP-based mechanism for discovering peers on the network
- **Mesh Formation**: WebSocket connections between peers to form a resilient network
- **Routing Table Management**: Distance vector algorithm to maintain optimal routes
- **Store-and-Forward**: Message caching and retry system for reliable delivery

Thorough testing of these components is critical to ensure the network functions correctly under various conditions, including node failures, network partitions, and high message loads.

## Testing Strategies

### 1. Local Development Testing

Start with controlled local tests using the existing CLI tool:

```bash
# Start multiple instances on different ports
npm run start-mesh 44301 127.0.0.1  # Terminal 1
npm run start-mesh 44302 127.0.0.1  # Terminal 2 
npm run start-mesh 44303 127.0.0.1  # Terminal 3
```

Verify basic operations:
- Peer discovery
- Connection establishment
- Direct message delivery
- Multi-hop routing
- Broadcast messaging

### 2. Automated Unit and Integration Tests

Expand the existing test suite with:

- Unit tests for routing table algorithms
- Integration tests for peer discovery
- End-to-end tests for message delivery
- Stress tests with high message volumes

Example of a routing table test:

```typescript
test('Routing table correctly updates on peer disconnection', async () => {
  // Setup a 3-node network
  const [node1, node2, node3] = await setupThreeNodeNetwork();
  
  // Verify all nodes are connected
  expect(node1.getPeers().length).toBe(2);
  expect(node2.getPeers().length).toBe(2);
  expect(node3.getPeers().length).toBe(2);
  
  // Send message from node1 to node3
  await sendTestMessage(node1, node3);
  
  // Stop middle node (node2)
  await node2.stop();
  
  // Wait for routing tables to update
  await waitForRoutingUpdate();
  
  // Verify node1 and node3 update their routing tables
  expect(node1.getPeers().length).toBe(1);
  expect(node3.getPeers().length).toBe(1);
  
  // Verify message can still be sent from node1 to node3 directly
  await sendTestMessage(node1, node3);
  
  // Cleanup
  await Promise.all([node1, node3].map(n => n.stop()));
});
```

### 3. Docker Container Testing

Docker provides an ideal environment for testing mesh networks, as it simulates true network isolation between containers:

```yaml
# docker-compose.yml for mesh testing
version: '3'
services:
  mesh-node-1:
    build: .
    ports:
      - "44301:44301"
      - "44201:44201/udp"
    environment:
      - MESH_NODE_HOST=mesh-node-1
      - MESH_NODE_PORT=44301
      - MESH_NODE_NAME=Node-1
    networks:
      - mesh-network

  mesh-node-2:
    build: .
    ports:
      - "44302:44302"
      - "44201:44201/udp"
    environment:
      - MESH_NODE_HOST=mesh-node-2
      - MESH_NODE_PORT=44302
      - MESH_NODE_NAME=Node-2
    networks:
      - mesh-network

  # Add more nodes as needed

networks:
  mesh-network:
    driver: bridge
```

Use Docker network features to test specific scenarios:
- Use network partitioning to split the mesh
- Introduce latency with `tc` commands
- Simulate packet loss between containers

### 4. Integration with Token Flow Testing

The existing Docker-based test user instances can be enhanced to incorporate mesh network testing. This provides an opportunity to test both token flow and mesh networking simultaneously:

1. Add mesh network configuration to existing test user containers
2. Create test scenarios that require message routing for token transfers
3. Measure and analyze network performance during token flow operations

This integrated approach helps validate that the mesh network can properly support the core token functionality under realistic conditions.

## Dynamic Port Allocation

To enable dynamic port allocation for easier testing with large numbers of nodes:

### 1. Port Manager Service

Implement a port management service to track and allocate available ports:

```typescript
export class PortManager {
  private usedPorts: Set<number>;
  private portRange: [number, number];
  
  constructor(minPort = 44300, maxPort = 44399) {
    this.usedPorts = new Set<number>();
    this.portRange = [minPort, maxPort];
  }
  
  allocatePort(): number {
    for (let port = this.portRange[0]; port <= this.portRange[1]; port++) {
      if (!this.usedPorts.has(port)) {
        this.usedPorts.add(port);
        return port;
      }
    }
    throw new Error('No available ports in the specified range');
  }
  
  releasePort(port: number): void {
    this.usedPorts.delete(port);
  }
}
```

### 2. Network Node Factory

Create a factory function to easily spin up nodes with dynamic ports:

```typescript
export async function createMeshNode(
  name?: string,
  portManager?: PortManager
): Promise<{
  address: PeerAddress;
  network: MeshNetwork;
  port: number;
}> {
  // Use port manager or create a default one
  const pm = portManager || new PortManager();
  
  // Allocate a port
  const port = pm.allocatePort();
  
  // Create address, discovery, and network
  const address = createPeerAddress('127.0.0.1', port, {
    name: name || `Node-${port}`,
    type: 'test-node'
  });
  
  const discovery = PeerDiscoveryFactory.createUdpDiscovery();
  const network = MeshNetworkFactory.createWebSocketMeshNetwork(address, discovery);
  
  // Start the network
  await network.start();
  
  return { address, network, port };
}
```

### 3. Test Utilities

Update the test utilities to support dynamic port allocation:

```typescript
export async function createTestNetwork(
  nodeCount: number
): Promise<MeshNetwork[]> {
  const portManager = new PortManager();
  const nodes: MeshNetwork[] = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const { network } = await createMeshNode(`Node-${i}`, portManager);
    nodes.push(network);
  }
  
  // Allow time for peers to discover each other
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return nodes;
}
```

## Network Visualization

Implement monitoring tools to visualize the mesh network for debugging and analysis:

### 1. CLI-Based Routing Visualization

Add a new command to the CLI tool that provides detailed routing information:

```typescript
case 'debug-routes': {
  // Get current routing table
  const routes = (network as any).routingTable?.getRoutes();
  if (!routes || routes.length === 0) {
    console.log('No routes available to visualize');
    break;
  }
  
  // Create visualization data
  const nodes = new Set<string>();
  const links = [];
  
  // Add local node
  nodes.add(`${localAddress.id} (${localAddress.metadata?.name || 'local'})`);
  
  // Add routes
  routes.forEach((route: RoutingEntry) => {
    const destId = `${route.destination.id} (${route.destination.metadata?.name || 'peer'})`;
    const hopId = `${route.nextHop.id} (${route.nextHop.metadata?.name || 'peer'})`;
    
    nodes.add(destId);
    nodes.add(hopId);
    
    links.push({
      source: `${localAddress.id} (${localAddress.metadata?.name || 'local'})`,
      target: hopId,
      distance: 1
    });
    
    if (route.distance > 1) {
      links.push({
        source: hopId,
        target: destId,
        distance: route.distance - 1
      });
    }
  });
  
  // Output ASCII visualization
  console.log('\nNetwork Topology:');
  console.log('----------------');
  nodes.forEach(node => console.log(`Node: ${node}`));
  console.log('');
  links.forEach(link => console.log(`Link: ${link.source} → ${link.target} (distance: ${link.distance})`));
  
  break;
}
```

### 2. Web-Based Network Visualization Dashboard

For more advanced visualization, implement a web dashboard:

```typescript
// Create a monitoring server that collects data from all nodes
export class MeshMonitor {
  private server: http.Server;
  private io: socketIO.Server;
  private nodes: Map<string, NodeStatus> = new Map();
  
  constructor(port = 9090) {
    this.server = http.createServer();
    this.io = new socketIO.Server(this.server);
    
    this.io.on('connection', (socket) => {
      socket.on('node-status', (status: NodeStatus) => {
        this.nodes.set(status.id, status);
        this.io.emit('network-update', Array.from(this.nodes.values()));
      });
    });
    
    this.server.listen(port, () => {
      console.log(`Mesh monitor running on port ${port}`);
    });
  }
}

// Update WebSocketMeshNetwork to report status to monitor
private reportStatus() {
  if (!this.monitor) return;
  
  const status = {
    id: this.localAddress.id,
    name: this.localAddress.metadata?.name,
    peers: this.getPeers(),
    routes: this.routingTable.getRoutes(),
    messages: this.messageStore.getPending().length
  };
  
  this.monitor.emit('node-status', status);
}
```

This data can be visualized in a browser using D3.js or similar libraries to create interactive network graphs.

### 3. Route Change Recording and Playback

Implement a system to record routing table changes for later analysis:

```typescript
export class RouteRecorder {
  private events: RouteEvent[] = [];
  private startTime: number;
  
  constructor() {
    this.startTime = Date.now();
  }
  
  recordEvent(type: 'add' | 'remove' | 'update', entry: RoutingEntry) {
    this.events.push({
      timestamp: Date.now() - this.startTime,
      type,
      entry
    });
  }
  
  save(filename: string) {
    fs.writeFileSync(filename, JSON.stringify(this.events, null, 2));
  }
  
  static load(filename: string): RouteEvent[] {
    return JSON.parse(fs.readFileSync(filename, 'utf-8'));
  }
  
  static replay(events: RouteEvent[]): void {
    // Create a visualization of the events over time
  }
}
```

## Advanced Testing Scenarios

### 1. Network Partition Testing

Split the network into two or more partitions and verify proper behavior:

- Messages to unreachable peers should be queued in store-and-forward
- When partitions reconnect, queued messages should be delivered
- Routing tables should update correctly when partitions merge

```typescript
async function testNetworkPartition() {
  // Create a 6-node network
  const nodes = await createTestNetwork(6);
  
  // Split into two partitions by stopping node[2] and node[3]
  // This creates two partitions: [0,1] and [4,5]
  await nodes[2].stop();
  await nodes[3].stop();
  
  // Verify partitions
  expect(canReach(nodes[0], nodes[1])).toBe(true);
  expect(canReach(nodes[0], nodes[4])).toBe(false);
  expect(canReach(nodes[4], nodes[5])).toBe(true);
  
  // Queue a message from node[0] to node[5]
  const message = createTestMessage(nodes[0], nodes[5]);
  await nodes[0].send(message);
  
  // Restart node[3] to bridge the partitions
  await nodes[3].start();
  
  // Wait for routing tables to update
  await waitForRoutingUpdate();
  
  // Verify message delivery
  expect(messageReceived(nodes[5], message.id)).toBe(true);
}
```

### 2. High-Load Testing

Test the network under heavy message load to identify bottlenecks:

```typescript
async function testHighLoad() {
  // Create a network with 10 nodes in a ring topology
  const nodes = await createRingNetwork(10);
  
  // Send 1000 messages through the network
  const messages = [];
  for (let i = 0; i < 1000; i++) {
    // Send from random source to random destination
    const sourceIdx = Math.floor(Math.random() * 10);
    let destIdx;
    do {
      destIdx = Math.floor(Math.random() * 10);
    } while (destIdx === sourceIdx);
    
    const message = createTestMessage(nodes[sourceIdx], nodes[destIdx].getPeerAddress());
    messages.push({ id: message.id, destIdx });
    await nodes[sourceIdx].send(message);
  }
  
  // Verify delivery
  const deliveryResults = await Promise.all(
    messages.map(async ({ id, destIdx }) => {
      return { id, delivered: await messageReceived(nodes[destIdx], id) };
    })
  );
  
  // Calculate delivery rate
  const deliveryRate = deliveryResults.filter(r => r.delivered).length / messages.length;
  console.log(`Delivery rate: ${deliveryRate * 100}%`);
}
```

### 3. Large Network Testing

Test behavior with a large number of nodes:

```typescript
async function testLargeNetwork() {
  // Create a network with 100 nodes
  const nodes = await createTestNetwork(100);
  
  // Measure time to stabilize routing tables
  const start = Date.now();
  await waitForStableNetwork(nodes);
  const stabilizationTime = Date.now() - start;
  
  console.log(`Network with 100 nodes stabilized in ${stabilizationTime}ms`);
  
  // Test message delivery across the network
  const sourceNode = nodes[0];
  const destNode = nodes[99];
  
  const message = createTestMessage(sourceNode, destNode.getPeerAddress());
  const sendStart = Date.now();
  await sourceNode.send(message);
  
  // Wait for delivery
  await waitForMessageDelivery(destNode, message.id);
  const deliveryTime = Date.now() - sendStart;
  
  console.log(`Message delivered across 100-node network in ${deliveryTime}ms`);
}
```

## Continuous Monitoring and Telemetry

Implement continuous monitoring to track network health:

### 1. Metrics Collection

```typescript
export interface MeshMetrics {
  nodeId: string;
  connectedPeers: number;
  routeCount: number;
  messagesReceived: number;
  messagesSent: number;
  messagesForwarded: number;
  pendingMessages: number;
  avgDeliveryTime: number;
}

// Add to WebSocketMeshNetwork
private metrics: MeshMetrics = {
  nodeId: '',
  connectedPeers: 0,
  routeCount: 0,
  messagesReceived: 0,
  messagesSent: 0,
  messagesForwarded: 0,
  pendingMessages: 0,
  avgDeliveryTime: 0
};

// Update metrics periodically
private updateMetrics(): void {
  this.metrics = {
    nodeId: this.localAddress.id,
    connectedPeers: this.connections.size,
    routeCount: this.routingTable.getRoutes().length,
    messagesReceived: this.receivedCount,
    messagesSent: this.sentCount,
    messagesForwarded: this.forwardedCount,
    pendingMessages: this.messageStore.getPending().length,
    avgDeliveryTime: this.calculateAvgDeliveryTime()
  };
  
  // Report to monitoring system
  if (this.metricsReporter) {
    this.metricsReporter.report(this.metrics);
  }
}
```

### 2. Prometheus Integration

```typescript
export class PrometheusReporter {
  private registry: prometheus.Registry;
  private connectedPeersGauge: prometheus.Gauge;
  private messagesSentCounter: prometheus.Counter;
  private messagesReceivedCounter: prometheus.Counter;
  
  constructor() {
    this.registry = new prometheus.Registry();
    
    this.connectedPeersGauge = new prometheus.Gauge({
      name: 'mesh_connected_peers',
      help: 'Number of currently connected peers',
      labelNames: ['node_id']
    });
    
    // Add more metrics...
    
    this.registry.registerMetric(this.connectedPeersGauge);
    // Register other metrics...
  }
  
  report(metrics: MeshMetrics): void {
    this.connectedPeersGauge.set({ node_id: metrics.nodeId }, metrics.connectedPeers);
    // Update other metrics...
  }
  
  startServer(port: number): void {
    http.createServer((req, res) => {
      if (req.url === '/metrics') {
        res.setHeader('Content-Type', this.registry.contentType);
        res.end(this.registry.metrics());
      } else {
        res.statusCode = 404;
        res.end('Not found');
      }
    }).listen(port);
  }
}
```

## Best Practices and Recommendations

### Network Design

1. **Network Topology**: Design the network topology to balance between:
   - Resilience (multiple connection paths)
   - Efficiency (minimal hops for common routes)
   - Scalability (avoid all-to-all connectivity)

2. **Routing Algorithm**: The distance vector algorithm works well for small to medium networks, but consider alternatives for larger deployments:
   - Link state routing for larger networks
   - Geographic routing for location-aware applications
   - Hybrid approaches for specific use cases

3. **Connection Management**: Establish policies for:
   - Maximum connections per node
   - Connection pruning strategies
   - Reconnection backoff algorithms

### Testing Approach

1. **Progressive Testing**: Follow a staged approach:
   - Unit tests for basic functionality
   - Integration tests for component interaction
   - Simulated network tests for realistic scenarios
   - Production monitoring for real-world behavior

2. **Chaos Testing**: Deliberately introduce failures:
   - Random node failures
   - Network partitions
   - Message delays and losses
   - Clock drift between nodes

3. **Performance Testing**: Establish baseline performance:
   - Message throughput
   - Routing convergence time
   - CPU and memory usage
   - Network bandwidth consumption

### Deployment Considerations

1. **Service Discovery**: Enhance peer discovery for production:
   - Bootstrap nodes for initial connection
   - DNSDiscovery for nodes behind NAT
   - Centralized registry for enterprise deployments

2. **Security**: Add security measures:
   - TLS for all connections
   - Node authentication
   - Message encryption
   - Rate limiting to prevent DoS

3. **Monitoring**: Implement comprehensive monitoring:
   - Node health metrics
   - Network topology visualization
   - Message flow analysis
   - Alert on anomalies

## Conclusion

Testing the JuiceMesh routing implementation requires a multi-faceted approach that covers basic functionality, resilience, performance, and security. By following the strategies outlined in this document, you can ensure that the mesh network will function reliably under various real-world conditions.

The mesh network is a critical component of the JuiceTokens protocol, as it enables the peer-to-peer value exchange that is central to the system's design. Thorough testing of the transport layer ensures that higher-level protocols can operate efficiently and reliably across the network.

Future work should focus on optimizing the mesh network for specific deployment scenarios, enhancing security features, and improving monitoring and visualization tools to help operators maintain the network. 