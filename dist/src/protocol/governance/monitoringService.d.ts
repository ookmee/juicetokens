import { EventEmitter } from 'events';
/**
 * System status enum matching the one in the protocol buffer
 */
export declare enum SystemStatus {
    HEALTHY = 0,
    DEGRADED = 1,
    CRITICAL = 2,
    MAINTENANCE = 3
}
/**
 * Alert status enum matching the one in the protocol buffer
 */
export declare enum AlertStatus {
    FIRING = 0,
    RESOLVED = 1,
    ACKNOWLEDGED = 2,
    SILENCED = 3
}
/**
 * Interface for health metrics
 */
export interface IHealthMetric {
    metricId: string;
    component: string;
    metricType: string;
    value: number;
    unit: string;
    timestampMs: number;
    severity: number;
}
/**
 * Interface for system health
 */
export interface ISystemHealth {
    instanceId: string;
    version: string;
    timestampMs: number;
    metrics: Record<string, IHealthMetric>;
    status: SystemStatus;
}
/**
 * Interface for performance metrics
 */
export interface IPerformanceMetrics {
    component: string;
    averageResponseTimeMs: number;
    p95ResponseTimeMs: number;
    p99ResponseTimeMs: number;
    requestRate: number;
    errorRate: number;
    timestampMs: number;
}
/**
 * Interface for business metrics
 */
export interface IBusinessMetrics {
    activeUsers: number;
    tokenTransactions: number;
    tokenVolume: number;
    newUsers: number;
    renewalsProcessed: number;
    attestationsCreated: number;
    timestampMs: number;
    customMetrics: Record<string, number>;
}
/**
 * Interface for an alert
 */
export interface IAlert {
    alertId: string;
    instanceId: string;
    startTimestampMs: number;
    lastUpdatedMs: number;
    currentValue: string;
    severity: number;
    status: AlertStatus;
}
/**
 * Monitoring service configuration interface
 */
export interface IMonitoringConfiguration {
    metricCollectionIntervalSeconds: number;
    collectSystemMetrics: boolean;
    collectBusinessMetrics: boolean;
    collectNetworkMetrics: boolean;
    retentionDays: number;
    enabledAlerts: string[];
}
/**
 * Service for monitoring system health and collecting metrics
 */
export declare class MonitoringService extends EventEmitter {
    private static instance;
    private configuration;
    private systemHealth;
    private alerts;
    private collectInterval;
    private initialized;
    private monitoringRoot;
    private systemHealthType;
    private healthMetricType;
    private alertType;
    private businessMetricsType;
    private performanceMetricsType;
    private constructor();
    /**
     * Initialize the monitoring service
     */
    private initialize;
    /**
     * Generate a unique instance ID
     */
    private generateInstanceId;
    /**
     * Get the singleton instance of the MonitoringService
     */
    static getInstance(): MonitoringService;
    /**
     * Create fallback type definitions for testing
     */
    private createFallbackTypes;
    /**
     * Load protocol definitions from .proto files
     */
    private loadProtocolDefinitions;
    /**
     * Wait for initialization to complete
     */
    private ensureInitialized;
    /**
     * Configure the monitoring service
     */
    configure(config: Partial<IMonitoringConfiguration>): Promise<void>;
    /**
     * Start collecting metrics
     */
    startCollection(): Promise<void>;
    /**
     * Stop collecting metrics
     */
    stopCollection(): void;
    /**
     * Collect metrics from various system components
     */
    private collectMetrics;
    /**
     * Collect system metrics
     */
    private collectSystemMetrics;
    /**
     * Collect business metrics
     */
    private collectBusinessMetrics;
    /**
     * Collect network metrics
     */
    private collectNetworkMetrics;
    /**
     * Evaluate alert conditions and trigger alerts
     */
    private evaluateAlerts;
    /**
     * Trigger an alert
     */
    private triggerAlert;
    /**
     * Update the overall system status based on active alerts
     */
    private updateSystemStatus;
    /**
     * Get current system health
     */
    getSystemHealth(): Promise<ISystemHealth>;
    /**
     * Get active alerts
     */
    getActiveAlerts(): Promise<IAlert[]>;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): Promise<boolean>;
    /**
     * Silence an alert
     */
    silenceAlert(alertId: string): Promise<boolean>;
    /**
     * Serialize system health to protocol buffer format
     */
    serializeSystemHealth(): Promise<Uint8Array>;
    /**
     * Deserialize protocol buffer to system health object
     */
    deserializeSystemHealth(buffer: Uint8Array): Promise<ISystemHealth>;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
