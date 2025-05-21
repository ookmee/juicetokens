import { Observable } from 'rxjs';
import { PeerAddress, PeerDiscovery } from './types';
/**
 * Configuration for UDP discovery
 */
export interface UdpDiscoveryConfig {
    discoveryPort: number;
    broadcastAddress: string;
    advertisementIntervalMs: number;
    timeoutMs: number;
}
/**
 * UDP-based peer discovery implementation
 */
export declare class UdpPeerDiscovery implements PeerDiscovery {
    private socket;
    private discoverySubject;
    private running;
    private advertisementTimer;
    private config;
    private localAddress;
    constructor(config: UdpDiscoveryConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    advertise(address: PeerAddress): Promise<void>;
    discover(): Observable<PeerAddress>;
}
/**
 * Factory for creating peer discovery instances
 */
export declare class PeerDiscoveryFactory {
    static createUdpDiscovery(config?: Partial<UdpDiscoveryConfig>): PeerDiscovery;
}
/**
 * Helper to create a peer address
 */
export declare function createPeerAddress(host: string, port: number, metadata?: Record<string, string>): PeerAddress;
