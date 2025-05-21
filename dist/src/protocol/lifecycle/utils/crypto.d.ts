/**
 * SHA256 hash stacking utility functions
 */
export declare class HashUtil {
    /**
     * Creates a SHA256 hash of the input data
     * @param data Data to hash
     * @returns SHA256 hash as Uint8Array
     */
    static sha256(data: Buffer | Uint8Array | string): Uint8Array;
    /**
     * Creates a commitment using SHA256 hash stacking
     * @param data Array of data items to include in the commitment
     * @returns Commitment as Uint8Array
     */
    static createCommitment(...data: (string | Buffer | Uint8Array)[]): Uint8Array;
}
/**
 * Utility class for cryptographic operations used in the lifecycle layer
 */
export declare class SignatureUtil {
    /**
     * Generate a signature for data using a private key
     * @param data Data to sign
     * @param privateKey Private key to sign with
     * @returns Signature as Uint8Array
     */
    static sign(data: string, privateKey: string): Uint8Array;
    /**
     * Verify a signature for data using a public key
     * @param data Data that was signed
     * @param signature Signature to verify
     * @param publicKey Public key to verify with
     * @returns Whether the signature is valid
     */
    static verify(data: string, signature: Uint8Array, publicKey: string): boolean;
    /**
     * Generate a new key pair for signing
     * @returns Object containing public and private keys
     */
    static generateKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    /**
     * Hash data using SHA-256
     * @param data Data to hash
     * @returns Hash as Uint8Array
     */
    static hash(data: string): Uint8Array;
}
