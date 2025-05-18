import * as protobuf from 'protobufjs';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

/**
 * System status enum matching the one in the protocol buffer
 */
export enum SystemStatus {
  HEALTHY = 0,
  DEGRADED = 1,
  CRITICAL = 2,
  MAINTENANCE = 3
}

/**
 * Alert status enum matching the one in the protocol buffer
 */
export enum AlertStatus {
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
export class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private configuration: IMonitoringConfiguration;
  private systemHealth: ISystemHealth;
  private alerts: Map<string, IAlert> = new Map();
  private collectInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;
  
  private monitoringRoot!: protobuf.Root;
  private systemHealthType!: protobuf.Type;
  private healthMetricType!: protobuf.Type;
  private alertType!: protobuf.Type;
  private businessMetricsType!: protobuf.Type;
  private performanceMetricsType!: protobuf.Type;
  
  private constructor() {
    super();
    
    // Initialize with default configuration
    this.configuration = {
      metricCollectionIntervalSeconds: 60,
      collectSystemMetrics: true,
      collectBusinessMetrics: true,
      collectNetworkMetrics: true,
      retentionDays: 30,
      enabledAlerts: ['critical', 'error']
    };
    
    // Initialize system health
    this.systemHealth = {
      instanceId: this.generateInstanceId(),
      version: '0.1.0',
      timestampMs: Date.now(),
      metrics: {},
      status: SystemStatus.HEALTHY
    };
    
    // Make initialization non-blocking
    this.initialize().catch(err => {
      console.error('Failed to initialize MonitoringService:', err);
    });
  }
  
