"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformType = void 0;
exports.detectPlatformType = detectPlatformType;
exports.getPlatformInfo = getPlatformInfo;
/**
 * Environment platform types
 */
var PlatformType;
(function (PlatformType) {
    PlatformType["BROWSER"] = "browser";
    PlatformType["NODE"] = "node";
    PlatformType["REACT_NATIVE"] = "react-native";
    PlatformType["ELECTRON"] = "electron";
    PlatformType["UNKNOWN"] = "unknown";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
/**
 * Detect current platform type
 */
function detectPlatformType() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Browser environment
        if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
            return PlatformType.ELECTRON;
        }
        // Check for React Native
        if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
            return PlatformType.REACT_NATIVE;
        }
        return PlatformType.BROWSER;
    }
    // Node.js environment
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        return PlatformType.NODE;
    }
    return PlatformType.UNKNOWN;
}
/**
 * Get detailed platform information
 */
function getPlatformInfo() {
    const platformType = detectPlatformType();
    let version = '';
    let isMobile = false;
    let isDesktop = false;
    let isServer = false;
    let osName;
    let osVersion;
    switch (platformType) {
        case PlatformType.BROWSER:
            version = typeof navigator !== 'undefined' ? navigator.userAgent : '';
            isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            isDesktop = !isMobile;
            isServer = false;
            // Try to detect OS info from user agent
            if (typeof navigator !== 'undefined') {
                const ua = navigator.userAgent;
                if (/Windows/.test(ua)) {
                    osName = 'Windows';
                    const match = ua.match(/Windows NT (\d+\.\d+)/);
                    osVersion = match ? match[1] : undefined;
                }
                else if (/Macintosh|Mac OS X/.test(ua)) {
                    osName = 'macOS';
                    const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
                    osVersion = match ? match[1].replace(/_/g, '.') : undefined;
                }
                else if (/Linux/.test(ua)) {
                    osName = 'Linux';
                }
                else if (/Android/.test(ua)) {
                    osName = 'Android';
                    const match = ua.match(/Android (\d+\.\d+)/);
                    osVersion = match ? match[1] : undefined;
                }
                else if (/iOS|iPhone|iPad|iPod/.test(ua)) {
                    osName = 'iOS';
                    const match = ua.match(/OS (\d+[._]\d+)/);
                    osVersion = match ? match[1].replace(/_/g, '.') : undefined;
                }
            }
            break;
        case PlatformType.NODE:
            version = process.version;
            isMobile = false;
            isDesktop = false;
            isServer = true;
            if (typeof process !== 'undefined' && process.platform) {
                osName = process.platform;
                osVersion = process.release?.name;
            }
            break;
        case PlatformType.REACT_NATIVE:
            version = ''; // React Native doesn't expose version easily
            isMobile = true;
            isDesktop = false;
            isServer = false;
            break;
        case PlatformType.ELECTRON:
            version = process.versions.electron || '';
            isMobile = false;
            isDesktop = true;
            isServer = false;
            if (typeof process !== 'undefined' && process.platform) {
                osName = process.platform;
            }
            break;
        default:
            break;
    }
    return {
        type: platformType,
        version,
        isMobile,
        isDesktop,
        isServer,
        osName,
        osVersion
    };
}
//# sourceMappingURL=platform.js.map