import { Logger } from '@juicetokens/common';
import { ITimeSource, TimeSourceType } from './interfaces';
import { SystemTimeSource } from './system-time-source';

/**
 * Configuration for TimeSourceManager
 */
export interface TimeSourceManagerConfig {
  /**
   * Whether to initialize with a system time source
   */
  includeSystemTimeSource?: boolean;
  
  /**
   * System time source ID to use if includeSystemTimeSource is true
   */
  systemTimeSourceId?: string;
}

/**
 * Manages multiple time sources
 */
export class TimeSourceManager {
  private readonly logger: Logger;
  private readonly timeSources: Map<string, ITimeSource> = new Map();
  private readonly timeSourcesByType: Map<TimeSourceType, Set<string>> = new Map();
  
  /**
   * Creates a new TimeSourceManager
   * @param logger Logger instance
   * @param config Configuration options
   */
  constructor(logger: Logger, config: TimeSourceManagerConfig = {}) {
    this.logger = logger;
    
    // Initialize maps for each source type
    Object.values(TimeSourceType).forEach(sourceType => {
      this.timeSourcesByType.set(sourceType as TimeSourceType, new Set<string>());
    });
    
    // Add system time source if configured
    if (config.includeSystemTimeSource !== false) {
      const sourceId = config.systemTimeSourceId || 'system-time-default';
      const systemTimeSource = new SystemTimeSource(sourceId, logger);
      this.addTimeSource(systemTimeSource);
    }
  }
  
  /**
   * Add a time source to the manager
   * @param timeSource The time source to add
   * @returns true if the source was added, false if a source with same ID already exists
   */
  public addTimeSource(timeSource: ITimeSource): boolean {
    const sourceId = timeSource.sourceId;
    
    if (this.timeSources.has(sourceId)) {
      this.logger.warn(`Time source with ID ${sourceId} already exists`);
      return false;
    }
    
    this.timeSources.set(sourceId, timeSource);
    
    // Add to type map
    const typeSet = this.timeSourcesByType.get(timeSource.type);
    if (typeSet) {
      typeSet.add(sourceId);
    }
    
    this.logger.info(`Added time source: ${timeSource.type} with ID ${sourceId}`);
    return true;
  }
  
  /**
   * Remove a time source by ID
   * @param sourceId The ID of the time source to remove
   * @returns true if the source was removed, false if no source with that ID exists
   */
  public removeTimeSource(sourceId: string): boolean {
    const timeSource = this.timeSources.get(sourceId);
    
    if (!timeSource) {
      return false;
    }
    
    this.timeSources.delete(sourceId);
    
    // Remove from type map
    const typeSet = this.timeSourcesByType.get(timeSource.type);
    if (typeSet) {
      typeSet.delete(sourceId);
    }
    
    // Dispose the time source if it has a dispose method
    if (typeof (timeSource as any).dispose === 'function') {
      (timeSource as any).dispose();
    }
    
    this.logger.info(`Removed time source with ID ${sourceId}`);
    return true;
  }
  
  /**
   * Get a time source by ID
   * @param sourceId The ID of the time source
   * @returns The time source, or undefined if not found
   */
  public getTimeSource(sourceId: string): ITimeSource | undefined {
    return this.timeSources.get(sourceId);
  }
  
  /**
   * Get all time sources of a specific type
   * @param sourceType The type of time sources to get
   * @returns Array of time sources of the specified type
   */
  public getTimeSourcesByType(sourceType: TimeSourceType): ITimeSource[] {
    const sourceIds = this.timeSourcesByType.get(sourceType);
    
    if (!sourceIds || sourceIds.size === 0) {
      return [];
    }
    
    return Array.from(sourceIds)
      .map(id => this.timeSources.get(id)!)
      .filter(source => source !== undefined);
  }
  
  /**
   * Get all available time sources
   * @returns Promise resolving to array of available time sources
   */
  public async getAvailableTimeSources(): Promise<ITimeSource[]> {
    const availableSources: ITimeSource[] = [];
    
    for (const source of this.timeSources.values()) {
      try {
        if (await source.isAvailable()) {
          availableSources.push(source);
        }
      } catch (error) {
        this.logger.error(`Error checking availability of time source ${source.sourceId}: ${error}`);
      }
    }
    
    return availableSources;
  }
  
  /**
   * Get the current time from the highest confidence available source
   * @returns Promise resolving to the current time in milliseconds
   * @throws Error if no time sources are available
   */
  public async getCurrentTime(): Promise<number> {
    const availableSources = await this.getAvailableTimeSources();
    
    if (availableSources.length === 0) {
      throw new Error('No time sources available');
    }
    
    // Get confidence scores for all available sources
    const sourcesWithConfidence = await Promise.all(
      availableSources.map(async source => ({
        source,
        confidence: await source.getConfidenceScore()
      }))
    );
    
    // Sort by confidence (descending)
    sourcesWithConfidence.sort((a, b) => b.confidence - a.confidence);
    
    // Use the highest confidence source
    try {
      const highestConfidenceSource = sourcesWithConfidence[0].source;
      return await highestConfidenceSource.getCurrentTime();
    } catch (error) {
      this.logger.error(`Error getting time from highest confidence source: ${error}`);
      
      // Try the next source if available
      if (sourcesWithConfidence.length > 1) {
        try {
          const nextSource = sourcesWithConfidence[1].source;
          return await nextSource.getCurrentTime();
        } catch (secondError) {
          this.logger.error(`Error getting time from next source: ${secondError}`);
        }
      }
      
      throw new Error('Failed to get time from available sources');
    }
  }
  
  /**
   * Clean up resources when no longer needed
   */
  public dispose(): void {
    // Dispose all time sources
    for (const source of this.timeSources.values()) {
      if (typeof (source as any).dispose === 'function') {
        (source as any).dispose();
      }
    }
    
    this.timeSources.clear();
    
    // Clear type maps
    this.timeSourcesByType.forEach(set => set.clear());
  }
} 