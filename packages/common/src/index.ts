// Common utilities for the JuiceTokens protocol

// Example utility function
export function isValidDenomination(value: number): boolean {
  const validDenominations = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  return validDenominations.includes(value);
}

// Types
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds 