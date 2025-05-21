/**
 * JuiceTokens Container Manager Service
 * 
 * Handles dynamic provisioning of Docker containers for test users
 */

const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Configuration
const config = {
  // MongoDB connection
  mongoUri: process.env.MONGODB_URI || 'mongodb://mongodb:27017',
  mongoDbName: process.env.MONGODB_DB_NAME || 'juicetokens',
  containerCollection: 'containers',
  userCollection: 'users',
  
  // Docker settings
  dockerSocketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
  networkName: process.env.DOCKER_NETWORK || 'juicetokens-test-network',
  baseImageName: process.env.BASE_IMAGE || 'juicetokens/test-environment',
  containerLifetimeHours: parseInt(process.env.CONTAINER_LIFETIME_HOURS || '24', 10),
  maxContainersPerUser: parseInt(process.env.MAX_CONTAINERS_PER_USER || '2', 10),
  maxTotalContainers: parseInt(process.env.MAX_TOTAL_CONTAINERS || '100', 10),
  
  // Server settings
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
};

// Create app
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB and Docker
const docker = new Docker({ socketPath: config.dockerSocketPath });
let db;
let containerCollection;
let userCollection;

/**
 * Connect to MongoDB
 */
async function connectToMongo() {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  
  db = client.db(config.mongoDbName);
  containerCollection = db.collection(config.containerCollection);
  userCollection = db.collection(config.userCollection);
  
  // Create indexes
  await containerCollection.createIndex({ username: 1 });
  await containerCollection.createIndex({ expiresAt: 1 });
  await userCollection.createIndex({ username: 1 }, { unique: true });
  
  console.log('Connected to MongoDB');
}

/**
 * Ensure Docker network exists
 */
async function ensureNetwork() {
  try {
    const networks = await docker.listNetworks({
      filters: { name: [config.networkName] }
    });
    
    if (networks.length === 0) {
      console.log(`Creating Docker network: ${config.networkName}`);
      await docker.createNetwork({
        Name: config.networkName,
        Driver: 'bridge'
      });
    }
  } catch (error) {
    console.error('Error ensuring network:', error);
    throw error;
  }
}

/**
 * Clean up expired containers
 */
async function cleanupExpiredContainers() {
  try {
    const expiredContainers = await containerCollection.find({
      expiresAt: { $lt: new Date() }
    }).toArray();
    
    for (const container of expiredContainers) {
      try {
        console.log(`Removing expired container: ${container.id} for user ${container.username}`);
        const dockerContainer = docker.getContainer(container.dockerId);
        await dockerContainer.stop();
        await dockerContainer.remove();
        await containerCollection.deleteOne({ id: container.id });
      } catch (containerError) {
        console.error(`Error removing container ${container.id}:`, containerError);
      }
    }
  } catch (error) {
    console.error('Error cleaning up containers:', error);
  }
}

/**
 * Initialize the application
 */
