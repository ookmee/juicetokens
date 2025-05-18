/**
 * JuiceTokens Foundation Layer
 * 
 * Provides core infrastructure abstractions for the JuiceTokens protocol:
 * - Time source management with multiple source types
 * - Time integrity verification for transactions
 * - Hardware capability detection (with mocks for testing)
 * - TEE simulation for testing
 */

// Export time module
export * from './time';

// Export hardware module
export * from './hardware';

// Export TEE module
export * from './tee'; 