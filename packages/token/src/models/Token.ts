import { TokenId, TokenIdProps } from './TokenId';

export enum TokenStatus {
  ACTIVE = 0,
  RESERVED = 1,
  EXPIRED = 2,
  REVOKED = 3,
  CONSUMED = 4
}

// Valid denominations for tokens
export type TokenDenomination = 1 | 2 | 5 | 10 | 20 | 50 | 100 | 200 | 500;

export const VALID_DENOMINATIONS: TokenDenomination[] = [1, 2, 5, 10, 20, 50, 100, 200, 500];

export interface TokenProps {
  tokenId: TokenId | TokenIdProps;
  denomination: TokenDenomination;
  creationTimeMs: number;
  issuer: string;
  status: TokenStatus;
  expiryTimeMs?: number;
}

export class Token {
  private readonly _tokenId: TokenId;
  private readonly _denomination: TokenDenomination;
  private readonly _creationTimeMs: number;
  private readonly _issuer: string;
  private _status: TokenStatus;
  private _expiryTimeMs?: number;

  constructor(props: TokenProps) {
    this._tokenId = props.tokenId instanceof TokenId 
      ? props.tokenId 
      : new TokenId(props.tokenId);
    
    if (!VALID_DENOMINATIONS.includes(props.denomination)) {
      throw new Error(`Invalid denomination: ${props.denomination}`);
    }
    
    this._denomination = props.denomination;
    this._creationTimeMs = props.creationTimeMs;
    this._issuer = props.issuer;
    this._status = props.status;
    this._expiryTimeMs = props.expiryTimeMs;
  }

  static create(
    tokenId: TokenId,
    denomination: TokenDenomination,
    issuer: string,
    expiryTimeMs?: number
  ): Token {
    return new Token({
      tokenId,
      denomination,
      creationTimeMs: Date.now(),
      issuer,
      status: TokenStatus.ACTIVE,
      expiryTimeMs
    });
  }

  get tokenId(): TokenId {
    return this._tokenId;
  }

  get denomination(): TokenDenomination {
    return this._denomination;
  }

  get creationTimeMs(): number {
    return this._creationTimeMs;
  }

  get issuer(): string {
    return this._issuer;
  }

  get status(): TokenStatus {
    return this._status;
  }

  get expiryTimeMs(): number | undefined {
    return this._expiryTimeMs;
  }

  setStatus(status: TokenStatus): void {
    this._status = status;
  }

  setExpiryTimeMs(expiryTimeMs: number): void {
    this._expiryTimeMs = expiryTimeMs;
  }

  isExpired(): boolean {
    if (!this._expiryTimeMs) {
      return false;
    }
    return Date.now() > this._expiryTimeMs;
  }

  validate(): boolean {
    // Check if TokenId is valid
    if (!this._tokenId.validate()) {
      return false;
    }

    // Check if denomination is valid
    if (!VALID_DENOMINATIONS.includes(this._denomination)) {
      return false;
    }

    // Check if creation time is valid
    if (typeof this._creationTimeMs !== 'number' || this._creationTimeMs <= 0) {
      return false;
    }

    // Check if issuer is valid
    if (!this._issuer || typeof this._issuer !== 'string') {
      return false;
    }

    // Check if status is valid
    if (!Object.values(TokenStatus).includes(this._status)) {
      return false;
    }

    // Check if expiryTimeMs is valid if present
    if (this._expiryTimeMs !== undefined && 
        (typeof this._expiryTimeMs !== 'number' || this._expiryTimeMs <= 0)) {
      return false;
    }

    return true;
  }

  toJSON(): TokenProps {
    const result: TokenProps = {
      tokenId: this._tokenId.toJSON(),
      denomination: this._denomination,
      creationTimeMs: this._creationTimeMs,
      issuer: this._issuer,
      status: this._status
    };

    if (this._expiryTimeMs !== undefined) {
      result.expiryTimeMs = this._expiryTimeMs;
    }

    return result;
  }

  static fromJSON(json: TokenProps): Token {
    return new Token(json);
  }
} 