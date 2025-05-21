"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.VALID_DENOMINATIONS = exports.TokenStatus = void 0;
const TokenId_1 = require("./TokenId");
var TokenStatus;
(function (TokenStatus) {
    TokenStatus[TokenStatus["ACTIVE"] = 0] = "ACTIVE";
    TokenStatus[TokenStatus["RESERVED"] = 1] = "RESERVED";
    TokenStatus[TokenStatus["EXPIRED"] = 2] = "EXPIRED";
    TokenStatus[TokenStatus["REVOKED"] = 3] = "REVOKED";
    TokenStatus[TokenStatus["CONSUMED"] = 4] = "CONSUMED";
})(TokenStatus || (exports.TokenStatus = TokenStatus = {}));
exports.VALID_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500];
class Token {
    constructor(props) {
        this._tokenId = props.tokenId instanceof TokenId_1.TokenId
            ? props.tokenId
            : new TokenId_1.TokenId(props.tokenId);
        if (!exports.VALID_DENOMINATIONS.includes(props.denomination)) {
            throw new Error(`Invalid denomination: ${props.denomination}`);
        }
        this._denomination = props.denomination;
        this._creationTimeMs = props.creationTimeMs;
        this._issuer = props.issuer;
        this._status = props.status;
        this._expiryTimeMs = props.expiryTimeMs;
    }
    static create(tokenId, denomination, issuer, expiryTimeMs) {
        return new Token({
            tokenId,
            denomination,
            creationTimeMs: Date.now(),
            issuer,
            status: TokenStatus.ACTIVE,
            expiryTimeMs
        });
    }
    get tokenId() {
        return this._tokenId;
    }
    get denomination() {
        return this._denomination;
    }
    get creationTimeMs() {
        return this._creationTimeMs;
    }
    get issuer() {
        return this._issuer;
    }
    get status() {
        return this._status;
    }
    get expiryTimeMs() {
        return this._expiryTimeMs;
    }
    setStatus(status) {
        this._status = status;
    }
    setExpiryTimeMs(expiryTimeMs) {
        this._expiryTimeMs = expiryTimeMs;
    }
    isExpired() {
        if (!this._expiryTimeMs) {
            return false;
        }
        return Date.now() > this._expiryTimeMs;
    }
    validate() {
        // Check if TokenId is valid
        if (!this._tokenId.validate()) {
            return false;
        }
        // Check if denomination is valid
        if (!exports.VALID_DENOMINATIONS.includes(this._denomination)) {
            return false;
        }
        // Check if creation time is valid
        if (typeof this._creationTimeMs !== 'number' || this._creationTimeMs <= 0) {
            return false;
        }
        // Check if issuer is valid
        if (!this._issuer || typeof this._issuer !== 'string') {
            return false;
        }
        // Check if status is valid
        if (!Object.values(TokenStatus).includes(this._status)) {
            return false;
        }
        // Check if expiryTimeMs is valid if present
        if (this._expiryTimeMs !== undefined &&
            (typeof this._expiryTimeMs !== 'number' || this._expiryTimeMs <= 0)) {
            return false;
        }
        return true;
    }
    toJSON() {
        const result = {
            tokenId: this._tokenId.toJSON(),
            denomination: this._denomination,
            creationTimeMs: this._creationTimeMs,
            issuer: this._issuer,
            status: this._status
        };
        if (this._expiryTimeMs !== undefined) {
            result.expiryTimeMs = this._expiryTimeMs;
        }
        return result;
    }
    static fromJSON(json) {
        return new Token(json);
    }
}
exports.Token = Token;
//# sourceMappingURL=Token.js.map