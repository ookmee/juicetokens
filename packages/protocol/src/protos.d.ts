import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace juicetokens. */
export namespace juicetokens {

    /** Properties of a Token. */
    interface IToken {

        /** Token id */
        id?: (string|null);

        /** Token name */
        name?: (string|null);

        /** Token symbol */
        symbol?: (string|null);

        /** Token totalSupply */
        totalSupply?: (number|Long|null);

        /** Token owner */
        owner?: (string|null);

        /** Token holders */
        holders?: (string[]|null);
    }

    /** Represents a Token. */
    class Token implements IToken {

        /**
         * Constructs a new Token.
         * @param [properties] Properties to set
         */
        constructor(properties?: juicetokens.IToken);

        /** Token id. */
        public id: string;

        /** Token name. */
        public name: string;

        /** Token symbol. */
        public symbol: string;

        /** Token totalSupply. */
        public totalSupply: (number|Long);

        /** Token owner. */
        public owner: string;

        /** Token holders. */
        public holders: string[];

        /**
         * Creates a new Token instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Token instance
         */
        public static create(properties?: juicetokens.IToken): juicetokens.Token;

        /**
         * Encodes the specified Token message. Does not implicitly {@link juicetokens.Token.verify|verify} messages.
         * @param message Token message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: juicetokens.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Token message, length delimited. Does not implicitly {@link juicetokens.Token.verify|verify} messages.
         * @param message Token message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: juicetokens.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Token message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): juicetokens.Token;

        /**
         * Decodes a Token message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): juicetokens.Token;

        /**
         * Verifies a Token message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Token message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Token
         */
        public static fromObject(object: { [k: string]: any }): juicetokens.Token;

        /**
         * Creates a plain object from a Token message. Also converts values to other types if specified.
         * @param message Token
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: juicetokens.Token, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Token to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Token
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TokenTransfer. */
    interface ITokenTransfer {

        /** TokenTransfer tokenId */
        tokenId?: (string|null);

        /** TokenTransfer from */
        from?: (string|null);

        /** TokenTransfer to */
        to?: (string|null);

        /** TokenTransfer amount */
        amount?: (number|Long|null);

        /** TokenTransfer timestamp */
        timestamp?: (number|Long|null);
    }

    /** Represents a TokenTransfer. */
    class TokenTransfer implements ITokenTransfer {

        /**
         * Constructs a new TokenTransfer.
         * @param [properties] Properties to set
         */
        constructor(properties?: juicetokens.ITokenTransfer);

        /** TokenTransfer tokenId. */
        public tokenId: string;

        /** TokenTransfer from. */
        public from: string;

        /** TokenTransfer to. */
        public to: string;

        /** TokenTransfer amount. */
        public amount: (number|Long);

        /** TokenTransfer timestamp. */
        public timestamp: (number|Long);

        /**
         * Creates a new TokenTransfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenTransfer instance
         */
        public static create(properties?: juicetokens.ITokenTransfer): juicetokens.TokenTransfer;

        /**
         * Encodes the specified TokenTransfer message. Does not implicitly {@link juicetokens.TokenTransfer.verify|verify} messages.
         * @param message TokenTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: juicetokens.ITokenTransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TokenTransfer message, length delimited. Does not implicitly {@link juicetokens.TokenTransfer.verify|verify} messages.
         * @param message TokenTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: juicetokens.ITokenTransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenTransfer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TokenTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): juicetokens.TokenTransfer;

        /**
         * Decodes a TokenTransfer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TokenTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): juicetokens.TokenTransfer;

        /**
         * Verifies a TokenTransfer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TokenTransfer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TokenTransfer
         */
        public static fromObject(object: { [k: string]: any }): juicetokens.TokenTransfer;

        /**
         * Creates a plain object from a TokenTransfer message. Also converts values to other types if specified.
         * @param message TokenTransfer
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: juicetokens.TokenTransfer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TokenTransfer to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TokenTransfer
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Represents a TokenService */
    class TokenService extends $protobuf.rpc.Service {

        /**
         * Constructs a new TokenService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new TokenService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): TokenService;

        /**
         * Calls GetToken.
         * @param request GetTokenRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and Token
         */
        public getToken(request: juicetokens.IGetTokenRequest, callback: juicetokens.TokenService.GetTokenCallback): void;

        /**
         * Calls GetToken.
         * @param request GetTokenRequest message or plain object
         * @returns Promise
         */
        public getToken(request: juicetokens.IGetTokenRequest): Promise<juicetokens.Token>;

