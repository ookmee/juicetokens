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
export declare class Telomeer {
    private readonly _tokenId;
    private _currentOwner;
    private _hashPreviousOwner;
    private _hashHistory;
    constructor(props: TelomeerProps);
    static create(tokenId: TokenId, initialOwner: string): Telomeer;
    static hashOwner(ownerPublicKey: string): string;
    get tokenId(): TokenId;
    get currentOwner(): string;
    get hashPreviousOwner(): string;
    get hashHistory(): string[];
    /**
     * Transfer token ownership to a new owner
     * Updates the ownership chain and manages history pruning
     */
    transferOwnership(newOwner: string, transactionId: string): void;
    /**
     * Creates a composite hash from multiple history entries
     * This enables pruning while maintaining cryptographic verification capability
     */
    private createCompositeHash;
    /**
     * Verifies if the provided owner was previously in the ownership chain
     */
    verifyPreviousOwnership(ownerPublicKey: string): boolean;
    /**
     * Generate an ownership proof for the current owner
     */
    generateOwnershipProof(): {
        tokenId: TokenId;
        timestamp: number;
        ownershipChain: string[];
    };
    validate(): boolean;
    toJSON(): TelomeerProps;
    static fromJSON(json: TelomeerProps): Telomeer;
}
