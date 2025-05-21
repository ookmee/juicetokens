import { PeerAddress, RoutingEntry, RoutingTable } from './types';
/**
 * Configuration for the distance vector routing table
 */
export interface RoutingTableConfig {
    maxAge: number;
    cleanupIntervalMs: number;
    infiniteDistance: number;
}
/**
 * Implementation of a distance vector routing table
 */
export declare class DistanceVectorRoutingTable implements RoutingTable {
    private routes;
    private config;
    private cleanupTimer;
    private routeUpdates;
    private localAddress;
    constructor(localAddress: PeerAddress, config?: Partial<RoutingTableConfig>);
    /**
     * Add or update a route in the routing table
     */
    addRoute(entry: RoutingEntry): void;
    /**
     * Remove a route from the routing table
     */
    removeRoute(destination: PeerAddress): void;
    /**
     * Get the next hop for a destination
     */
    getNextHop(destination: PeerAddress): PeerAddress | null;
    /**
     * Get all routes in the routing table
     */
    getRoutes(): RoutingEntry[];
    /**
     * Update routes based on routing updates from a neighbor
     */
    updateRoutes(updates: RoutingEntry[]): void;
    /**
     * Clean up stale routes
     */
    private cleanup;
    /**
     * Stop the routing table and cleanup timers
     */
    stop(): void;
}
/**
 * Factory for creating routing table instances
 */
export declare class RoutingTableFactory {
    static createDistanceVectorRoutingTable(localAddress: PeerAddress, config?: Partial<RoutingTableConfig>): RoutingTable;
}
