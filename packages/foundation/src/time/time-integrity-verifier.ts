import { Logger } from '@juicetokens/common';
import { 
  ITimeIntegrityVerifier, 
  ITimeSource, 
  SpoofingDetectionResult, 
  SpoofingSignature, 
  SpoofingSignatureType, 
  TimeIntegrityResult, 
  TimeSourceStatus, 
  TimeSourceType 
} from './interfaces';
import { TimeSourceManager } from './time-source-manager';

/**
 * Configuration for TimeIntegrityVerifier
 */
export interface TimeIntegrityVerifierConfig {
  /**
   * Default confidence threshold for high confidence
   */
  highConfidenceThreshold?: number;
  
  /**
   * Maximum allowed deviation for a source to be considered consistent
   */
  maxConsistentDeviationMs?: number;
  
  /**
   * Time window for detecting sudden jumps in milliseconds
   */
  jumpDetectionWindowMs?: number;
  
  /**
   * Threshold for detecting jumps in milliseconds
   */
  jumpDetectionThresholdMs?: number;
  
  /**
   * Whether to enable transaction verification by default
   */
  enableTransactionVerification?: boolean;
}

/**
 * Implements time integrity verification
 */
export class TimeIntegrityVerifier implements ITimeIntegrityVerifier {
  private readonly logger: Logger;
  private readonly timeSourceManager: TimeSourceManager;
  private readonly config: TimeIntegrityVerifierConfig;
  
  // For drift and jump detection
  private lastVerificationTime: number = 0;
  private lastReportedTimes: Map<string, number> = new Map();
  
  /**
   * Creates a new TimeIntegrityVerifier
   * @param logger Logger instance
   * @param timeSourceManager Time source manager to use
   * @param config Configuration options
   */
  constructor(
    logger: Logger, 
    timeSourceManager: TimeSourceManager, 
    config: TimeIntegrityVerifierConfig = {}
  ) {
    this.logger = logger;
    this.timeSourceManager = timeSourceManager;
    this.config = {
      highConfidenceThreshold: 80,
      maxConsistentDeviationMs: 1000, // 1 second
      jumpDetectionWindowMs: 60000, // 1 minute
      jumpDetectionThresholdMs: 5000, // 5 seconds
      enableTransactionVerification: true,
      ...config
    };
  }
  
  /**
   * {@inheritdoc}
   */
  public async verifyTimeIntegrity(
    sourceTypes: TimeSourceType[],
    requireHighConfidence: boolean,
    minimumSources: number,
    checkForSpoofing: boolean
  ): Promise<TimeIntegrityResult> {
    // Get all available time sources of the requested types
    const availableSources: ITimeSource[] = [];
    
    for (const sourceType of sourceTypes) {
      const sources = this.timeSourceManager.getTimeSourcesByType(sourceType);
      for (const source of sources) {
        try {
          if (await source.isAvailable()) {
            availableSources.push(source);
          }
        } catch (error) {
          this.logger.error(`Error checking availability of time source ${source.sourceId}: ${error}`);
        }
      }
    }
    
    // Check if we have enough sources
    const haveEnoughSources = availableSources.length >= minimumSources;
    
    if (!haveEnoughSources) {
      this.logger.warn(`Insufficient time sources: have ${availableSources.length}, need ${minimumSources}`);
    }
    
    // Get time from each source and calculate confidence
    const sourceStatuses: TimeSourceStatus[] = [];
    let totalConfidence = 0;
    let reportedTimes: number[] = [];
    
    for (const source of availableSources) {
      try {
        const currentTime = await source.getCurrentTime();
        const confidence = await source.getConfidenceScore();
        
        reportedTimes.push(currentTime);
        totalConfidence += confidence;
        
        // Store for drift detection
        this.lastReportedTimes.set(source.sourceId, currentTime);
        
        sourceStatuses.push({
          sourceType: source.type,
          available: true,
          reportedTime: currentTime,
          confidenceScore: confidence,
          deviationMs: 0, // Will be calculated after consensus
          contributingToConsensus: true
        });
      } catch (error) {
        this.logger.error(`Error getting time from source ${source.sourceId}: ${error}`);
        
        sourceStatuses.push({
          sourceType: source.type,
          available: false,
          reportedTime: 0,
          confidenceScore: 0,
          deviationMs: 0,
          errorMessage: `${error}`,
          contributingToConsensus: false
        });
      }
    }
    
    // Calculate median time as consensus
    let consensusTime = this.calculateMedian(reportedTimes);
    if (reportedTimes.length === 0) {
      // Fallback to system time if no sources
      consensusTime = Date.now();
    }
    
    // Calculate deviations from consensus
    for (let i = 0; i < sourceStatuses.length; i++) {
      if (sourceStatuses[i].available) {
        sourceStatuses[i].deviationMs = Math.abs(sourceStatuses[i].reportedTime - consensusTime);
        
        // Exclude from consensus if deviation is too large
        if (sourceStatuses[i].deviationMs > this.config.maxConsistentDeviationMs!) {
          sourceStatuses[i].contributingToConsensus = false;
        }
      }
    }
    
    // Recalculate consensus excluding inconsistent sources
    const consistentTimes = reportedTimes.filter((_, index) => 
      sourceStatuses[index].contributingToConsensus
    );
    
    if (consistentTimes.length > 0) {
      consensusTime = this.calculateMedian(consistentTimes);
    }
    
    // Calculate overall confidence score
    const averageConfidence = availableSources.length > 0 
      ? totalConfidence / availableSources.length 
      : 0;
    
    // Adjust confidence based on consistency
    const consistencyFactor = consistentTimes.length / Math.max(1, reportedTimes.length);
    let overallConfidence = Math.round(averageConfidence * consistencyFactor);
    
    // Check for spoofing if requested
    let spoofingDetection: SpoofingDetectionResult | undefined;
    if (checkForSpoofing) {
      spoofingDetection = await this.detectTimeSpoofing(sourceStatuses, consensusTime);
      
      // Reduce confidence if spoofing is detected
      if (spoofingDetection.spoofingDetected) {
        overallConfidence = Math.max(0, overallConfidence - 50);
      }
    }
    
    // Determine if time has high enough confidence
    const hasHighConfidence = overallConfidence >= this.config.highConfidenceThreshold!;
    
    // Determine if time integrity is verified
    const integrityVerified = haveEnoughSources && 
      (spoofingDetection ? !spoofingDetection.spoofingDetected : true) &&
      (!requireHighConfidence || hasHighConfidence);
    
    // Determine if suitable for transactions
    const suitableForTransactions = integrityVerified && 
      (this.config.enableTransactionVerification ? hasHighConfidence : true);
    
    // Update last verification time
    this.lastVerificationTime = Date.now();
    
    // Create and return result
    const result: TimeIntegrityResult = {
      timestamp: consensusTime,
      confidenceScore: overallConfidence,
      sources: sourceStatuses,
      integrityVerified,
      spoofingDetection,
      suitableForTransactions
    };
    
    this.logger.info(`Time integrity verification: ${integrityVerified ? 'VERIFIED' : 'FAILED'}, confidence: ${overallConfidence}, suitable for transactions: ${suitableForTransactions}`);
    
    return result;
  }
  
