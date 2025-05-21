"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telomeer = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Telomeer implementation - the ownership tracking mechanism with
 * self-composting history that prevents unbounded growth
 */
class Telomeer {
    constructor(props) {
        this._tokenId = props.tokenId;
        this._currentOwner = props.currentOwner;
        this._hashPreviousOwner = props.hashPreviousOwner;
        this._hashHistory = props.hashHistory || [];
    }
    static create(tokenId, initialOwner) {
        return new Telomeer({
            tokenId,
            currentOwner: initialOwner,
            hashPreviousOwner: Telomeer.hashOwner('GENESIS'),
            hashHistory: []
        });
    }
    static hashOwner(ownerPublicKey) {
        return crypto_1.default.createHash('sha256')
            .update(ownerPublicKey)
            .digest('hex');
    }
    get tokenId() {
        return this._tokenId;
    }
    get currentOwner() {
        return this._currentOwner;
    }
    get hashPreviousOwner() {
        return this._hashPreviousOwner;
    }
    get hashHistory() {
        return [...this._hashHistory];
    }
    /**
     * Transfer token ownership to a new owner
     * Updates the ownership chain and manages history pruning
     */
    transferOwnership(newOwner, transactionId) {
        if (!newOwner || newOwner === this._currentOwner) {
            throw new Error('Invalid new owner for transfer');
        }
        // Save current owner's hash before updating
        const previousOwnerHash = Telomeer.hashOwner(this._currentOwner);
        // Update hashHistory with the previous owner's hash
        this._hashHistory.push(previousOwnerHash);
        // Prune history if it exceeds the maximum size (keep most recent 10 entries)
        const MAX_HISTORY_SIZE = 10;
        if (this._hashHistory.length > MAX_HISTORY_SIZE) {
            // When pruning, we create a composite hash of the oldest entries
            const oldestEntries = this._hashHistory.splice(0, this._hashHistory.length - MAX_HISTORY_SIZE + 1);
            const compositeHash = this.createCompositeHash(oldestEntries);
            this._hashHistory.unshift(compositeHash);
        }
        // Update previous owner hash and current owner
        this._hashPreviousOwner = previousOwnerHash;
        this._currentOwner = newOwner;
    }
    /**
     * Creates a composite hash from multiple history entries
     * This enables pruning while maintaining cryptographic verification capability
     */
    createCompositeHash(hashes) {
        const concatenated = hashes.join('');
        return crypto_1.default.createHash('sha256')
            .update(concatenated)
            .digest('hex');
    }
    /**
     * Verifies if the provided owner was previously in the ownership chain
     */
    verifyPreviousOwnership(ownerPublicKey) {
        const ownerHash = Telomeer.hashOwner(ownerPublicKey);
        // Check if it matches the previous owner
        if (ownerHash === this._hashPreviousOwner) {
            return true;
        }
        // Check if it's in the history
        return this._hashHistory.includes(ownerHash);
    }
    /**
     * Generate an ownership proof for the current owner
     */
    generateOwnershipProof() {
        return {
            tokenId: this._tokenId,
            timestamp: Date.now(),
            ownershipChain: [this._currentOwner, this._hashPreviousOwner, ...this._hashHistory]
        };
    }
    validate() {
        if (!this._tokenId.validate()) {
            return false;
        }
        if (!this._currentOwner || typeof this._currentOwner !== 'string') {
            return false;
        }
        if (!this._hashPreviousOwner || typeof this._hashPreviousOwner !== 'string') {
            return false;
        }
        if (!Array.isArray(this._hashHistory)) {
            return false;
        }
        return true;
    }
    toJSON() {
        return {
            tokenId: this._tokenId,
            currentOwner: this._currentOwner,
            hashPreviousOwner: this._hashPreviousOwner,
            hashHistory: [...this._hashHistory]
        };
    }
    static fromJSON(json) {
        return new Telomeer(json);
    }
}
exports.Telomeer = Telomeer;
//# sourceMappingURL=Telomeer.js.map