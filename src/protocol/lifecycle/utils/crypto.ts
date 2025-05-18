import * as crypto from 'crypto';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

/**
 * SHA256 hash stacking utility functions
 */
export class HashUtil {
  /**
   * Creates a SHA256 hash of the input data
   * @param data Data to hash
   * @returns SHA256 hash as Uint8Array
   */
  static sha256(data: Buffer | Uint8Array | string): Uint8Array {
    const hash = crypto.createHash('sha256');
    
    if (typeof data === 'string') {
      hash.update(data);
    } else {
      hash.update(Buffer.from(data));
    }
    
    return new Uint8Array(hash.digest());
  }
  
  /**
   * Creates a commitment using SHA256 hash stacking
   * @param data Array of data items to include in the commitment
   * @returns Commitment as Uint8Array
   */
  static createCommitment(...data: (string | Buffer | Uint8Array)[]): Uint8Array {
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

/**
 * Utility class for cryptographic operations used in the lifecycle layer
 */
export class SignatureUtil {
  /**
   * Generate a signature for data using a private key
   * @param data Data to sign
   * @param privateKey Private key to sign with
   * @returns Signature as Uint8Array
   */
  public static sign(data: string, privateKey: string): Uint8Array {
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
  public static verify(data: string, signature: Uint8Array, publicKey: string): boolean {
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
  public static generateKeyPair(): { publicKey: string, privateKey: string } {
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
  public static hash(data: string): Uint8Array {
    const hash = crypto.createHash('sha256').update(data).digest();
    return new Uint8Array(hash);
  }
} 