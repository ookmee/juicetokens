"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkAdapterFactory = void 0;
/**
 * Factory class for creating and managing network adapters
 */
class NetworkAdapterFactory {
    constructor() {
        this.defaultAdapter = null;
        this.adapters = new Map();
    }
    /**
     * Get the singleton instance of the factory
     */
    static getInstance() {
        if (!NetworkAdapterFactory.instance) {
            NetworkAdapterFactory.instance = new NetworkAdapterFactory();
        }
        return NetworkAdapterFactory.instance;
    }
    /**
     * Register a network adapter
     */
    register(adapter) {
        this.adapters.set(adapter.id, adapter);
        // Set as default if it's the first adapter
        if (this.adapters.size === 1) {
            this.defaultAdapter = adapter.id;
        }
    }
    /**
     * Set a specific adapter as the default
     */
    setDefaultAdapter(adapterId) {
        if (!this.adapters.has(adapterId)) {
            throw new Error(`Network adapter '${adapterId}' not registered`);
        }
        this.defaultAdapter = adapterId;
    }
    /**
     * Get a specific adapter by ID
     */
    getAdapter(adapterId) {
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Network adapter '${adapterId}' not found`);
        }
        return adapter;
    }
    /**
     * Get the default adapter
     */
    getDefaultAdapter() {
        if (!this.defaultAdapter || !this.adapters.has(this.defaultAdapter)) {
            throw new Error('No default network adapter set');
        }
        return this.adapters.get(this.defaultAdapter);
    }
    /**
     * Get all registered adapters
     */
    getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    /**
     * Check if an adapter with the given ID exists
     */
    hasAdapter(adapterId) {
        return this.adapters.has(adapterId);
    }
    /**
     * Remove an adapter registration
     */
    unregister(adapterId) {
        if (this.defaultAdapter === adapterId) {
            this.defaultAdapter = null;
        }
        return this.adapters.delete(adapterId);
    }
}
exports.NetworkAdapterFactory = NetworkAdapterFactory;
//# sourceMappingURL=network-factory.js.map