"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenId = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TokenId {
    constructor(props) {
        this._id = props.id;
        this._issuanceId = props.issuanceId;
        this._sequenceNumber = props.sequenceNumber;
        this._creationTimeMs = props.creationTimeMs;
    }
    static generate(issuanceId, sequenceNumber) {
        const id = crypto_1.default.randomUUID();
        const creationTimeMs = Date.now();
        return new TokenId({
            id,
            issuanceId,
            sequenceNumber,
            creationTimeMs
        });
    }
    get id() {
        return this._id;
    }
    get issuanceId() {
        return this._issuanceId;
    }
    get sequenceNumber() {
        return this._sequenceNumber;
    }
    get creationTimeMs() {
        return this._creationTimeMs;
    }
    validate() {
        if (!this._id || typeof this._id !== 'string') {
            return false;
        }
        if (!this._issuanceId || typeof this._issuanceId !== 'string') {
            return false;
        }
        if (typeof this._sequenceNumber !== 'number' || this._sequenceNumber < 0) {
            return false;
        }
        if (typeof this._creationTimeMs !== 'number' || this._creationTimeMs <= 0) {
            return false;
        }
        return true;
    }
    toString() {
        return `${this._issuanceId}-${this._sequenceNumber.toString().padStart(6, '0')}`;
    }
    toJSON() {
        return {
            id: this._id,
            issuanceId: this._issuanceId,
            sequenceNumber: this._sequenceNumber,
            creationTimeMs: this._creationTimeMs
        };
    }
    static fromJSON(json) {
        return new TokenId(json);
    }
}
exports.TokenId = TokenId;
//# sourceMappingURL=TokenId.js.map