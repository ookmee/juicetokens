import http from 'http';
import { Server, Socket } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import { Observable, Subject, filter } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { 
  MeshNetwork, 
  NetworkMessage, 
  PeerAddress, 
  PeerConnection, 
  PeerDiscovery, 
  RoutingTable,
  MessageStore
} from './types';
import { DistanceVectorRoutingTable } from './routing';
import { DefaultMessageStore } from './store';

/**
 * Configuration for the mesh network
 */
export interface MeshNetworkConfig {
  maxConnections: number;
  connectionTimeoutMs: number;
  routingUpdateIntervalMs: number;
  pendingDeliveryIntervalMs: number;
  port: number;
}

/**
 * WebSocket-based peer connection
 */
class WebSocketPeerConnection implements PeerConnection {
  private socket: Socket;
  private connected = false;
  private peer: PeerAddress;
  private messageSubject = new Subject<NetworkMessage>();

  constructor(socket: Socket, peer: PeerAddress) {
    this.socket = socket;
    this.peer = peer;

    this.socket.on('message', (message: NetworkMessage) => {
      this.messageSubject.next(message);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    return new Promise<void>((resolve, reject) => {
      if (this.socket.connected) {
        this.connected = true;
        resolve();
      } else {
        const onConnect = () => {
          this.connected = true;
          this.socket.off('connect', onConnect);
          this.socket.off('connect_error', onError);
          resolve();
        };

        const onError = (err: Error) => {
          this.socket.off('connect', onConnect);
          this.socket.off('connect_error', onError);
          reject(err);
        };

        this.socket.on('connect', onConnect);
        this.socket.on('connect_error', onError);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.socket.disconnect();
    this.connected = false;
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.connected && this.socket.connected;
  }

  getPeer(): PeerAddress {
    return this.peer;
  }

  async send(message: NetworkMessage): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Connection is not active');
    }

    return new Promise<void>((resolve, reject) => {
      this.socket.emit('message', message, (ack: { success: boolean; error?: string }) => {
        if (ack && ack.success) {
          resolve();
        } else {
          reject(new Error(ack?.error || 'Failed to send message'));
        }
      });
    });
  }

  receive(): Observable<NetworkMessage> {
    return this.messageSubject.asObservable();
  }
}

/**
 * Implementation of a mesh network
 */
export class WebSocketMeshNetwork implements MeshNetwork {
  private server: http.Server | null = null;
  private io: Server | null = null;
  private connections: Map<string, PeerConnection> = new Map();
  private running = false;
  private config: MeshNetworkConfig;
  private discovery: PeerDiscovery;
  private routingTable: RoutingTable;
  private messageStore: MessageStore;
  private localAddress: PeerAddress;
  private messageSubject = new Subject<NetworkMessage>();
  private routingUpdateTimer: NodeJS.Timeout | null = null;
  private pendingDeliveryTimer: NodeJS.Timeout | null = null;

  constructor(
    localAddress: PeerAddress,
    discovery: PeerDiscovery,
    config?: Partial<MeshNetworkConfig>
  ) {
    const defaultConfig: MeshNetworkConfig = {
      maxConnections: 10,
      connectionTimeoutMs: 10000,
      routingUpdateIntervalMs: 30000,
      pendingDeliveryIntervalMs: 15000,
      port: localAddress.port
    };

    this.config = { ...defaultConfig, ...config };
    this.discovery = discovery;
    this.localAddress = localAddress;

    // Initialize routing table
    this.routingTable = new DistanceVectorRoutingTable(localAddress);
    
    // Initialize message store
    this.messageStore = new DefaultMessageStore();
  }

  async start(): Promise<void> {
    if (this.running) return;

    // Create HTTP server and Socket.IO instance
    this.server = http.createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Set up event listeners
    this.io.on('connection', (socket) => {
      socket.on('peer-info', async (peerInfo: PeerAddress, callback) => {
        // Skip if we're at max connections
        if (this.connections.size >= this.config.maxConnections && !this.connections.has(peerInfo.id)) {
          callback({ success: false, error: 'Max connections reached' });
          return;
        }

        // Use the peer info to create a connection
        try {
          const connection = new WebSocketPeerConnection(socket, peerInfo);
          this.handleNewConnection(connection);
          callback({ success: true });
        } catch (err) {
          callback({ success: false, error: (err as Error).message });
        }
      });
    });

    // Start the server
    await new Promise<void>((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server not initialized'));
        return;
      }

      this.server.on('error', reject);
      this.server.listen(this.config.port, () => {
        console.log(`Mesh network server started on port ${this.config.port}`);
        resolve();
      });
    });

    // Start peer discovery
    await this.discovery.start();
    await this.discovery.advertise(this.localAddress);

    // Listen for peer discoveries
    this.discovery.discover().subscribe((peer) => {
      // Don't connect to ourselves
      if (peer.id === this.localAddress.id) return;

      // Try to connect if we don't already have a connection
      if (!this.connections.has(peer.id) && this.connections.size < this.config.maxConnections) {
        this.connect(peer).catch((err) => {
          console.error(`Failed to connect to peer ${peer.id}:`, err);
        });
      }
    });

    // Start routing update timer
    this.routingUpdateTimer = setInterval(() => this.sendRoutingUpdates(), this.config.routingUpdateIntervalMs);

    // Start pending delivery timer
    this.pendingDeliveryTimer = setInterval(() => this.processPendingMessages(), this.config.pendingDeliveryIntervalMs);

    this.running = true;
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    // Stop timers
    if (this.routingUpdateTimer) {
      clearInterval(this.routingUpdateTimer);
      this.routingUpdateTimer = null;
    }

    if (this.pendingDeliveryTimer) {
      clearInterval(this.pendingDeliveryTimer);
      this.pendingDeliveryTimer = null;
    }

    // Disconnect all peers
    const disconnectPromises = Array.from(this.connections.values()).map((conn) => 
      conn.disconnect().catch(console.error)
    );
    await Promise.all(disconnectPromises);
    this.connections.clear();

    // Stop message store
    if ('stop' in this.messageStore && typeof this.messageStore.stop === 'function') {
      this.messageStore.stop();
    }

    // Stop routing table
    if ('stop' in this.routingTable && typeof this.routingTable.stop === 'function') {
      this.routingTable.stop();
    }

    // Stop discovery
    await this.discovery.stop();

    // Close server
    if (this.io) {
      await new Promise<void>((resolve) => {
        this.io?.close(() => resolve());
      });
      this.io = null;
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server?.close(() => resolve());
        this.server = null;
      });
    }

    this.running = false;
  }