  /**
   * Initialize the monitoring service
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadProtocolDefinitions();
      this.initialized = true;
    } catch (error) {
      console.error('Monitoring service initialization failed:', error);
      // Create fallback types for testing
      this.createFallbackTypes();
      this.initialized = true;
    }
  }
  
  /**
   * Generate a unique instance ID
   */
  private generateInstanceId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Get the singleton instance of the MonitoringService
   */
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  /**
   * Create fallback type definitions for testing
   */
  private createFallbackTypes(): void {
    try {
      this.monitoringRoot = new protobuf.Root();
      const namespace = this.monitoringRoot.define('juicetokens.governance');
      
      // Create HealthMetric message type
      const HealthMetric = new protobuf.Type('HealthMetric')
        .add(new protobuf.Field('metricId', 1, 'string'))
        .add(new protobuf.Field('component', 2, 'string'))
        .add(new protobuf.Field('metricType', 3, 'string'))
        .add(new protobuf.Field('value', 4, 'double'))
        .add(new protobuf.Field('unit', 5, 'string'))
        .add(new protobuf.Field('timestampMs', 6, 'uint64'))
        .add(new protobuf.Field('severity', 7, 'uint32'));
      
      // Create SystemStatus enum
      const SystemStatusEnum = new protobuf.Enum('SystemStatus')
        .add('HEALTHY', 0)
        .add('DEGRADED', 1)
        .add('CRITICAL', 2)
        .add('MAINTENANCE', 3);
      
      // Create SystemHealth message type
      const SystemHealth = new protobuf.Type('SystemHealth')
        .add(new protobuf.Field('instanceId', 1, 'string'))
        .add(new protobuf.Field('version', 2, 'string'))
        .add(new protobuf.Field('timestampMs', 3, 'uint64'))
        .add(new protobuf.MapField('metrics', 4, 'string', 'juicetokens.governance.HealthMetric'))
        .add(new protobuf.Field('status', 5, 'juicetokens.governance.SystemStatus'));
      
      // Create Alert message type
      const AlertStatusEnum = new protobuf.Enum('AlertStatus')
        .add('FIRING', 0)
        .add('RESOLVED', 1)
        .add('ACKNOWLEDGED', 2)
        .add('SILENCED', 3);
      
      const Alert = new protobuf.Type('Alert')
        .add(new protobuf.Field('alertId', 1, 'string'))
        .add(new protobuf.Field('instanceId', 2, 'string'))
        .add(new protobuf.Field('startTimestampMs', 3, 'uint64'))
        .add(new protobuf.Field('lastUpdatedMs', 4, 'uint64'))
        .add(new protobuf.Field('currentValue', 5, 'string'))
        .add(new protobuf.Field('severity', 6, 'uint32'))
        .add(new protobuf.Field('status', 7, 'juicetokens.governance.AlertStatus'));
      
      // Create BusinessMetrics message type
      const BusinessMetrics = new protobuf.Type('BusinessMetrics')
        .add(new protobuf.Field('activeUsers', 1, 'uint32'))
        .add(new protobuf.Field('tokenTransactions', 2, 'uint32'))
        .add(new protobuf.Field('tokenVolume', 3, 'uint64'))
        .add(new protobuf.Field('newUsers', 4, 'uint32'))
        .add(new protobuf.Field('renewalsProcessed', 5, 'uint32'))
        .add(new protobuf.Field('attestationsCreated', 6, 'uint32'))
        .add(new protobuf.Field('timestampMs', 7, 'uint64'))
        .add(new protobuf.MapField('customMetrics', 8, 'string', 'double'));
      
      // Create PerformanceMetrics message type
      const PerformanceMetrics = new protobuf.Type('PerformanceMetrics')
        .add(new protobuf.Field('component', 1, 'string'))
        .add(new protobuf.Field('averageResponseTimeMs', 2, 'double'))
        .add(new protobuf.Field('p95ResponseTimeMs', 3, 'double'))
        .add(new protobuf.Field('p99ResponseTimeMs', 4, 'double'))
        .add(new protobuf.Field('requestRate', 5, 'double'))
        .add(new protobuf.Field('errorRate', 6, 'double'))
        .add(new protobuf.Field('timestampMs', 7, 'uint64'));
      
      // Add all types to namespace
      namespace.add(HealthMetric);
      namespace.add(SystemStatusEnum);
      namespace.add(SystemHealth);
      namespace.add(AlertStatusEnum);
      namespace.add(Alert);
      namespace.add(BusinessMetrics);
      namespace.add(PerformanceMetrics);
      
      // Set the types
      this.systemHealthType = this.monitoringRoot.lookupType('juicetokens.governance.SystemHealth');
      this.healthMetricType = this.monitoringRoot.lookupType('juicetokens.governance.HealthMetric');
      this.alertType = this.monitoringRoot.lookupType('juicetokens.governance.Alert');
      this.businessMetricsType = this.monitoringRoot.lookupType('juicetokens.governance.BusinessMetrics');
      this.performanceMetricsType = this.monitoringRoot.lookupType('juicetokens.governance.PerformanceMetrics');
    } catch (error) {
      console.error('Failed to create fallback types:', error);
    }
  }
  
  /**
   * Load protocol definitions from .proto files
   */
  private async loadProtocolDefinitions(): Promise<void> {
    try {
      // Load the monitoring proto file
      this.monitoringRoot = new protobuf.Root();
      // Fix: Use correct path
      const protoPath = path.resolve(__dirname, '../../../protos/governance/monitoring.proto');
      
      // Verify file exists before attempting to load
      if (!fs.existsSync(protoPath)) {
        console.warn(`Proto file not found: ${protoPath}. Using fallback types.`);
        this.createFallbackTypes();
        return;
      }
      
      // Load the protocol buffer definitions
      await this.monitoringRoot.load(protoPath, { keepCase: false });
      
      // Look up the message types
      this.systemHealthType = this.monitoringRoot.lookupType('juicetokens.governance.SystemHealth');
      this.healthMetricType = this.monitoringRoot.lookupType('juicetokens.governance.HealthMetric');
      this.alertType = this.monitoringRoot.lookupType('juicetokens.governance.Alert');
      this.businessMetricsType = this.monitoringRoot.lookupType('juicetokens.governance.BusinessMetrics');
      this.performanceMetricsType = this.monitoringRoot.lookupType('juicetokens.governance.PerformanceMetrics');
    } catch (error) {
      console.error('Failed to load protocol definitions:', error);
      
      // Create fallback for testing
      this.createFallbackTypes();
    }
  }
  
