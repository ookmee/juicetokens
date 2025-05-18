/**
 * Environment platform types
 */
export declare enum PlatformType {
    BROWSER = "browser",
    NODE = "node",
    REACT_NATIVE = "react-native",
    ELECTRON = "electron",
    UNKNOWN = "unknown"
}
/**
 * Runtime environment information
 */
export interface PlatformInfo {
    type: PlatformType;
    version: string;
    isMobile: boolean;
    isDesktop: boolean;
    isServer: boolean;
    osName?: string;
    osVersion?: string;
}
/**
 * Detect current platform type
 */
export declare function detectPlatformType(): PlatformType;
/**
 * Get detailed platform information
 */
export declare function getPlatformInfo(): PlatformInfo;
