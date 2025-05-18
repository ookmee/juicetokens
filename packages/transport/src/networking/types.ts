import { Observable } from 'rxjs';

/**
 * Represents the address of a peer in the network
 */
export interface PeerAddress {
  id: string;
  host: string;
  port: number;
  metadata?: Record<string, string>;
}

/**
 * Defines the routing table entry for a peer
 */
export interface RoutingEntry {
  destination: PeerAddress;
  nextHop: PeerAddress;
  distance: number;
  lastUpdated: number;
}

/**
 * Message to be passed through the network
 */
export interface NetworkMessage {
  id: string;
  source: PeerAddress;
  destination: PeerAddress;
  payload: Uint8Array;
  ttl: number;
  timestamp: number;
  headers?: Record<string, string>;
}

/**
 * Network discovery protocol
 */
export interface PeerDiscovery {
  start(): Promise<void>;
  stop(): Promise<void>;
  advertise(address: PeerAddress): Promise<void>;
  discover(): Observable<PeerAddress>;
}

/**
 * Network connection interface
 */
export interface PeerConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getPeer(): PeerAddress;
  send(message: NetworkMessage): Promise<void>;
  receive(): Observable<NetworkMessage>;
}

/**
 * Mesh network manager
 */
export interface MeshNetwork {
  start(): Promise<void>;
  stop(): Promise<void>;
  connect(peer: PeerAddress): Promise<PeerConnection>;
  broadcast(message: NetworkMessage): Promise<void>;
  send(message: NetworkMessage): Promise<void>;
  onMessage(): Observable<NetworkMessage>;
  getPeers(): PeerAddress[];
}

/**
 * Routing table manager
 */
export interface RoutingTable {
  addRoute(entry: RoutingEntry): void;
  removeRoute(destination: PeerAddress): void;
  getNextHop(destination: PeerAddress): PeerAddress | null;
  getRoutes(): RoutingEntry[];
  updateRoutes(updates: RoutingEntry[]): void;
}

/**
 * Store-and-forward message cache
 */
export interface MessageStore {
  add(message: NetworkMessage): void;
  remove(messageId: string): void;
  get(messageId: string): NetworkMessage | null;
  getPending(): NetworkMessage[];
  markDelivered(messageId: string): void;
  cleanup(maxAgeMs: number): void;
} 