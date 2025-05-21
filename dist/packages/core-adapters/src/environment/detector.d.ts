import { PlatformType } from './platform';
import { StorageAdapter, NetworkAdapter, HardwareAdapter } from '../interfaces';
/**
 * Type for adapter selection strategy function
 */
type AdapterSelector<T> = (availableAdapters: T[], platformType: PlatformType, isMobile: boolean) => string | null;
/**
 * Class for detecting environment and selecting appropriate adapters
 */
export declare class EnvironmentDetector {
    private static instance;
    private storageSelector;
    private networkSelector;
    private hardwareSelector;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): EnvironmentDetector;
    /**
     * Set selection strategy for storage adapters
     */
    setStorageAdapterSelector(selector: AdapterSelector<StorageAdapter>): void;
    /**
     * Set selection strategy for network adapters
     */
    setNetworkAdapterSelector(selector: AdapterSelector<NetworkAdapter>): void;
    /**
     * Set selection strategy for hardware adapters
     */
    setHardwareAdapterSelector(selector: AdapterSelector<HardwareAdapter>): void;
    /**
     * Automatically select the best storage adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestStorageAdapter(): string | null;
    /**
     * Automatically select the best network adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestNetworkAdapter(): string | null;
    /**
     * Automatically select the best hardware adapter for current environment
     * @returns The ID of the selected adapter or null if none found
     */
    selectBestHardwareAdapter(): string | null;
    /**
     * Default strategy for selecting storage adapters
     */
    private defaultStorageSelector;
    /**
     * Default strategy for selecting network adapters
     */
    private defaultNetworkSelector;
    /**
     * Default strategy for selecting hardware adapters
     */
    private defaultHardwareSelector;
}
export {};
