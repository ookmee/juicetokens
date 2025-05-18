# JuiceTokens Protocol Implementation

This repository contains a TypeScript implementation of the JuiceTokens protocol, a layered architecture that enables peer-to-peer value exchange with unique properties such as token denominations, telomere tracking, and a psychosocial development framework.

## Project Structure

The project is organized as a monorepo with the following packages:

- **common**: Shared utilities and types
- **proto**: Protocol Buffer definitions
- **foundation**: Layer 1 - Core Infrastructure
- **transport**: Layer 2 - Communication Protocol Stack
- **token**: Layer 3 - Value Representation
- **trust**: Layer 4 - Reputation Framework
- **lifecycle**: Layer 5 - Temporal Value Management
- **extension**: Layer 6 - Application Integration Points
- **governance**: Layer 7 - System Evolution Framework
- **app**: Main application entry point

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 7 or higher
- Docker (optional, for containerized development)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/juicetokens.git
cd juicetokens
npm install
```

### Build

Build the TypeScript code and Protocol Buffer definitions:

```bash
npm run build
```

### Run

Start the application:

```bash
npm start
```

Or using Docker:

```bash
npm run start:detached
```

## Development

### Adding Protocol Buffer Definitions

1. Add `.proto` files to the appropriate subdirectory in the `protos/` directory
2. Run `npm run build:proto` to generate TypeScript types

### Running Tests

```bash
npm test
```

## Docker Support

The project includes Docker support for easy deployment and testing:

```bash
# Build and start the Docker container
npm run start:detached

# Stop the Docker container
npm run stop
```

## License

[Add License Information]
