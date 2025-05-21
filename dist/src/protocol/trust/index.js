"use strict";
/**
 * Trust and Attestation Layer - Index File
 *
 * This file exports all components of the Trust and Attestation Layer.
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
exports.LinkType = exports.AttributeVerificationStatus = exports.IdentityStatus = exports.PatternType = exports.UpdateType = exports.Direction = exports.StorageType = exports.DHTAdapter = exports.IdentityService = exports.ReputationService = exports.AttestationService = void 0;
// Export types
__exportStar(require("./types"), exports);
// Export services
var attestation_service_1 = require("./attestation.service");
Object.defineProperty(exports, "AttestationService", { enumerable: true, get: function () { return attestation_service_1.AttestationService; } });
var reputation_service_1 = require("./reputation.service");
Object.defineProperty(exports, "ReputationService", { enumerable: true, get: function () { return reputation_service_1.ReputationService; } });
var identity_service_1 = require("./identity.service");
Object.defineProperty(exports, "IdentityService", { enumerable: true, get: function () { return identity_service_1.IdentityService; } });
// Export DHT adapter
var dht_adapter_1 = require("./dht.adapter");
Object.defineProperty(exports, "DHTAdapter", { enumerable: true, get: function () { return dht_adapter_1.DHTAdapter; } });
// Re-export primary interfaces as a convenience
var types_1 = require("./types");
Object.defineProperty(exports, "StorageType", { enumerable: true, get: function () { return types_1.StorageType; } });
Object.defineProperty(exports, "Direction", { enumerable: true, get: function () { return types_1.Direction; } });
Object.defineProperty(exports, "UpdateType", { enumerable: true, get: function () { return types_1.UpdateType; } });
Object.defineProperty(exports, "PatternType", { enumerable: true, get: function () { return types_1.PatternType; } });
Object.defineProperty(exports, "IdentityStatus", { enumerable: true, get: function () { return types_1.IdentityStatus; } });
Object.defineProperty(exports, "AttributeVerificationStatus", { enumerable: true, get: function () { return types_1.AttributeVerificationStatus; } });
Object.defineProperty(exports, "LinkType", { enumerable: true, get: function () { return types_1.LinkType; } });
//# sourceMappingURL=index.js.map