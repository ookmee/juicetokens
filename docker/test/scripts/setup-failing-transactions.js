#!/usr/bin/env node

/**
 * Setup failing transactions script for JuiceTokens
 * 
 * This script sets up incomplete/failing transactions for testing recovery mechanisms.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  nodeId: 'node1'
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    const [key, value] = option.split('=');
    if (key && value !== undefined) {
      options[key] = value;
    }
  }
}

console.log(`Setting up failing transactions for node ${options.nodeId}`);

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

// Load existing transactions if they exist
const transactionsFile = path.join(dataDir, 'transactions.json');
let transactions = [];
if (fs.existsSync(transactionsFile)) {
  transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));
}

const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

console.log(`Loaded ${tokens.length} tokens and ${users.length} users.`);

// Find users with tokens
const usersWithTokens = users.filter(user => user.tokens.length > 0);
if (usersWithTokens.length < 2) {
  console.error('Need at least 2 users with tokens to set up failing transactions.');
  process.exit(1);
}

// Create different types of failing transactions
const now = new Date().toISOString();
const failingTransactions = [];

// 1. Transaction initiation that never completes
for (let i = 0; i < 3; i++) {
  const sender = usersWithTokens[i % usersWithTokens.length];
  const receiver = usersWithTokens[(i + 1) % usersWithTokens.length];
  
  if (sender.tokens.length === 0) continue;
  
  const tokenId = sender.tokens[0]; // Use the first token
  
  failingTransactions.push({
    id: `fail-init-${crypto.randomBytes(8).toString('hex')}`,
    tokenId: tokenId,
    fromId: sender.id,
    toId: receiver.id,
    timestamp: now,
    type: 'TRANSFER',
    status: 'INITIATED',
    errorType: 'TIMEOUT',
    description: 'Transaction initiated but never completed'
  });
}

// 2. Transaction approval that fails validation
for (let i = 0; i < 2; i++) {
  const sender = usersWithTokens[i % usersWithTokens.length];
  const receiver = usersWithTokens[(i + 2) % usersWithTokens.length];
  
  if (sender.tokens.length <= 1) continue;
  
  const tokenId = sender.tokens[1]; // Use the second token
  
  failingTransactions.push({
    id: `fail-val-${crypto.randomBytes(8).toString('hex')}`,
    tokenId: tokenId,
    fromId: sender.id,
    toId: receiver.id,
    timestamp: now,
    type: 'TRANSFER',
    status: 'APPROVED',
    errorType: 'VALIDATION_FAILED',
    description: 'Transaction approved but validation failed'
  });
}

// 3. Transaction pending finalization but network fails
for (let i = 0; i < 2; i++) {
  const sender = usersWithTokens[i % usersWithTokens.length];
  const receiver = usersWithTokens[(i + 3) % usersWithTokens.length];
  
  if (sender.tokens.length <= 2) continue;
  
  const tokenId = sender.tokens[2]; // Use the third token
  
  failingTransactions.push({
    id: `fail-final-${crypto.randomBytes(8).toString('hex')}`,
    tokenId: tokenId,
    fromId: sender.id,
    toId: receiver.id,
    timestamp: now,
    type: 'TRANSFER',
    status: 'PENDING_FINALIZATION',
    errorType: 'NETWORK_FAILURE',
    description: 'Transaction pending finalization but network failed'
  });
}

// Save failing transactions
const pendingTransactionsFile = path.join(dataDir, 'pending-transactions.json');
fs.writeFileSync(pendingTransactionsFile, JSON.stringify(failingTransactions, null, 2));

console.log(`Created ${failingTransactions.length} failing transaction scenarios.`);

// Also add them to main transactions file
transactions = [...transactions, ...failingTransactions];
fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

console.log('Added failing transactions to main transaction log.'); 