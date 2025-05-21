export interface TokenIdProps {
    id: string;
    issuanceId: string;
    sequenceNumber: number;
    creationTimeMs: number;
}
export declare class TokenId {
    private readonly _id;
    private readonly _issuanceId;
    private readonly _sequenceNumber;
    private readonly _creationTimeMs;
    constructor(props: TokenIdProps);
    static generate(issuanceId: string, sequenceNumber: number): TokenId;
    get id(): string;
    get issuanceId(): string;
    get sequenceNumber(): number;
    get creationTimeMs(): number;
    validate(): boolean;
    toString(): string;
    toJSON(): TokenIdProps;
    static fromJSON(json: TokenIdProps): TokenId;
}
