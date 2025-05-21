"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareSecurityCapability = void 0;
/**
 * Hardware security capabilities
 */
var HardwareSecurityCapability;
(function (HardwareSecurityCapability) {
    HardwareSecurityCapability["TEE"] = "TEE";
    HardwareSecurityCapability["TPM"] = "TPM";
    HardwareSecurityCapability["SE"] = "SE";
    HardwareSecurityCapability["SGX"] = "SGX";
    HardwareSecurityCapability["TZ"] = "TZ";
    HardwareSecurityCapability["HSM"] = "HSM";
    HardwareSecurityCapability["OTP"] = "OTP"; // One-Time Programmable memory
})(HardwareSecurityCapability || (exports.HardwareSecurityCapability = HardwareSecurityCapability = {}));
//# sourceMappingURL=interfaces.js.map