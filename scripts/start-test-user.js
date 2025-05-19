#!/usr/bin/env node

/**
 * Test User UI Launcher
 * 
 * This script starts an Express server for a test user UI.
 * Usage: node start-test-user.js --port=3001 --user-id=test-user-1
 */

const express = require('express');
const path = require('path');
const { program } = require('commander');

// Parse command line arguments
program
  .option('-p, --port <port>', 'Port to run the server on', '3001')
  .option('-u, --user-id <userId>', 'Test user ID', 'test-user-1')
  .parse(process.argv);

const options = program.opts();
const PORT = options.port;
const USER_ID = options.userId;

// Create Express app
const app = express();

// Configure the app
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API endpoints that connect to the existing monorepo code
app.get('/api/user', (req, res) => {
  res.json({ id: USER_ID });
});

// Forward other API requests to the appropriate handlers in the monorepo
// For development, we'll use mock responses similar to what we had in app.js

// Token balance endpoint
app.get('/api/tokens/balance', async (req, res) => {
  const balance = Math.floor(Math.random() * 100) + 50;
  res.json({ balance });
});

// Advertisements endpoint
app.get('/api/advertisements', async (req, res) => {
  // Sample advertisement data
  const advertisements = [
    {
      type: "OFFER",
      title: "Fresh vegetables from my garden",
      description: "Organic tomatoes, lettuce, and carrots available weekly.",
      creatorId: "user-432",
      creatorName: "Alice",
      tokenValue: 25
    },
    {
      type: "REQUEST",
      title: "Need help with garden work",
      description: "Looking for someone to help with weeding and planting.",
      creatorId: "user-876",
      creatorName: "Bob",
      tokenValue: 40
    }
  ];
  
  res.json({ advertisements });
});

// Nearby peers endpoint
app.get('/api/peers/nearby', async (req, res) => {
  // Generate mock peer data
  const count = Math.floor(Math.random() * 3) + 1;
  const peers = [];
  
  for (let i = 0; i < count; i++) {
    peers.push({
      id: `peer-${i}`,
      distance: Math.random() * 100,
      lastSeen: Date.now() - Math.random() * 60000
    });
  }
  
  res.json({ peers });
});

// Token sending endpoint
app.post('/api/tokens/send', async (req, res) => {
  const { recipientId, amount } = req.body;
  
  if (!recipientId || !amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Recipient ID and amount are required' 
    });
  }
  
  // Simulate successful transaction
  res.json({ 
    success: true, 
    transactionId: `tx-${Date.now()}`,
    amount,
    recipient: recipientId,
    timestamp: Date.now() 
  });
});

// Receive code endpoint
app.get('/api/tokens/receive-code', async (req, res) => {
  const code = `RECEIVE-${USER_ID}-${Date.now()}`;
  res.json({ code });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test User UI for ${USER_ID} running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});

