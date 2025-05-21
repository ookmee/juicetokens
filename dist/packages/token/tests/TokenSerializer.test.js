"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialization_1 = require("../src/utils/serialization");
const TokenId_1 = require("../src/models/TokenId");
const Token_1 = require("../src/models/Token");
const WisselToken_1 = require("../src/models/WisselToken");
const Telomeer_1 = require("../src/models/Telomeer");
describe('TokenSerializer', () => {
    let tokenId;
    let token;
    let wisselToken;
    let telomeer;
    beforeEach(() => {
        tokenId = TokenId_1.TokenId.generate('AMS-001', 1);
        token = Token_1.Token.create(tokenId, 10, 'test-issuer');
        wisselToken = WisselToken_1.WisselToken.create(token);
        telomeer = Telomeer_1.Telomeer.create(tokenId, 'initial-owner');
    });
    describe('serializeToken / deserializeToken', () => {
        it('should correctly serialize and deserialize a Token', () => {
            const serialized = serialization_1.TokenSerializer.serializeToken(token);
            const deserialized = serialization_1.TokenSerializer.deserializeToken(serialized);
            expect(typeof serialized).toBe('string');
            expect(deserialized.tokenId.id).toBe(token.tokenId.id);
            expect(deserialized.denomination).toBe(token.denomination);
            expect(deserialized.issuer).toBe(token.issuer);
            expect(deserialized.status).toBe(token.status);
        });
        it('should preserve all properties during serialization', () => {
            const expiryTimeMs = Date.now() + 3600000; // 1 hour from now
            token.setExpiryTimeMs(expiryTimeMs);
            token.setStatus(Token_1.TokenStatus.RESERVED);
            const serialized = serialization_1.TokenSerializer.serializeToken(token);
            const deserialized = serialization_1.TokenSerializer.deserializeToken(serialized);
            expect(deserialized.expiryTimeMs).toBe(token.expiryTimeMs);
            expect(deserialized.status).toBe(Token_1.TokenStatus.RESERVED);
        });
    });
    describe('serializeWisselToken / deserializeWisselToken', () => {
        it('should correctly serialize and deserialize a WisselToken', () => {
            wisselToken.addToBuffer(0.42, 'tx-123');
            const serialized = serialization_1.TokenSerializer.serializeWisselToken(wisselToken);
            const deserialized = serialization_1.TokenSerializer.deserializeWisselToken(serialized);
            expect(typeof serialized).toBe('string');
            expect(deserialized.afrondingsbuffer).toBe(wisselToken.afrondingsbuffer);
            expect(deserialized.lastTransactionId).toBe(wisselToken.lastTransactionId);
            expect(deserialized.baseToken.tokenId.id).toBe(wisselToken.baseToken.tokenId.id);
        });
    });
    describe('serializeTelomeer / deserializeTelomeer', () => {
        it('should correctly serialize and deserialize a Telomeer', () => {
            telomeer.transferOwnership('new-owner', 'tx-123');
            const serialized = serialization_1.TokenSerializer.serializeTelomeer(telomeer);
            const deserialized = serialization_1.TokenSerializer.deserializeTelomeer(serialized);
            expect(typeof serialized).toBe('string');
            expect(deserialized.currentOwner).toBe(telomeer.currentOwner);
            expect(deserialized.hashPreviousOwner).toBe(telomeer.hashPreviousOwner);
            expect(deserialized.hashHistory).toEqual(telomeer.hashHistory);
            expect(deserialized.tokenId.id).toBe(telomeer.tokenId.id);
        });
    });
    describe('serializeTokenId / deserializeTokenId', () => {
        it('should correctly serialize and deserialize a TokenId', () => {
            const serialized = serialization_1.TokenSerializer.serializeTokenId(tokenId);
            const deserialized = serialization_1.TokenSerializer.deserializeTokenId(serialized);
            expect(typeof serialized).toBe('string');
            expect(deserialized.id).toBe(tokenId.id);
            expect(deserialized.issuanceId).toBe(tokenId.issuanceId);
            expect(deserialized.sequenceNumber).toBe(tokenId.sequenceNumber);
            expect(deserialized.creationTimeMs).toBe(tokenId.creationTimeMs);
        });
    });
    describe('tokenToBinary / tokenFromBinary', () => {
        it('should correctly convert a Token to and from binary', () => {
            const binary = serialization_1.TokenSerializer.tokenToBinary(token);
            const deserialized = serialization_1.TokenSerializer.tokenFromBinary(binary);
            expect(Buffer.isBuffer(binary)).toBe(true);
            expect(deserialized.tokenId.id).toBe(token.tokenId.id);
            expect(deserialized.denomination).toBe(token.denomination);
            expect(deserialized.issuer).toBe(token.issuer);
        });
    });
    describe('wisselTokenToBinary / wisselTokenFromBinary', () => {
        it('should correctly convert a WisselToken to and from binary', () => {
            wisselToken.addToBuffer(0.42, 'tx-123');
            const binary = serialization_1.TokenSerializer.wisselTokenToBinary(wisselToken);
            const deserialized = serialization_1.TokenSerializer.wisselTokenFromBinary(binary);
            expect(Buffer.isBuffer(binary)).toBe(true);
            expect(deserialized.afrondingsbuffer).toBe(wisselToken.afrondingsbuffer);
            expect(deserialized.lastTransactionId).toBe(wisselToken.lastTransactionId);
            expect(deserialized.baseToken.tokenId.id).toBe(wisselToken.baseToken.tokenId.id);
        });
    });
    describe('telomeerToBinary / telomeerFromBinary', () => {
        it('should correctly convert a Telomeer to and from binary', () => {
            telomeer.transferOwnership('new-owner', 'tx-123');
            const binary = serialization_1.TokenSerializer.telomeerToBinary(telomeer);
            const deserialized = serialization_1.TokenSerializer.telomeerFromBinary(binary);
            expect(Buffer.isBuffer(binary)).toBe(true);
            expect(deserialized.currentOwner).toBe(telomeer.currentOwner);
            expect(deserialized.hashPreviousOwner).toBe(telomeer.hashPreviousOwner);
            expect(deserialized.hashHistory).toEqual(telomeer.hashHistory);
        });
    });
});
//# sourceMappingURL=TokenSerializer.test.js.map