"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerDiscoveryFactory = exports.UdpPeerDiscovery = void 0;
exports.createPeerAddress = createPeerAddress;
const dgram_1 = __importDefault(require("dgram"));
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
/**
 * UDP-based peer discovery implementation
 */
class UdpPeerDiscovery {
    constructor(config) {
        this.socket = null;
        this.discoverySubject = new rxjs_1.Subject();
        this.running = false;
        this.advertisementTimer = null;
        this.localAddress = null;
        this.config = config;
    }
    async start() {
        if (this.running)
            return;
        this.socket = dgram_1.default.createSocket({ type: 'udp4', reuseAddr: true });
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
                    const peer = JSON.parse(msg.toString());
                    // Don't add ourselves
                    if (this.localAddress && peer.id === this.localAddress.id)
                        return;
                    // Add the actual sender IP
                    peer.host = rinfo.address;
                    this.discoverySubject.next(peer);
                }
                catch (err) {
                    console.error('Failed to parse discovery message:', err);
                }
            });
            this.socket.on('listening', () => {
                if (!this.socket)
                    return;
                try {
                    this.socket.setBroadcast(true);
                    this.running = true;
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            });
            this.socket.bind(this.config.discoveryPort);
        });
    }
    async stop() {
        if (this.advertisementTimer) {
            clearInterval(this.advertisementTimer);
            this.advertisementTimer = null;
        }
        if (this.socket) {
            return new Promise((resolve) => {
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
    async advertise(address) {
        if (!this.running || !this.socket) {
            throw new Error('Discovery service not running');
        }
        this.localAddress = address;
        // Stop any existing advertisement
        if (this.advertisementTimer) {
            clearInterval(this.advertisementTimer);
        }
        const sendAdvertisement = () => {
            if (!this.socket || !this.localAddress)
                return;
            const message = Buffer.from(JSON.stringify(this.localAddress));
            this.socket.send(message, 0, message.length, this.config.discoveryPort, this.config.broadcastAddress);
        };
        // Send initial advertisement
        sendAdvertisement();
        // Set up periodic advertisements
        this.advertisementTimer = setInterval(sendAdvertisement, this.config.advertisementIntervalMs);
    }
    discover() {
        return this.discoverySubject.asObservable();
    }
}
exports.UdpPeerDiscovery = UdpPeerDiscovery;
/**
 * Factory for creating peer discovery instances
 */
class PeerDiscoveryFactory {
    static createUdpDiscovery(config) {
        const defaultConfig = {
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
exports.PeerDiscoveryFactory = PeerDiscoveryFactory;
/**
 * Helper to create a peer address
 */
function createPeerAddress(host, port, metadata) {
    return {
        id: (0, uuid_1.v4)(),
        host,
        port,
        metadata
    };
}
//# sourceMappingURL=discovery.js.map