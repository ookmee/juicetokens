import { Token, TokenProps } from './Token';
export interface WisselTokenProps {
    baseToken: Token | TokenProps;
    afrondingsbuffer: number;
    lastUpdatedTimeMs: number;
    lastTransactionId?: string;
}
/**
 * WisselToken implementation
 *
 * A special token that maintains an "afrondingsbuffer" (rounding buffer)
 * for handling fractional amounts in transactions
 */
export declare class WisselToken {
    private readonly _baseToken;
    private _afrondingsbuffer;
    private _lastUpdatedTimeMs;
    private _lastTransactionId?;
    constructor(props: WisselTokenProps);
    static create(baseToken: Token): WisselToken;
    get baseToken(): Token;
    get afrondingsbuffer(): number;
    get lastUpdatedTimeMs(): number;
    get lastTransactionId(): string | undefined;
    /**
     * Add an amount to the afrondingsbuffer
     * If the addition would make the buffer >= 1.0, returns the integer part
     * and keeps only the fractional part in the buffer
     */
    addToBuffer(amount: number, transactionId: string): number;
    /**
     * Remove an amount from the afrondingsbuffer
     * Returns true if successful, false if not enough in the buffer
     */
    removeFromBuffer(amount: number, transactionId: string): boolean;
    /**
     * Transfers a specific amount from one WisselToken to another
     * Returns true if successful, false if not enough in source buffer
     */
    static transferBuffer(source: WisselToken, target: WisselToken, amount: number, transactionId: string): boolean;
    validate(): boolean;
    toJSON(): WisselTokenProps;
    static fromJSON(json: WisselTokenProps): WisselToken;
}
