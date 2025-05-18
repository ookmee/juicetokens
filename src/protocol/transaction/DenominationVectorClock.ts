import { TokenDenomination, VALID_DENOMINATIONS } from '../../../packages/token/src/models/Token';

/**
 * Status codes for denomination distribution
 * 00: Lack - Strong need for this denomination
 * 01: Slightly wanting - Could use more of this denomination
 * 10: Good - Balanced amount of this denomination
 * 11: Abundance - Excess of this denomination, can give away
 */
export enum DenominationStatus {
  LACK = '00',
  SLIGHTLY_WANTING = '01',
  GOOD = '10',
  ABUNDANCE = '11'
}

/**
 * DenominationVectorClock handles token denomination optimization during transactions
 * 
 * It performs two key functions:
 * 1. Calculates the ideal token denomination distribution
 * 2. Shares status codes for each denomination to optimize token selection between peers
 */
export class DenominationVectorClock {
  // Map of denomination values to their status codes
  private _statusCodes: Map<TokenDenomination, DenominationStatus>;
  
  // Ideal distribution counts (approximately five tokens of each denomination)
  private _idealDistribution: Map<TokenDenomination, number>;

  /**
   * Creates a new DenominationVectorClock
   * @param currentDistribution Current distribution of tokens by denomination
   */
  constructor(currentDistribution?: Map<TokenDenomination, number>) {
    this._statusCodes = new Map();
    this._idealDistribution = new Map();
    
    // Initialize ideal distribution (approximately 5 tokens of each denomination)
    // with fewer high-value tokens
    this._idealDistribution.set(1, 5);
    this._idealDistribution.set(2, 5);
    this._idealDistribution.set(5, 5);
    this._idealDistribution.set(10, 5);
    this._idealDistribution.set(20, 5);
    this._idealDistribution.set(50, 4);
    this._idealDistribution.set(100, 3);
    this._idealDistribution.set(200, 2);
    this._idealDistribution.set(500, 1);
    
    // Calculate status codes based on current distribution if provided
    if (currentDistribution) {
      this.calculateStatusCodes(currentDistribution);
    } else {
      // Initialize with default LACK status for all denominations
      VALID_DENOMINATIONS.forEach(denom => {
        this._statusCodes.set(denom, DenominationStatus.LACK);
      });
    }
  }
  
  /**
   * Calculates status codes based on current distribution
   * @param currentDistribution Current distribution of tokens by denomination
   */
  calculateStatusCodes(currentDistribution: Map<TokenDenomination, number>): void {
    VALID_DENOMINATIONS.forEach(denom => {
      const current = currentDistribution.get(denom) || 0;
      const ideal = this._idealDistribution.get(denom) || 0;
      
      if (current === 0) {
        // No tokens of this denomination
        this._statusCodes.set(denom, DenominationStatus.LACK);
      } else if (current < ideal * 0.5) {
        // Less than 50% of ideal
        this._statusCodes.set(denom, DenominationStatus.LACK);
      } else if (current < ideal) {
        // Less than ideal but more than 50%
        this._statusCodes.set(denom, DenominationStatus.SLIGHTLY_WANTING);
      } else if (current <= ideal * 1.5) {
        // Within 50% above ideal
        this._statusCodes.set(denom, DenominationStatus.GOOD);
      } else {
        // More than 50% above ideal
        this._statusCodes.set(denom, DenominationStatus.ABUNDANCE);
      }
    });
  }
  
  /**
   * Gets the status code for a specific denomination
   * @param denomination The denomination to get status for
   * @returns The status code (DenominationStatus)
   */
  getStatus(denomination: TokenDenomination): DenominationStatus {
    return this._statusCodes.get(denomination) || DenominationStatus.LACK;
  }
  
  /**
   * Gets the ideal count for a specific denomination
   * @param denomination The denomination to get ideal count for
   * @returns The ideal count
   */
  getIdealCount(denomination: TokenDenomination): number {
    return this._idealDistribution.get(denomination) || 0;
  }
  
  /**
   * Gets all status codes
   * @returns Map of denomination values to status codes
   */
  get statusCodes(): Map<TokenDenomination, DenominationStatus> {
    return new Map(this._statusCodes);
  }
  
