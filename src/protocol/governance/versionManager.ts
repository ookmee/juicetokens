import * as protobuf from 'protobufjs';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface representing the ProtocolVersion message from the protocol buffer
 */
export interface IProtocolVersion {
  version: string;
  releaseNotes: string;
  releaseTimestampMs: number;
  changedComponents: string[];
  backwardsCompatible: boolean;
}

/**
 * Class that manages protocol versioning, updates, and compatibility
 */
export class VersionManager extends EventEmitter {
  private static instance: VersionManager;
  private currentVersion!: IProtocolVersion;
  private availableVersions: Map<string, IProtocolVersion> = new Map();
  private versionRoot!: protobuf.Root;
  private versionProto!: protobuf.Type;
  private initialized: boolean = false;

  private constructor() {
    super();
    // Make initialization non-blocking
    this.initialize().catch(err => {
      console.error('Failed to initialize VersionManager:', err);
    });
  }

  /**
   * Initialize the version manager
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadProtocolDefinitions();
      this.loadAvailableVersions();
      this.initialized = true;
    } catch (error) {
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
  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  /**
   * Create fallback type definitions for testing
   */
  private createFallbackTypes(): void {
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
    } catch (error) {
      console.error('Failed to create fallback types:', error);
    }
  }

  /**
   * Load protocol definitions from .proto files
   */
  private async loadProtocolDefinitions(): Promise<void> {
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
        throw new Error('VersionManager failed to initialize');
      }
    }
  }

  /**
   * Load all available versions from local storage or network
   */
  private loadAvailableVersions(): void {
    // In a real implementation, this might fetch from a distributed registry
    // For now, we'll just create a default version
    
    // Current version - in production this would be loaded from configuration
    const defaultVersion: IProtocolVersion = {
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
  public async getCurrentVersion(): Promise<IProtocolVersion> {
    await this.ensureInitialized();
    return this.currentVersion;
  }

  /**
   * Get all available protocol versions
   */
  public async getAvailableVersions(): Promise<IProtocolVersion[]> {
    await this.ensureInitialized();
    return Array.from(this.availableVersions.values());
  }

  /**
   * Check if an update is available
   */
  public async isUpdateAvailable(): Promise<boolean> {
    await this.ensureInitialized();
    
    // Compare current version with latest available
    const versions = Array.from(this.availableVersions.values());
    const latestVersion = versions.sort((a, b) => 
      this.compareVersions(b.version, a.version)
    )[0];
    
    return this.compareVersions(latestVersion.version, this.currentVersion.version) > 0;
  }

  /**
   * Compare two semantic versions
   * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
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
  public async updateToVersion(version: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.availableVersions.has(version)) {
      throw new Error(`Version ${version} is not available`);
    }

    const targetVersion = this.availableVersions.get(version)!;
    
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
  public async registerVersion(version: IProtocolVersion): Promise<void> {
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
  public async getChangedComponents(fromVersion: string, toVersion: string): Promise<string[]> {
    await this.ensureInitialized();
    
    if (!this.availableVersions.has(fromVersion) || !this.availableVersions.has(toVersion)) {
      throw new Error('One or both versions not available');
    }

    const targetVersion = this.availableVersions.get(toVersion)!;
    return targetVersion.changedComponents;
  }

  /**
   * Serialize a version to protocol buffer format
   */
  public async serializeVersion(version: IProtocolVersion): Promise<Uint8Array> {
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
  public async deserializeVersion(buffer: Uint8Array): Promise<IProtocolVersion> {
    await this.ensureInitialized();
    
    if (!this.versionProto) {
      throw new Error('Protocol definitions not loaded');
    }
    const decoded = this.versionProto.decode(buffer);
    return this.versionProto.toObject(decoded) as unknown as IProtocolVersion;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Release any resources that need to be released
    this.removeAllListeners();
  }
} 