#!/usr/bin/env node

/**
 * Test token creation script for JuiceTokens
 * 
 * This script creates test tokens for use in the testing environment.
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  count: 100,
  value: 10,
  nodeId: 'node1',
  persist: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    const [key, value] = option.split('=');
    if (key && value !== undefined) {
      if (key === 'count' || key === 'value') {
        options[key] = parseInt(value, 10);
      } else if (key === 'persist') {
        options[key] = value.toLowerCase() === 'true';
      } else {
        options[key] = value;
      }
    }
  }
}

console.log(`Creating ${options.count} test tokens with value ${options.value} for node ${options.nodeId}`);

// Ensure data directory exists
const dataDir = path.join('/app/data', options.nodeId);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate tokens
const tokens = [];
const now = new Date().toISOString();
const location = options.nodeId;
const reference = `TEST-${now.substr(0, 10)}`;

for (let i = 0; i < options.count; i++) {
  const tokenId = options.persist ? 
    `${location}-${reference}-${options.value}-${i+1}` : 
    `${location}-${reference}-${options.value}-${uuidv4().substr(0, 8)}`;
  
  const token = {
    id: {
      fullId: tokenId,
      location: location,
      reference: reference,
      value: options.value,
      index: i + 1
    },
    batchId: `${location}-${reference}`,
    meta: {
      scenario: 'test',
      asset: 'test-token',
      expiry: null
    },
    time: {
      creationTime: now,
      lastTransactionTime: now,
      expiryTime: null
    },
    telomere: {
      currentOwner: 'system',
      hashPreviousOwner: null,
      hashHistory: []
    }
  };
  
  tokens.push(token);
}

// Save tokens to file
const tokensFile = path.join(dataDir, 'tokens.json');
fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));

console.log(`Created and saved ${tokens.length} tokens to ${tokensFile}`); 