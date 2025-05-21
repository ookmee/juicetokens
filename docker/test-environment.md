# JuiceTokens Dynamic Docker Test Environment

## Overview

This document outlines the architecture for a dynamic Docker-based test environment that:
1. Uses MongoDB for persistence as a precursor for IndexedDB and native storage
2. Enables communication between Docker containers for testing multi-user scenarios
3. Provides a complete service provider implementation
4. Supports dynamically spawning containers for test users via a web interface

## Architecture Components

### 1. Container Orchestration

```
┌─────────────────────────────────────────────────┐
│                API Gateway                      │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│           Container Manager                      │
└───┬───────────────┬──────────────┬──────────────┘
    │               │              │
┌───▼───┐       ┌───▼───┐      ┌───▼───┐
│User A │       │User B │      │User C │
│Docker │       │Docker │      │Docker │
└───┬───┘       └───┬───┘      └───┬───┘
    │               │              │
┌───▼───────────────▼──────────────▼───┐
│             MongoDB                  │
└─────────────────────────────────────┘
```

### 2. MongoDB Persistence Layer

- Serves as a shared persistence layer between containers
- Maps to the DHT storage interface
- Provides collections for:
  - User profiles
  - Token records
  - Transaction history
  - Test data

### 3. Service Provider Implementation

- Completes the stub in `/public/js/service-provider.js`
- Registers both mock and real implementations
- Provides container-aware configuration
- Routes service calls to appropriate implementations

### 4. Dynamic User Container Spawning

- Web interface at test.juicetokens.com
- User registration flow
- Container provisioning API
- Container lifecycle management

## Implementation Plan

### Phase 1: Infrastructure Setup

1. **Docker Compose Environment**
   - Base container image with JuiceTokens core
   - MongoDB service
   - Container manager service
   - API gateway

2. **MongoDB Schema Design**
   - Map protocol buffer models to MongoDB schema
   - Implement indexes for efficient querying
   - Setup data persistence between container restarts

### Phase 2: Service Provider Implementation

1. **Complete Service Provider Interface**
   - Implement registration mechanisms
   - Add configuration management
   - Create service discovery

2. **Container-Aware Communication**
   - Implement WebSocket transport between containers
   - Create container addressing scheme
   - Add service routing capabilities

### Phase 3: Dynamic Container Management

1. **Container Manager Service**
   - API for container creation/deletion
   - User-container mapping
   - Resource monitoring and limits

2. **Web Interface**
   - User registration form
   - Container provisioning UI
   - Test scenario selection

## Technical Specifications

### Docker Container Configuration

```yaml
# docker-compose.yml
version: '3'

services:
  gateway:
    build: ./gateway
    ports:
      - "80:80"
    depends_on:
      - container-manager
      - mongodb

  container-manager:
    build: ./container-manager
    environment:
      - MAX_CONTAINERS=100
      - CONTAINER_LIFETIME_HOURS=24
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  # Template for dynamically created user containers
  user-template:
    build: ./juicetokens
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MOCK_MODE=true
    # This service is not started automatically,
    # but used as a template for dynamic containers

volumes:
  mongo-data:
```

### MongoDB Persistence Adapter

```typescript
// MongoDB implementation of DHT storage
export class MongoDBDHTStorage implements DHTStorage {
  private db: Db;
  private collection: Collection;
  
  constructor(connectionString: string) {
    // Connect to MongoDB and get collection
  }
  
  async initialize(): Promise<void> {
    // Connect to MongoDB
    const client = new MongoClient(this.connectionString);
    await client.connect();
    this.db = client.db('juicetokens');
    this.collection = this.db.collection('dht_entries');
    
    // Create indexes
    await this.collection.createIndex({ key: 1 }, { unique: true });
    await this.collection.createIndex({ user_id: 1 });
    await this.collection.createIndex({ entry_type: 1 });
  }
  
  async put(entry: DHTEntry): Promise<void> {
    const key = this.keyToString(entry.key);
    await this.collection.updateOne(
      { key }, 
      { $set: this.entryToDocument(entry) },
      { upsert: true }
    );
  }
  
  async get(key: Uint8Array): Promise<DHTEntry | null> {
    const keyStr = this.keyToString(key);
    const doc = await this.collection.findOne({ key: keyStr });
    if (!doc) return null;
    return this.documentToEntry(doc);
  }
  
  // Additional methods implemented here...
}
```

### Container Manager API

```typescript
interface ContainerManagerAPI {
  // Create a new container for a test user
  createUserContainer(username: string, options?: ContainerOptions): Promise<ContainerInfo>;
  
  // Get information about a user's container
  getUserContainer(username: string): Promise<ContainerInfo | null>;
  
  // Delete a user's container
  deleteUserContainer(username: string): Promise<boolean>;
  
  // List all active containers
  listActiveContainers(): Promise<ContainerInfo[]>;
}

interface ContainerInfo {
  id: string;
  username: string;
  hostname: string;
  port: number;
  status: 'starting' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  expiresAt: Date;
}

interface ContainerOptions {
  lifetime?: number; // Container lifetime in hours
  scenarioType?: 'basic' | 'advanced';
  initialTokens?: number;
}
```

## Next Steps

1. Implement the MongoDB persistence adapter
2. Complete the service provider implementation
3. Create the container manager service
4. Develop the web interface for dynamic container provisioning 