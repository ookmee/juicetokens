"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = exports.AlertStatus = exports.SystemStatus = void 0;
const protobuf = __importStar(require("protobufjs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const events_1 = require("events");
/**
 * System status enum matching the one in the protocol buffer
 */
var SystemStatus;
(function (SystemStatus) {
    SystemStatus[SystemStatus["HEALTHY"] = 0] = "HEALTHY";
    SystemStatus[SystemStatus["DEGRADED"] = 1] = "DEGRADED";
    SystemStatus[SystemStatus["CRITICAL"] = 2] = "CRITICAL";
    SystemStatus[SystemStatus["MAINTENANCE"] = 3] = "MAINTENANCE";
})(SystemStatus || (exports.SystemStatus = SystemStatus = {}));
/**
 * Alert status enum matching the one in the protocol buffer
 */
var AlertStatus;
(function (AlertStatus) {
    AlertStatus[AlertStatus["FIRING"] = 0] = "FIRING";
    AlertStatus[AlertStatus["RESOLVED"] = 1] = "RESOLVED";
    AlertStatus[AlertStatus["ACKNOWLEDGED"] = 2] = "ACKNOWLEDGED";
    AlertStatus[AlertStatus["SILENCED"] = 3] = "SILENCED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
/**
 * Service for monitoring system health and collecting metrics
 */
class MonitoringService extends events_1.EventEmitter {
    constructor() {
        super();
        this.alerts = new Map();
        this.collectInterval = null;
        this.initialized = false;
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
    async initialize() {
        try {
            await this.loadProtocolDefinitions();
            this.initialized = true;
        }
        catch (error) {
            console.error('Monitoring service initialization failed:', error);
            // Create fallback types for testing
            this.createFallbackTypes();
            this.initialized = true;
        }
    }
    /**
     * Generate a unique instance ID
     */
    generateInstanceId() {
        return `node-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
    /**
     * Get the singleton instance of the MonitoringService
     */
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    /**
     * Create fallback type definitions for testing
     */
    createFallbackTypes() {
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
        }
        catch (error) {
            console.error('Failed to create fallback types:', error);
        }
    }
    /**
     * Load protocol definitions from .proto files
     */
    async loadProtocolDefinitions() {
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
        }
        catch (error) {
            console.error('Failed to load protocol definitions:', error);
            // Create fallback for testing
            this.createFallbackTypes();
        }
    }
    /**
     * Wait for initialization to complete
     */
    async ensureInitialized() {
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
    async configure(config) {
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
    async startCollection() {
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
    stopCollection() {
        if (this.collectInterval) {
            clearInterval(this.collectInterval);
            this.collectInterval = null;
        }
    }
    /**
     * Collect metrics from various system components
     */
    collectMetrics() {
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
    collectSystemMetrics() {
        // This is where you would integrate with Node.js metrics
        // For now, just add some example metrics
        const cpuMetric = {
            metricId: 'system.cpu.usage',
            component: 'system',
            metricType: 'gauge',
            value: Math.random() * 100,
            unit: 'percent',
            timestampMs: Date.now(),
            severity: 0
        };
        const memoryMetric = {
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
    collectBusinessMetrics() {
        // In a real implementation, these would be collected from actual system components
        const businessMetrics = {
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
    collectNetworkMetrics() {
        // In a real implementation, these would be collected from network monitoring
        const performanceMetrics = {
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
    evaluateAlerts() {
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
        }
        else {
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
    triggerAlert(alert) {
        const existingAlert = this.alerts.get(alert.alertId);
        if (existingAlert && existingAlert.status === AlertStatus.FIRING) {
            // Update existing alert
            existingAlert.lastUpdatedMs = alert.lastUpdatedMs;
            existingAlert.currentValue = alert.currentValue;
            this.alerts.set(alert.alertId, existingAlert);
        }
        else {
            // Create new alert
            this.alerts.set(alert.alertId, alert);
            this.emit('alertFired', alert);
        }
    }
    /**
     * Update the overall system status based on active alerts
     */
    updateSystemStatus() {
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
    async getSystemHealth() {
        await this.ensureInitialized();
        return this.systemHealth;
    }
    /**
     * Get active alerts
     */
    async getActiveAlerts() {
        await this.ensureInitialized();
        return Array.from(this.alerts.values()).filter(alert => alert.status === AlertStatus.FIRING);
    }
    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId) {
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
    async silenceAlert(alertId) {
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
    async serializeSystemHealth() {
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
    async deserializeSystemHealth(buffer) {
        await this.ensureInitialized();
        if (!this.systemHealthType) {
            throw new Error('Protocol definitions not loaded');
        }
        const decoded = this.systemHealthType.decode(buffer);
        return this.systemHealthType.toObject(decoded);
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopCollection();
        this.removeAllListeners();
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=monitoringService.js.map