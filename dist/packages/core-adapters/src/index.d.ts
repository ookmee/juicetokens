export * from './interfaces';
export * from './factories';
export * from './environment';
export * from './config';
import { AdaptersConfig } from './config';
/**
 * Initialize the core adapters framework
 */
export declare function initAdapters(config?: AdaptersConfig): void;
/**
 * Get the current platform information
 */
export declare function getCurrentPlatform(): import("./environment").PlatformInfo;
/**
 * Reset the adapter system to defaults
 */
export declare function resetAdapters(): void;
