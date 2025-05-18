import { TokenSerializer } from '../src/utils/serialization';
import { TokenId } from '../src/models/TokenId';
import { Token, TokenDenomination, TokenStatus } from '../src/models/Token';
import { WisselToken } from '../src/models/WisselToken';
import { Telomeer } from '../src/models/Telomeer';

describe('TokenSerializer', () => {
  let tokenId: TokenId;
  let token: Token;
  let wisselToken: WisselToken;
  let telomeer: Telomeer;
  
  beforeEach(() => {
    tokenId = TokenId.generate('AMS-001', 1);
    token = Token.create(tokenId, 10 as TokenDenomination, 'test-issuer');
    wisselToken = WisselToken.create(token);
    telomeer = Telomeer.create(tokenId, 'initial-owner');
  });
  
  describe('serializeToken / deserializeToken', () => {
    it('should correctly serialize and deserialize a Token', () => {
      const serialized = TokenSerializer.serializeToken(token);
      const deserialized = TokenSerializer.deserializeToken(serialized);
      
      expect(typeof serialized).toBe('string');
      expect(deserialized.tokenId.id).toBe(token.tokenId.id);
      expect(deserialized.denomination).toBe(token.denomination);
      expect(deserialized.issuer).toBe(token.issuer);
      expect(deserialized.status).toBe(token.status);
    });
    
    it('should preserve all properties during serialization', () => {
      const expiryTimeMs = Date.now() + 3600000; // 1 hour from now
      token.setExpiryTimeMs(expiryTimeMs);
      token.setStatus(TokenStatus.RESERVED);
      
      const serialized = TokenSerializer.serializeToken(token);
      const deserialized = TokenSerializer.deserializeToken(serialized);
      
      expect(deserialized.expiryTimeMs).toBe(token.expiryTimeMs);
      expect(deserialized.status).toBe(TokenStatus.RESERVED);
    });
  });
  
  describe('serializeWisselToken / deserializeWisselToken', () => {
    it('should correctly serialize and deserialize a WisselToken', () => {
      wisselToken.addToBuffer(0.42, 'tx-123');
      
      const serialized = TokenSerializer.serializeWisselToken(wisselToken);
      const deserialized = TokenSerializer.deserializeWisselToken(serialized);
      
      expect(typeof serialized).toBe('string');
      expect(deserialized.afrondingsbuffer).toBe(wisselToken.afrondingsbuffer);
      expect(deserialized.lastTransactionId).toBe(wisselToken.lastTransactionId);
      expect(deserialized.baseToken.tokenId.id).toBe(wisselToken.baseToken.tokenId.id);
    });
  });
  
  describe('serializeTelomeer / deserializeTelomeer', () => {
    it('should correctly serialize and deserialize a Telomeer', () => {
      telomeer.transferOwnership('new-owner', 'tx-123');
      
      const serialized = TokenSerializer.serializeTelomeer(telomeer);
      const deserialized = TokenSerializer.deserializeTelomeer(serialized);
      
      expect(typeof serialized).toBe('string');
      expect(deserialized.currentOwner).toBe(telomeer.currentOwner);
      expect(deserialized.hashPreviousOwner).toBe(telomeer.hashPreviousOwner);
      expect(deserialized.hashHistory).toEqual(telomeer.hashHistory);
      expect(deserialized.tokenId.id).toBe(telomeer.tokenId.id);
    });
  });
  
  describe('serializeTokenId / deserializeTokenId', () => {
    it('should correctly serialize and deserialize a TokenId', () => {
      const serialized = TokenSerializer.serializeTokenId(tokenId);
      const deserialized = TokenSerializer.deserializeTokenId(serialized);
      
      expect(typeof serialized).toBe('string');
      expect(deserialized.id).toBe(tokenId.id);
      expect(deserialized.issuanceId).toBe(tokenId.issuanceId);
      expect(deserialized.sequenceNumber).toBe(tokenId.sequenceNumber);
      expect(deserialized.creationTimeMs).toBe(tokenId.creationTimeMs);
    });
  });
  
  describe('tokenToBinary / tokenFromBinary', () => {
    it('should correctly convert a Token to and from binary', () => {
      const binary = TokenSerializer.tokenToBinary(token);
      const deserialized = TokenSerializer.tokenFromBinary(binary);
      
      expect(Buffer.isBuffer(binary)).toBe(true);
      expect(deserialized.tokenId.id).toBe(token.tokenId.id);
      expect(deserialized.denomination).toBe(token.denomination);
      expect(deserialized.issuer).toBe(token.issuer);
    });
  });
  
  describe('wisselTokenToBinary / wisselTokenFromBinary', () => {
    it('should correctly convert a WisselToken to and from binary', () => {
      wisselToken.addToBuffer(0.42, 'tx-123');
      
      const binary = TokenSerializer.wisselTokenToBinary(wisselToken);
      const deserialized = TokenSerializer.wisselTokenFromBinary(binary);
      
      expect(Buffer.isBuffer(binary)).toBe(true);
      expect(deserialized.afrondingsbuffer).toBe(wisselToken.afrondingsbuffer);
      expect(deserialized.lastTransactionId).toBe(wisselToken.lastTransactionId);
      expect(deserialized.baseToken.tokenId.id).toBe(wisselToken.baseToken.tokenId.id);
    });
  });
  
  describe('telomeerToBinary / telomeerFromBinary', () => {
    it('should correctly convert a Telomeer to and from binary', () => {
      telomeer.transferOwnership('new-owner', 'tx-123');
      
      const binary = TokenSerializer.telomeerToBinary(telomeer);
      const deserialized = TokenSerializer.telomeerFromBinary(binary);
      
      expect(Buffer.isBuffer(binary)).toBe(true);
      expect(deserialized.currentOwner).toBe(telomeer.currentOwner);
      expect(deserialized.hashPreviousOwner).toBe(telomeer.hashPreviousOwner);
      expect(deserialized.hashHistory).toEqual(telomeer.hashHistory);
    });
  });
}); 