/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const juicetokens = $root.juicetokens = (() => {

    /**
     * Namespace juicetokens.
     * @exports juicetokens
     * @namespace
     */
    const juicetokens = {};

    juicetokens.Token = (function() {

        /**
         * Properties of a Token.
         * @memberof juicetokens
         * @interface IToken
         * @property {string|null} [id] Token id
         * @property {string|null} [name] Token name
         * @property {string|null} [symbol] Token symbol
         * @property {number|Long|null} [totalSupply] Token totalSupply
         * @property {string|null} [owner] Token owner
         * @property {Array.<string>|null} [holders] Token holders
         */

        /**
         * Constructs a new Token.
         * @memberof juicetokens
         * @classdesc Represents a Token.
         * @implements IToken
         * @constructor
         * @param {juicetokens.IToken=} [properties] Properties to set
         */
        function Token(properties) {
            this.holders = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Token id.
         * @member {string} id
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.id = "";

        /**
         * Token name.
         * @member {string} name
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.name = "";

        /**
         * Token symbol.
         * @member {string} symbol
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.symbol = "";

        /**
         * Token totalSupply.
         * @member {number|Long} totalSupply
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.totalSupply = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Token owner.
         * @member {string} owner
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.owner = "";

        /**
         * Token holders.
         * @member {Array.<string>} holders
         * @memberof juicetokens.Token
         * @instance
         */
        Token.prototype.holders = $util.emptyArray;

        /**
         * Creates a new Token instance using the specified properties.
         * @function create
         * @memberof juicetokens.Token
         * @static
         * @param {juicetokens.IToken=} [properties] Properties to set
         * @returns {juicetokens.Token} Token instance
         */
        Token.create = function create(properties) {
            return new Token(properties);
        };

        /**
         * Encodes the specified Token message. Does not implicitly {@link juicetokens.Token.verify|verify} messages.
         * @function encode
         * @memberof juicetokens.Token
         * @static
         * @param {juicetokens.IToken} message Token message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Token.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.symbol);
            if (message.totalSupply != null && Object.hasOwnProperty.call(message, "totalSupply"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.totalSupply);
            if (message.owner != null && Object.hasOwnProperty.call(message, "owner"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.owner);
            if (message.holders != null && message.holders.length)
                for (let i = 0; i < message.holders.length; ++i)
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.holders[i]);
            return writer;
        };

        /**
         * Encodes the specified Token message, length delimited. Does not implicitly {@link juicetokens.Token.verify|verify} messages.
         * @function encodeDelimited
         * @memberof juicetokens.Token
         * @static
         * @param {juicetokens.IToken} message Token message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Token.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Token message from the specified reader or buffer.
         * @function decode
         * @memberof juicetokens.Token
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {juicetokens.Token} Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Token.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.juicetokens.Token();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.symbol = reader.string();
                        break;
                    }
                case 4: {
                        message.totalSupply = reader.uint64();
                        break;
                    }
                case 5: {
                        message.owner = reader.string();
                        break;
                    }
                case 6: {
                        if (!(message.holders && message.holders.length))
                            message.holders = [];
                        message.holders.push(reader.string());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Token message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof juicetokens.Token
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {juicetokens.Token} Token
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Token.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Token message.
         * @function verify
         * @memberof juicetokens.Token
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Token.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.symbol != null && message.hasOwnProperty("symbol"))
                if (!$util.isString(message.symbol))
                    return "symbol: string expected";
            if (message.totalSupply != null && message.hasOwnProperty("totalSupply"))
                if (!$util.isInteger(message.totalSupply) && !(message.totalSupply && $util.isInteger(message.totalSupply.low) && $util.isInteger(message.totalSupply.high)))
                    return "totalSupply: integer|Long expected";
            if (message.owner != null && message.hasOwnProperty("owner"))
                if (!$util.isString(message.owner))
                    return "owner: string expected";
            if (message.holders != null && message.hasOwnProperty("holders")) {
                if (!Array.isArray(message.holders))
                    return "holders: array expected";
                for (let i = 0; i < message.holders.length; ++i)
                    if (!$util.isString(message.holders[i]))
                        return "holders: string[] expected";
            }
            return null;
        };

        /**
         * Creates a Token message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof juicetokens.Token
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {juicetokens.Token} Token
         */
        Token.fromObject = function fromObject(object) {
            if (object instanceof $root.juicetokens.Token)
                return object;
            let message = new $root.juicetokens.Token();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.symbol != null)
                message.symbol = String(object.symbol);
            if (object.totalSupply != null)
                if ($util.Long)
                    (message.totalSupply = $util.Long.fromValue(object.totalSupply)).unsigned = true;
                else if (typeof object.totalSupply === "string")
                    message.totalSupply = parseInt(object.totalSupply, 10);
                else if (typeof object.totalSupply === "number")
                    message.totalSupply = object.totalSupply;
                else if (typeof object.totalSupply === "object")
                    message.totalSupply = new $util.LongBits(object.totalSupply.low >>> 0, object.totalSupply.high >>> 0).toNumber(true);
            if (object.owner != null)
                message.owner = String(object.owner);
            if (object.holders) {
                if (!Array.isArray(object.holders))
                    throw TypeError(".juicetokens.Token.holders: array expected");
                message.holders = [];
                for (let i = 0; i < object.holders.length; ++i)
                    message.holders[i] = String(object.holders[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Token message. Also converts values to other types if specified.
         * @function toObject
         * @memberof juicetokens.Token
         * @static
         * @param {juicetokens.Token} message Token
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Token.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.holders = [];
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.symbol = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.totalSupply = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.totalSupply = options.longs === String ? "0" : 0;
                object.owner = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.symbol != null && message.hasOwnProperty("symbol"))
                object.symbol = message.symbol;
            if (message.totalSupply != null && message.hasOwnProperty("totalSupply"))
                if (typeof message.totalSupply === "number")
                    object.totalSupply = options.longs === String ? String(message.totalSupply) : message.totalSupply;
                else
                    object.totalSupply = options.longs === String ? $util.Long.prototype.toString.call(message.totalSupply) : options.longs === Number ? new $util.LongBits(message.totalSupply.low >>> 0, message.totalSupply.high >>> 0).toNumber(true) : message.totalSupply;
            if (message.owner != null && message.hasOwnProperty("owner"))
                object.owner = message.owner;
            if (message.holders && message.holders.length) {
                object.holders = [];
                for (let j = 0; j < message.holders.length; ++j)
                    object.holders[j] = message.holders[j];
            }
            return object;
        };

        /**
         * Converts this Token to JSON.
         * @function toJSON
         * @memberof juicetokens.Token
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Token.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Token
         * @function getTypeUrl
         * @memberof juicetokens.Token
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Token.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/juicetokens.Token";
        };

        return Token;
    })();

    juicetokens.TokenTransfer = (function() {

        /**
         * Properties of a TokenTransfer.
         * @memberof juicetokens
         * @interface ITokenTransfer
         * @property {string|null} [tokenId] TokenTransfer tokenId
         * @property {string|null} [from] TokenTransfer from
         * @property {string|null} [to] TokenTransfer to
         * @property {number|Long|null} [amount] TokenTransfer amount
         * @property {number|Long|null} [timestamp] TokenTransfer timestamp
         */

        /**
         * Constructs a new TokenTransfer.
         * @memberof juicetokens
         * @classdesc Represents a TokenTransfer.
         * @implements ITokenTransfer
         * @constructor
         * @param {juicetokens.ITokenTransfer=} [properties] Properties to set
         */
        function TokenTransfer(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TokenTransfer tokenId.
         * @member {string} tokenId
         * @memberof juicetokens.TokenTransfer
         * @instance
         */
        TokenTransfer.prototype.tokenId = "";

        /**
         * TokenTransfer from.
         * @member {string} from
         * @memberof juicetokens.TokenTransfer
         * @instance
         */
        TokenTransfer.prototype.from = "";

        /**
         * TokenTransfer to.
         * @member {string} to
         * @memberof juicetokens.TokenTransfer
         * @instance
         */
        TokenTransfer.prototype.to = "";

        /**
         * TokenTransfer amount.
         * @member {number|Long} amount
         * @memberof juicetokens.TokenTransfer
         * @instance
         */
        TokenTransfer.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TokenTransfer timestamp.
         * @member {number|Long} timestamp
         * @memberof juicetokens.TokenTransfer
         * @instance
         */
        TokenTransfer.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new TokenTransfer instance using the specified properties.
         * @function create
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {juicetokens.ITokenTransfer=} [properties] Properties to set
         * @returns {juicetokens.TokenTransfer} TokenTransfer instance
         */
        TokenTransfer.create = function create(properties) {
            return new TokenTransfer(properties);
        };

        /**
         * Encodes the specified TokenTransfer message. Does not implicitly {@link juicetokens.TokenTransfer.verify|verify} messages.
         * @function encode
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {juicetokens.ITokenTransfer} message TokenTransfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenTransfer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tokenId != null && Object.hasOwnProperty.call(message, "tokenId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.tokenId);
            if (message.from != null && Object.hasOwnProperty.call(message, "from"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.from);
            if (message.to != null && Object.hasOwnProperty.call(message, "to"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.to);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.amount);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.timestamp);
            return writer;
        };

        /**
         * Encodes the specified TokenTransfer message, length delimited. Does not implicitly {@link juicetokens.TokenTransfer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {juicetokens.ITokenTransfer} message TokenTransfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TokenTransfer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TokenTransfer message from the specified reader or buffer.
         * @function decode
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {juicetokens.TokenTransfer} TokenTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenTransfer.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.juicetokens.TokenTransfer();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tokenId = reader.string();
                        break;
                    }
                case 2: {
                        message.from = reader.string();
                        break;
                    }
                case 3: {
                        message.to = reader.string();
                        break;
                    }
                case 4: {
                        message.amount = reader.uint64();
                        break;
                    }
                case 5: {
                        message.timestamp = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TokenTransfer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {juicetokens.TokenTransfer} TokenTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TokenTransfer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TokenTransfer message.
         * @function verify
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TokenTransfer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                if (!$util.isString(message.tokenId))
                    return "tokenId: string expected";
            if (message.from != null && message.hasOwnProperty("from"))
                if (!$util.isString(message.from))
                    return "from: string expected";
            if (message.to != null && message.hasOwnProperty("to"))
                if (!$util.isString(message.to))
                    return "to: string expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            return null;
        };

        /**
         * Creates a TokenTransfer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {juicetokens.TokenTransfer} TokenTransfer
         */
        TokenTransfer.fromObject = function fromObject(object) {
            if (object instanceof $root.juicetokens.TokenTransfer)
                return object;
            let message = new $root.juicetokens.TokenTransfer();
            if (object.tokenId != null)
                message.tokenId = String(object.tokenId);
            if (object.from != null)
                message.from = String(object.from);
            if (object.to != null)
                message.to = String(object.to);
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            if (object.timestamp != null)
                if ($util.Long)
                    (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                else if (typeof object.timestamp === "string")
                    message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a TokenTransfer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {juicetokens.TokenTransfer} message TokenTransfer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TokenTransfer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.tokenId = "";
                object.from = "";
                object.to = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestamp = options.longs === String ? "0" : 0;
            }
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                object.tokenId = message.tokenId;
            if (message.from != null && message.hasOwnProperty("from"))
                object.from = message.from;
            if (message.to != null && message.hasOwnProperty("to"))
                object.to = message.to;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            return object;
        };

        /**
         * Converts this TokenTransfer to JSON.
         * @function toJSON
         * @memberof juicetokens.TokenTransfer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TokenTransfer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TokenTransfer
         * @function getTypeUrl
         * @memberof juicetokens.TokenTransfer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TokenTransfer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/juicetokens.TokenTransfer";
        };

        return TokenTransfer;
    })();

    juicetokens.TokenService = (function() {

        /**
         * Constructs a new TokenService service.
         * @memberof juicetokens
         * @classdesc Represents a TokenService
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function TokenService(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (TokenService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = TokenService;

        /**
         * Creates new TokenService service using the specified rpc implementation.
         * @function create
         * @memberof juicetokens.TokenService
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {TokenService} RPC service. Useful where requests and/or responses are streamed.
         */
        TokenService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link juicetokens.TokenService#getToken}.
         * @memberof juicetokens.TokenService
         * @typedef GetTokenCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {juicetokens.Token} [response] Token
         */

        /**
         * Calls GetToken.
         * @function getToken
         * @memberof juicetokens.TokenService
         * @instance
         * @param {juicetokens.IGetTokenRequest} request GetTokenRequest message or plain object
         * @param {juicetokens.TokenService.GetTokenCallback} callback Node-style callback called with the error, if any, and Token
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(TokenService.prototype.getToken = function getToken(request, callback) {
            return this.rpcCall(getToken, $root.juicetokens.GetTokenRequest, $root.juicetokens.Token, request, callback);
        }, "name", { value: "GetToken" });

        /**
         * Calls GetToken.
         * @function getToken
         * @memberof juicetokens.TokenService
         * @instance
         * @param {juicetokens.IGetTokenRequest} request GetTokenRequest message or plain object
         * @returns {Promise<juicetokens.Token>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link juicetokens.TokenService#transferToken}.
         * @memberof juicetokens.TokenService
         * @typedef TransferTokenCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {juicetokens.TokenTransfer} [response] TokenTransfer
         */

        /**
         * Calls TransferToken.
         * @function transferToken
         * @memberof juicetokens.TokenService
         * @instance
         * @param {juicetokens.ITransferTokenRequest} request TransferTokenRequest message or plain object
         * @param {juicetokens.TokenService.TransferTokenCallback} callback Node-style callback called with the error, if any, and TokenTransfer
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(TokenService.prototype.transferToken = function transferToken(request, callback) {
            return this.rpcCall(transferToken, $root.juicetokens.TransferTokenRequest, $root.juicetokens.TokenTransfer, request, callback);
        }, "name", { value: "TransferToken" });

        /**
         * Calls TransferToken.
         * @function transferToken
         * @memberof juicetokens.TokenService
         * @instance
         * @param {juicetokens.ITransferTokenRequest} request TransferTokenRequest message or plain object
         * @returns {Promise<juicetokens.TokenTransfer>} Promise
         * @variation 2
         */

        return TokenService;
    })();

    juicetokens.GetTokenRequest = (function() {

        /**
         * Properties of a GetTokenRequest.
         * @memberof juicetokens
         * @interface IGetTokenRequest
         * @property {string|null} [tokenId] GetTokenRequest tokenId
         */

        /**
         * Constructs a new GetTokenRequest.
         * @memberof juicetokens
         * @classdesc Represents a GetTokenRequest.
         * @implements IGetTokenRequest
         * @constructor
         * @param {juicetokens.IGetTokenRequest=} [properties] Properties to set
         */
        function GetTokenRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetTokenRequest tokenId.
         * @member {string} tokenId
         * @memberof juicetokens.GetTokenRequest
         * @instance
         */
        GetTokenRequest.prototype.tokenId = "";

        /**
         * Creates a new GetTokenRequest instance using the specified properties.
         * @function create
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {juicetokens.IGetTokenRequest=} [properties] Properties to set
         * @returns {juicetokens.GetTokenRequest} GetTokenRequest instance
         */
        GetTokenRequest.create = function create(properties) {
            return new GetTokenRequest(properties);
        };

        /**
         * Encodes the specified GetTokenRequest message. Does not implicitly {@link juicetokens.GetTokenRequest.verify|verify} messages.
         * @function encode
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {juicetokens.IGetTokenRequest} message GetTokenRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetTokenRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tokenId != null && Object.hasOwnProperty.call(message, "tokenId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.tokenId);
            return writer;
        };

        /**
         * Encodes the specified GetTokenRequest message, length delimited. Does not implicitly {@link juicetokens.GetTokenRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {juicetokens.IGetTokenRequest} message GetTokenRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetTokenRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetTokenRequest message from the specified reader or buffer.
         * @function decode
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {juicetokens.GetTokenRequest} GetTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetTokenRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.juicetokens.GetTokenRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tokenId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetTokenRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {juicetokens.GetTokenRequest} GetTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetTokenRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetTokenRequest message.
         * @function verify
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetTokenRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                if (!$util.isString(message.tokenId))
                    return "tokenId: string expected";
            return null;
        };

        /**
         * Creates a GetTokenRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {juicetokens.GetTokenRequest} GetTokenRequest
         */
        GetTokenRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.juicetokens.GetTokenRequest)
                return object;
            let message = new $root.juicetokens.GetTokenRequest();
            if (object.tokenId != null)
                message.tokenId = String(object.tokenId);
            return message;
        };

        /**
         * Creates a plain object from a GetTokenRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {juicetokens.GetTokenRequest} message GetTokenRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetTokenRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.tokenId = "";
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                object.tokenId = message.tokenId;
            return object;
        };

        /**
         * Converts this GetTokenRequest to JSON.
         * @function toJSON
         * @memberof juicetokens.GetTokenRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetTokenRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetTokenRequest
         * @function getTypeUrl
         * @memberof juicetokens.GetTokenRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetTokenRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/juicetokens.GetTokenRequest";
        };

        return GetTokenRequest;
    })();

    juicetokens.TransferTokenRequest = (function() {

        /**
         * Properties of a TransferTokenRequest.
         * @memberof juicetokens
         * @interface ITransferTokenRequest
         * @property {string|null} [tokenId] TransferTokenRequest tokenId
         * @property {string|null} [to] TransferTokenRequest to
         * @property {number|Long|null} [amount] TransferTokenRequest amount
         */

        /**
         * Constructs a new TransferTokenRequest.
         * @memberof juicetokens
         * @classdesc Represents a TransferTokenRequest.
         * @implements ITransferTokenRequest
         * @constructor
         * @param {juicetokens.ITransferTokenRequest=} [properties] Properties to set
         */
        function TransferTokenRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransferTokenRequest tokenId.
         * @member {string} tokenId
         * @memberof juicetokens.TransferTokenRequest
         * @instance
         */
        TransferTokenRequest.prototype.tokenId = "";

        /**
         * TransferTokenRequest to.
         * @member {string} to
         * @memberof juicetokens.TransferTokenRequest
         * @instance
         */
        TransferTokenRequest.prototype.to = "";

        /**
         * TransferTokenRequest amount.
         * @member {number|Long} amount
         * @memberof juicetokens.TransferTokenRequest
         * @instance
         */
        TransferTokenRequest.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new TransferTokenRequest instance using the specified properties.
         * @function create
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {juicetokens.ITransferTokenRequest=} [properties] Properties to set
         * @returns {juicetokens.TransferTokenRequest} TransferTokenRequest instance
         */
        TransferTokenRequest.create = function create(properties) {
            return new TransferTokenRequest(properties);
        };

        /**
         * Encodes the specified TransferTokenRequest message. Does not implicitly {@link juicetokens.TransferTokenRequest.verify|verify} messages.
         * @function encode
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {juicetokens.ITransferTokenRequest} message TransferTokenRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransferTokenRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tokenId != null && Object.hasOwnProperty.call(message, "tokenId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.tokenId);
            if (message.to != null && Object.hasOwnProperty.call(message, "to"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.to);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.amount);
            return writer;
        };

        /**
         * Encodes the specified TransferTokenRequest message, length delimited. Does not implicitly {@link juicetokens.TransferTokenRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {juicetokens.ITransferTokenRequest} message TransferTokenRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransferTokenRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TransferTokenRequest message from the specified reader or buffer.
         * @function decode
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {juicetokens.TransferTokenRequest} TransferTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransferTokenRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.juicetokens.TransferTokenRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tokenId = reader.string();
                        break;
                    }
                case 2: {
                        message.to = reader.string();
                        break;
                    }
                case 3: {
                        message.amount = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TransferTokenRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {juicetokens.TransferTokenRequest} TransferTokenRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransferTokenRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TransferTokenRequest message.
         * @function verify
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TransferTokenRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                if (!$util.isString(message.tokenId))
                    return "tokenId: string expected";
            if (message.to != null && message.hasOwnProperty("to"))
                if (!$util.isString(message.to))
                    return "to: string expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            return null;
        };

        /**
         * Creates a TransferTokenRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {juicetokens.TransferTokenRequest} TransferTokenRequest
         */
        TransferTokenRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.juicetokens.TransferTokenRequest)
                return object;
            let message = new $root.juicetokens.TransferTokenRequest();
            if (object.tokenId != null)
                message.tokenId = String(object.tokenId);
            if (object.to != null)
                message.to = String(object.to);
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a TransferTokenRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {juicetokens.TransferTokenRequest} message TransferTokenRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TransferTokenRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.tokenId = "";
                object.to = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
            }
            if (message.tokenId != null && message.hasOwnProperty("tokenId"))
                object.tokenId = message.tokenId;
            if (message.to != null && message.hasOwnProperty("to"))
                object.to = message.to;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            return object;
        };

        /**
         * Converts this TransferTokenRequest to JSON.
         * @function toJSON
         * @memberof juicetokens.TransferTokenRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TransferTokenRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TransferTokenRequest
         * @function getTypeUrl
         * @memberof juicetokens.TransferTokenRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TransferTokenRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/juicetokens.TransferTokenRequest";
        };

        return TransferTokenRequest;
    })();

    return juicetokens;
})();

export { $root as default };
