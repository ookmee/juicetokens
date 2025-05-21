"use strict";
/**
 * Trust and Attestation Layer - TypeScript Types
 *
 * This file defines TypeScript interfaces that correspond to the protocol buffer
 * definitions in protos/trust/. These types will be used by the Trust and Attestation
 * Layer adapters.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkType = exports.AttributeVerificationStatus = exports.IdentityStatus = exports.UpdateType = exports.PatternType = exports.Direction = exports.StorageType = void 0;
var StorageType;
(function (StorageType) {
    StorageType[StorageType["LOCAL"] = 0] = "LOCAL";
    StorageType[StorageType["DHT"] = 1] = "DHT";
    StorageType[StorageType["BOTH"] = 2] = "BOTH";
})(StorageType || (exports.StorageType = StorageType = {}));
var Direction;
(function (Direction) {
    Direction[Direction["GIVEN"] = 0] = "GIVEN";
    Direction[Direction["RECEIVED"] = 1] = "RECEIVED";
    Direction[Direction["OBSERVED"] = 2] = "OBSERVED";
})(Direction || (exports.Direction = Direction = {}));
var PatternType;
(function (PatternType) {
    PatternType[PatternType["CYCLICAL"] = 0] = "CYCLICAL";
    PatternType[PatternType["TREND"] = 1] = "TREND";
    PatternType[PatternType["SEASONAL"] = 2] = "SEASONAL";
    PatternType[PatternType["EVENT"] = 3] = "EVENT";
})(PatternType || (exports.PatternType = PatternType = {}));
var UpdateType;
(function (UpdateType) {
    UpdateType[UpdateType["TRANSACTION"] = 0] = "TRANSACTION";
    UpdateType[UpdateType["ATTESTATION"] = 1] = "ATTESTATION";
    UpdateType[UpdateType["NETWORK"] = 2] = "NETWORK";
    UpdateType[UpdateType["MANUAL"] = 3] = "MANUAL";
    UpdateType[UpdateType["PERIODIC"] = 4] = "PERIODIC";
})(UpdateType || (exports.UpdateType = UpdateType = {}));
// Identity Types
var IdentityStatus;
(function (IdentityStatus) {
    IdentityStatus[IdentityStatus["ACTIVE"] = 0] = "ACTIVE";
    IdentityStatus[IdentityStatus["SUSPENDED"] = 1] = "SUSPENDED";
    IdentityStatus[IdentityStatus["REVOKED"] = 2] = "REVOKED";
    IdentityStatus[IdentityStatus["RECOVERY"] = 3] = "RECOVERY";
})(IdentityStatus || (exports.IdentityStatus = IdentityStatus = {}));
var AttributeVerificationStatus;
(function (AttributeVerificationStatus) {
    AttributeVerificationStatus[AttributeVerificationStatus["UNVERIFIED"] = 0] = "UNVERIFIED";
    AttributeVerificationStatus[AttributeVerificationStatus["PEER_VERIFIED"] = 1] = "PEER_VERIFIED";
    AttributeVerificationStatus[AttributeVerificationStatus["SYSTEM_VERIFIED"] = 2] = "SYSTEM_VERIFIED";
    AttributeVerificationStatus[AttributeVerificationStatus["EXPERT_VERIFIED"] = 3] = "EXPERT_VERIFIED";
})(AttributeVerificationStatus || (exports.AttributeVerificationStatus = AttributeVerificationStatus = {}));
var LinkType;
(function (LinkType) {
    LinkType[LinkType["KNOWS"] = 0] = "KNOWS";
    LinkType[LinkType["TRUSTS"] = 1] = "TRUSTS";
    LinkType[LinkType["ENDORSES"] = 2] = "ENDORSES";
    LinkType[LinkType["FAMILY"] = 3] = "FAMILY";
    LinkType[LinkType["GUARDIAN"] = 4] = "GUARDIAN";
    LinkType[LinkType["RECOVERY"] = 5] = "RECOVERY";
})(LinkType || (exports.LinkType = LinkType = {}));
//# sourceMappingURL=types.js.map