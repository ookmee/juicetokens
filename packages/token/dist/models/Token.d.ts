import { TokenId, TokenIdProps } from './TokenId';
export declare enum TokenStatus {
    ACTIVE = 0,
    RESERVED = 1,
    EXPIRED = 2,
    REVOKED = 3,
    CONSUMED = 4
}
export type TokenDenomination = 1 | 2 | 5 | 10 | 20 | 50 | 100 | 200 | 500;
export declare const VALID_DENOMINATIONS: TokenDenomination[];
export interface TokenProps {
    tokenId: TokenId | TokenIdProps;
    denomination: TokenDenomination;
    creationTimeMs: number;
    issuer: string;
    status: TokenStatus;
    expiryTimeMs?: number;
}
export declare class Token {
    private readonly _tokenId;
    private readonly _denomination;
    private readonly _creationTimeMs;
    private readonly _issuer;
    private _status;
    private _expiryTimeMs?;
    constructor(props: TokenProps);
    static create(tokenId: TokenId, denomination: TokenDenomination, issuer: string, expiryTimeMs?: number): Token;
    get tokenId(): TokenId;
    get denomination(): TokenDenomination;
    get creationTimeMs(): number;
    get issuer(): string;
    get status(): TokenStatus;
    get expiryTimeMs(): number | undefined;
    setStatus(status: TokenStatus): void;
    setExpiryTimeMs(expiryTimeMs: number): void;
    isExpired(): boolean;
    validate(): boolean;
    toJSON(): TokenProps;
    static fromJSON(json: TokenProps): Token;
}
