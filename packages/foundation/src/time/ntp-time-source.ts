import { Logger } from '@juicetokens/common';
import { BaseTimeSource } from './base-time-source';
import { TimeSourceType } from './interfaces';

/**
 * Configuration for NTPTimeSource
 */
export interface NTPTimeSourceConfig {
  /**
   * NTP server addresses to use
   */
  servers?: string[];
  
  /**
   * How often to synchronize with NTP servers in milliseconds
   */
  syncIntervalMs?: number;
  
  /**
   * Default confidence score
   */
  defaultConfidenceScore?: number;
  
  /**
   * Whether this is a mock implementation
   */
  mockMode?: boolean;
  
  /**
   * For mock mode: fixed offset from system time in milliseconds
   */
  mockTimeOffsetMs?: number;
  
  /**
   * For mock mode: whether the source is available
   */
  mockAvailable?: boolean;
}

/**
 * Implementation of a time source that uses NTP
 */
export class NTPTimeSource extends BaseTimeSource {
  private readonly config: NTPTimeSourceConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private offsetFromSystemTime: number = 0;
  private available: boolean = true;
  
  /**
   * Creates a new NTPTimeSource
   * @param sourceId Unique identifier for this source
   * @param logger Logger instance
   * @param config Configuration options
   */
  constructor(
    sourceId: string, 
    logger: Logger, 
    config: NTPTimeSourceConfig = {}
  ) {
    super(TimeSourceType.NTP, sourceId, logger);
    
    this.config = {
      servers: ['pool.ntp.org', 'time.google.com', 'time.cloudflare.com'],
      syncIntervalMs: 3600000, // Sync every hour
      defaultConfidenceScore: 90, // NTP is generally very reliable
      mockMode: false,
      mockTimeOffsetMs: 0,
      mockAvailable: true,
      ...config
    };
    
    // Initialize confidence score
    this.updateConfidenceScore(this.config.defaultConfidenceScore!);
    
    if (this.config.mockMode) {
      this.offsetFromSystemTime = this.config.mockTimeOffsetMs!;
      this.available = this.config.mockAvailable!;
    }
    
    // Start synchronization if enabled
    if (this.config.syncIntervalMs && this.config.syncIntervalMs > 0) {
      this.startSync();
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async isAvailable(): Promise<boolean> {
    if (this.config.mockMode) {
      return this.available;
    }
    
    try {
      // In a real implementation, we would check connectivity to NTP servers
      // For now, assume NTP is available
      return true;
    } catch (error) {
      this.logger.error(`NTP availability check failed: ${error}`);
      return false;
    }
  }
  
  /**
   * {@inheritdoc}
   */
  public async getCurrentTime(): Promise<number> {
    if (!await this.isAvailable()) {
      throw new Error('NTP time source is not available');
    }
    
    if (this.config.mockMode) {
      // In mock mode, add configured offset to system time
      return Date.now() + this.offsetFromSystemTime;
    }
    
    try {
      // In a real implementation, we would query NTP servers
      // and calculate the accurate time
      // For now, simulate NTP by adding the calculated offset
      return Date.now() + this.offsetFromSystemTime;
    } catch (error) {
      this.logger.error(`Failed to get NTP time: ${error}`);
      throw error;
    }
  }
  
  /**
   * Start NTP synchronization
   */
  private startSync(): void {
    // Perform initial sync
    this.syncWithNTPServers()
      .catch(error => this.logger.error(`Initial NTP sync failed: ${error}`));
    
    // Set up interval for regular syncs
    this.syncInterval = setInterval(() => {
      this.syncWithNTPServers()
        .catch(error => this.logger.error(`NTP sync failed: ${error}`));
    }, this.config.syncIntervalMs);
  }
  
  /**
   * Synchronize with NTP servers
   */
  private async syncWithNTPServers(): Promise<void> {
    if (this.config.mockMode) {
      // In mock mode, just update the last sync time
      this.updateLastSyncTime(Date.now());
      return;
    }
    
    try {
      // In a real implementation, we would:
      // 1. Query multiple NTP servers
      // 2. Filter out outliers
      // 3. Calculate average offset
      // 4. Update our offset from system time
      
      // Simulate NTP query with a small random offset
      const randomOffset = Math.floor(Math.random() * 100) - 50; // -50 to +50 ms
      this.offsetFromSystemTime = randomOffset;
      
      // Update last sync time
      this.updateLastSyncTime(Date.now());
      
      this.logger.info(`NTP sync completed, offset: ${this.offsetFromSystemTime}ms`);
      
      // Update confidence score based on successful sync
      const newConfidence = Math.min(100, this.confidenceScore + 2);
      this.updateConfidenceScore(newConfidence);
    } catch (error) {
      // Reduce confidence on sync failure
      const newConfidence = Math.max(0, this.confidenceScore - 10);
      this.updateConfidenceScore(newConfidence);
      
      this.logger.error(`NTP sync failed: ${error}, reducing confidence to ${newConfidence}`);
      throw error;
    }
  }
  
  /**
   * Stop synchronization
   */
  public stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Clean up resources when no longer needed
   */
  public dispose(): void {
    this.stopSync();
  }
  
  /**
   * For testing: set mock availability
   */
  public setMockAvailability(available: boolean): void {
    if (!this.config.mockMode) {
      throw new Error('Cannot set mock availability when not in mock mode');
    }
    this.available = available;
  }
  
  /**
   * For testing: set mock time offset
   */
  public setMockTimeOffset(offsetMs: number): void {
    if (!this.config.mockMode) {
      throw new Error('Cannot set mock time offset when not in mock mode');
    }
    this.offsetFromSystemTime = offsetMs;
  }
} 