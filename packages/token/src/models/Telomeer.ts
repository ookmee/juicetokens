import crypto from 'crypto';
import { TokenId } from './TokenId';

export interface TelomeerProps {
  tokenId: TokenId;
  currentOwner: string;
  hashPreviousOwner: string;
  hashHistory: string[];
}

/**
 * Telomeer implementation - the ownership tracking mechanism with 
 * self-composting history that prevents unbounded growth
 */
export class Telomeer {
  private readonly _tokenId: TokenId;
  private _currentOwner: string;
  private _hashPreviousOwner: string;
  private _hashHistory: string[];

  constructor(props: TelomeerProps) {
    this._tokenId = props.tokenId;
    this._currentOwner = props.currentOwner;
    this._hashPreviousOwner = props.hashPreviousOwner;
    this._hashHistory = props.hashHistory || [];
  }

  static create(tokenId: TokenId, initialOwner: string): Telomeer {
    return new Telomeer({
      tokenId,
      currentOwner: initialOwner,
      hashPreviousOwner: Telomeer.hashOwner('GENESIS'),
      hashHistory: []
    });
  }

  static hashOwner(ownerPublicKey: string): string {
    return crypto.createHash('sha256')
      .update(ownerPublicKey)
      .digest('hex');
  }

  get tokenId(): TokenId {
    return this._tokenId;
  }

  get currentOwner(): string {
    return this._currentOwner;
  }

  get hashPreviousOwner(): string {
    return this._hashPreviousOwner;
  }

  get hashHistory(): string[] {
    return [...this._hashHistory];
  }

  /**
   * Transfer token ownership to a new owner
   * Updates the ownership chain and manages history pruning
   */
  transferOwnership(newOwner: string, transactionId: string): void {
    if (!newOwner || newOwner === this._currentOwner) {
      throw new Error('Invalid new owner for transfer');
    }

    // Save current owner's hash before updating
    const previousOwnerHash = Telomeer.hashOwner(this._currentOwner);
    
    // Update hashHistory with the previous owner's hash
    this._hashHistory.push(previousOwnerHash);
    
    // Prune history if it exceeds the maximum size (keep most recent 10 entries)
    const MAX_HISTORY_SIZE = 10;
    if (this._hashHistory.length > MAX_HISTORY_SIZE) {
      // When pruning, we create a composite hash of the oldest entries
      const oldestEntries = this._hashHistory.splice(0, this._hashHistory.length - MAX_HISTORY_SIZE + 1);
      const compositeHash = this.createCompositeHash(oldestEntries);
      this._hashHistory.unshift(compositeHash);
    }
    
    // Update previous owner hash and current owner
    this._hashPreviousOwner = previousOwnerHash;
    this._currentOwner = newOwner;
  }

  /**
   * Creates a composite hash from multiple history entries
   * This enables pruning while maintaining cryptographic verification capability
   */
  private createCompositeHash(hashes: string[]): string {
    const concatenated = hashes.join('');
    return crypto.createHash('sha256')
      .update(concatenated)
      .digest('hex');
  }

  /**
   * Verifies if the provided owner was previously in the ownership chain
   */
  verifyPreviousOwnership(ownerPublicKey: string): boolean {
    const ownerHash = Telomeer.hashOwner(ownerPublicKey);
    
    // Check if it matches the previous owner
    if (ownerHash === this._hashPreviousOwner) {
      return true;
    }
    
    // Check if it's in the history
    return this._hashHistory.includes(ownerHash);
  }

  /**
   * Generate an ownership proof for the current owner
   */
  generateOwnershipProof(): { tokenId: TokenId, timestamp: number, ownershipChain: string[] } {
    return {
      tokenId: this._tokenId,
      timestamp: Date.now(),
      ownershipChain: [this._currentOwner, this._hashPreviousOwner, ...this._hashHistory]
    };
  }

  validate(): boolean {
    if (!this._tokenId.validate()) {
      return false;
    }

    if (!this._currentOwner || typeof this._currentOwner !== 'string') {
      return false;
    }

    if (!this._hashPreviousOwner || typeof this._hashPreviousOwner !== 'string') {
      return false;
    }

    if (!Array.isArray(this._hashHistory)) {
      return false;
    }

    return true;
  }

  toJSON(): TelomeerProps {
    return {
      tokenId: this._tokenId,
      currentOwner: this._currentOwner,
      hashPreviousOwner: this._hashPreviousOwner,
      hashHistory: [...this._hashHistory]
    };
  }

  static fromJSON(json: TelomeerProps): Telomeer {
    return new Telomeer(json);
  }
}