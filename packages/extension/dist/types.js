"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionEventType = exports.ExtensionState = void 0;
/**
 * Extension lifecycle states
 */
var ExtensionState;
(function (ExtensionState) {
    ExtensionState["REGISTERED"] = "registered";
    ExtensionState["INITIALIZED"] = "initialized";
    ExtensionState["ACTIVE"] = "active";
    ExtensionState["PAUSED"] = "paused";
    ExtensionState["DISABLED"] = "disabled";
    ExtensionState["ERROR"] = "error";
})(ExtensionState || (exports.ExtensionState = ExtensionState = {}));
/**
 * Extension event types
 */
var ExtensionEventType;
(function (ExtensionEventType) {
    ExtensionEventType["REGISTERED"] = "extension:registered";
    ExtensionEventType["INITIALIZED"] = "extension:initialized";
    ExtensionEventType["ACTIVATED"] = "extension:activated";
    ExtensionEventType["PAUSED"] = "extension:paused";
    ExtensionEventType["DISABLED"] = "extension:disabled";
    ExtensionEventType["ERROR"] = "extension:error";
    ExtensionEventType["CONFIG_CHANGED"] = "extension:config_changed";
    ExtensionEventType["MESSAGE"] = "extension:message";
})(ExtensionEventType || (exports.ExtensionEventType = ExtensionEventType = {}));
//# sourceMappingURL=types.js.map