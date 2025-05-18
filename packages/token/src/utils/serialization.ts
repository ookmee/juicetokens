import { TokenId, TokenIdProps } from '../models/TokenId';
import { Token, TokenProps, TokenStatus, TokenDenomination } from '../models/Token';
import { WisselToken, WisselTokenProps } from '../models/WisselToken';
import { Telomeer, TelomeerProps } from '../models/Telomeer';
// Import the protobuf definition
// import * as proto from '@juicetokens/proto';

// For now, we'll use a placeholder for the token model namespace
// This should be replaced with the actual import once fixed
const tokenModel = {
  Token: {
    create: () => ({}),
    encode: () => ({ finish: () => new Uint8Array() }),
    decode: () => ({})
  },
  WisselToken: {
    create: () => ({}),
    encode: () => ({ finish: () => new Uint8Array() }),
    decode: () => ({})
  },
  Telomeer: {
    create: () => ({}),
    encode: () => ({ finish: () => new Uint8Array() }),
    decode: () => ({})
  },
  OwnershipRecord: {
    create: () => ({})
  },
  DenominationValue: {
    DENOMINATION_UNSPECIFIED: 0,
    DENOMINATION_1: 1,
    DENOMINATION_2: 2,
    DENOMINATION_5: 5,
    DENOMINATION_10: 10,
    DENOMINATION_20: 20,
    DENOMINATION_50: 50,
    DENOMINATION_100: 100,
    DENOMINATION_200: 200,
    DENOMINATION_500: 500
  },
  TokenState: {
    ACTIVE: 0,
    PENDING: 1,
    EXPIRED: 2,
    REVOKED: 3,
    MERGED: 4
  },
  TokenType: {
    REGULAR: 0
  },
  WisselTokenState: {
    WISSEL_ACTIVE: 0
  },
  ChainOfCustodyStatus: {
    VERIFIED: 1
  }
};

/**
 * Token serialization utilities for converting between objects and their string/binary representations
 */
export class TokenSerializer {
  /**
   * Serialize a Token to JSON string
   */
  static serializeToken(token: Token): string {
    return JSON.stringify(token.toJSON());
  }

  /**
   * Deserialize a Token from JSON string
   */
  static deserializeToken(json: string): Token {
    const data = JSON.parse(json) as TokenProps;
    return Token.fromJSON(data);
  }

  /**
   * Serialize a WisselToken to JSON string
   */
  static serializeWisselToken(wisselToken: WisselToken): string {
    return JSON.stringify(wisselToken.toJSON());
  }

  /**
   * Deserialize a WisselToken from JSON string
   */
  static deserializeWisselToken(json: string): WisselToken {
    const data = JSON.parse(json) as WisselTokenProps;
    return WisselToken.fromJSON(data);
  }

  /**
   * Serialize a Telomeer to JSON string
   */
  static serializeTelomeer(telomeer: Telomeer): string {
    return JSON.stringify(telomeer.toJSON());
  }

  /**
   * Deserialize a Telomeer from JSON string
   */
  static deserializeTelomeer(json: string): Telomeer {
    const data = JSON.parse(json) as TelomeerProps;
    return Telomeer.fromJSON(data);
  }

  /**
   * Serialize a TokenId to JSON string
   */
  static serializeTokenId(tokenId: TokenId): string {
    return JSON.stringify(tokenId.toJSON());
  }

  /**
   * Deserialize a TokenId from JSON string
   */
  static deserializeTokenId(json: string): TokenId {
    const data = JSON.parse(json) as TokenIdProps;
    return TokenId.fromJSON(data);
  }

