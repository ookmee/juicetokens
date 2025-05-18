# JuiceTokens Documentation

Welcome to the JuiceTokens documentation. This repository contains comprehensive documentation for the JuiceTokens system, a secure and reliable token protocol.

## Documentation Structure

### Architecture
- [System Architecture](architecture/system-architecture.md): Overview of the JuiceTokens architecture and components

### Setup
- [Installation Guide](setup/installation.md): Instructions for setting up and running JuiceTokens

### API Documentation
- [TypeScript Adapters](api/typescript-adapters.md): API documentation for all TypeScript adapters

### Testing
- [Testing Procedures](testing/testing-procedures.md): How to test the JuiceTokens system
- [Integration Tests](../tests/integration/README.md): Information about integration tests

### Troubleshooting
- [Troubleshooting Guide](troubleshooting/troubleshooting-guide.md): Solutions for common issues

## Quick Links

### Getting Started
1. [Installation Guide](setup/installation.md)
2. [System Architecture](architecture/system-architecture.md)

### Development
1. [TypeScript Adapters](api/typescript-adapters.md)
2. [Testing Procedures](testing/testing-procedures.md)

### Operations
1. [Troubleshooting Guide](troubleshooting/troubleshooting-guide.md)

## Running Tests

To run the comprehensive integration tests:

```bash
# Run integration tests in Docker
bash tests/integration/run-integration-tests.sh
```

See the [Testing Procedures](testing/testing-procedures.md) document for more information.

## System Overview

JuiceTokens is built on a layered architecture:

1. **Foundation Layer**: Storage, cryptography, and time synchronization
2. **Transport Layer**: Communication channels between nodes
3. **Token Layer**: Token operations and transactions
4. **Trust Layer**: Attestations and trust verification
5. **Lifecycle Layer**: Token creation, renewal, and expiration
6. **Extension Layer**: Plugin architecture
7. **Governance Layer**: Monitoring and system management

Each layer has a well-defined API and communicates with adjacent layers through clearly defined interfaces.

## Contributing

Please see the [Contributing Guide](../CONTRIBUTING.md) for information on how to contribute to the project. 