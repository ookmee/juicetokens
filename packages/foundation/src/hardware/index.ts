/**
 * Hardware capability abstraction module for JuiceTokens Foundation Layer
 */

// Export interfaces
export * from './interfaces';

// Export implementations
export * from './hardware-capability-detector';
export * from './mock-capability-provider-factory';

// Re-export common types for convenience
export { HardwareSecurityCapability } from './interfaces'; 