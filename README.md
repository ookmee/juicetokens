# JuiceTokens

A monorepo containing all JuiceTokens components:
- Protocol definitions and shared types
- Progressive Web App (PWA)
- Flutter mobile application

## Project Structure

```
juicetokens/
├── packages/
│   ├── protocol/           # Protocol definitions and shared types
│   │   ├── proto/         # Protobuf definitions
│   │   └── src/           # Generated TypeScript types
│   ├── pwa/               # Progressive Web App
│   │   ├── src/
│   │   └── public/
│   └── flutter/           # Flutter mobile app
│       ├── lib/
│       └── test/
├── tools/                 # Shared development tools
│   ├── scripts/
│   └── config/
├── .github/              # CI/CD workflows
├── docker/              # Docker configurations
└── docs/               # Project documentation
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build all packages:
   ```bash
   npm run build
   ```

3. Run development servers:
   ```bash
   npm run dev
   ```

## Testing

Run tests for all packages:
```bash
npm test
```

## Building for Production

Build all packages for production:
```bash
npm run build
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
