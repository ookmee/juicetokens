"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WisselToken = void 0;
const Token_1 = require("./Token");
/**
 * WisselToken implementation
 *
 * A special token that maintains an "afrondingsbuffer" (rounding buffer)
 * for handling fractional amounts in transactions
 */
class WisselToken {
    constructor(props) {
        this._baseToken = props.baseToken instanceof Token_1.Token
            ? props.baseToken
            : Token_1.Token.fromJSON(props.baseToken);
        // Afrondingsbuffer must be between 0.0 and 0.99
        if (props.afrondingsbuffer < 0 || props.afrondingsbuffer >= 1) {
            throw new Error('Afrondingsbuffer must be between 0.0 and 0.99');
        }
        this._afrondingsbuffer = Math.round(props.afrondingsbuffer * 100) / 100;
        this._lastUpdatedTimeMs = props.lastUpdatedTimeMs;
        this._lastTransactionId = props.lastTransactionId;
    }
    static create(baseToken) {
        return new WisselToken({
            baseToken,
            afrondingsbuffer: 0,
            lastUpdatedTimeMs: Date.now()
        });
    }
    get baseToken() {
        return this._baseToken;
    }
    get afrondingsbuffer() {
        return this._afrondingsbuffer;
    }
    get lastUpdatedTimeMs() {
        return this._lastUpdatedTimeMs;
    }
    get lastTransactionId() {
        return this._lastTransactionId;
    }
    /**
     * Add an amount to the afrondingsbuffer
     * If the addition would make the buffer >= 1.0, returns the integer part
     * and keeps only the fractional part in the buffer
     */
    addToBuffer(amount, transactionId) {
        if (amount < 0) {
            throw new Error('Cannot add negative amount to buffer');
        }
        const newTotal = this._afrondingsbuffer + amount;
        const integerPart = Math.floor(newTotal);
        const fractionalPart = newTotal - integerPart;
        // Update the buffer with only the fractional part
        this._afrondingsbuffer = fractionalPart;
        this._lastUpdatedTimeMs = Date.now();
        this._lastTransactionId = transactionId;
        // Return the integer part (might be 0)
        return integerPart;
    }
    /**
     * Remove an amount from the afrondingsbuffer
     * Returns true if successful, false if not enough in the buffer
     */
    removeFromBuffer(amount, transactionId) {
        if (amount < 0 || amount > this._afrondingsbuffer) {
            return false;
        }
        this._afrondingsbuffer = Math.round((this._afrondingsbuffer - amount) * 100) / 100;
        this._lastUpdatedTimeMs = Date.now();
        this._lastTransactionId = transactionId;
        return true;
    }
    /**
     * Transfers a specific amount from one WisselToken to another
     * Returns true if successful, false if not enough in source buffer
     */
    static transferBuffer(source, target, amount, transactionId) {
        if (amount < 0 || amount > source.afrondingsbuffer) {
            return false;
        }
        if (source.removeFromBuffer(amount, transactionId)) {
            target.addToBuffer(amount, transactionId);
            return true;
        }
        return false;
    }
    validate() {
        // Check if base token is valid
        if (!this._baseToken.validate()) {
            return false;
        }
        // Check if buffer is within valid range
        if (this._afrondingsbuffer < 0 || this._afrondingsbuffer >= 1) {
            return false;
        }
        // Check if lastUpdatedTimeMs is valid
        if (typeof this._lastUpdatedTimeMs !== 'number' || this._lastUpdatedTimeMs <= 0) {
            return false;
        }
        // Check if lastTransactionId is valid if present
        if (this._lastTransactionId !== undefined &&
            (typeof this._lastTransactionId !== 'string' || !this._lastTransactionId)) {
            return false;
        }
        return true;
    }
    toJSON() {
        const result = {
            baseToken: this._baseToken.toJSON(),
            afrondingsbuffer: this._afrondingsbuffer,
            lastUpdatedTimeMs: this._lastUpdatedTimeMs
        };
        if (this._lastTransactionId) {
            result.lastTransactionId = this._lastTransactionId;
        }
        return result;
    }
    static fromJSON(json) {
        return new WisselToken(json);
    }
}
exports.WisselToken = WisselToken;
//# sourceMappingURL=WisselToken.js.map