        /**
         * Calls TransferToken.
         * @param request TransferTokenRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and TokenTransfer
         */
        public transferToken(request: juicetokens.ITransferTokenRequest, callback: juicetokens.TokenService.TransferTokenCallback): void;

        /**
         * Calls TransferToken.
         * @param request TransferTokenRequest message or plain object
         * @returns Promise
         */
        public transferToken(request: juicetokens.ITransferTokenRequest): Promise<juicetokens.TokenTransfer>;
    }

    namespace TokenService {

        /**
         * Callback as used by {@link juicetokens.TokenService#getToken}.
         * @param error Error, if any
         * @param [response] Token
         */
        type GetTokenCallback = (error: (Error|null), response?: juicetokens.Token) => void;

        /**
         * Callback as used by {@link juicetokens.TokenService#transferToken}.
         * @param error Error, if any
         * @param [response] TokenTransfer
         */
        type TransferTokenCallback = (error: (Error|null), response?: juicetokens.TokenTransfer) => void;
    }

    /** Properties of a GetTokenRequest. */
    interface IGetTokenRequest {

        /** GetTokenRequest tokenId */
        tokenId?: (string|null);
    }

    /** Represents a GetTokenRequest. */
    class GetTokenRequest implements IGetTokenRequest {

        /**
         * Constructs a new GetTokenRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: juicetokens.IGetTokenRequest);

        /** GetTokenRequest tokenId. */
        public tokenId: string;

        /**
         * Creates a new GetTokenRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetTokenRequest instance
         */
        public static create(properties?: juicetokens.IGetTokenRequest): juicetokens.GetTokenRequest;

        /**
         * Encodes the specified GetTokenRequest message. Does not implicitly {@link juicetokens.GetTokenRequest.verify|verify} messages.
         * @param message GetTokenRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: juicetokens.IGetTokenRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetTokenRequest message, length delimited. Does not implicitly {@link juicetokens.GetTokenRequest.verify|verify} messages.
         * @param message GetTokenRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: juicetokens.IGetTokenRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetTokenRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): juicetokens.GetTokenRequest;

        /**
         * Decodes a GetTokenRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): juicetokens.GetTokenRequest;

        /**
         * Verifies a GetTokenRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetTokenRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetTokenRequest
         */
        public static fromObject(object: { [k: string]: any }): juicetokens.GetTokenRequest;

        /**
         * Creates a plain object from a GetTokenRequest message. Also converts values to other types if specified.
         * @param message GetTokenRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: juicetokens.GetTokenRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetTokenRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetTokenRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TransferTokenRequest. */
    interface ITransferTokenRequest {

        /** TransferTokenRequest tokenId */
        tokenId?: (string|null);

        /** TransferTokenRequest to */
        to?: (string|null);

        /** TransferTokenRequest amount */
        amount?: (number|Long|null);
    }

    /** Represents a TransferTokenRequest. */
    class TransferTokenRequest implements ITransferTokenRequest {

        /**
         * Constructs a new TransferTokenRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: juicetokens.ITransferTokenRequest);

        /** TransferTokenRequest tokenId. */
        public tokenId: string;

        /** TransferTokenRequest to. */
        public to: string;

        /** TransferTokenRequest amount. */
        public amount: (number|Long);

        /**
         * Creates a new TransferTokenRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransferTokenRequest instance
         */
        public static create(properties?: juicetokens.ITransferTokenRequest): juicetokens.TransferTokenRequest;

        /**
         * Encodes the specified TransferTokenRequest message. Does not implicitly {@link juicetokens.TransferTokenRequest.verify|verify} messages.
         * @param message TransferTokenRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: juicetokens.ITransferTokenRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransferTokenRequest message, length delimited. Does not implicitly {@link juicetokens.TransferTokenRequest.verify|verify} messages.
         * @param message TransferTokenRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: juicetokens.ITransferTokenRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransferTokenRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TransferTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): juicetokens.TransferTokenRequest;

        /**
         * Decodes a TransferTokenRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TransferTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): juicetokens.TransferTokenRequest;

        /**
         * Verifies a TransferTokenRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransferTokenRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransferTokenRequest
         */
        public static fromObject(object: { [k: string]: any }): juicetokens.TransferTokenRequest;

        /**
         * Creates a plain object from a TransferTokenRequest message. Also converts values to other types if specified.
         * @param message TransferTokenRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: juicetokens.TransferTokenRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransferTokenRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TransferTokenRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