  /**
   * Convert a Token to binary data using Protocol Buffers
   * 
   * This method converts our TypeScript Token model to the Protocol Buffer
   * representation defined in protos/token/model.proto
   */
  static tokenToBinary(token: Token): Buffer {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /* 
      // Create a new Protocol Buffer Token message
      const protoToken = tokenModel.Token.create({
        id: token.tokenId.id,
        denomination: this.mapDenominationToProto(token.denomination),
        value: token.denomination, // Value in smallest unit (cents)
        createdAtMs: token.creationTimeMs,
        state: this.mapTokenStatusToProto(token.status),
        metadata: {
          reference: {
            id: token.issuer,
            type: "ISSUER"
          }
        },
        version: 1,
        type: tokenModel.TokenType.REGULAR
      });

      // Add expiry time if present
      if (token.expiryTimeMs) {
        if (!protoToken.metadata) {
          protoToken.metadata = {};
        }
        if (!protoToken.metadata.attributes) {
          protoToken.metadata.attributes = {};
        }
        protoToken.metadata.attributes["expiryTimeMs"] = token.expiryTimeMs.toString();
      }

      // Encode the Protocol Buffer message to binary
      const buffer = tokenModel.Token.encode(protoToken).finish();
      return Buffer.from(buffer);
      */

      // Fallback to JSON serialization for now
      const json = this.serializeToken(token);
      return Buffer.from(json, 'utf8');
    } catch (error) {
      console.error('Error serializing token to binary:', error);
      // Fall back to JSON serialization if Protocol Buffer serialization fails
      const json = this.serializeToken(token);
      return Buffer.from(json, 'utf8');
    }
  }

  /**
   * Helper method to map our denomination to Protocol Buffer enum
   */
  private static mapDenominationToProto(denomination: TokenDenomination): number {
    switch(denomination) {
      case 1: return tokenModel.DenominationValue.DENOMINATION_1;
      case 2: return tokenModel.DenominationValue.DENOMINATION_2;
      case 5: return tokenModel.DenominationValue.DENOMINATION_5;
      case 10: return tokenModel.DenominationValue.DENOMINATION_10;
      case 20: return tokenModel.DenominationValue.DENOMINATION_20;
      case 50: return tokenModel.DenominationValue.DENOMINATION_50;
      case 100: return tokenModel.DenominationValue.DENOMINATION_100;
      case 200: return tokenModel.DenominationValue.DENOMINATION_200;
      case 500: return tokenModel.DenominationValue.DENOMINATION_500;
      default: return tokenModel.DenominationValue.DENOMINATION_UNSPECIFIED;
    }
  }

  /**
   * Helper method to map our token status to Protocol Buffer enum
   */
  private static mapTokenStatusToProto(status: TokenStatus): number {
    switch(status) {
      case TokenStatus.ACTIVE: return tokenModel.TokenState.ACTIVE;
      case TokenStatus.RESERVED: return tokenModel.TokenState.PENDING;
      case TokenStatus.EXPIRED: return tokenModel.TokenState.EXPIRED;
      case TokenStatus.REVOKED: return tokenModel.TokenState.REVOKED;
      case TokenStatus.CONSUMED: return tokenModel.TokenState.MERGED;
      default: return tokenModel.TokenState.ACTIVE;
    }
  }

  /**
   * Parse a Token from binary data using Protocol Buffers
   * 
   * This method converts the Protocol Buffer representation back to our
   * TypeScript Token model
   */
  static tokenFromBinary(buffer: Buffer): Token {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /*
      // Decode the Protocol Buffer message from binary
      const protoToken = tokenModel.Token.decode(buffer);

      // Extract the issuance ID and sequence number from the token ID
      const idParts = protoToken.id.split('-');
      const issuanceId = idParts.slice(0, -1).join('-');
      const sequenceNumber = parseInt(idParts[idParts.length - 1], 10);

      // Create a new TokenId
      const tokenId = new TokenId({
        id: protoToken.id,
        issuanceId: issuanceId,
        sequenceNumber: sequenceNumber,
        creationTimeMs: Number(protoToken.createdAtMs)
      });

      // Extract the denomination
      const denomination = this.mapDenominationFromProto(protoToken.denomination);

      // Extract the expiry time if present
      let expiryTimeMs: number | undefined;
      if (protoToken.metadata?.attributes?.["expiryTimeMs"]) {
        expiryTimeMs = parseInt(protoToken.metadata.attributes["expiryTimeMs"], 10);
      }

      // Create a new Token
      return new Token({
        tokenId: tokenId,
        denomination: denomination,
        creationTimeMs: Number(protoToken.createdAtMs),
        issuer: protoToken.metadata?.reference?.id || '',
        status: this.mapTokenStatusFromProto(protoToken.state),
        expiryTimeMs: expiryTimeMs
      });
      */

      // Fallback to JSON deserialization for now
      const json = buffer.toString('utf8');
      return this.deserializeToken(json);
    } catch (error) {
      console.error('Error deserializing token from binary:', error);
      // Fall back to JSON deserialization if Protocol Buffer deserialization fails
      const json = buffer.toString('utf8');
      return this.deserializeToken(json);
    }
  }

  /**
   * Helper method to map Protocol Buffer enum to our denomination
   */
  private static mapDenominationFromProto(denomination: number): TokenDenomination {
    switch(denomination) {
      case tokenModel.DenominationValue.DENOMINATION_1: return 1 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_2: return 2 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_5: return 5 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_10: return 10 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_20: return 20 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_50: return 50 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_100: return 100 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_200: return 200 as TokenDenomination;
      case tokenModel.DenominationValue.DENOMINATION_500: return 500 as TokenDenomination;
      default: return 1 as TokenDenomination;
    }
  }

  /**
   * Helper method to map Protocol Buffer enum to our token status
   */
  private static mapTokenStatusFromProto(status: number): TokenStatus {
    switch(status) {
      case tokenModel.TokenState.ACTIVE: return TokenStatus.ACTIVE;
      case tokenModel.TokenState.PENDING: return TokenStatus.RESERVED;
      case tokenModel.TokenState.EXPIRED: return TokenStatus.EXPIRED;
      case tokenModel.TokenState.REVOKED: return TokenStatus.REVOKED;
      case tokenModel.TokenState.MERGED: return TokenStatus.CONSUMED;
      default: return TokenStatus.ACTIVE;
    }
  }

  /**
   * Convert a WisselToken to binary data using Protocol Buffers
   */
  static wisselTokenToBinary(wisselToken: WisselToken): Buffer {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /*
      // Create a new Protocol Buffer WisselToken message
      const protoWisselToken = tokenModel.WisselToken.create({
        id: wisselToken.baseToken.tokenId.id,
        ownerPublicKey: Buffer.from(wisselToken.baseToken.issuer),
        createdAtMs: wisselToken.baseToken.creationTimeMs,
        lastUsedMs: wisselToken.lastUpdatedTimeMs,
        state: tokenModel.WisselTokenState.WISSEL_ACTIVE,
        afrondingsbuffer: wisselToken.afrondingsbuffer
      });

      // Add transaction information if available
      if (wisselToken.lastTransactionId) {
        protoWisselToken.exchangeHistory = [{
          timestampMs: wisselToken.lastUpdatedTimeMs,
          exchangeType: wisselToken.lastTransactionId
        }];
      }

      // Encode the Protocol Buffer message to binary
      const buffer = tokenModel.WisselToken.encode(protoWisselToken).finish();
      return Buffer.from(buffer);
      */

      // Fallback to JSON serialization for now
      const json = this.serializeWisselToken(wisselToken);
      return Buffer.from(json, 'utf8');
    } catch (error) {
      console.error('Error serializing wisselToken to binary:', error);
      // Fall back to JSON serialization if Protocol Buffer serialization fails
      const json = this.serializeWisselToken(wisselToken);
      return Buffer.from(json, 'utf8');
    }
  }

  /**
   * Parse a WisselToken from binary data using Protocol Buffers
   */
  static wisselTokenFromBinary(buffer: Buffer): WisselToken {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /*
      // Decode the Protocol Buffer message from binary
      const protoWisselToken = tokenModel.WisselToken.decode(buffer);

      // We need to create or fetch the base Token
      // For now, we'll create a minimal Token with the available data
      const tokenId = new TokenId({
        id: protoWisselToken.id,
        issuanceId: 'WISSEL', // Placeholder for now
        sequenceNumber: 0,     // Placeholder for now
        creationTimeMs: Number(protoWisselToken.createdAtMs)
      });

      const baseToken = new Token({
        tokenId: tokenId,
        denomination: 1 as TokenDenomination, // Default denomination
        creationTimeMs: Number(protoWisselToken.createdAtMs),
        issuer: protoWisselToken.ownerPublicKey ? protoWisselToken.ownerPublicKey.toString('utf8') : '',
        status: TokenStatus.ACTIVE
      });

      // Extract the last transaction ID if available
      let lastTransactionId: string | undefined;
      if (protoWisselToken.exchangeHistory && protoWisselToken.exchangeHistory.length > 0) {
        lastTransactionId = protoWisselToken.exchangeHistory[0].exchangeType || undefined;
      }

      // Create a new WisselToken
      return new WisselToken({
        baseToken: baseToken,
        afrondingsbuffer: protoWisselToken.afrondingsbuffer,
        lastUpdatedTimeMs: Number(protoWisselToken.lastUsedMs),
        lastTransactionId: lastTransactionId
      });
      */

      // Fallback to JSON deserialization for now
      const json = buffer.toString('utf8');
      return this.deserializeWisselToken(json);
    } catch (error) {
      console.error('Error deserializing wisselToken from binary:', error);
      // Fall back to JSON deserialization if Protocol Buffer deserialization fails
      const json = buffer.toString('utf8');
      return this.deserializeWisselToken(json);
    }
  }

  /**
   * Convert a Telomeer to binary data using Protocol Buffers
   */
  static telomeerToBinary(telomeer: Telomeer): Buffer {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /*
      // Create ownership records from hash history
      const ownershipHistory = telomeer.hashHistory.map(hash => {
        return tokenModel.OwnershipRecord.create({
          ownerPublicKey: Buffer.from(hash),
          startTimestampMs: 0, // Default values since we don't have this info
          endTimestampMs: 0,   // Default values since we don't have this info
        });
      });

      // Create a new Protocol Buffer Telomeer message
      const protoTelomeer = tokenModel.Telomeer.create({
        ownerPublicKey: Buffer.from(telomeer.currentOwner),
        previousOwnerPublicKey: Buffer.from(telomeer.hashPreviousOwner),
        ownershipHistory: ownershipHistory,
        transferCount: telomeer.hashHistory.length,
        chainOfCustodyStatus: tokenModel.ChainOfCustodyStatus.VERIFIED
      });

      // Encode the Protocol Buffer message to binary
      const buffer = tokenModel.Telomeer.encode(protoTelomeer).finish();
      return Buffer.from(buffer);
      */

      // Fallback to JSON serialization for now
      const json = this.serializeTelomeer(telomeer);
      return Buffer.from(json, 'utf8');
    } catch (error) {
      console.error('Error serializing telomeer to binary:', error);
      // Fall back to JSON serialization if Protocol Buffer serialization fails
      const json = this.serializeTelomeer(telomeer);
      return Buffer.from(json, 'utf8');
    }
  }

  /**
   * Parse a Telomeer from binary data using Protocol Buffers
   */
  static telomeerFromBinary(buffer: Buffer): Telomeer {
    try {
      // This is a placeholder for the real Protocol Buffer implementation
      // When properly integrated with protobuf, uncomment the real implementation

      /*
      // Decode the Protocol Buffer message from binary
      const protoTelomeer = tokenModel.Telomeer.decode(buffer);

      // For demonstration purposes, we'll create a placeholder TokenId
      // In a real implementation, we would need to get this from context or the token
      const tokenId = new TokenId({
        id: 'placeholder-id',
        issuanceId: 'placeholder-issuance',
        sequenceNumber: 0,
        creationTimeMs: Date.now()
      });

      // Extract the ownership history
      const hashHistory = protoTelomeer.ownershipHistory.map(record => {
        return record.ownerPublicKey ? record.ownerPublicKey.toString('utf8') : '';
      });

      // Create a new Telomeer
      return new Telomeer({
        tokenId: tokenId,
        currentOwner: protoTelomeer.ownerPublicKey ? protoTelomeer.ownerPublicKey.toString('utf8') : '',
        hashPreviousOwner: protoTelomeer.previousOwnerPublicKey ? protoTelomeer.previousOwnerPublicKey.toString('utf8') : '',
        hashHistory: hashHistory
      });
      */

      // Fallback to JSON deserialization for now
      const json = buffer.toString('utf8');
      return this.deserializeTelomeer(json);
    } catch (error) {
      console.error('Error deserializing telomeer from binary:', error);
      // Fall back to JSON deserialization if Protocol Buffer deserialization fails
      const json = buffer.toString('utf8');
      return this.deserializeTelomeer(json);
    }
  }
}