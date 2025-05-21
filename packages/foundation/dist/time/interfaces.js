"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpoofingSignatureType = exports.TimeSourceType = void 0;
/**
 * Enum representing different time source types
 */
var TimeSourceType;
(function (TimeSourceType) {
    TimeSourceType["SYSTEM"] = "SYSTEM";
    TimeSourceType["NTP"] = "NTP";
    TimeSourceType["GNSS"] = "GNSS";
    TimeSourceType["RADIO"] = "RADIO";
    TimeSourceType["CONSENSUS"] = "CONSENSUS";
    TimeSourceType["TSA"] = "TSA";
    TimeSourceType["BLOCKCHAIN"] = "BLOCKCHAIN";
})(TimeSourceType || (exports.TimeSourceType = TimeSourceType = {}));
/**
 * Types of spoofing signatures
 */
var SpoofingSignatureType;
(function (SpoofingSignatureType) {
    SpoofingSignatureType["JUMP"] = "JUMP";
    SpoofingSignatureType["DRIFT"] = "DRIFT";
    SpoofingSignatureType["INCONSISTENCY"] = "INCONSISTENCY";
    SpoofingSignatureType["REPEATED"] = "REPEATED";
    SpoofingSignatureType["PATTERN"] = "PATTERN";
})(SpoofingSignatureType || (exports.SpoofingSignatureType = SpoofingSignatureType = {}));
//# sourceMappingURL=interfaces.js.map