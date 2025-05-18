import { HardwareAdapter } from '../interfaces';

/**
 * Factory class for creating and managing hardware adapters
 */
export class HardwareAdapterFactory {
  private static instance: HardwareAdapterFactory;
  private adapters: Map<string, HardwareAdapter>;
  private defaultAdapter: string | null = null;

  private constructor() {
    this.adapters = new Map<string, HardwareAdapter>();
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): HardwareAdapterFactory {
    if (!HardwareAdapterFactory.instance) {
      HardwareAdapterFactory.instance = new HardwareAdapterFactory();
    }
    return HardwareAdapterFactory.instance;
  }

  /**
   * Register a hardware adapter
   */
  public register(adapter: HardwareAdapter): void {
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
      throw new Error(`Hardware adapter '${adapterId}' not registered`);
    }
    this.defaultAdapter = adapterId;
  }

  /**
   * Get a specific adapter by ID
   */
  public getAdapter(adapterId: string): HardwareAdapter {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Hardware adapter '${adapterId}' not found`);
    }
    return adapter;
  }

  /**
   * Get the default adapter
   */
  public getDefaultAdapter(): HardwareAdapter {
    if (!this.defaultAdapter || !this.adapters.has(this.defaultAdapter)) {
      throw new Error('No default hardware adapter set');
    }
    return this.adapters.get(this.defaultAdapter)!;
  }

  /**
   * Get all registered adapters
   */
  public getAllAdapters(): HardwareAdapter[] {
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