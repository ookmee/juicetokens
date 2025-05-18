# JuiceTokens Core Adapters

This package provides a flexible adapter pattern framework for the JuiceTokens protocol, allowing seamless integration with different storage engines, network protocols, and hardware devices.

## Features

- **Adapter Interfaces**: Well-defined interfaces for Storage, Network, and Hardware adapters
- **Factory System**: Factory classes for adapter instantiation and management
- **Environment Detection**: Automatic detection of runtime environment for optimal adapter selection
- **Configuration System**: Flexible configuration options for all adapters
- **Platform Agnostic**: Works across browsers, Node.js, React Native, and Electron environments

## Usage

### Basic Usage

```typescript
import { 
  StorageAdapterFactory, 
  NetworkAdapterFactory, 
  initAdapters 
} from '@juicetokens/core-adapters';

// Register your adapters
StorageAdapterFactory.getInstance().register(myStorageAdapter);
NetworkAdapterFactory.getInstance().register(myNetworkAdapter);

// Initialize the adapter system with automatic environment detection
initAdapters();

// Use the default adapter for each type
const storage = StorageAdapterFactory.getInstance().getDefaultAdapter();
await storage.store('my-key', { data: 'example' });

const network = NetworkAdapterFactory.getInstance().getDefaultAdapter();
const response = await network.get('https://api.example.com/data');
```

### Configuration

```typescript
import { 
  initAdapters, 
  AdaptersConfig 
} from '@juicetokens/core-adapters';

const config: AdaptersConfig = {
  storage: [
    {
      id: 'local-storage',
      enabled: true,
      priority: 100,
      useEncryption: true,
      encryptionKey: 'your-secret-key'
    }
  ],
  network: [
    {
      id: 'axios-adapter',
      enabled: true,
      timeout: 5000,
      retryCount: 3
    }
  ],
  global: {
    autoSelectAdapters: true,
    logLevel: 'info'
  }
};

// Initialize with configuration
initAdapters(config);
```

### Custom Adapter Implementation

```typescript
import { StorageAdapter } from '@juicetokens/core-adapters';

// Implement the storage adapter interface
class MyCustomStorageAdapter implements StorageAdapter {
  readonly id = 'my-custom-storage';
  
  async store(key: string, data: any): Promise<void> {
    // Custom implementation
  }
  
  async retrieve(key: string): Promise<any> {
    // Custom implementation
  }
  
  async delete(key: string): Promise<void> {
    // Custom implementation
  }
  
  async exists(key: string): Promise<boolean> {
    // Custom implementation
  }
  
  async clear(): Promise<void> {
    // Custom implementation
  }
}

// Register your custom adapter
import { StorageAdapterFactory } from '@juicetokens/core-adapters';
const factory = StorageAdapterFactory.getInstance();
factory.register(new MyCustomStorageAdapter());
```

## API Reference

See the TypeScript interfaces and documentation in the source code for detailed API information. 