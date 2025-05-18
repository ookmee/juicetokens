#!/usr/bin/env node

/**
 * Token distribution script for JuiceTokens
 * 
 * This script distributes test tokens to users in the testing environment.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  nodeId: 'node1',
  persist: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    const [key, value] = option.split('=');
    if (key && value !== undefined) {
      if (key === 'persist') {
        options[key] = value.toLowerCase() === 'true';
      } else {
        options[key] = value;
      }
    }
  }
}

console.log(`Distributing tokens to users for node ${options.nodeId}`);

// Ensure data directory exists
const dataDir = path.join('/app/data', options.nodeId);
if (!fs.existsSync(dataDir)) {
  console.error(`Data directory ${dataDir} does not exist. Please create tokens and users first.`);
  process.exit(1);
}

// Load tokens
const tokensFile = path.join(dataDir, 'tokens.json');
if (!fs.existsSync(tokensFile)) {
  console.error(`Tokens file ${tokensFile} not found. Please create tokens first.`);
  process.exit(1);
}

// Load users
const usersFile = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersFile)) {
  console.error(`Users file ${usersFile} not found. Please create users first.`);
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

console.log(`Loaded ${tokens.length} tokens and ${users.length} users.`);

// Create hash of previous owner for token telomere
function createOwnerHash(ownerId, tokenId) {
  return crypto.createHash('sha256').update(`${ownerId}:${tokenId}`).digest('hex');
}

// Distribute tokens to users
const now = new Date().toISOString();
let distributedCount = 0;
let userIndex = 0;

// Distribute tokens evenly between users (with a slight preference for early users)
tokens.forEach((token, index) => {
  // Skip some tokens to leave them in the 'system' account for testing
  if (index % 10 === 0) {
    return; // 10% of tokens remain with system
  }
  
  // Select user - distribute with some variance to create different token counts
  userIndex = (userIndex + 1) % users.length;
  // Every 7th token, skip to make distribution uneven
  if (index % 7 === 0) {
    userIndex = (userIndex + 1) % users.length;
  }
  
  const user = users[userIndex];
  
  // Update token ownership
  token.telomere.hashPreviousOwner = createOwnerHash('system', token.id.fullId);
  token.telomere.currentOwner = user.id;
  token.telomere.hashHistory.push({
    ownerHash: token.telomere.hashPreviousOwner,
    timestamp: now
  });
  token.time.lastTransactionTime = now;
  
  // Add token to user's collection
  user.tokens.push(token.id.fullId);
  
  distributedCount++;
});

// Save updated tokens and users
fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

console.log(`Distributed ${distributedCount} tokens to ${users.length} users.`);

// Create transactions file to record distribution
const transactions = tokens
  .filter(token => token.telomere.currentOwner !== 'system')
  .map(token => ({
    id: `txn-${crypto.randomBytes(8).toString('hex')}`,
    tokenId: token.id.fullId,
    fromId: 'system',
    toId: token.telomere.currentOwner,
    timestamp: token.time.lastTransactionTime,
    type: 'DISTRIBUTION',
    status: 'COMPLETED'
  }));

const transactionsFile = path.join(dataDir, 'transactions.json');
fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

console.log(`Recorded ${transactions.length} distribution transactions.`); 