  /**
   * Gets the ideal distribution
   * @returns Map of denomination values to ideal counts
   */
  get idealDistribution(): Map<TokenDenomination, number> {
    return new Map(this._idealDistribution);
  }
  
  /**
   * Updates the status code for a specific denomination
   * @param denomination The denomination to update
   * @param status The new status code
   */
  updateStatus(denomination: TokenDenomination, status: DenominationStatus): void {
    if (!VALID_DENOMINATIONS.includes(denomination)) {
      throw new Error(`Invalid denomination: ${denomination}`);
    }
    
    this._statusCodes.set(denomination, status);
  }
  
  /**
   * Optimizes token selection for a transaction
   * @param availableTokens The tokens available for the transaction
   * @param targetAmount The target amount for the transaction
   * @param receiverVectorClock The receiver's vector clock for optimization
   * @returns The optimal tokens to use in the transaction
   */
  optimizeTokenSelection(
    availableTokens: { denomination: TokenDenomination }[],
    targetAmount: number,
    receiverVectorClock?: DenominationVectorClock
  ): { denomination: TokenDenomination }[] {
    // Count tokens by denomination
    const tokensByDenom = new Map<TokenDenomination, { denomination: TokenDenomination }[]>();
    availableTokens.forEach(token => {
      if (!tokensByDenom.has(token.denomination)) {
        tokensByDenom.set(token.denomination, []);
      }
      tokensByDenom.get(token.denomination)?.push(token);
    });
    
    // Start with empty selection
    const selection: { denomination: TokenDenomination }[] = [];
    let remainingAmount = targetAmount;
    
    // Try to use tokens the receiver needs first (if we have receiver's vector clock)
    if (receiverVectorClock) {
      // Sort denominations by receiver's need (LACK -> SLIGHTLY_WANTING -> GOOD -> ABUNDANCE)
      const sortedDenomsByReceiverNeed = [...VALID_DENOMINATIONS].sort((a, b) => {
        const statusA = receiverVectorClock.getStatus(a);
        const statusB = receiverVectorClock.getStatus(b);
        
        // Compare status priority (LACK is highest priority)
        if (statusA !== statusB) {
          const priorityMap = {
            [DenominationStatus.LACK]: 0,
            [DenominationStatus.SLIGHTLY_WANTING]: 1,
            [DenominationStatus.GOOD]: 2,
            [DenominationStatus.ABUNDANCE]: 3
          };
          return priorityMap[statusA] - priorityMap[statusB];
        }
        
        // If status is the same, prefer larger denominations for efficiency
        return b - a;
      });
      
      // Try to satisfy receiver's needs while fulfilling the target amount
      for (const denom of sortedDenomsByReceiverNeed) {
        // Skip if this denomination is too large for remaining amount
        if (denom > remainingAmount) continue;
        
        const tokensOfDenom = tokensByDenom.get(denom) || [];
        
        // Status of this denomination for receiver
        const receiverStatus = receiverVectorClock.getStatus(denom);
        
        // Status of this denomination for sender
        const senderStatus = this.getStatus(denom);
        
        // Determine how many tokens to give based on both statuses
        let tokensToGive = 0;
        
        if (receiverStatus === DenominationStatus.LACK) {
          // Receiver really needs these, give as many as possible
          tokensToGive = Math.min(
            Math.floor(remainingAmount / denom), // Max based on remaining amount
            tokensOfDenom.length, // Limited by available tokens
            senderStatus === DenominationStatus.ABUNDANCE ? 
              tokensOfDenom.length : // If sender has abundance, give all
              Math.ceil(tokensOfDenom.length / 2) // Otherwise give up to half
          );
        } else if (receiverStatus === DenominationStatus.SLIGHTLY_WANTING) {
          // Receiver could use some, be more conservative
          tokensToGive = Math.min(
            Math.floor(remainingAmount / denom),
            tokensOfDenom.length,
            senderStatus === DenominationStatus.ABUNDANCE ? 
              Math.ceil(tokensOfDenom.length / 2) : // If sender has abundance, give up to half
              Math.ceil(tokensOfDenom.length / 3) // Otherwise give up to a third
          );
        } else {
          // Receiver doesn't need these, only use if sender has abundance
          if (senderStatus === DenominationStatus.ABUNDANCE) {
            tokensToGive = Math.min(
              Math.floor(remainingAmount / denom),
              tokensOfDenom.length,
              Math.ceil(tokensOfDenom.length / 4) // Give up to a quarter
            );
          }
        }
        
        // Add tokens to selection
        if (tokensToGive > 0) {
          const tokensToAdd = tokensOfDenom.slice(0, tokensToGive);
          selection.push(...tokensToAdd);
          remainingAmount -= tokensToGive * denom;
          
          // Remove used tokens from available pool
          tokensByDenom.set(denom, tokensOfDenom.slice(tokensToGive));
        }
        
        // Break if we've reached the target amount
        if (remainingAmount === 0) break;
      }
    }
    
    // If we still have remaining amount, use greedy algorithm for efficiency
    if (remainingAmount > 0) {
      // Sort denominations in descending order for greedy approach
      const sortedDenoms = [...VALID_DENOMINATIONS].sort((a, b) => b - a);
      
      for (const denom of sortedDenoms) {
        if (denom > remainingAmount) continue;
        
        const tokensOfDenom = tokensByDenom.get(denom) || [];
        const tokensNeeded = Math.min(
          Math.floor(remainingAmount / denom),
          tokensOfDenom.length
        );
        
        if (tokensNeeded > 0) {
          const tokensToAdd = tokensOfDenom.slice(0, tokensNeeded);
          selection.push(...tokensToAdd);
          remainingAmount -= tokensNeeded * denom;
          
          // Remove used tokens from available pool
          tokensByDenom.set(denom, tokensOfDenom.slice(tokensNeeded));
        }
        
        if (remainingAmount === 0) break;
      }
    }
    
    // If we still couldn't reach exact amount, try to find smallest token that works
    if (remainingAmount > 0) {
      for (const denom of VALID_DENOMINATIONS) {
        const tokensOfDenom = tokensByDenom.get(denom) || [];
        
        if (tokensOfDenom.length > 0) {
          selection.push(tokensOfDenom[0]);
          break;
        }
      }
    }
    
    return selection;
  }
  
