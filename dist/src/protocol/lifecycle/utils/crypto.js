"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureUtil = exports.HashUtil = void 0;
const crypto = __importStar(require("crypto"));
/**
 * SHA256 hash stacking utility functions
 */
class HashUtil {
    /**
     * Creates a SHA256 hash of the input data
     * @param data Data to hash
     * @returns SHA256 hash as Uint8Array
     */
    static sha256(data) {
        const hash = crypto.createHash('sha256');
        if (typeof data === 'string') {
            hash.update(data);
        }
        else {
            hash.update(Buffer.from(data));
        }
        return new Uint8Array(hash.digest());
    }
    /**
     * Creates a commitment using SHA256 hash stacking
     * @param data Array of data items to include in the commitment
     * @returns Commitment as Uint8Array
     */
    static createCommitment(...data) {
        // Create a composite buffer by concatenating all data elements
        const concatenated = data.map(item => {
            if (typeof item === 'string') {
                return Buffer.from(item);
            }
            return Buffer.from(item);
        }).reduce((acc, val) => Buffer.concat([acc, val]), Buffer.alloc(0));
        // Return the SHA256 hash of the concatenated data
        return HashUtil.sha256(concatenated);
    }
}
exports.HashUtil = HashUtil;
/**
 * Utility class for cryptographic operations used in the lifecycle layer
 */
class SignatureUtil {
    /**
     * Generate a signature for data using a private key
     * @param data Data to sign
     * @param privateKey Private key to sign with
     * @returns Signature as Uint8Array
     */
    static sign(data, privateKey) {
        // In a real implementation, this would use proper asymmetric cryptography
        // For this example, we're using a simple HMAC
        const hmac = crypto.createHmac('sha256', privateKey);
        hmac.update(data);
        return new Uint8Array(hmac.digest());
    }
    /**
     * Verify a signature for data using a public key
     * @param data Data that was signed
     * @param signature Signature to verify
     * @param publicKey Public key to verify with
     * @returns Whether the signature is valid
     */
    static verify(data, signature, publicKey) {
        // In a real implementation, this would verify using asymmetric cryptography
        // For this example, we're using a simple HMAC comparison
        const hmac = crypto.createHmac('sha256', publicKey);
        hmac.update(data);
        const expectedSignature = new Uint8Array(hmac.digest());
        // Compare signatures
        if (expectedSignature.length !== signature.length) {
            return false;
        }
        // Time-constant comparison to prevent timing attacks
        let result = 0;
        for (let i = 0; i < signature.length; i++) {
            result |= expectedSignature[i] ^ signature[i];
        }
        return result === 0;
    }
    /**
     * Generate a new key pair for signing
     * @returns Object containing public and private keys
     */
    static generateKeyPair() {
        // In a real implementation, this would generate proper asymmetric key pairs
        // For this example, we're generating random strings
        const privateKey = crypto.randomBytes(32).toString('hex');
        const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
        return {
            publicKey,
            privateKey
        };
    }
    /**
     * Hash data using SHA-256
     * @param data Data to hash
     * @returns Hash as Uint8Array
     */
    static hash(data) {
        const hash = crypto.createHash('sha256').update(data).digest();
        return new Uint8Array(hash);
    }
}
exports.SignatureUtil = SignatureUtil;
//# sourceMappingURL=crypto.js.map