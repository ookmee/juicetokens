import { StorageAdapter } from '../interfaces';

/**
 * Factory class for creating and managing storage adapters
 */
export class StorageAdapterFactory {
  private static instance: StorageAdapterFactory;
  private adapters: Map<string, StorageAdapter>;
  private defaultAdapter: string | null = null;

  private constructor() {
    this.adapters = new Map<string, StorageAdapter>();
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): StorageAdapterFactory {
    if (!StorageAdapterFactory.instance) {
      StorageAdapterFactory.instance = new StorageAdapterFactory();
    }
    return StorageAdapterFactory.instance;
  }

  /**
   * Register a storage adapter
   */
  public register(adapter: StorageAdapter): void {
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
      throw new Error(`Storage adapter '${adapterId}' not registered`);
    }
    this.defaultAdapter = adapterId;
  }

  /**
   * Get a specific adapter by ID
   */
  public getAdapter(adapterId: string): StorageAdapter {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Storage adapter '${adapterId}' not found`);
    }
    return adapter;
  }

  /**
   * Get the default adapter
   */
  public getDefaultAdapter(): StorageAdapter {
    if (!this.defaultAdapter || !this.adapters.has(this.defaultAdapter)) {
      throw new Error('No default storage adapter set');
    }
    return this.adapters.get(this.defaultAdapter)!;
  }

  /**
   * Get all registered adapters
   */
  public getAllAdapters(): StorageAdapter[] {
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