  /**
   * Merges this vector clock with another to create an optimal combined view
   * @param other The other vector clock to merge with
   * @returns A new vector clock representing the merged state
   */
  mergeWith(other: DenominationVectorClock): DenominationVectorClock {
    const merged = new DenominationVectorClock();
    
    VALID_DENOMINATIONS.forEach(denom => {
      const thisStatus = this.getStatus(denom);
      const otherStatus = other.getStatus(denom);
      
      // Determine merged status based on both inputs
      let mergedStatus: DenominationStatus;
      
      if (thisStatus === DenominationStatus.LACK && otherStatus === DenominationStatus.ABUNDANCE) {
        // One party lacks what the other has in abundance - optimal transfer opportunity
        mergedStatus = DenominationStatus.GOOD;
      } else if (thisStatus === DenominationStatus.ABUNDANCE && otherStatus === DenominationStatus.LACK) {
        // One party has abundance of what the other lacks - optimal transfer opportunity
        mergedStatus = DenominationStatus.GOOD;
      } else {
        // Use the more "needy" status to prioritize filling gaps
        const priorityMap = {
          [DenominationStatus.LACK]: 0,
          [DenominationStatus.SLIGHTLY_WANTING]: 1,
          [DenominationStatus.GOOD]: 2,
          [DenominationStatus.ABUNDANCE]: 3
        };
        
        mergedStatus = priorityMap[thisStatus] <= priorityMap[otherStatus] ? 
          thisStatus : otherStatus;
      }
      
      merged.updateStatus(denom, mergedStatus);
    });
    
    return merged;
  }
  
  /**
   * Converts to a string representation for debugging
   */
  toString(): string {
    const output: string[] = ['DenominationVectorClock:'];
    VALID_DENOMINATIONS.forEach(denom => {
      const status = this._statusCodes.get(denom) || DenominationStatus.LACK;
      const ideal = this._idealDistribution.get(denom) || 0;
      output.push(`  ${denom}: ${status} (ideal: ${ideal})`);
    });
    return output.join('\n');
  }
} 