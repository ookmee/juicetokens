import dgram from 'dgram';
import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
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
export class UdpPeerDiscovery implements PeerDiscovery {
  private socket: dgram.Socket | null = null;
  private discoverySubject = new Subject<PeerAddress>();
  private running = false;
  private advertisementTimer: NodeJS.Timeout | null = null;
  private config: UdpDiscoveryConfig;
  private localAddress: PeerAddress | null = null;

  constructor(config: UdpDiscoveryConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Failed to create UDP socket'));
        return;
      }

      this.socket.on('error', (err) => {
        console.error('UDP discovery error:', err);
        this.stop().catch(console.error);
        reject(err);
      });

      this.socket.on('message', (msg, rinfo) => {
        try {
          const peer = JSON.parse(msg.toString()) as PeerAddress;
          // Don't add ourselves
          if (this.localAddress && peer.id === this.localAddress.id) return;
          
          // Add the actual sender IP
          peer.host = rinfo.address;
          this.discoverySubject.next(peer);
        } catch (err) {
          console.error('Failed to parse discovery message:', err);
        }
      });

      this.socket.on('listening', () => {
        if (!this.socket) return;
        
        try {
          this.socket.setBroadcast(true);
          this.running = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      this.socket.bind(this.config.discoveryPort);
    });
  }

  async stop(): Promise<void> {
    if (this.advertisementTimer) {
      clearInterval(this.advertisementTimer);
      this.advertisementTimer = null;
    }

    if (this.socket) {
      return new Promise<void>((resolve) => {
        if (!this.socket) {
          resolve();
          return;
        }
        this.socket.close(() => {
          this.socket = null;
          this.running = false;
          resolve();
        });
      });
    }
    
    this.running = false;
    return Promise.resolve();
  }

  async advertise(address: PeerAddress): Promise<void> {
    if (!this.running || !this.socket) {
      throw new Error('Discovery service not running');
    }

    this.localAddress = address;
    
    // Stop any existing advertisement
    if (this.advertisementTimer) {
      clearInterval(this.advertisementTimer);
    }

    const sendAdvertisement = () => {
      if (!this.socket || !this.localAddress) return;
      
      const message = Buffer.from(JSON.stringify(this.localAddress));
      this.socket.send(
        message, 
        0, 
        message.length, 
        this.config.discoveryPort, 
        this.config.broadcastAddress
      );
    };

    // Send initial advertisement
    sendAdvertisement();
    
    // Set up periodic advertisements
    this.advertisementTimer = setInterval(
      sendAdvertisement, 
      this.config.advertisementIntervalMs
    );
  }

  discover(): Observable<PeerAddress> {
    return this.discoverySubject.asObservable();
  }
}

/**
 * Factory for creating peer discovery instances
 */
export class PeerDiscoveryFactory {
  static createUdpDiscovery(config?: Partial<UdpDiscoveryConfig>): PeerDiscovery {
    const defaultConfig: UdpDiscoveryConfig = {
      discoveryPort: 44201,
      broadcastAddress: '255.255.255.255',
      advertisementIntervalMs: 10000,
      timeoutMs: 30000
    };

    return new UdpPeerDiscovery({
      ...defaultConfig,
      ...config
    });
  }
}

/**
 * Helper to create a peer address
 */
export function createPeerAddress(
  host: string,
  port: number,
  metadata?: Record<string, string>
): PeerAddress {
  return {
    id: uuidv4(),
    host,
    port,
    metadata
  };
} 