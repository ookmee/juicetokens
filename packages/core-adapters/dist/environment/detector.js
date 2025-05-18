"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentDetector = void 0;
const platform_1 = require("./platform");
const factories_1 = require("../factories");
/**
 * Class for detecting environment and selecting appropriate adapters
 */
class EnvironmentDetector {
    constructor() {
        this.storageSelector = null;
        this.networkSelector = null;
        this.hardwareSelector = null;
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!EnvironmentDetector.instance) {
            EnvironmentDetector.instance = new EnvironmentDetector();
        }
        return EnvironmentDetector.instance;
    }
    /**
     * Set selection strategy for storage adapters
     */
    setStorageAdapterSelector(selector) {
        this.storageSelector = selector;
    }
    /**
     * Set selection strategy for network adapters
     */
    setNetworkAdapterSelector(selector) {
        this.networkSelector = selector;
    }
    /**
     * Set selection strategy for hardware adapters
     */
    setHardwareAdapterSelector(selector) {
        this.hardwareSelector = selector;
    }
    /**
     * Automatically select the best storage adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestStorageAdapter() {
        if (!this.storageSelector) {
            return this.defaultStorageSelector();
        }
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const availableAdapters = factories_1.StorageAdapterFactory.getInstance().getAllAdapters();
        return this.storageSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
    }
    /**
     * Automatically select the best network adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestNetworkAdapter() {
        if (!this.networkSelector) {
            return this.defaultNetworkSelector();
        }
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const availableAdapters = factories_1.NetworkAdapterFactory.getInstance().getAllAdapters();
        return this.networkSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
    }
    /**
     * Automatically select the best hardware adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestHardwareAdapter() {
        if (!this.hardwareSelector) {
            return this.defaultHardwareSelector();
        }
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const availableAdapters = factories_1.HardwareAdapterFactory.getInstance().getAllAdapters();
        return this.hardwareSelector(availableAdapters, platformInfo.type, platformInfo.isMobile);
    }
    /**
     * Default strategy for selecting storage adapters
     */
    defaultStorageSelector() {
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const factory = factories_1.StorageAdapterFactory.getInstance();
        const adapters = factory.getAllAdapters();
        if (adapters.length === 0) {
            return null;
        }
        // Simple logic based on platform
        switch (platformInfo.type) {
            case platform_1.PlatformType.BROWSER:
                // Prefer LocalStorage or IndexedDB adapters in browser
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('local') ||
                        adapter.id.toLowerCase().includes('indexeddb')) {
                        return adapter.id;
                    }
                }
                break;
            case platform_1.PlatformType.NODE:
                // Prefer FileSystem adapters in Node.js
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('file') ||
                        adapter.id.toLowerCase().includes('fs')) {
                        return adapter.id;
                    }
                }
                break;
            case platform_1.PlatformType.REACT_NATIVE:
                // Prefer AsyncStorage adapters in React Native
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('async')) {
                        return adapter.id;
                    }
                }
                break;
        }
        // Default to first available adapter if no preference
        return adapters[0].id;
    }
    /**
     * Default strategy for selecting network adapters
     */
    defaultNetworkSelector() {
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const factory = factories_1.NetworkAdapterFactory.getInstance();
        const adapters = factory.getAllAdapters();
        if (adapters.length === 0) {
            return null;
        }
        // Simple logic based on platform
        switch (platformInfo.type) {
            case platform_1.PlatformType.BROWSER:
                // Prefer Fetch API adapters in browser
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('fetch')) {
                        return adapter.id;
                    }
                }
                break;
            case platform_1.PlatformType.NODE:
                // Prefer HTTP/HTTPS module adapters in Node.js
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('http') ||
                        adapter.id.toLowerCase().includes('axios')) {
                        return adapter.id;
                    }
                }
                break;
        }
        // Default to first available adapter if no preference
        return adapters[0].id;
    }
    /**
     * Default strategy for selecting hardware adapters
     */
    defaultHardwareSelector() {
        const platformInfo = (0, platform_1.getPlatformInfo)();
        const factory = factories_1.HardwareAdapterFactory.getInstance();
        const adapters = factory.getAllAdapters();
        if (adapters.length === 0) {
            return null;
        }
        // Simple logic based on platform and mobile status
        if (platformInfo.isMobile) {
            // Prefer mobile-specific adapters
            for (const adapter of adapters) {
                if (adapter.id.toLowerCase().includes('mobile')) {
                    return adapter.id;
                }
            }
        }
        else if (platformInfo.isDesktop) {
            // Prefer desktop-specific adapters
            for (const adapter of adapters) {
                if (adapter.id.toLowerCase().includes('desktop')) {
                    return adapter.id;
                }
            }
        }
        // Platform-specific preferences
        switch (platformInfo.type) {
            case platform_1.PlatformType.ELECTRON:
                for (const adapter of adapters) {
                    if (adapter.id.toLowerCase().includes('electron')) {
                        return adapter.id;
                    }
                }
                break;
        }
        // Default to first available adapter if no preference
        return adapters[0].id;
    }
}
exports.EnvironmentDetector = EnvironmentDetector;
//# sourceMappingURL=detector.js.map