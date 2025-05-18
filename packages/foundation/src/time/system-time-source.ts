import { Logger } from '@juicetokens/common';
import { BaseTimeSource } from './base-time-source';
import { TimeSourceType } from './interfaces';

/**
 * Configuration for SystemTimeSource
 */
export interface SystemTimeSourceConfig {
  /**
   * Default confidence score for system time
   */
  defaultConfidenceScore?: number;
  
  /**
   * How often to check system time drift in milliseconds
   */
  driftCheckIntervalMs?: number;
}

/**
 * Implementation of a time source that uses the system clock
 */
export class SystemTimeSource extends BaseTimeSource {
  private readonly config: SystemTimeSourceConfig;
  private driftCheckInterval: NodeJS.Timeout | null = null;
  private lastCheckedTime: number = 0;
  private lastCheckedSystemTime: number = 0;
  
  /**
   * Creates a new SystemTimeSource
   * @param sourceId Unique identifier for this source
   * @param logger Logger instance
   * @param config Configuration options
   */
  constructor(
    sourceId: string, 
    logger: Logger, 
    config: SystemTimeSourceConfig = {}
  ) {
    super(TimeSourceType.SYSTEM, sourceId, logger);
    
    this.config = {
      defaultConfidenceScore: 80, // System time is generally reliable
      driftCheckIntervalMs: 3600000, // Check drift every hour
      ...config
    };
    
    // Initialize confidence score
    this.updateConfidenceScore(this.config.defaultConfidenceScore!);
    
    // Initialize last sync time
    this.updateLastSyncTime(Date.now());
    
    // Start drift checking if enabled
    if (this.config.driftCheckIntervalMs && this.config.driftCheckIntervalMs > 0) {
      this.startDriftChecking();
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async isAvailable(): Promise<boolean> {
    // System time is always available
    return true;
  }
  
  /**
   * {@inheritdoc}
   */
  public async getCurrentTime(): Promise<number> {
    const now = Date.now();
    return now;
  }
  
  /**
   * Start checking for system time drift
   */
  private startDriftChecking(): void {
    // Initialize reference points
    this.lastCheckedTime = Date.now();
    this.lastCheckedSystemTime = Date.now();
    
    // Set up interval to check drift
    this.driftCheckInterval = setInterval(() => {
      this.checkDrift();
    }, this.config.driftCheckIntervalMs);
  }
  
  /**
   * Check for system time drift by comparing elapsed time
   * with expected elapsed time since last check
   */
  private checkDrift(): void {
    const now = Date.now();
    const systemTime = Date.now();
    
    const expectedElapsed = now - this.lastCheckedTime;
    const actualElapsed = systemTime - this.lastCheckedSystemTime;
    
    // Calculate drift in milliseconds
    const drift = Math.abs(actualElapsed - expectedElapsed);
    
    // Update confidence score based on drift
    // If drift is significant, reduce confidence
    if (drift > 5000) { // More than 5 seconds of drift
      const newConfidence = Math.max(0, this.confidenceScore - 20);
      this.updateConfidenceScore(newConfidence);
      this.logger.warn(`System time drift detected: ${drift}ms, reducing confidence to ${newConfidence}`);
    } else if (drift > 1000) { // More than 1 second of drift
      const newConfidence = Math.max(0, this.confidenceScore - 10);
      this.updateConfidenceScore(newConfidence);
      this.logger.warn(`System time drift detected: ${drift}ms, reducing confidence to ${newConfidence}`);
    } else if (drift < 100) { // Less than 100ms drift is good
      const newConfidence = Math.min(100, this.confidenceScore + 5);
      this.updateConfidenceScore(newConfidence);
    }
    
    // Update reference points
    this.lastCheckedTime = now;
    this.lastCheckedSystemTime = systemTime;
    
    // Update last sync time
    this.updateLastSyncTime(now);
  }
  
  /**
   * Stop drift checking
   */
  public stopDriftChecking(): void {
    if (this.driftCheckInterval) {
      clearInterval(this.driftCheckInterval);
      this.driftCheckInterval = null;
    }
  }
  
  /**
   * Clean up resources when no longer needed
   */
  public dispose(): void {
    this.stopDriftChecking();
  }
} 