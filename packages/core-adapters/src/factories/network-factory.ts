import { NetworkAdapter } from '../interfaces';

/**
 * Factory class for creating and managing network adapters
 */
export class NetworkAdapterFactory {
  private static instance: NetworkAdapterFactory;
  private adapters: Map<string, NetworkAdapter>;
  private defaultAdapter: string | null = null;

  private constructor() {
    this.adapters = new Map<string, NetworkAdapter>();
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): NetworkAdapterFactory {
    if (!NetworkAdapterFactory.instance) {
      NetworkAdapterFactory.instance = new NetworkAdapterFactory();
    }
    return NetworkAdapterFactory.instance;
  }

  /**
   * Register a network adapter
   */
  public register(adapter: NetworkAdapter): void {
    this.adapters.set(adapter.id, adapter);
    
    // Set as default if it's the first adapter
    if (this.adapters.size === 1) {
      this.defaultAdapter = adapter.id;
    }
  }

  /**
   * Set a specific adapter as the default
   */
  public setDefaultAdapter(adapterId: string): void {
    if (!this.adapters.has(adapterId)) {
      throw new Error(`Network adapter '${adapterId}' not registered`);
    }
    this.defaultAdapter = adapterId;
  }

  /**
   * Get a specific adapter by ID
   */
  public getAdapter(adapterId: string): NetworkAdapter {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Network adapter '${adapterId}' not found`);
    }
    return adapter;
  }

  /**
   * Get the default adapter
   */
  public getDefaultAdapter(): NetworkAdapter {
    if (!this.defaultAdapter || !this.adapters.has(this.defaultAdapter)) {
      throw new Error('No default network adapter set');
    }
    return this.adapters.get(this.defaultAdapter)!;
  }

  /**
   * Get all registered adapters
   */
  public getAllAdapters(): NetworkAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if an adapter with the given ID exists
   */
  public hasAdapter(adapterId: string): boolean {
    return this.adapters.has(adapterId);
  }

  /**
   * Remove an adapter registration
   */
  public unregister(adapterId: string): boolean {
    if (this.defaultAdapter === adapterId) {
      this.defaultAdapter = null;
    }
    return this.adapters.delete(adapterId);
  }
} 