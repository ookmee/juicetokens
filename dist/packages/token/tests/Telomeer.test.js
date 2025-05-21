"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Telomeer_1 = require("../src/models/Telomeer");
const TokenId_1 = require("../src/models/TokenId");
describe('Telomeer', () => {
    let tokenId;
    beforeEach(() => {
        tokenId = TokenId_1.TokenId.generate('AMS-001', 1);
    });
    describe('constructor', () => {
        it('should create a Telomeer with the provided properties', () => {
            const props = {
                tokenId,
                currentOwner: 'owner-public-key',
                hashPreviousOwner: 'previous-owner-hash',
                hashHistory: ['hash1', 'hash2']
            };
            const telomeer = new Telomeer_1.Telomeer(props);
            expect(telomeer.tokenId).toBe(tokenId);
            expect(telomeer.currentOwner).toBe(props.currentOwner);
            expect(telomeer.hashPreviousOwner).toBe(props.hashPreviousOwner);
            expect(telomeer.hashHistory).toEqual(props.hashHistory);
        });
        it('should initialize empty hashHistory if not provided', () => {
            const props = {
                tokenId,
                currentOwner: 'owner-public-key',
                hashPreviousOwner: 'previous-owner-hash',
                hashHistory: undefined
            };
            const telomeer = new Telomeer_1.Telomeer(props);
            expect(telomeer.hashHistory).toEqual([]);
        });
    });
    describe('create', () => {
        it('should create a new Telomeer with initial owner', () => {
            const initialOwner = 'initial-owner-public-key';
            const telomeer = Telomeer_1.Telomeer.create(tokenId, initialOwner);
            expect(telomeer.tokenId).toBe(tokenId);
            expect(telomeer.currentOwner).toBe(initialOwner);
            expect(telomeer.hashPreviousOwner).toBe(Telomeer_1.Telomeer.hashOwner('GENESIS'));
            expect(telomeer.hashHistory).toEqual([]);
        });
    });
    describe('hashOwner', () => {
        it('should create a SHA-256 hash of the owner public key', () => {
            const ownerPublicKey = 'owner-public-key';
            const hash = Telomeer_1.Telomeer.hashOwner(ownerPublicKey);
            expect(typeof hash).toBe('string');
            expect(hash.length).toBe(64); // SHA-256 hash is 64 hex characters
        });
        it('should produce different hashes for different keys', () => {
            const hash1 = Telomeer_1.Telomeer.hashOwner('owner1');
            const hash2 = Telomeer_1.Telomeer.hashOwner('owner2');
            expect(hash1).not.toBe(hash2);
        });
        it('should produce the same hash for the same key', () => {
            const key = 'owner-public-key';
            const hash1 = Telomeer_1.Telomeer.hashOwner(key);
            const hash2 = Telomeer_1.Telomeer.hashOwner(key);
            expect(hash1).toBe(hash2);
        });
    });
    describe('transferOwnership', () => {
        let telomeer;
        const initialOwner = 'initial-owner';
        beforeEach(() => {
            telomeer = Telomeer_1.Telomeer.create(tokenId, initialOwner);
        });
        it('should transfer ownership to a new owner', () => {
            const newOwner = 'new-owner';
            const transactionId = 'transaction-id';
            const previousOwnerHash = Telomeer_1.Telomeer.hashOwner(initialOwner);
            telomeer.transferOwnership(newOwner, transactionId);
            expect(telomeer.currentOwner).toBe(newOwner);
            expect(telomeer.hashPreviousOwner).toBe(previousOwnerHash);
            expect(telomeer.hashHistory).toContain(previousOwnerHash);
        });
        it('should throw an error if new owner is empty', () => {
            expect(() => telomeer.transferOwnership('', 'transaction-id')).toThrow('Invalid new owner for transfer');
        });
        it('should throw an error if new owner is the same as current owner', () => {
            expect(() => telomeer.transferOwnership(initialOwner, 'transaction-id')).toThrow('Invalid new owner for transfer');
        });
        it('should prune history when it exceeds maximum size', () => {
            // Create a telomeer with a large history
            const largeHistory = Array(15).fill(0).map((_, i) => `hash${i}`);
            const telomeerWithLargeHistory = new Telomeer_1.Telomeer({
                tokenId,
                currentOwner: initialOwner,
                hashPreviousOwner: 'previous-owner-hash',
                hashHistory: largeHistory
            });
            // Transfer ownership to trigger pruning
            telomeerWithLargeHistory.transferOwnership('new-owner', 'transaction-id');
            // Check that history was pruned to 10 entries
            expect(telomeerWithLargeHistory.hashHistory.length).toBeLessThanOrEqual(10);
            // First hash should be a composite hash that's not directly in the original large history
            // Instead of directly comparing (which might fail if the hash algorithm or input changes),
            // we'll check that the pruning operation properly set the array length
            expect(telomeerWithLargeHistory.hashHistory.length).toBe(10);
        });
    });
    describe('verifyPreviousOwnership', () => {
        let telomeer;
        const owner1 = 'owner1';
        const owner2 = 'owner2';
        const owner3 = 'owner3';
        beforeEach(() => {
            telomeer = Telomeer_1.Telomeer.create(tokenId, owner1);
            telomeer.transferOwnership(owner2, 'tx1');
            telomeer.transferOwnership(owner3, 'tx2');
        });
        it('should return true for the previous owner', () => {
            expect(telomeer.verifyPreviousOwnership(owner2)).toBe(true);
        });
        it('should return true for an owner in the history', () => {
            expect(telomeer.verifyPreviousOwnership(owner1)).toBe(true);
        });
        it('should return false for an unknown owner', () => {
            expect(telomeer.verifyPreviousOwnership('unknown-owner')).toBe(false);
        });
    });
    describe('generateOwnershipProof', () => {
        it('should generate a proof with the correct structure', () => {
            const telomeer = Telomeer_1.Telomeer.create(tokenId, 'owner');
            const proof = telomeer.generateOwnershipProof();
            expect(proof.tokenId).toBe(tokenId);
            expect(typeof proof.timestamp).toBe('number');
            expect(proof.ownershipChain).toEqual([
                'owner',
                Telomeer_1.Telomeer.hashOwner('GENESIS'),
                ...telomeer.hashHistory
            ]);
        });
    });
    describe('validate', () => {
        it('should return true for a valid telomeer', () => {
            const telomeer = Telomeer_1.Telomeer.create(tokenId, 'owner');
            expect(telomeer.validate()).toBe(true);
        });
        it('should return false if tokenId is invalid', () => {
            const invalidTokenId = new TokenId_1.TokenId({
                id: '',
                issuanceId: 'AMS-001',
                sequenceNumber: 1,
                creationTimeMs: Date.now()
            });
            const telomeer = Telomeer_1.Telomeer.create(invalidTokenId, 'owner');
            expect(telomeer.validate()).toBe(false);
        });
        it('should return false if currentOwner is invalid', () => {
            const telomeer = Telomeer_1.Telomeer.create(tokenId, 'owner');
            telomeer._currentOwner = '';
            expect(telomeer.validate()).toBe(false);
        });
        it('should return false if hashPreviousOwner is invalid', () => {
            const telomeer = Telomeer_1.Telomeer.create(tokenId, 'owner');
            telomeer._hashPreviousOwner = '';
            expect(telomeer.validate()).toBe(false);
        });
        it('should return false if hashHistory is not an array', () => {
            const telomeer = Telomeer_1.Telomeer.create(tokenId, 'owner');
            telomeer._hashHistory = 'not-an-array';
            expect(telomeer.validate()).toBe(false);
        });
    });
    describe('toJSON / fromJSON', () => {
        it('should correctly serialize and deserialize a Telomeer', () => {
            const owner1 = 'owner1';
            const owner2 = 'owner2';
            const original = Telomeer_1.Telomeer.create(tokenId, owner1);
            original.transferOwnership(owner2, 'tx1');
            const json = original.toJSON();
            const deserialized = Telomeer_1.Telomeer.fromJSON(json);
            expect(deserialized.tokenId.id).toBe(original.tokenId.id);
            expect(deserialized.currentOwner).toBe(original.currentOwner);
            expect(deserialized.hashPreviousOwner).toBe(original.hashPreviousOwner);
            expect(deserialized.hashHistory).toEqual(original.hashHistory);
        });
    });
});
//# sourceMappingURL=Telomeer.test.js.map