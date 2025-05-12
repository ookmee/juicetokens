import express, { Request, Response } from 'express';
import { StorageFactory, StorageConfig } from './storage/TokenStorage';
import { promisify } from 'util';
import path from 'path';

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize storage
const safeConfig: StorageConfig = {
  type: 'safe',
  location: 'SERVER',
  options: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tokenengine'
  }
};

let safeStorage: any;

async function initializeStorage() {
  try {
    safeStorage = await StorageFactory.create(safeConfig);
    await safeStorage.initialize();
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  }
}

// Test endpoints
app.post('/api/tokens/safe', async (req: Request, res: Response) => {
  try {
    const result = await safeStorage.addTokens([req.body]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

app.get('/api/tokens/safe', async (req: Request, res: Response) => {
  try {
    const tokens = await safeStorage.getTokens(req.query);
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeStorage();
  console.log(`Server running on port ${PORT}`);
}); 