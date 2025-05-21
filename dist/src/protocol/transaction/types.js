"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PakStatus = exports.TransactionState = void 0;
/**
 * Represents the current state of a transaction
 */
var TransactionState;
(function (TransactionState) {
    TransactionState[TransactionState["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    TransactionState[TransactionState["INITIATED"] = 1] = "INITIATED";
    TransactionState[TransactionState["PREPARING"] = 2] = "PREPARING";
    TransactionState[TransactionState["PREPARED"] = 3] = "PREPARED";
    TransactionState[TransactionState["COMMITTING"] = 4] = "COMMITTING";
    TransactionState[TransactionState["COMMITTED"] = 5] = "COMMITTED";
    TransactionState[TransactionState["ABORTING"] = 6] = "ABORTING";
    TransactionState[TransactionState["ABORTED"] = 7] = "ABORTED";
    TransactionState[TransactionState["FAILED"] = 8] = "FAILED";
})(TransactionState || (exports.TransactionState = TransactionState = {}));
/**
 * Represents the state of a token package
 */
var PakStatus;
(function (PakStatus) {
    PakStatus[PakStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    PakStatus[PakStatus["CREATED"] = 1] = "CREATED";
    PakStatus[PakStatus["SENT"] = 2] = "SENT";
    PakStatus[PakStatus["RECEIVED"] = 3] = "RECEIVED";
    PakStatus[PakStatus["VERIFIED"] = 4] = "VERIFIED";
    PakStatus[PakStatus["COMMITTED"] = 5] = "COMMITTED";
    PakStatus[PakStatus["ROLLED_BACK"] = 6] = "ROLLED_BACK";
    PakStatus[PakStatus["FAILED"] = 7] = "FAILED";
})(PakStatus || (exports.PakStatus = PakStatus = {}));
//# sourceMappingURL=types.js.map