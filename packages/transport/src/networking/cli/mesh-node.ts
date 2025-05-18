#!/usr/bin/env node
import readline from 'readline';
import { createPeerAddress, PeerDiscoveryFactory } from '../discovery';
import { MeshNetworkFactory } from '../mesh';
import { NetworkMessage, RoutingEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Parse command line arguments
const args = process.argv.slice(2);
const port = parseInt(args[0]) || 44301;
const host = args[1] || '127.0.0.1';

// Create a local peer address
const localAddress = createPeerAddress(host, port, {
  name: `Node-${port}`,
  type: 'cli-node'
});

// Create discovery and mesh network
const discovery = PeerDiscoveryFactory.createUdpDiscovery();
const network = MeshNetworkFactory.createWebSocketMeshNetwork(
  localAddress,
  discovery
);

// Setup CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Start the mesh network
async function startNetwork() {
  console.log(`Starting mesh network node ${localAddress.id} on ${host}:${port}`);
  
  try {
    await network.start();
    console.log('Mesh network started successfully');
    
    // Subscribe to incoming messages
    network.onMessage().subscribe(message => {
      const text = new TextDecoder().decode(message.payload);
      console.log(`\nMessage from ${message.source.id} (${message.source.metadata?.name || 'unknown'}): ${text}`);
      rl.prompt();
    });
    
    // Display commands menu
    displayCommands();
    rl.prompt();
  } catch (err) {
    console.error('Failed to start mesh network:', err);
    process.exit(1);
  }
}

// Display available commands
function displayCommands() {
  console.log('\nAvailable commands:');
  console.log('  peers                  - List connected peers');
  console.log('  routes                 - Show routing table');
  console.log('  send <peer_id> <msg>   - Send message to a specific peer');
  console.log('  broadcast <msg>        - Broadcast message to all peers');
  console.log('  exit                   - Exit the application');
  console.log('');
}

// Process user commands
rl.on('line', async (input) => {
  const [command, ...args] = input.trim().split(' ');
  
  try {
    switch (command) {
      case 'peers': {
        const connectedPeers = network.getPeers();
        if (connectedPeers.length === 0) {
          console.log('No peers connected');
        } else {
          console.log('\nConnected peers:');
          connectedPeers.forEach(peer => {
            console.log(`  ${peer.id} (${peer.host}:${peer.port}) - ${peer.metadata?.name || 'unnamed'}`);
          });
        }
        break;
      }
        
      case 'routes': {
        if ('getRoutes' in network) {
          // This requires extending the MeshNetwork interface to expose the routing table
          const routes = (network as any).routingTable?.getRoutes();
          if (routes && routes.length > 0) {
            console.log('\nRouting table:');
            routes.forEach((route: RoutingEntry) => {
              console.log(`  ${route.destination.id} via ${route.nextHop.id} (distance: ${route.distance})`);
            });
          } else {
            console.log('No routes available');
          }
        } else {
          console.log('Routing table not accessible');
        }
        break;
      }
        
      case 'send': {
        if (args.length < 2) {
          console.log('Usage: send <peer_id> <message>');
          break;
        }
        
        const peerId = args[0];
        const messageText = args.slice(1).join(' ');
        const availablePeers = network.getPeers();
        const targetPeer = availablePeers.find(p => p.id === peerId || (p.metadata?.name === peerId));
        
        if (!targetPeer) {
          console.log(`Peer ${peerId} not found. Use 'peers' to list available peers.`);
          break;
        }
        
        const message: NetworkMessage = {
          id: uuidv4(),
          source: localAddress,
          destination: targetPeer,
          payload: new TextEncoder().encode(messageText),
          ttl: 10,
          timestamp: Date.now()
        };
        
        await network.send(message);
        console.log(`Message sent to ${targetPeer.metadata?.name || targetPeer.id}`);
        break;
      }
        
      case 'broadcast': {
        if (args.length < 1) {
          console.log('Usage: broadcast <message>');
          break;
        }
        
        const broadcastText = args.join(' ');
        const broadcastMessage: NetworkMessage = {
          id: uuidv4(),
          source: localAddress,
          destination: { id: 'broadcast', host: '255.255.255.255', port: 0 },
          payload: new TextEncoder().encode(broadcastText),
          ttl: 5,
          timestamp: Date.now()
        };
        
        await network.broadcast(broadcastMessage);
        console.log('Message broadcasted to all peers');
        break;
      }
        
      case 'exit': {
        await network.stop();
        console.log('Mesh network stopped');
        process.exit(0);
        break;
      }
        
      case 'help': {
        displayCommands();
        break;
      }
        
      default:
        if (command) {
          console.log(`Unknown command: ${command}`);
          displayCommands();
        }
    }
  } catch (err) {
    console.error('Error executing command:', err);
  }
  
  rl.prompt();
});

// Handle application shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down mesh network...');
  try {
    await network.stop();
    console.log('Mesh network stopped');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
});

// Start the network
startNetwork().catch(console.error); 