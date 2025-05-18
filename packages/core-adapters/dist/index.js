"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAdapters = initAdapters;
exports.getCurrentPlatform = getCurrentPlatform;
exports.resetAdapters = resetAdapters;
// Export interfaces
__exportStar(require("./interfaces"), exports);
// Export factories
__exportStar(require("./factories"), exports);
// Export environment utilities
__exportStar(require("./environment"), exports);
// Export configuration
__exportStar(require("./config"), exports);
// Export utility methods for simplified adapter setup
const factories_1 = require("./factories");
const environment_1 = require("./environment");
const config_1 = require("./config");
/**
 * Initialize the core adapters framework
 */
function initAdapters(config) {
    // Set configuration if provided
    if (config) {
        config_1.AdapterConfigManager.getInstance().setConfig(config);
    }
    // Auto-select adapters if enabled in config
    const globalConfig = config_1.AdapterConfigManager.getInstance().getGlobalConfig();
    if (globalConfig && globalConfig.autoSelectAdapters) {
        const detector = environment_1.EnvironmentDetector.getInstance();
        // Try to auto-select best storage adapter
        const storageAdapterId = detector.selectBestStorageAdapter();
        if (storageAdapterId) {
            factories_1.StorageAdapterFactory.getInstance().setDefaultAdapter(storageAdapterId);
        }
        // Try to auto-select best network adapter
        const networkAdapterId = detector.selectBestNetworkAdapter();
        if (networkAdapterId) {
            factories_1.NetworkAdapterFactory.getInstance().setDefaultAdapter(networkAdapterId);
        }
        // Try to auto-select best hardware adapter
        const hardwareAdapterId = detector.selectBestHardwareAdapter();
        if (hardwareAdapterId) {
            factories_1.HardwareAdapterFactory.getInstance().setDefaultAdapter(hardwareAdapterId);
        }
    }
}
/**
 * Get the current platform information
 */
function getCurrentPlatform() {
    return (0, environment_1.getPlatformInfo)();
}
/**
 * Reset the adapter system to defaults
 */
function resetAdapters() {
    // Reset configuration
    config_1.AdapterConfigManager.getInstance().resetConfig();
    // Reset factories
    const storageFactory = factories_1.StorageAdapterFactory.getInstance();
    const networkFactory = factories_1.NetworkAdapterFactory.getInstance();
    const hardwareFactory = factories_1.HardwareAdapterFactory.getInstance();
    // Unregister all adapters
    for (const adapter of storageFactory.getAllAdapters()) {
        storageFactory.unregister(adapter.id);
    }
    for (const adapter of networkFactory.getAllAdapters()) {
        networkFactory.unregister(adapter.id);
    }
    for (const adapter of hardwareFactory.getAllAdapters()) {
        hardwareFactory.unregister(adapter.id);
    }
}
//# sourceMappingURL=index.js.map