  async connect(peer: PeerAddress): Promise<PeerConnection> {
    // If we already have a connection to this peer, return it
    const existingConnection = this.connections.get(peer.id);
    if (existingConnection) {
      if (!existingConnection.isConnected()) {
        await existingConnection.connect();
      }
      return existingConnection;
    }

    // Create a new socket.io client connection
    const socket = ioClient(`http://${peer.host}:${peer.port}`, {
      timeout: this.config.connectionTimeoutMs,
      reconnection: true,
      reconnectionAttempts: 3
    });

    return new Promise<PeerConnection>((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error(`Connection to peer ${peer.id} timed out`));
      }, this.config.connectionTimeoutMs);

      socket.on('connect', () => {
        clearTimeout(timeout);

        // Send our peer info
        socket.emit('peer-info', this.localAddress, async (response: { success: boolean; error?: string }) => {
          if (response.success) {
            const connection = new WebSocketPeerConnection(socket, peer);
            this.handleNewConnection(connection);
            resolve(connection);
          } else {
            socket.disconnect();
            reject(new Error(response.error || 'Peer rejected connection'));
          }
        });
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(err);
      });
    });
  }

  async broadcast(message: NetworkMessage): Promise<void> {
    // Set the source address if not already set
    const broadcastMessage: NetworkMessage = {
      ...message,
      source: this.localAddress,
      id: message.id || uuidv4(),
      timestamp: message.timestamp || Date.now()
    };

    // Send to all connected peers
    const sendPromises = Array.from(this.connections.values()).map((conn) => 
      conn.send(broadcastMessage).catch((err) => {
        console.error(`Failed to broadcast to ${conn.getPeer().id}:`, err);
      })
    );

    await Promise.all(sendPromises);
  }

  async send(message: NetworkMessage): Promise<void> {
    // Set message ID, source and timestamp if not already set
    const outgoingMessage: NetworkMessage = {
      ...message,
      id: message.id || uuidv4(),
      source: this.localAddress,
      timestamp: message.timestamp || Date.now()
    };

    // Add to message store
    this.messageStore.add(outgoingMessage);

    // Direct delivery if peer is directly connected
    const directConnection = this.connections.get(outgoingMessage.destination.id);
    if (directConnection && directConnection.isConnected()) {
      try {
        await directConnection.send(outgoingMessage);
        this.messageStore.markDelivered(outgoingMessage.id);
        return;
      } catch (err) {
        console.error(`Direct delivery to ${outgoingMessage.destination.id} failed:`, err);
        // Continue to routing
      }
    }

    // Find next hop using routing table
    const nextHop = this.routingTable.getNextHop(outgoingMessage.destination);
    if (!nextHop) {
      console.error(`No route to ${outgoingMessage.destination.id}`);
      return;
    }

    // Send to next hop
    const hopConnection = this.connections.get(nextHop.id);
    if (!hopConnection || !hopConnection.isConnected()) {
      console.error(`Next hop ${nextHop.id} not connected`);
      return;
    }

    try {
      await hopConnection.send(outgoingMessage);
    } catch (err) {
      console.error(`Failed to send to next hop ${nextHop.id}:`, err);
    }
  }

  onMessage(): Observable<NetworkMessage> {
    return this.messageSubject.asObservable();
  }

  getPeers(): PeerAddress[] {
    return Array.from(this.connections.values()).map(conn => conn.getPeer());
  }

  /**
   * Handles a new connection to a peer
   */
  private handleNewConnection(connection: PeerConnection): void {
    const peer = connection.getPeer();
    
    // Add to connections map
    this.connections.set(peer.id, connection);

    // Add direct route to routing table
    this.routingTable.addRoute({
      destination: peer,
      nextHop: peer,
      distance: 1,
      lastUpdated: Date.now()
    });

    // Subscribe to messages
    connection.receive().subscribe((message) => {
      // Process the message
      this.processIncomingMessage(message, connection);
    });

    console.log(`Connected to peer ${peer.id} (${peer.host}:${peer.port})`);
  }

  /**
   * Process an incoming message
   */
  private processIncomingMessage(message: NetworkMessage, connection: PeerConnection): void {
    // Decrease TTL
    const remainingTtl = message.ttl - 1;
    
    // Discard messages with expired TTL
    if (remainingTtl <= 0) {
      return;
    }

    // If we're the destination, deliver the message
    if (message.destination.id === this.localAddress.id) {
      this.messageSubject.next(message);
      
      // Send acknowledgment if needed
      // (In a real implementation, you'd send back an ACK message)
      
      return;
    }

    // Otherwise, forward the message
    const updatedMessage: NetworkMessage = {
      ...message,
      ttl: remainingTtl
    };

    // Add to message store for reliability
    this.messageStore.add(updatedMessage);

    // Forward the message
    this.send(updatedMessage).catch(err => {
      console.error(`Failed to forward message ${message.id}:`, err);
    });
  }

  /**
   * Send routing table updates to peers
   */
  private sendRoutingUpdates(): void {
    if (!this.running) return;

    const routes = this.routingTable.getRoutes();
    
    for (const connection of this.connections.values()) {
      if (!connection.isConnected()) continue;

      // Simple routing update message (in a real system, use a proper format)
      const updateMessage: NetworkMessage = {
        id: uuidv4(),
        source: this.localAddress,
        destination: connection.getPeer(),
        ttl: 1,
        timestamp: Date.now(),
        payload: new TextEncoder().encode(JSON.stringify(routes)),
        headers: { 'type': 'routing-update' }
      };

      connection.send(updateMessage).catch(err => {
        console.error(`Failed to send routing update to ${connection.getPeer().id}:`, err);
      });
    }
  }

  /**
   * Process pending messages from the store
   */
  private processPendingMessages(): void {
    if (!this.running) return;

    const pendingMessages = this.messageStore.getPending();
    
    for (const message of pendingMessages) {
      this.send(message).catch(err => {
        console.error(`Failed to deliver pending message ${message.id}:`, err);
      });
    }
  }
}

/**
 * Factory for creating mesh network instances
 */
export class MeshNetworkFactory {
  static createWebSocketMeshNetwork(
    localAddress: PeerAddress,
    discovery: PeerDiscovery,
    config?: Partial<MeshNetworkConfig>
  ): MeshNetwork {
    return new WebSocketMeshNetwork(localAddress, discovery, config);
  }
} 