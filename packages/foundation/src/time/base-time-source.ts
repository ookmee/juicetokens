import { Logger } from '@juicetokens/common';
import { ITimeSource, TimeSourceType } from './interfaces';

/**
 * Base abstract class for time sources
 */
export abstract class BaseTimeSource implements ITimeSource {
  /**
   * The type of time source
   */
  public readonly type: TimeSourceType;
  
  /**
   * A unique identifier for this time source
   */
  public readonly sourceId: string;
  
  /**
   * Logger instance
   */
  protected readonly logger: Logger;
  
  /**
   * Last synchronization time
   */
  protected lastSyncTime: number = 0;
  
  /**
   * Last calculated confidence score
   */
  protected confidenceScore: number = 0;
  
  /**
   * Creates a new BaseTimeSource
   * @param type The time source type
   * @param sourceId Unique identifier for this source
   * @param logger Logger instance
   */
  constructor(type: TimeSourceType, sourceId: string, logger: Logger) {
    this.type = type;
    this.sourceId = sourceId;
    this.logger = logger;
  }

  /**
   * Check if this time source is available
   */
  public abstract isAvailable(): Promise<boolean>;
  
  /**
   * Get the current time from this source
   */
  public abstract getCurrentTime(): Promise<number>;
  
  /**
   * Get the confidence score for this time source
   */
  public async getConfidenceScore(): Promise<number> {
    // Default implementation returns cached confidence score
    return this.confidenceScore;
  }
  
  /**
   * Get the last synchronization time
   */
  public async getLastSyncTime(): Promise<number> {
    return this.lastSyncTime;
  }
  
  /**
   * Update the last synchronization time
   * @param time The synchronization time
   */
  protected updateLastSyncTime(time: number): void {
    this.lastSyncTime = time;
  }
  
  /**
   * Update the confidence score
   * @param score The new confidence score
   */
  protected updateConfidenceScore(score: number): void {
    // Ensure score is between 0-100
    this.confidenceScore = Math.min(100, Math.max(0, score));
  }
} 