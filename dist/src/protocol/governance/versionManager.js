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
exports.VersionManager = void 0;
const protobuf = __importStar(require("protobufjs"));
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Class that manages protocol versioning, updates, and compatibility
 */
class VersionManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.availableVersions = new Map();
        this.initialized = false;
        // Make initialization non-blocking
        this.initialize().catch(err => {
            console.error('Failed to initialize VersionManager:', err);
        });
    }
    /**
     * Initialize the version manager
     */
    async initialize() {
        try {
            await this.loadProtocolDefinitions();
            this.loadAvailableVersions();
            this.initialized = true;
        }
        catch (error) {
            console.error('Version manager initialization failed:', error);
            // Create fallback version types for testing
            this.createFallbackTypes();
            this.loadAvailableVersions();
            this.initialized = true;
        }
    }
    /**
     * Get the singleton instance of the VersionManager
     */
    static getInstance() {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }
    /**
     * Create fallback type definitions for testing
     */
    createFallbackTypes() {
        try {
            this.versionRoot = new protobuf.Root();
            const ProtocolVersion = new protobuf.Type('ProtocolVersion')
                .add(new protobuf.Field('version', 1, 'string'))
                .add(new protobuf.Field('releaseNotes', 2, 'string'))
                .add(new protobuf.Field('releaseTimestampMs', 3, 'uint64'))
                .add(new protobuf.Field('changedComponents', 4, 'string', 'repeated'))
                .add(new protobuf.Field('backwardsCompatible', 5, 'bool'));
            this.versionRoot.define('juicetokens.governance').add(ProtocolVersion);
            this.versionProto = this.versionRoot.lookupType('juicetokens.governance.ProtocolVersion');
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
            // Load the versioning proto file
            this.versionRoot = new protobuf.Root();
            // Fix: Use correct path
            const protoPath = path.resolve(__dirname, '../../../protos/governance/versioning.proto');
            // Verify file exists before attempting to load
            if (!fs.existsSync(protoPath)) {
                console.warn(`Proto file not found: ${protoPath}. Using fallback types.`);
                this.createFallbackTypes();
                return;
            }
            // Load the protocol buffer definitions
            await this.versionRoot.load(protoPath, { keepCase: false });
            this.versionProto = this.versionRoot.lookupType('juicetokens.governance.ProtocolVersion');
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
                throw new Error('VersionManager failed to initialize');
            }
        }
    }
    /**
     * Load all available versions from local storage or network
     */
    loadAvailableVersions() {
        // In a real implementation, this might fetch from a distributed registry
        // For now, we'll just create a default version
        // Current version - in production this would be loaded from configuration
        const defaultVersion = {
            version: '0.1.0',
            releaseNotes: 'Initial protocol version',
            releaseTimestampMs: Date.now(),
            changedComponents: ['foundation', 'transport', 'token'],
            backwardsCompatible: true
        };
        this.availableVersions.set(defaultVersion.version, defaultVersion);
        this.currentVersion = defaultVersion;
    }
    /**
     * Get the current protocol version
     */
    async getCurrentVersion() {
        await this.ensureInitialized();
        return this.currentVersion;
    }
    /**
     * Get all available protocol versions
     */
    async getAvailableVersions() {
        await this.ensureInitialized();
        return Array.from(this.availableVersions.values());
    }
    /**
     * Check if an update is available
     */
    async isUpdateAvailable() {
        await this.ensureInitialized();
        // Compare current version with latest available
        const versions = Array.from(this.availableVersions.values());
        const latestVersion = versions.sort((a, b) => this.compareVersions(b.version, a.version))[0];
        return this.compareVersions(latestVersion.version, this.currentVersion.version) > 0;
    }
    /**
     * Compare two semantic versions
     * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    compareVersions(v1, v2) {
        const v1parts = v1.split('.').map(Number);
        const v2parts = v2.split('.').map(Number);
        for (let i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }
            if (v1parts[i] === v2parts[i]) {
                continue;
            }
            return v1parts[i] > v2parts[i] ? 1 : -1;
        }
        return v1parts.length === v2parts.length ? 0 : -1;
    }
    /**
     * Update to a specific version
     * @param version The version to update to
     */
    async updateToVersion(version) {
        await this.ensureInitialized();
        if (!this.availableVersions.has(version)) {
            throw new Error(`Version ${version} is not available`);
        }
        const targetVersion = this.availableVersions.get(version);
        // Check compatibility
        if (this.compareVersions(targetVersion.version, this.currentVersion.version) < 0 &&
            !targetVersion.backwardsCompatible) {
            throw new Error(`Cannot downgrade to incompatible version ${version}`);
        }
        // Perform update logic here
        // This would typically involve downloading new protocol definitions,
        // updating configuration, and possibly restarting services
        // For now, just update the current version
        this.currentVersion = targetVersion;
        // Emit an update event
        this.emit('versionUpdated', this.currentVersion);
        return true;
    }
    /**
     * Register a new version in the system
     * @param version Version details
     */
    async registerVersion(version) {
        await this.ensureInitialized();
        // Validate the version
        if (this.versionProto) {
            const error = this.versionProto.verify(version);
            if (error) {
                throw new Error(`Invalid version format: ${error}`);
            }
        }
        // Add to available versions
        this.availableVersions.set(version.version, version);
        // Emit a version added event
        this.emit('versionAdded', version);
    }
    /**
     * Get components that changed between two versions
     */
    async getChangedComponents(fromVersion, toVersion) {
        await this.ensureInitialized();
        if (!this.availableVersions.has(fromVersion) || !this.availableVersions.has(toVersion)) {
            throw new Error('One or both versions not available');
        }
        const targetVersion = this.availableVersions.get(toVersion);
        return targetVersion.changedComponents;
    }
    /**
     * Serialize a version to protocol buffer format
     */
    async serializeVersion(version) {
        await this.ensureInitialized();
        if (!this.versionProto) {
            throw new Error('Protocol definitions not loaded');
        }
        const message = this.versionProto.create(version);
        return this.versionProto.encode(message).finish();
    }
    /**
     * Deserialize a protocol buffer to a version object
     */
    async deserializeVersion(buffer) {
        await this.ensureInitialized();
        if (!this.versionProto) {
            throw new Error('Protocol definitions not loaded');
        }
        const decoded = this.versionProto.decode(buffer);
        return this.versionProto.toObject(decoded);
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        // Release any resources that need to be released
        this.removeAllListeners();
    }
}
exports.VersionManager = VersionManager;
//# sourceMappingURL=versionManager.js.map