"use strict";
/**
 * Hardware capability abstraction module for JuiceTokens Foundation Layer
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
exports.HardwareSecurityCapability = void 0;
// Export interfaces
__exportStar(require("./interfaces"), exports);
// Export implementations
__exportStar(require("./hardware-capability-detector"), exports);
__exportStar(require("./mock-capability-provider-factory"), exports);
// Re-export common types for convenience
var interfaces_1 = require("./interfaces");
Object.defineProperty(exports, "HardwareSecurityCapability", { enumerable: true, get: function () { return interfaces_1.HardwareSecurityCapability; } });
//# sourceMappingURL=index.js.map