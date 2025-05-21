"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const discovery_1 = require("../discovery");
const mesh_1 = require("../mesh");
// Mock the UDP socket for tests
globals_1.jest.mock('dgram', () => {
    const EventEmitter = require('events');
    class MockSocket extends EventEmitter {
        bind(port) {
            setTimeout(() => this.emit('listening'), 0);
            return this;
        }
        setBroadcast() {
            return true;
        }
        send(msg, offset, length, port, address, callback) {
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
            if (callback)
                callback();
            return this;
        }
        close(callback) {
            if (callback)
                callback();
            return this;
        }
    }
    return {
        createSocket: () => new MockSocket()
    };
});
// Mock HTTP server
globals_1.jest.mock('http', () => {
    const EventEmitter = require('events');
    class MockServer extends EventEmitter {
        listen(port, callback) {
            setTimeout(callback, 0);
            return this;
        }
        close(callback) {
            setTimeout(callback, 0);
            return this;
        }
    }
    return {
        createServer: () => new MockServer()
    };
});
// Mock Socket.IO
globals_1.jest.mock('socket.io', () => {
    const EventEmitter = require('events');
    class MockIO extends EventEmitter {
        constructor() {
            super();
            this.sockets = new Map();
        }
        close(callback) {
            setTimeout(callback, 0);
        }
    }
    return {
        Server: MockIO
    };
});
globals_1.jest.mock('socket.io-client', () => {
    const EventEmitter = require('events');
    class MockSocket extends EventEmitter {
        constructor() {
            super(...arguments);
            this.connected = true;
        }
        connect() {
            this.connected = true;
            setTimeout(() => this.emit('connect'), 10);
            return this;
        }
        disconnect() {
            this.connected = false;
            return this;
        }
        emit(event, ...args) {
            if (event === 'peer-info' && global.__TEST_PEERS__) {
                const peerInfo = args[0];
                const callback = args[1];
                // Find target peer by port
                const targetPeer = global.__TEST_PEERS__.find(p => p.address.port === this.__port && p.network !== this.__sourceNetwork);
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
                }
                else if (callback) {
                    callback({ success: false, error: 'Peer not found or rejected' });
                }
            }
            else if (event === 'message' && this.__targetNetwork && args.length > 0) {
                const message = args[0];
                const callback = args[1];
                if (callback)
                    callback({ success: true });
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
        io: (url, opts) => {
            const matches = url.match(/:(\d+)/);
            const port = matches ? parseInt(matches[1]) : 0;
            const socket = new MockSocket();
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
// Setup test environment
(0, globals_1.beforeAll)(() => {
    global.__TEST_PEERS__ = [];
});
(0, globals_1.afterAll)(() => {
    global.__TEST_PEERS__ = undefined;
});
(0, globals_1.beforeEach)(() => {
    global.__TEST_PEERS__ = [];
});
(0, globals_1.describe)('Network Topology Tests', () => {
    (0, globals_1.test)('Peers can discover each other', async () => {
        // Create peer addresses
        const peer1Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44301);
        const peer2Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44302);
        // Create discovery services
        const peer1Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        const peer2Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        // Track discovered peers
        const peer1Discovered = [];
        const peer2Discovered = [];
        // Setup discovery listeners
        peer1Discovery.discover().subscribe(peer => peer1Discovered.push(peer));
        peer2Discovery.discover().subscribe(peer => peer2Discovered.push(peer));
        // Create mock sockets for test peers
        const mockSocket1 = { emit: globals_1.jest.fn() };
        const mockSocket2 = { emit: globals_1.jest.fn() };
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
        (0, globals_1.expect)(peer1Discovered.length).toBeGreaterThanOrEqual(1);
        (0, globals_1.expect)(peer2Discovered.length).toBeGreaterThanOrEqual(1);
        (0, globals_1.expect)(peer1Discovered.some(p => p.id === peer2Address.id)).toBeTruthy();
        (0, globals_1.expect)(peer2Discovered.some(p => p.id === peer1Address.id)).toBeTruthy();
    });
    (0, globals_1.test)('Mesh network can form between peers', async () => {
        // Create peer addresses
        const peer1Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44401);
        const peer2Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44402);
        // Create discovery services
        const peer1Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        const peer2Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        // Create mesh networks
        const peer1Network = mesh_1.MeshNetworkFactory.createWebSocketMeshNetwork(peer1Address, peer1Discovery);
        const peer2Network = mesh_1.MeshNetworkFactory.createWebSocketMeshNetwork(peer2Address, peer2Discovery);
        // Track connections
        let peer1Connected = false;
        let peer2Connected = false;
        // Register test peers with connection handling
        global.__TEST_PEERS__ = [
            {
                address: peer1Address,
                network: peer1Network,
                outgoingConnections: [],
                acceptConnection: (sourcePort, peerInfo) => {
                    peer1Connected = true;
                }
            },
            {
                address: peer2Address,
                network: peer2Network,
                outgoingConnections: [],
                acceptConnection: (sourcePort, peerInfo) => {
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
        (0, globals_1.expect)(peer1Connected || peer2Connected).toBeTruthy();
    });
    (0, globals_1.test)('Messages can be sent through the mesh network', async () => {
        // Create peer addresses for a 3-node network
        const peer1Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44501);
        const peer2Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44502);
        const peer3Address = (0, discovery_1.createPeerAddress)('127.0.0.1', 44503);
        // Create discovery services
        const peer1Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        const peer2Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        const peer3Discovery = discovery_1.PeerDiscoveryFactory.createUdpDiscovery();
        // Create mesh networks
        const peer1Network = mesh_1.MeshNetworkFactory.createWebSocketMeshNetwork(peer1Address, peer1Discovery);
        const peer2Network = mesh_1.MeshNetworkFactory.createWebSocketMeshNetwork(peer2Address, peer2Discovery);
        const peer3Network = mesh_1.MeshNetworkFactory.createWebSocketMeshNetwork(peer3Address, peer3Discovery);
        // Message trackers
        const messagesReceived = {
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
                acceptConnection: () => { },
                receiveMessage: (message) => {
                    if (message.destination.id === peer1Address.id) {
                        messagesReceived.peer1.push(message);
                    }
                }
            },
            {
                address: peer2Address,
                network: peer2Network,
                outgoingConnections: [],
                acceptConnection: () => { },
                receiveMessage: (message) => {
                    if (message.destination.id === peer2Address.id) {
                        messagesReceived.peer2.push(message);
                    }
                }
            },
            {
                address: peer3Address,
                network: peer3Network,
                outgoingConnections: [],
                acceptConnection: () => { },
                receiveMessage: (message) => {
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
        const testMessage = {
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
        const replyMessage = {
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
        const broadcastMessage = {
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
        (0, globals_1.expect)(messagesReceived.peer3.length).toBeGreaterThanOrEqual(1);
        (0, globals_1.expect)(messagesReceived.peer1.length).toBeGreaterThanOrEqual(1);
        // Check message content
        const peer3ReceivedMessage = messagesReceived.peer3.find(m => m.id === 'test-message-1');
        const peer1ReceivedMessage = messagesReceived.peer1.find(m => m.id === 'test-message-2');
        (0, globals_1.expect)(peer3ReceivedMessage).toBeDefined();
        (0, globals_1.expect)(peer1ReceivedMessage).toBeDefined();
        if (peer3ReceivedMessage) {
            (0, globals_1.expect)(new TextDecoder().decode(peer3ReceivedMessage.payload)).toBe('Hello, Peer 3!');
        }
        if (peer1ReceivedMessage) {
            (0, globals_1.expect)(new TextDecoder().decode(peer1ReceivedMessage.payload)).toBe('Hello back, Peer 1!');
        }
    });
});
//# sourceMappingURL=network.test.js.map