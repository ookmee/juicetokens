import { TokenId } from '../models/TokenId';
import { Token } from '../models/Token';
import { WisselToken } from '../models/WisselToken';
import { Telomeer } from '../models/Telomeer';
/**
 * Token serialization utilities for converting between objects and their string/binary representations
 */
export declare class TokenSerializer {
    /**
     * Serialize a Token to JSON string
     */
    static serializeToken(token: Token): string;
    /**
     * Deserialize a Token from JSON string
     */
    static deserializeToken(json: string): Token;
    /**
     * Serialize a WisselToken to JSON string
     */
    static serializeWisselToken(wisselToken: WisselToken): string;
    /**
     * Deserialize a WisselToken from JSON string
     */
    static deserializeWisselToken(json: string): WisselToken;
    /**
     * Serialize a Telomeer to JSON string
     */
    static serializeTelomeer(telomeer: Telomeer): string;
    /**
     * Deserialize a Telomeer from JSON string
     */
    static deserializeTelomeer(json: string): Telomeer;
    /**
     * Serialize a TokenId to JSON string
     */
    static serializeTokenId(tokenId: TokenId): string;
    /**
     * Deserialize a TokenId from JSON string
     */
    static deserializeTokenId(json: string): TokenId;
    /**
     * Convert a Token to binary data using Protocol Buffers
     *
     * This method converts our TypeScript Token model to the Protocol Buffer
     * representation defined in protos/token/model.proto
     */
    static tokenToBinary(token: Token): Buffer;
    /**
     * Helper method to map our denomination to Protocol Buffer enum
     */
    private static mapDenominationToProto;
    /**
     * Helper method to map our token status to Protocol Buffer enum
     */
    private static mapTokenStatusToProto;
    /**
     * Parse a Token from binary data using Protocol Buffers
     *
     * This method converts the Protocol Buffer representation back to our
     * TypeScript Token model
     */
    static tokenFromBinary(buffer: Buffer): Token;
    /**
     * Helper method to map Protocol Buffer enum to our denomination
     */
    private static mapDenominationFromProto;
    /**
     * Helper method to map Protocol Buffer enum to our token status
     */
    private static mapTokenStatusFromProto;
    /**
     * Convert a WisselToken to binary data using Protocol Buffers
     */
    static wisselTokenToBinary(wisselToken: WisselToken): Buffer;
    /**
     * Parse a WisselToken from binary data using Protocol Buffers
     */
    static wisselTokenFromBinary(buffer: Buffer): WisselToken;
    /**
     * Convert a Telomeer to binary data using Protocol Buffers
     */
    static telomeerToBinary(telomeer: Telomeer): Buffer;
    /**
     * Parse a Telomeer from binary data using Protocol Buffers
     */
    static telomeerFromBinary(buffer: Buffer): Telomeer;
}