  /**
   * Detect potential time spoofing based on time source data
   * @param sourceStatuses Status of all time sources
   * @param consensusTime The calculated consensus time
   * @returns Spoofing detection result
   */
  private async detectTimeSpoofing(
    sourceStatuses: TimeSourceStatus[],
    consensusTime: number
  ): Promise<SpoofingDetectionResult> {
    const signatures: SpoofingSignature[] = [];
    const affectedSources: TimeSourceType[] = [];
    
    // Check for inconsistency between sources
    const inconsistentSources = sourceStatuses.filter(
      status => status.available && !status.contributingToConsensus
    );
    
    if (inconsistentSources.length > 0) {
      signatures.push({
        signatureType: SpoofingSignatureType.INCONSISTENCY,
        severity: 70,
        description: `${inconsistentSources.length} sources have inconsistent time readings`
      });
      
      // Add affected source types
      inconsistentSources.forEach(source => {
        if (!affectedSources.includes(source.sourceType)) {
          affectedSources.push(source.sourceType);
        }
      });
    }
    
    // Check for sudden time jumps
    if (this.lastVerificationTime > 0) {
      const timeSinceLastCheck = Date.now() - this.lastVerificationTime;
      
      // Only check for jumps if within the detection window
      if (timeSinceLastCheck <= this.config.jumpDetectionWindowMs!) {
        for (const status of sourceStatuses) {
          if (!status.available) continue;
          
          const lastReportedTime = this.lastReportedTimes.get(status.sourceType + '-' + status.reportedTime);
          
          if (lastReportedTime) {
            const expectedElapsed = timeSinceLastCheck;
            const actualElapsed = status.reportedTime - lastReportedTime;
            const jumpMagnitude = Math.abs(actualElapsed - expectedElapsed);
            
            if (jumpMagnitude > this.config.jumpDetectionThresholdMs!) {
              signatures.push({
                signatureType: SpoofingSignatureType.JUMP,
                severity: 80,
                description: `Sudden time jump detected in ${status.sourceType}: ${jumpMagnitude}ms`
              });
              
              if (!affectedSources.includes(status.sourceType)) {
                affectedSources.push(status.sourceType);
              }
            }
          }
        }
      }
    }
    
    // Check for repeated timestamps
    const uniqueTimes = new Set(
      sourceStatuses
        .filter(status => status.available)
        .map(status => status.reportedTime)
    );
    
    if (uniqueTimes.size < sourceStatuses.filter(status => status.available).length) {
      signatures.push({
        signatureType: SpoofingSignatureType.REPEATED,
        severity: 60,
        description: 'Duplicate timestamps detected across different sources'
      });
    }
    
    // Determine if spoofing is detected based on signatures
    const spoofingDetected = signatures.length > 0;
    let confidenceInDetection = 0;
    
    if (spoofingDetected) {
      // Calculate confidence in detection based on signature severities
      const totalSeverity = signatures.reduce((sum, sig) => sum + sig.severity, 0);
      confidenceInDetection = Math.min(100, Math.round(totalSeverity / signatures.length));
    }
    
    return {
      spoofingDetected,
      detectionReason: spoofingDetected ? 
        `Detected ${signatures.length} spoofing signatures` : undefined,
      expectedTimeRangeMinMs: consensusTime - this.config.maxConsistentDeviationMs!,
      expectedTimeRangeMaxMs: consensusTime + this.config.maxConsistentDeviationMs!,
      detectedTimeMs: consensusTime,
      confidenceInDetection: spoofingDetected ? confidenceInDetection : undefined,
      affectedSources: affectedSources.length > 0 ? affectedSources : undefined,
      signatures: signatures.length > 0 ? signatures : undefined
    };
  }
  
  /**
   * Calculate the median of an array of numbers
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }
} 