async function initialize() {
  try {
    await connectToMongo();
    await ensureNetwork();
    
    // Run initial cleanup
    await cleanupExpiredContainers();
    
    // Schedule regular cleanup
    setInterval(cleanupExpiredContainers, 15 * 60 * 1000); // Every 15 minutes
    
    console.log('Container manager initialized');
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

// API Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Get container status
 */
app.get('/api/containers/:id', async (req, res) => {
  try {
    const container = await containerCollection.findOne({ id: req.params.id });
    
    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }
    
    // Get real-time status from Docker
    try {
      const dockerContainer = docker.getContainer(container.dockerId);
      const info = await dockerContainer.inspect();
      container.status = info.State.Status;
    } catch (dockerError) {
      console.error(`Error inspecting container ${container.id}:`, dockerError);
      container.status = 'unknown';
    }
    
    res.json(container);
  } catch (error) {
    console.error('Error getting container:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * List containers for a user
 */
app.get('/api/users/:username/containers', async (req, res) => {
  try {
    const containers = await containerCollection.find({
      username: req.params.username
    }).toArray();
    
    res.json(containers);
  } catch (error) {
    console.error('Error listing containers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create a new container for a user
 */
app.post('/api/containers', async (req, res) => {
  const { username, scenarioType = 'basic', initialTokens = 10 } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    // Check if user exists, create if not
    const user = await userCollection.findOneAndUpdate(
      { username },
      { $setOnInsert: { username, createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    
    // Count user's active containers
    const activeContainers = await containerCollection.countDocuments({
      username,
      expiresAt: { $gt: new Date() }
    });
    
    if (activeContainers >= config.maxContainersPerUser) {
      return res.status(429).json({
        error: `User already has ${activeContainers} active containers (max ${config.maxContainersPerUser})`
      });
    }
    
    // Count total containers
    const totalContainers = await containerCollection.countDocuments({
      expiresAt: { $gt: new Date() }
    });
    
    if (totalContainers >= config.maxTotalContainers) {
      return res.status(429).json({
        error: `System limit of ${config.maxTotalContainers} containers reached`
      });
    }
    
    // Create container in Docker
    const containerId = uuidv4();
    const containerName = `juicetokens-${username}-${containerId.substring(0, 8)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.containerLifetimeHours);
    
    const containerOptions = {
      Image: config.baseImageName,
      name: containerName,
      Env: [
        `USER_ID=${username}`,
        `MOCK_MODE=true`,
        `SCENARIO_TYPE=${scenarioType}`,
        `INITIAL_TOKENS=${initialTokens}`,
        'MONGODB_URI=' + config.mongoUri,
        'CONTAINER_ID=' + containerId
      ],
      ExposedPorts: {
        '8080/tcp': {}
      },
      HostConfig: {
        NetworkMode: config.networkName,
        PortBindings: {
          '8080/tcp': [{ HostPort: '0' }] // Dynamically assign port
        }
      }
    };
    
    const container = await docker.createContainer(containerOptions);
    await container.start();
    
    // Get assigned port
    const containerInfo = await container.inspect();
    const portBinding = containerInfo.NetworkSettings.Ports['8080/tcp'][0];
    const hostPort = portBinding.HostPort;
    
    // Save container info to MongoDB
    const containerRecord = {
      id: containerId,
      username,
      dockerId: containerInfo.Id,
      name: containerName,
      hostname: containerInfo.Config.Hostname,
      hostPort: parseInt(hostPort, 10),
      scenarioType,
      initialTokens,
      status: containerInfo.State.Status,
      ipAddress: containerInfo.NetworkSettings.Networks[config.networkName].IPAddress,
      createdAt: new Date(),
      expiresAt
    };
    
    await containerCollection.insertOne(containerRecord);
    
    res.status(201).json(containerRecord);
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete a container
 */
app.delete('/api/containers/:id', async (req, res) => {
  try {
    const container = await containerCollection.findOne({ id: req.params.id });
    
    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }
    
    try {
      const dockerContainer = docker.getContainer(container.dockerId);
      await dockerContainer.stop();
      await dockerContainer.remove();
    } catch (dockerError) {
      console.error(`Error removing container ${container.id}:`, dockerError);
    }
    
    await containerCollection.deleteOne({ id: req.params.id });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting container:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get container logs
 */
app.get('/api/containers/:id/logs', async (req, res) => {
  try {
    const container = await containerCollection.findOne({ id: req.params.id });
    
    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }
    
    try {
      const dockerContainer = docker.getContainer(container.dockerId);
      const logs = await dockerContainer.logs({
        stdout: true,
        stderr: true,
        tail: 100
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(logs);
    } catch (dockerError) {
      console.error(`Error getting logs for container ${container.id}:`, dockerError);
      res.status(500).json({ error: 'Error retrieving logs' });
    }
  } catch (error) {
    console.error('Error getting container logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
initialize().then(() => {
  app.listen(config.port, config.host, () => {
    console.log(`Container manager listening on ${config.host}:${config.port}`);
  });
}); 