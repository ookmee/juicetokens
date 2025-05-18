/**
 * Jest Configuration for JuiceTokens Test Environment
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // The root directory for Jest
  rootDir: '.',

  // Test files pattern
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/packages/**/*.test.ts'
  ],

  // Test setup file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Timeout for each test (in milliseconds)
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Coverage reporting
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'packages/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  // Reporters
  reporters: ['default'],

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    },
    TEST_ENV: 'development'
  }
}; 