  /**
   * Wait for initialization to complete
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      // Wait for initialization with a timeout
      let attempts = 0;
      while (!this.initialized && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.initialized) {
        throw new Error('MonitoringService failed to initialize');
      }
    }
  }
  
  /**
   * Configure the monitoring service
   */
  public async configure(config: Partial<IMonitoringConfiguration>): Promise<void> {
    await this.ensureInitialized();
    
    this.configuration = { ...this.configuration, ...config };
    
    // Restart collection if interval changed
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.startCollection();
    }
  }
  
  /**
   * Start collecting metrics
   */
  public async startCollection(): Promise<void> {
    await this.ensureInitialized();
    
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
    }
    
    this.collectInterval = setInterval(() => {
      this.collectMetrics();
    }, this.configuration.metricCollectionIntervalSeconds * 1000);
    
    // Collect immediately on start
    this.collectMetrics();
  }
  
  /**
   * Stop collecting metrics
   */
  public stopCollection(): void {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }
  }
  
  /**
   * Collect metrics from various system components
   */
  private collectMetrics(): void {
    const now = Date.now();
    
    // Update timestamp
    this.systemHealth.timestampMs = now;
    
    // Collect system metrics if enabled
    if (this.configuration.collectSystemMetrics) {
      this.collectSystemMetrics();
    }
    
    // Collect business metrics if enabled
    if (this.configuration.collectBusinessMetrics) {
      this.collectBusinessMetrics();
    }
    
    // Collect network metrics if enabled
    if (this.configuration.collectNetworkMetrics) {
      this.collectNetworkMetrics();
    }
    
    // Check for alert conditions
    this.evaluateAlerts();
    
    // Emit metrics collected event
    this.emit('metricsCollected', this.systemHealth);
  }
  
  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    // This is where you would integrate with Node.js metrics
    // For now, just add some example metrics
    
    const cpuMetric: IHealthMetric = {
      metricId: 'system.cpu.usage',
      component: 'system',
      metricType: 'gauge',
      value: Math.random() * 100,
      unit: 'percent',
      timestampMs: Date.now(),
      severity: 0
    };
    
    const memoryMetric: IHealthMetric = {
      metricId: 'system.memory.usage',
      component: 'system',
      metricType: 'gauge',
      value: Math.random() * 100,
      unit: 'percent',
      timestampMs: Date.now(),
      severity: 0
    };
    
    // Update metrics in system health
    this.systemHealth.metrics[cpuMetric.metricId] = cpuMetric;
    this.systemHealth.metrics[memoryMetric.metricId] = memoryMetric;
  }
  
  /**
   * Collect business metrics
   */
  private collectBusinessMetrics(): void {
    // In a real implementation, these would be collected from actual system components
    const businessMetrics: IBusinessMetrics = {
      activeUsers: Math.floor(Math.random() * 100),
      tokenTransactions: Math.floor(Math.random() * 1000),
      tokenVolume: Math.floor(Math.random() * 10000),
      newUsers: Math.floor(Math.random() * 10),
      renewalsProcessed: Math.floor(Math.random() * 50),
      attestationsCreated: Math.floor(Math.random() * 30),
      timestampMs: Date.now(),
      customMetrics: {}
    };
    
    // Emit business metrics event
    this.emit('businessMetrics', businessMetrics);
  }
  
  /**
   * Collect network metrics
   */
  private collectNetworkMetrics(): void {
    // In a real implementation, these would be collected from network monitoring
    const performanceMetrics: IPerformanceMetrics = {
      component: 'network',
      averageResponseTimeMs: Math.random() * 100,
      p95ResponseTimeMs: Math.random() * 200,
      p99ResponseTimeMs: Math.random() * 300,
      requestRate: Math.random() * 50,
      errorRate: Math.random() * 0.05,
      timestampMs: Date.now()
    };
    
    // Emit performance metrics event
    this.emit('performanceMetrics', performanceMetrics);
  }
  
  /**
   * Evaluate alert conditions and trigger alerts
   */
  private evaluateAlerts(): void {
    const now = Date.now();
    
    // Check CPU usage alert
    const cpuMetric = this.systemHealth.metrics['system.cpu.usage'];
    if (cpuMetric && cpuMetric.value > 90) {
      this.triggerAlert({
        alertId: 'high-cpu-usage',
        instanceId: this.systemHealth.instanceId,
        startTimestampMs: now,
        lastUpdatedMs: now,
        currentValue: cpuMetric.value.toString(),
        severity: 2, // Error
        status: AlertStatus.FIRING
      });
    } else {
      // Resolve the alert if it was firing
      const existingAlert = this.alerts.get('high-cpu-usage');
      if (existingAlert && existingAlert.status === AlertStatus.FIRING) {
        existingAlert.status = AlertStatus.RESOLVED;
        existingAlert.lastUpdatedMs = now;
        this.alerts.set('high-cpu-usage', existingAlert);
        this.emit('alertResolved', existingAlert);
      }
    }
    
    // Update system status based on active alerts
    this.updateSystemStatus();
  }
  
  /**
   * Trigger an alert
   */
  private triggerAlert(alert: IAlert): void {
    const existingAlert = this.alerts.get(alert.alertId);
    
    if (existingAlert && existingAlert.status === AlertStatus.FIRING) {
      // Update existing alert
      existingAlert.lastUpdatedMs = alert.lastUpdatedMs;
      existingAlert.currentValue = alert.currentValue;
      this.alerts.set(alert.alertId, existingAlert);
    } else {
      // Create new alert
      this.alerts.set(alert.alertId, alert);
      this.emit('alertFired', alert);
    }
  }
  
  /**
   * Update the overall system status based on active alerts
   */
  private updateSystemStatus(): void {
    let worstStatus = SystemStatus.HEALTHY;
    
    // Find the most severe alert status
    for (const alert of this.alerts.values()) {
      if (alert.status !== AlertStatus.FIRING) {
        continue;
      }
      
      switch (alert.severity) {
        case 3: // Critical
          worstStatus = SystemStatus.CRITICAL;
          break;
        case 2: // Error
          if (worstStatus < SystemStatus.CRITICAL) {
            worstStatus = SystemStatus.DEGRADED;
          }
          break;
        case 1: // Warning
          if (worstStatus < SystemStatus.DEGRADED) {
            worstStatus = SystemStatus.DEGRADED;
          }
          break;
      }
    }
    
    // Update system status
    if (this.systemHealth.status !== worstStatus) {
      this.systemHealth.status = worstStatus;
      this.emit('statusChanged', worstStatus);
    }
  }
  
  /**
   * Get current system health
   */
  public async getSystemHealth(): Promise<ISystemHealth> {
    await this.ensureInitialized();
    return this.systemHealth;
  }
  
  /**
   * Get active alerts
   */
  public async getActiveAlerts(): Promise<IAlert[]> {
    await this.ensureInitialized();
    return Array.from(this.alerts.values()).filter(
      alert => alert.status === AlertStatus.FIRING
    );
  }
  
  /**
   * Acknowledge an alert
   */
  public async acknowledgeAlert(alertId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === AlertStatus.FIRING) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.lastUpdatedMs = Date.now();
      this.alerts.set(alertId, alert);
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }
  
  /**
   * Silence an alert
   */
  public async silenceAlert(alertId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === AlertStatus.FIRING) {
      alert.status = AlertStatus.SILENCED;
      alert.lastUpdatedMs = Date.now();
      this.alerts.set(alertId, alert);
      this.emit('alertSilenced', alert);
      return true;
    }
    return false;
  }
  
  /**
   * Serialize system health to protocol buffer format
   */
  public async serializeSystemHealth(): Promise<Uint8Array> {
    await this.ensureInitialized();
    
    if (!this.systemHealthType) {
      throw new Error('Protocol definitions not loaded');
    }
    const message = this.systemHealthType.create(this.systemHealth);
    return this.systemHealthType.encode(message).finish();
  }
  
  /**
   * Deserialize protocol buffer to system health object
   */
  public async deserializeSystemHealth(buffer: Uint8Array): Promise<ISystemHealth> {
    await this.ensureInitialized();
    
    if (!this.systemHealthType) {
      throw new Error('Protocol definitions not loaded');
    }
    const decoded = this.systemHealthType.decode(buffer);
    return this.systemHealthType.toObject(decoded) as unknown as ISystemHealth;
  }
  
  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopCollection();
    this.removeAllListeners();
  }
} 