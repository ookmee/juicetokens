import { NetworkMessage, PeerAddress } from '../types';
declare global {
    var __TEST_PEERS__: Array<{
        address: PeerAddress;
        network: any;
        mockSocket?: any;
        acceptConnection?: (sourcePort: number, peerInfo: PeerAddress) => void;
        receiveMessage?: (message: NetworkMessage, sourcePort: number) => void;
        outgoingConnections?: any[];
    }> | undefined;
}
