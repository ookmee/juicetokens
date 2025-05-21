"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token_1 = require("../src/models/Token");
const TokenId_1 = require("../src/models/TokenId");
const WisselToken_1 = require("../src/models/WisselToken");
describe('WisselToken', () => {
    let baseToken;
    beforeEach(() => {
        const tokenId = TokenId_1.TokenId.generate('AMS-001', 1);
        baseToken = Token_1.Token.create(tokenId, 1, 'test-issuer');
    });
    describe('constructor', () => {
        it('should create a WisselToken with the provided properties', () => {
            const props = {
                baseToken,
                afrondingsbuffer: 0.5,
                lastUpdatedTimeMs: Date.now()
            };
            const wisselToken = new WisselToken_1.WisselToken(props);
            expect(wisselToken.baseToken).toBe(baseToken);
            expect(wisselToken.afrondingsbuffer).toBe(props.afrondingsbuffer);
            expect(wisselToken.lastUpdatedTimeMs).toBe(props.lastUpdatedTimeMs);
            expect(wisselToken.lastTransactionId).toBeUndefined();
        });
        it('should accept an optional lastTransactionId', () => {
            const props = {
                baseToken,
                afrondingsbuffer: 0.5,
                lastUpdatedTimeMs: Date.now(),
                lastTransactionId: 'tx-123'
            };
            const wisselToken = new WisselToken_1.WisselToken(props);
            expect(wisselToken.lastTransactionId).toBe(props.lastTransactionId);
        });
        it('should round the afrondingsbuffer to two decimal places', () => {
            const props = {
                baseToken,
                afrondingsbuffer: 0.567,
                lastUpdatedTimeMs: Date.now()
            };
            const wisselToken = new WisselToken_1.WisselToken(props);
            expect(wisselToken.afrondingsbuffer).toBe(0.57);
        });
        it('should throw an error if afrondingsbuffer is negative', () => {
            const props = {
                baseToken,
                afrondingsbuffer: -0.1,
                lastUpdatedTimeMs: Date.now()
            };
            expect(() => new WisselToken_1.WisselToken(props)).toThrow('Afrondingsbuffer must be between 0.0 and 0.99');
        });
        it('should throw an error if afrondingsbuffer is 1.0 or greater', () => {
            const props = {
                baseToken,
                afrondingsbuffer: 1.0,
                lastUpdatedTimeMs: Date.now()
            };
            expect(() => new WisselToken_1.WisselToken(props)).toThrow('Afrondingsbuffer must be between 0.0 and 0.99');
        });
    });
    describe('create', () => {
        it('should create a new WisselToken with zero afrondingsbuffer', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            expect(wisselToken.baseToken).toBe(baseToken);
            expect(wisselToken.afrondingsbuffer).toBe(0);
            expect(typeof wisselToken.lastUpdatedTimeMs).toBe('number');
            expect(wisselToken.lastUpdatedTimeMs).toBeGreaterThan(0);
            expect(wisselToken.lastTransactionId).toBeUndefined();
        });
    });
    describe('addToBuffer', () => {
        let wisselToken;
        beforeEach(() => {
            wisselToken = WisselToken_1.WisselToken.create(baseToken);
        });
        it('should add amount to the buffer', () => {
            const amount = 0.5;
            const transactionId = 'tx-123';
            const integerPart = wisselToken.addToBuffer(amount, transactionId);
            expect(wisselToken.afrondingsbuffer).toBe(0.5);
            expect(wisselToken.lastTransactionId).toBe(transactionId);
            expect(integerPart).toBe(0);
        });
        it('should handle additions that exceed 1.0', () => {
            // Initial buffer is 0
            // Adding 1.75 should result in buffer = 0.75 and return integer part 1
            const amount = 1.75;
            const transactionId = 'tx-123';
            const integerPart = wisselToken.addToBuffer(amount, transactionId);
            expect(wisselToken.afrondingsbuffer).toBe(0.75);
            expect(integerPart).toBe(1);
        });
        it('should handle multiple additions correctly', () => {
            wisselToken.addToBuffer(0.3, 'tx-1');
            wisselToken.addToBuffer(0.4, 'tx-2');
            const integerPart = wisselToken.addToBuffer(0.5, 'tx-3');
            // Due to floating point precision issues, use toBeCloseTo instead of toBe
            expect(wisselToken.afrondingsbuffer).toBeCloseTo(0.2, 10); // 0.3 + 0.4 + 0.5 = 1.2 -> 0.2 remainder
            expect(integerPart).toBe(1); // Integer part is 1
            expect(wisselToken.lastTransactionId).toBe('tx-3');
        });
        it('should throw an error for negative amounts', () => {
            expect(() => wisselToken.addToBuffer(-0.1, 'tx-123')).toThrow('Cannot add negative amount to buffer');
        });
    });
    describe('removeFromBuffer', () => {
        let wisselToken;
        beforeEach(() => {
            wisselToken = WisselToken_1.WisselToken.create(baseToken);
            wisselToken.addToBuffer(0.5, 'tx-init');
        });
        it('should remove amount from the buffer', () => {
            const result = wisselToken.removeFromBuffer(0.2, 'tx-123');
            expect(result).toBe(true);
            expect(wisselToken.afrondingsbuffer).toBe(0.3);
            expect(wisselToken.lastTransactionId).toBe('tx-123');
        });
        it('should return false if trying to remove more than available', () => {
            const result = wisselToken.removeFromBuffer(0.6, 'tx-123');
            expect(result).toBe(false);
            expect(wisselToken.afrondingsbuffer).toBe(0.5); // Unchanged
            expect(wisselToken.lastTransactionId).toBe('tx-init'); // Unchanged
        });
        it('should handle exact removal correctly', () => {
            const result = wisselToken.removeFromBuffer(0.5, 'tx-123');
            expect(result).toBe(true);
            expect(wisselToken.afrondingsbuffer).toBe(0);
        });
        it('should return false for negative amounts', () => {
            const result = wisselToken.removeFromBuffer(-0.1, 'tx-123');
            expect(result).toBe(false);
            expect(wisselToken.afrondingsbuffer).toBe(0.5); // Unchanged
        });
    });
    describe('transferBuffer', () => {
        let sourceWisselToken;
        let targetWisselToken;
        beforeEach(() => {
            const sourceTokenId = TokenId_1.TokenId.generate('AMS-001', 1);
            const sourceBaseToken = Token_1.Token.create(sourceTokenId, 1, 'test-issuer');
            sourceWisselToken = WisselToken_1.WisselToken.create(sourceBaseToken);
            sourceWisselToken.addToBuffer(0.5, 'tx-init');
            const targetTokenId = TokenId_1.TokenId.generate('AMS-001', 2);
            const targetBaseToken = Token_1.Token.create(targetTokenId, 1, 'test-issuer');
            targetWisselToken = WisselToken_1.WisselToken.create(targetBaseToken);
        });
        it('should transfer amount between WisselTokens', () => {
            const transactionId = 'tx-transfer';
            const result = WisselToken_1.WisselToken.transferBuffer(sourceWisselToken, targetWisselToken, 0.3, transactionId);
            expect(result).toBe(true);
            expect(sourceWisselToken.afrondingsbuffer).toBe(0.2);
            expect(targetWisselToken.afrondingsbuffer).toBe(0.3);
            expect(sourceWisselToken.lastTransactionId).toBe(transactionId);
            expect(targetWisselToken.lastTransactionId).toBe(transactionId);
        });
        it('should return false if trying to transfer more than available', () => {
            const transactionId = 'tx-transfer';
            const result = WisselToken_1.WisselToken.transferBuffer(sourceWisselToken, targetWisselToken, 0.6, transactionId);
            expect(result).toBe(false);
            expect(sourceWisselToken.afrondingsbuffer).toBe(0.5); // Unchanged
            expect(targetWisselToken.afrondingsbuffer).toBe(0); // Unchanged
        });
        it('should return false for negative amounts', () => {
            const transactionId = 'tx-transfer';
            const result = WisselToken_1.WisselToken.transferBuffer(sourceWisselToken, targetWisselToken, -0.1, transactionId);
            expect(result).toBe(false);
            expect(sourceWisselToken.afrondingsbuffer).toBe(0.5); // Unchanged
            expect(targetWisselToken.afrondingsbuffer).toBe(0); // Unchanged
        });
    });
    describe('validate', () => {
        it('should return true for a valid WisselToken', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            expect(wisselToken.validate()).toBe(true);
        });
        it('should return false if baseToken is invalid', () => {
            const invalidTokenId = new TokenId_1.TokenId({
                id: '',
                issuanceId: 'AMS-001',
                sequenceNumber: 1,
                creationTimeMs: Date.now()
            });
            const invalidBaseToken = Token_1.Token.create(invalidTokenId, 1, 'test-issuer');
            const wisselToken = WisselToken_1.WisselToken.create(invalidBaseToken);
            expect(wisselToken.validate()).toBe(false);
        });
        it('should return false if afrondingsbuffer is invalid', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            // Directly manipulating private property for testing
            wisselToken._afrondingsbuffer = 2.0;
            expect(wisselToken.validate()).toBe(false);
        });
        it('should return false if lastUpdatedTimeMs is invalid', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            // Directly manipulating private property for testing
            wisselToken._lastUpdatedTimeMs = 0;
            expect(wisselToken.validate()).toBe(false);
        });
        it('should return false if lastTransactionId is empty string', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            // Directly manipulating private property for testing
            wisselToken._lastTransactionId = '';
            expect(wisselToken.validate()).toBe(false);
        });
    });
    describe('toJSON / fromJSON', () => {
        it('should correctly serialize and deserialize a WisselToken', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            wisselToken.addToBuffer(0.42, 'tx-123');
            const json = wisselToken.toJSON();
            const deserialized = WisselToken_1.WisselToken.fromJSON(json);
            expect(deserialized.afrondingsbuffer).toBe(wisselToken.afrondingsbuffer);
            expect(deserialized.lastUpdatedTimeMs).toBe(wisselToken.lastUpdatedTimeMs);
            expect(deserialized.lastTransactionId).toBe(wisselToken.lastTransactionId);
            expect(deserialized.baseToken.tokenId.id).toBe(wisselToken.baseToken.tokenId.id);
        });
        it('should preserve baseToken properties during serialization', () => {
            const wisselToken = WisselToken_1.WisselToken.create(baseToken);
            const json = wisselToken.toJSON();
            const deserialized = WisselToken_1.WisselToken.fromJSON(json);
            expect(deserialized.baseToken.denomination).toBe(baseToken.denomination);
            expect(deserialized.baseToken.issuer).toBe(baseToken.issuer);
            expect(deserialized.baseToken.status).toBe(baseToken.status);
        });
    });
});
//# sourceMappingURL=WisselToken.test.js.map