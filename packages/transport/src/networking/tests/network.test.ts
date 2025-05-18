import { describe, jest, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createPeerAddress, PeerDiscoveryFactory } from '../discovery';
import { MeshNetworkFactory } from '../mesh';
import { NetworkMessage, PeerAddress } from '../types';
import { Observable, firstValueFrom, timeout } from 'rxjs';

// Mock the UDP socket for tests
jest.mock('dgram', () => {
  const EventEmitter = require('events');
  
  class MockSocket extends EventEmitter {
    bind(port: number) {
      setTimeout(() => this.emit('listening'), 0);
      return this;
    }
    
    setBroadcast() {
      return true;
    }
    
    send(msg: Buffer, offset: number, length: number, port: number, address: string, callback?: () => void) {
      // Simulate network broadcast by notifying all test peers
      if (global.__TEST_PEERS__) {
        const data = JSON.parse(msg.toString());
        for (const peer of global.__TEST_PEERS__) {
          if (peer.mockSocket && peer.address.id !== data.id) {
            setTimeout(() => {
              peer.mockSocket.emit('message', msg, { address: data.host, port: data.port });
            }, 50);
          }
        }
      }
      
      if (callback) callback();
      return this;
    }
    
    close(callback?: () => void) {
      if (callback) callback();
      return this;
    }
  }
  
  return {
    createSocket: () => new MockSocket()
  };
});

// Mock HTTP server
jest.mock('http', () => {
  const EventEmitter = require('events');
  
  class MockServer extends EventEmitter {
    listen(port: number, callback: () => void) {
      setTimeout(callback, 0);
      return this;
    }
    
    close(callback: () => void) {
      setTimeout(callback, 0);
      return this;
    }
  }
  
  return {
    createServer: () => new MockServer()
  };
});

// Mock Socket.IO
jest.mock('socket.io', () => {
  const EventEmitter = require('events');
  
  class MockIO extends EventEmitter {
    constructor() {
      super();
      this.sockets = new Map();
    }
    
    close(callback: () => void) {
      setTimeout(callback, 0);
    }
  }
  
  return {
    Server: MockIO
  };
});

// Add custom properties to MockSocket
interface MockSocket {
  __port?: number;
  __sourceNetwork?: any;
  __targetNetwork?: any;
  __sourcePort?: number;
  connected: boolean;
  connect(): this;
  disconnect(): this;
  emit(event: string, ...args: any[]): this;
}

jest.mock('socket.io-client', () => {
  const EventEmitter = require('events');
  
  class MockSocket extends EventEmitter {
    connected = true;
    __port?: number;
    __sourceNetwork?: any;
    __targetNetwork?: any;
    __sourcePort?: number;
    
    connect() {
      this.connected = true;
      setTimeout(() => this.emit('connect'), 10);
      return this;
    }
    
    disconnect() {
      this.connected = false;
      return this;
    }
    
    emit(event: string, ...args: any[]) {
      if (event === 'peer-info' && global.__TEST_PEERS__) {
        const peerInfo = args[0];
        const callback = args[1];
        
        // Find target peer by port
        const targetPeer = global.__TEST_PEERS__.find(p => 
          p.address.port === this.__port && p.network !== this.__sourceNetwork
        );
        
        if (targetPeer && callback) {
          // Simulating successful connection
          callback({ success: true });
          
          // Create virtual connection between peers
          setTimeout(() => {
            // Create a private message channel between the two peers
            this.__targetNetwork = targetPeer.network;
            this.__sourcePort = peerInfo.port;
            
            // Notify target of incoming connection
            if (targetPeer.acceptConnection) {
              targetPeer.acceptConnection(this.__sourcePort, peerInfo);
            }
          }, 50);
        } else if (callback) {
          callback({ success: false, error: 'Peer not found or rejected' });
        }
      } else if (event === 'message' && this.__targetNetwork && args.length > 0) {
        const message = args[0];
        const callback = args[1];
        
        if (callback) callback({ success: true });
        
        // Find target peer to deliver the message
        const sourcePeer = global.__TEST_PEERS__?.find(p => p.address.port === this.__sourcePort);
        const targetPeer = global.__TEST_PEERS__?.find(p => p.network === this.__targetNetwork);
        
        if (sourcePeer && targetPeer && targetPeer.receiveMessage) {
          setTimeout(() => targetPeer.receiveMessage(message, this.__sourcePort), 20);
        }
      }
      return this;
    }
  }
  
  // Factory function that creates mock socket
  return {
    io: (url: string, opts: any) => {
      const matches = url.match(/:(\d+)/);
      const port = matches ? parseInt(matches[1]) : 0;
      
      const socket = new MockSocket() as MockSocket;
      socket.__port = port;
      
      // Track which network this socket belongs to
      const sourcePeer = global.__TEST_PEERS__?.find(p => p.network && p.outgoingConnections);
      if (sourcePeer && sourcePeer.outgoingConnections) {
        socket.__sourceNetwork = sourcePeer.network;
        sourcePeer.outgoingConnections.push(socket);
      }
      
      return socket;
    }
  };
});

