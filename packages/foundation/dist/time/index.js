"use strict";
/**
 * Time abstraction module for JuiceTokens Foundation Layer
 */
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
exports.SpoofingSignatureType = exports.TimeSourceType = void 0;
// Export interfaces
__exportStar(require("./interfaces"), exports);
// Export time source implementations
__exportStar(require("./base-time-source"), exports);
__exportStar(require("./system-time-source"), exports);
__exportStar(require("./ntp-time-source"), exports);
// Export managers and verifiers
__exportStar(require("./time-source-manager"), exports);
__exportStar(require("./time-consensus-manager"), exports);
__exportStar(require("./time-integrity-verifier"), exports);
// Re-export common types for convenience
var interfaces_1 = require("./interfaces");
Object.defineProperty(exports, "TimeSourceType", { enumerable: true, get: function () { return interfaces_1.TimeSourceType; } });
Object.defineProperty(exports, "SpoofingSignatureType", { enumerable: true, get: function () { return interfaces_1.SpoofingSignatureType; } });
//# sourceMappingURL=index.js.map