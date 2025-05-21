/**
 * JuiceTokens Foundation Layer
 *
 * Provides core infrastructure abstractions for the JuiceTokens protocol:
 * - Time source management with multiple source types
 * - Time integrity verification for transactions
 * - Hardware capability detection (with mocks for testing)
 * - TEE simulation for testing
 */
export * from './time';
export * from './hardware';
export * from './tee';
