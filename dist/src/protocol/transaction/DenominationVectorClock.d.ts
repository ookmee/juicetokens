import { TokenDenomination } from '../../../packages/token/src/models/Token';
/**
 * Status codes for denomination distribution
 * 00: Lack - Strong need for this denomination
 * 01: Slightly wanting - Could use more of this denomination
 * 10: Good - Balanced amount of this denomination
 * 11: Abundance - Excess of this denomination, can give away
 */
export declare enum DenominationStatus {
    LACK = "00",
    SLIGHTLY_WANTING = "01",
    GOOD = "10",
    ABUNDANCE = "11"
}
/**
 * DenominationVectorClock handles token denomination optimization during transactions
 *
 * It performs two key functions:
 * 1. Calculates the ideal token denomination distribution
 * 2. Shares status codes for each denomination to optimize token selection between peers
 */
export declare class DenominationVectorClock {
    private _statusCodes;
    private _idealDistribution;
    /**
     * Creates a new DenominationVectorClock
     * @param currentDistribution Current distribution of tokens by denomination
     */
    constructor(currentDistribution?: Map<TokenDenomination, number>);
    /**
     * Calculates status codes based on current distribution
     * @param currentDistribution Current distribution of tokens by denomination
     */
    calculateStatusCodes(currentDistribution: Map<TokenDenomination, number>): void;
    /**
     * Gets the status code for a specific denomination
     * @param denomination The denomination to get status for
     * @returns The status code (DenominationStatus)
     */
    getStatus(denomination: TokenDenomination): DenominationStatus;
    /**
     * Gets the ideal count for a specific denomination
     * @param denomination The denomination to get ideal count for
     * @returns The ideal count
     */
    getIdealCount(denomination: TokenDenomination): number;
    /**
     * Gets all status codes
     * @returns Map of denomination values to status codes
     */
    get statusCodes(): Map<TokenDenomination, DenominationStatus>;
    /**
     * Gets the ideal distribution
     * @returns Map of denomination values to ideal counts
     */
    get idealDistribution(): Map<TokenDenomination, number>;
    /**
     * Updates the status code for a specific denomination
     * @param denomination The denomination to update
     * @param status The new status code
     */
    updateStatus(denomination: TokenDenomination, status: DenominationStatus): void;
    /**
     * Optimizes token selection for a transaction
     * @param availableTokens The tokens available for the transaction
     * @param targetAmount The target amount for the transaction
     * @param receiverVectorClock The receiver's vector clock for optimization
     * @returns The optimal tokens to use in the transaction
     */
    optimizeTokenSelection(availableTokens: {
        denomination: TokenDenomination;
    }[], targetAmount: number, receiverVectorClock?: DenominationVectorClock): {
        denomination: TokenDenomination;
    }[];
    /**
     * Merges this vector clock with another to create an optimal combined view
     * @param other The other vector clock to merge with
     * @returns A new vector clock representing the merged state
     */
    mergeWith(other: DenominationVectorClock): DenominationVectorClock;
    /**
     * Converts to a string representation for debugging
     */
    toString(): string;
}
