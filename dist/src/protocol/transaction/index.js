"use strict";
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
exports.DenominationStatus = exports.DenominationVectorClock = exports.TransactionErrorType = exports.TransactionError = exports.TransactionManager = void 0;
// Export transaction protocol types
__exportStar(require("./types"), exports);
// Export TransactionManager and DenominationVectorClock implementation
var TransactionManager_1 = require("./TransactionManager");
Object.defineProperty(exports, "TransactionManager", { enumerable: true, get: function () { return TransactionManager_1.TransactionManager; } });
Object.defineProperty(exports, "TransactionError", { enumerable: true, get: function () { return TransactionManager_1.TransactionError; } });
Object.defineProperty(exports, "TransactionErrorType", { enumerable: true, get: function () { return TransactionManager_1.TransactionErrorType; } });
var DenominationVectorClock_1 = require("./DenominationVectorClock");
Object.defineProperty(exports, "DenominationVectorClock", { enumerable: true, get: function () { return DenominationVectorClock_1.DenominationVectorClock; } });
Object.defineProperty(exports, "DenominationStatus", { enumerable: true, get: function () { return DenominationVectorClock_1.DenominationStatus; } });
// Re-export main transaction manager for easy access
const TransactionManager_2 = require("./TransactionManager");
exports.default = TransactionManager_2.TransactionManager;
//# sourceMappingURL=index.js.map