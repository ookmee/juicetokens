import { Subject } from 'rxjs';
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
export class DistanceVectorRoutingTable implements RoutingTable {
  private routes: Map<string, RoutingEntry> = new Map();
  private config: RoutingTableConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private routeUpdates = new Subject<RoutingEntry[]>();
  private localAddress: PeerAddress;

  constructor(localAddress: PeerAddress, config?: Partial<RoutingTableConfig>) {
    const defaultConfig: RoutingTableConfig = {
      maxAge: 120000, // 2 minutes
      cleanupIntervalMs: 30000, // 30 seconds
      infiniteDistance: 16 // "Infinity" in RIP-like protocols
    };

    this.config = { ...defaultConfig, ...config };
    this.localAddress = localAddress;
    
    // Start periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), this.config.cleanupIntervalMs);
  }

  /**
   * Add or update a route in the routing table
   */
  addRoute(entry: RoutingEntry): void {
    const destinationId = entry.destination.id;
    const existing = this.routes.get(destinationId);

    // Never update route to ourselves - we always know the best route
    if (destinationId === this.localAddress.id) {
      return;
    }

    // Update only if the new route is better or from the same next hop
    if (!existing || 
        entry.distance < existing.distance || 
        (entry.nextHop.id === existing.nextHop.id)) {
      
      // Don't allow routes with infinite distance to be added, only updated
      if (!existing && entry.distance >= this.config.infiniteDistance) {
        return;
      }

      // Cap distance to prevent count-to-infinity
      const newEntry: RoutingEntry = {
        ...entry,
        lastUpdated: Date.now(),
        distance: Math.min(entry.distance, this.config.infiniteDistance)
      };

      this.routes.set(destinationId, newEntry);
    }
  }

  /**
   * Remove a route from the routing table
   */
  removeRoute(destination: PeerAddress): void {
    this.routes.delete(destination.id);
  }

  /**
   * Get the next hop for a destination
   */
  getNextHop(destination: PeerAddress): PeerAddress | null {
    const route = this.routes.get(destination.id);
    
    if (!route || route.distance >= this.config.infiniteDistance) {
      return null;
    }
    
    return route.nextHop;
  }

  /**
   * Get all routes in the routing table
   */
  getRoutes(): RoutingEntry[] {
    return Array.from(this.routes.values());
  }

  /**
   * Update routes based on routing updates from a neighbor
   */
  updateRoutes(updates: RoutingEntry[]): void {
    const changedRoutes: RoutingEntry[] = [];
    
    for (const update of updates) {
      const current = this.routes.get(update.destination.id);
      const nextHopId = update.nextHop.id;
      
      // Process updates from this specific neighbor
      if (nextHopId === update.nextHop.id) {
        // Calculate new distance (hop count)
        const newDistance = update.distance + 1;
        
        // If we don't have this route or the route is via this neighbor,
        // or the new route is better, update it
        if (!current || 
            current.nextHop.id === nextHopId || 
            newDistance < current.distance) {
          
          const newEntry: RoutingEntry = {
            destination: update.destination,
            nextHop: update.nextHop,
            distance: newDistance,
            lastUpdated: Date.now()
          };
          
          this.routes.set(update.destination.id, newEntry);
          changedRoutes.push(newEntry);
        }
      }
    }
    
    // If we changed any routes, notify subscribers
    if (changedRoutes.length > 0) {
      this.routeUpdates.next(changedRoutes);
    }
  }

  /**
   * Clean up stale routes
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredRoutes: string[] = [];
    
    for (const [id, route] of this.routes.entries()) {
      if (now - route.lastUpdated > this.config.maxAge) {
        // Mark route as expired by setting infinite distance
        this.routes.set(id, {
          ...route,
          distance: this.config.infiniteDistance,
          lastUpdated: now
        });
        expiredRoutes.push(id);
      }
    }
    
    // Remove very old expired routes
    for (const id of expiredRoutes) {
      const route = this.routes.get(id);
      if (route && now - route.lastUpdated > this.config.maxAge * 2) {
        this.routes.delete(id);
      }
    }
  }

  /**
   * Stop the routing table and cleanup timers
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

/**
 * Factory for creating routing table instances
 */
export class RoutingTableFactory {
  static createDistanceVectorRoutingTable(
    localAddress: PeerAddress,
    config?: Partial<RoutingTableConfig>
  ): RoutingTable {
    return new DistanceVectorRoutingTable(localAddress, config);
  }
} 