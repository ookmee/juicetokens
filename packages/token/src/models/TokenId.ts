import crypto from 'crypto';

export interface TokenIdProps {
  id: string;
  issuanceId: string;
  sequenceNumber: number;
  creationTimeMs: number;
}

export class TokenId {
  private readonly _id: string;
  private readonly _issuanceId: string;
  private readonly _sequenceNumber: number;
  private readonly _creationTimeMs: number;

  constructor(props: TokenIdProps) {
    this._id = props.id;
    this._issuanceId = props.issuanceId;
    this._sequenceNumber = props.sequenceNumber;
    this._creationTimeMs = props.creationTimeMs;
  }

  static generate(issuanceId: string, sequenceNumber: number): TokenId {
    const id = crypto.randomUUID();
    const creationTimeMs = Date.now();
    
    return new TokenId({
      id,
      issuanceId,
      sequenceNumber,
      creationTimeMs
    });
  }

  get id(): string {
    return this._id;
  }

  get issuanceId(): string {
    return this._issuanceId;
  }

  get sequenceNumber(): number {
    return this._sequenceNumber;
  }

  get creationTimeMs(): number {
    return this._creationTimeMs;
  }

  validate(): boolean {
    if (!this._id || typeof this._id !== 'string') {
      return false;
    }

    if (!this._issuanceId || typeof this._issuanceId !== 'string') {
      return false;
    }

    if (typeof this._sequenceNumber !== 'number' || this._sequenceNumber < 0) {
      return false;
    }

    if (typeof this._creationTimeMs !== 'number' || this._creationTimeMs <= 0) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `${this._issuanceId}-${this._sequenceNumber.toString().padStart(6, '0')}`;
  }

  toJSON(): TokenIdProps {
    return {
      id: this._id,
      issuanceId: this._issuanceId,
      sequenceNumber: this._sequenceNumber,
      creationTimeMs: this._creationTimeMs
    };
  }

  static fromJSON(json: TokenIdProps): TokenId {
    return new TokenId(json);
  }
} 