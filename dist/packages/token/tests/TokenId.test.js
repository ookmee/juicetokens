"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TokenId_1 = require("../src/models/TokenId");
describe('TokenId', () => {
    describe('constructor', () => {
        it('should create a TokenId with the provided properties', () => {
            const props = {
                id: 'test-id',
                issuanceId: 'AMS-001',
                sequenceNumber: 42,
                creationTimeMs: Date.now()
            };
            const tokenId = new TokenId_1.TokenId(props);
            expect(tokenId.id).toBe(props.id);
            expect(tokenId.issuanceId).toBe(props.issuanceId);
            expect(tokenId.sequenceNumber).toBe(props.sequenceNumber);
            expect(tokenId.creationTimeMs).toBe(props.creationTimeMs);
        });
    });
    describe('generate', () => {
        it('should generate a TokenId with the provided issuanceId and sequenceNumber', () => {
            const issuanceId = 'AMS-001';
            const sequenceNumber = 42;
            const tokenId = TokenId_1.TokenId.generate(issuanceId, sequenceNumber);
            expect(tokenId.issuanceId).toBe(issuanceId);
            expect(tokenId.sequenceNumber).toBe(sequenceNumber);
            expect(typeof tokenId.id).toBe('string');
            expect(tokenId.id.length).toBeGreaterThan(0);
            expect(typeof tokenId.creationTimeMs).toBe('number');
            expect(tokenId.creationTimeMs).toBeGreaterThan(0);
        });
    });
    describe('validate', () => {
        it('should return true for a valid TokenId', () => {
            const tokenId = TokenId_1.TokenId.generate('AMS-001', 42);
            expect(tokenId.validate()).toBe(true);
        });
        it('should return false if id is missing or invalid', () => {
            const props = {
                id: '',
                issuanceId: 'AMS-001',
                sequenceNumber: 42,
                creationTimeMs: Date.now()
            };
            const tokenId = new TokenId_1.TokenId(props);
            expect(tokenId.validate()).toBe(false);
        });
        it('should return false if issuanceId is missing or invalid', () => {
            const props = {
                id: 'test-id',
                issuanceId: '',
                sequenceNumber: 42,
                creationTimeMs: Date.now()
            };
            const tokenId = new TokenId_1.TokenId(props);
            expect(tokenId.validate()).toBe(false);
        });
        it('should return false if sequenceNumber is negative', () => {
            const props = {
                id: 'test-id',
                issuanceId: 'AMS-001',
                sequenceNumber: -1,
                creationTimeMs: Date.now()
            };
            const tokenId = new TokenId_1.TokenId(props);
            expect(tokenId.validate()).toBe(false);
        });
        it('should return false if creationTimeMs is invalid', () => {
            const props = {
                id: 'test-id',
                issuanceId: 'AMS-001',
                sequenceNumber: 42,
                creationTimeMs: 0
            };
            const tokenId = new TokenId_1.TokenId(props);
            expect(tokenId.validate()).toBe(false);
        });
    });
    describe('toString', () => {
        it('should return a string in the format issuanceId-paddedSequenceNumber', () => {
            const tokenId = TokenId_1.TokenId.generate('AMS-001', 42);
            expect(tokenId.toString()).toBe('AMS-001-000042');
        });
    });
    describe('toJSON / fromJSON', () => {
        it('should correctly serialize and deserialize a TokenId', () => {
            const original = TokenId_1.TokenId.generate('AMS-001', 42);
            const json = original.toJSON();
            const deserialized = TokenId_1.TokenId.fromJSON(json);
            expect(deserialized.id).toBe(original.id);
            expect(deserialized.issuanceId).toBe(original.issuanceId);
            expect(deserialized.sequenceNumber).toBe(original.sequenceNumber);
            expect(deserialized.creationTimeMs).toBe(original.creationTimeMs);
        });
    });
});
//# sourceMappingURL=TokenId.test.js.map