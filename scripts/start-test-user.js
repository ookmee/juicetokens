#!/usr/bin/env node

/**
 * Test User UI Launcher
 * 
 * This script starts an Express server for a test user UI.
 * Usage: node start-test-user.js --port=3001 --user-id=test-user-1
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
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

// Log current directory for debugging
console.log('Current directory:', process.cwd());
console.log('Public directory:', path.join(process.cwd(), 'public'));
console.log('Files in public:', fs.existsSync(path.join(process.cwd(), 'public')) ? 
  fs.readdirSync(path.join(process.cwd(), 'public')) : 'Directory not found');

// Create directory structure for JS files if they don't exist
const publicJsDir = path.join(process.cwd(), 'public', 'js');
const publicJsServicesDir = path.join(publicJsDir, 'services');

if (!fs.existsSync(publicJsDir)) {
  console.log(`Creating directory: ${publicJsDir}`);
  fs.mkdirSync(publicJsDir, { recursive: true });
}

if (!fs.existsSync(publicJsServicesDir)) {
  console.log(`Creating directory: ${publicJsServicesDir}`);
  fs.mkdirSync(publicJsServicesDir, { recursive: true });
}

// Configure the app
app.use(express.json());

// Serve static files from the public directory with explicit path
const publicPath = path.resolve(process.cwd(), 'public');
console.log('Resolved public path:', publicPath);
app.use(express.static(publicPath));

// Handle root route explicitly
app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('Checking for index.html at:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    console.log('Found index.html, serving file');
    res.sendFile(indexPath);
  } else {
    console.log('index.html not found, serving fallback');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>JuiceTokens - Test User ${USER_ID}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #1E5C97;
            }
            .balance {
              font-size: 24px;
              font-weight: bold;
              color: #F2A900;
            }
            button {
              background: #1E5C97;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 10px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>JuiceTokens - Test User: <span id="userId">${USER_ID}</span></h1>
            <p>Balance: <span id="balance" class="balance">Loading...</span> tokens</p>
            <div>
              <button id="receiveBtn">Receive</button>
              <button id="sendBtn">Send</button>
            </div>
          </div>
          <script>
            // Simple client-side code
            document.addEventListener('DOMContentLoaded', async () => {
              try {
                // Fetch balance
                const balanceResponse = await fetch('/api/tokens/balance');
                const balanceData = await balanceResponse.json();
                document.getElementById('balance').textContent = balanceData.balance;
              } catch (err) {
                console.error('Error fetching data:', err);
              }
            });
          </script>
        </body>
      </html>
    `);
  }
});

// API endpoints that connect to the existing monorepo code
app.get('/api/user', (req, res) => {
  res.json({ id: USER_ID });
});

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test User UI for ${USER_ID} running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});

