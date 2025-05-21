import { Observable } from 'rxjs';
import { MeshNetwork, NetworkMessage, PeerAddress, PeerConnection, PeerDiscovery } from './types';
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
 * Implementation of a mesh network
 */
export declare class WebSocketMeshNetwork implements MeshNetwork {
    private server;
    private io;
    private connections;
    private running;
    private config;
    private discovery;
    private routingTable;
    private messageStore;
    private localAddress;
    private messageSubject;
    private routingUpdateTimer;
    private pendingDeliveryTimer;
    constructor(localAddress: PeerAddress, discovery: PeerDiscovery, config?: Partial<MeshNetworkConfig>);
    start(): Promise<void>;
    stop(): Promise<void>;
    connect(peer: PeerAddress): Promise<PeerConnection>;
    broadcast(message: NetworkMessage): Promise<void>;
    send(message: NetworkMessage): Promise<void>;
    onMessage(): Observable<NetworkMessage>;
    getPeers(): PeerAddress[];
    /**
     * Handles a new connection to a peer
     */
    private handleNewConnection;
    /**
     * Process an incoming message
     */
    private processIncomingMessage;
    /**
     * Send routing table updates to peers
     */
    private sendRoutingUpdates;
    /**
     * Process pending messages from the store
     */
    private processPendingMessages;
}
/**
 * Factory for creating mesh network instances
 */
export declare class MeshNetworkFactory {
    static createWebSocketMeshNetwork(localAddress: PeerAddress, discovery: PeerDiscovery, config?: Partial<MeshNetworkConfig>): MeshNetwork;
}