// Global registry for test peers
declare global {
  // eslint-disable-next-line no-var
  var __TEST_PEERS__: Array<{
    address: PeerAddress;
    network: any;
    mockSocket?: any;
    acceptConnection?: (sourcePort: number, peerInfo: PeerAddress) => void;
    receiveMessage?: (message: NetworkMessage, sourcePort: number) => void;
    outgoingConnections?: any[];
  }> | undefined;
}

// Setup test environment
beforeAll(() => {
  global.__TEST_PEERS__ = [];
});

afterAll(() => {
  global.__TEST_PEERS__ = undefined;
});

beforeEach(() => {
  global.__TEST_PEERS__ = [];
});

describe('Network Topology Tests', () => {
  test('Peers can discover each other', async () => {
    // Create peer addresses
    const peer1Address = createPeerAddress('127.0.0.1', 44301);
    const peer2Address = createPeerAddress('127.0.0.1', 44302);
    
    // Create discovery services
    const peer1Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    const peer2Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    
    // Track discovered peers
    const peer1Discovered: PeerAddress[] = [];
    const peer2Discovered: PeerAddress[] = [];
    
    // Setup discovery listeners
    peer1Discovery.discover().subscribe(peer => peer1Discovered.push(peer));
    peer2Discovery.discover().subscribe(peer => peer2Discovered.push(peer));
    
    // Create mock sockets for test peers
    const mockSocket1 = { emit: jest.fn() };
    const mockSocket2 = { emit: jest.fn() };
    
    // Register test peers
    global.__TEST_PEERS__ = [
      { address: peer1Address, network: null, mockSocket: mockSocket1 },
      { address: peer2Address, network: null, mockSocket: mockSocket2 }
    ];
    
    // Start discovery services
    await peer1Discovery.start();
    await peer2Discovery.start();
    
    // Advertise peer addresses
    await peer1Discovery.advertise(peer1Address);
    await peer2Discovery.advertise(peer2Address);
    
    // Wait for discovery to occur
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Stop discovery services
    await peer1Discovery.stop();
    await peer2Discovery.stop();
    
    // Verify peers discovered each other
    expect(peer1Discovered.length).toBeGreaterThanOrEqual(1);
    expect(peer2Discovered.length).toBeGreaterThanOrEqual(1);
    
    expect(peer1Discovered.some(p => p.id === peer2Address.id)).toBeTruthy();
    expect(peer2Discovered.some(p => p.id === peer1Address.id)).toBeTruthy();
  });

  test('Mesh network can form between peers', async () => {
    // Create peer addresses
    const peer1Address = createPeerAddress('127.0.0.1', 44401);
    const peer2Address = createPeerAddress('127.0.0.1', 44402);
    
    // Create discovery services
    const peer1Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    const peer2Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    
    // Create mesh networks
    const peer1Network = MeshNetworkFactory.createWebSocketMeshNetwork(
      peer1Address,
      peer1Discovery
    );
    
    const peer2Network = MeshNetworkFactory.createWebSocketMeshNetwork(
      peer2Address,
      peer2Discovery
    );
    
    // Track connections
    let peer1Connected = false;
    let peer2Connected = false;
    
    // Register test peers with connection handling
    global.__TEST_PEERS__ = [
      { 
        address: peer1Address, 
        network: peer1Network,
        outgoingConnections: [],
        acceptConnection: (sourcePort: number, peerInfo: PeerAddress) => {
          peer1Connected = true;
        }
      },
      { 
        address: peer2Address, 
        network: peer2Network,
        outgoingConnections: [],
        acceptConnection: (sourcePort: number, peerInfo: PeerAddress) => {
          peer2Connected = true;
        }
      }
    ];
    
    // Start the mesh networks
    await peer1Network.start();
    await peer2Network.start();
    
    // Wait for connections to form
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Stop the mesh networks
    await peer1Network.stop();
    await peer2Network.stop();
    
    // Verify connection state
    expect(peer1Connected || peer2Connected).toBeTruthy();
  });

  test('Messages can be sent through the mesh network', async () => {
    // Create peer addresses for a 3-node network
    const peer1Address = createPeerAddress('127.0.0.1', 44501);
    const peer2Address = createPeerAddress('127.0.0.1', 44502);
    const peer3Address = createPeerAddress('127.0.0.1', 44503);
    
    // Create discovery services
    const peer1Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    const peer2Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    const peer3Discovery = PeerDiscoveryFactory.createUdpDiscovery();
    
    // Create mesh networks
    const peer1Network = MeshNetworkFactory.createWebSocketMeshNetwork(
      peer1Address,
      peer1Discovery
    );
    
    const peer2Network = MeshNetworkFactory.createWebSocketMeshNetwork(
      peer2Address,
      peer2Discovery
    );
    
    const peer3Network = MeshNetworkFactory.createWebSocketMeshNetwork(
      peer3Address,
      peer3Discovery
    );
    
    // Message trackers
    const messagesReceived: Record<string, NetworkMessage[]> = {
      peer1: [],
      peer2: [],
      peer3: []
    };
    
    // Register test peers with message handling
    global.__TEST_PEERS__ = [
      { 
        address: peer1Address, 
        network: peer1Network,
        outgoingConnections: [],
        acceptConnection: () => {},
        receiveMessage: (message: NetworkMessage) => {
          if (message.destination.id === peer1Address.id) {
            messagesReceived.peer1.push(message);
          }
        }
      },
      { 
        address: peer2Address, 
        network: peer2Network,
        outgoingConnections: [],
        acceptConnection: () => {},
        receiveMessage: (message: NetworkMessage) => {
          if (message.destination.id === peer2Address.id) {
            messagesReceived.peer2.push(message);
          }
        }
      },
      { 
        address: peer3Address, 
        network: peer3Network,
        outgoingConnections: [],
        acceptConnection: () => {},
        receiveMessage: (message: NetworkMessage) => {
          if (message.destination.id === peer3Address.id) {
            messagesReceived.peer3.push(message);
          }
        }
      }
    ];
    
    // Start the mesh networks
    await peer1Network.start();
    await peer2Network.start();
    await peer3Network.start();
    
    // Wait for connections to form
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Peer 1 sends a message to Peer 3
    const testMessage: NetworkMessage = {
      id: 'test-message-1',
      source: peer1Address,
      destination: peer3Address,
      payload: new TextEncoder().encode('Hello, Peer 3!'),
      ttl: 10,
      timestamp: Date.now()
    };
    
    await peer1Network.send(testMessage);
    
    // Wait for message to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Peer 3 sends a reply to Peer 1
    const replyMessage: NetworkMessage = {
      id: 'test-message-2',
      source: peer3Address,
      destination: peer1Address,
      payload: new TextEncoder().encode('Hello back, Peer 1!'),
      ttl: 10,
      timestamp: Date.now()
    };
    
    await peer3Network.send(replyMessage);
    
    // Wait for message to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Broadcast from Peer 2 to all
    const broadcastMessage: NetworkMessage = {
      id: 'broadcast-message',
      source: peer2Address,
      destination: { id: 'broadcast', host: '255.255.255.255', port: 0 },
      payload: new TextEncoder().encode('Broadcast to all!'),
      ttl: 10,
      timestamp: Date.now()
    };
    
    await peer2Network.broadcast(broadcastMessage);
    
    // Wait for message to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Stop the mesh networks
    await peer1Network.stop();
    await peer2Network.stop();
    await peer3Network.stop();
    
    // Verify messages were received
    expect(messagesReceived.peer3.length).toBeGreaterThanOrEqual(1);
    expect(messagesReceived.peer1.length).toBeGreaterThanOrEqual(1);
    
    // Check message content
    const peer3ReceivedMessage = messagesReceived.peer3.find(m => m.id === 'test-message-1');
    const peer1ReceivedMessage = messagesReceived.peer1.find(m => m.id === 'test-message-2');
    
    expect(peer3ReceivedMessage).toBeDefined();
    expect(peer1ReceivedMessage).toBeDefined();
    
    if (peer3ReceivedMessage) {
      expect(new TextDecoder().decode(peer3ReceivedMessage.payload)).toBe('Hello, Peer 3!');
    }
    
    if (peer1ReceivedMessage) {
      expect(new TextDecoder().decode(peer1ReceivedMessage.payload)).toBe('Hello back, Peer 1!');
    }
  });
}); 