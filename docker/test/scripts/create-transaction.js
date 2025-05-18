#!/usr/bin/env node

/**
 * Transaction creation script for JuiceTokens
 * 
 * This script creates a token transaction between users.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  tokenId: '',
  fromId: '',
  toId: '',
  nodeId: 'node1',
  remoteNode: null,
  timeout: 30
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    const [key, value] = option.split('=');
    if (key && value !== undefined) {
      if (key === 'timeout') {
        options[key] = parseInt(value, 10);
      } else {
        options[key] = value;
      }
    }
  }
}

// Validate required options
if (!options.tokenId || !options.fromId || !options.toId) {
  console.error('Required parameters missing. Usage:');
  console.error('  create-transaction.js --tokenId=<token_id> --fromId=<sender_id> --toId=<receiver_id> [--nodeId=<node_id>] [--remoteNode=<remote_node>] [--timeout=<seconds>]');
  process.exit(1);
}

const isRemoteTransaction = !!options.remoteNode;
console.log(`Creating ${isRemoteTransaction ? 'remote' : 'local'} transaction for token ${options.tokenId} from ${options.fromId} to ${options.toId}`);

// Load data files
const dataDir = path.join('/app/data', options.nodeId);
if (!fs.existsSync(dataDir)) {
  console.error(`Data directory ${dataDir} does not exist.`);
  process.exit(1);
}

// Load tokens
const tokensFile = path.join(dataDir, 'tokens.json');
if (!fs.existsSync(tokensFile)) {
  console.error(`Tokens file ${tokensFile} not found.`);
  process.exit(1);
}

// Load transactions
const transactionsFile = path.join(dataDir, 'transactions.json');
let transactions = [];
if (fs.existsSync(transactionsFile)) {
  transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));
}

// Load token data
const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
const token = tokens.find(t => t.id.fullId === options.tokenId);

if (!token) {
  console.error(`Token ${options.tokenId} not found.`);
  process.exit(1);
}

// Validate token ownership
if (token.telomere.currentOwner !== options.fromId) {
  console.error(`Token ${options.tokenId} is not owned by ${options.fromId}.`);
  console.error(`Current owner is ${token.telomere.currentOwner}.`);
  process.exit(1);
}

// Create transaction
const now = new Date().toISOString();
const transactionId = `txn-${crypto.randomBytes(8).toString('hex')}`;

// Create owner hash for token telomere
function createOwnerHash(ownerId, tokenId) {
  return crypto.createHash('sha256').update(`${ownerId}:${tokenId}`).digest('hex');
}

// Process local transaction
function processLocalTransaction() {
  console.log(`Processing local transaction ${transactionId}`);
  
  // Create transaction record
  const transaction = {
    id: transactionId,
    tokenId: options.tokenId,
    fromId: options.fromId,
    toId: options.toId,
    timestamp: now,
    type: 'TRANSFER',
    status: 'COMPLETED'
  };
  
  // Update token ownership
  token.telomere.hashPreviousOwner = createOwnerHash(options.fromId, token.id.fullId);
  token.telomere.currentOwner = options.toId;
  token.telomere.hashHistory.push({
    ownerHash: token.telomere.hashPreviousOwner,
    timestamp: now
  });
  token.time.lastTransactionTime = now;
  
  // Save updated token data
  fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
  
  // Save transaction
  transactions.push(transaction);
  fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  
  console.log(`Local transaction ${transactionId} completed successfully.`);
  return transactionId;
}

// Process remote transaction
function processRemoteTransaction() {
  console.log(`Processing remote transaction ${transactionId} to ${options.remoteNode}`);
  
  // Create initial transaction record
  const transaction = {
    id: transactionId,
    tokenId: options.tokenId,
    fromId: options.fromId,
    toId: options.toId,
    timestamp: now,
    type: 'TRANSFER',
    status: 'INITIATED',
    remoteNode: options.remoteNode
  };
  
  // Simulate remote transaction process
  
  // 1. First mark as initiated
  transactions.push(transaction);
  fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  
  // 2. Simulate network communication delay
  const remoteNodeData = path.join('/app/data', options.remoteNode);
  const remoteTokensFile = path.join(remoteNodeData, 'tokens.json');
  const remoteTransactionsFile = path.join(remoteNodeData, 'transactions.json');
  
  // Check if remote node is accessible (simulate network check)
  const remoteAccessible = fs.existsSync(remoteNodeData);
  if (!remoteAccessible) {
    console.error(`Remote node ${options.remoteNode} is not accessible.`);
    
    // Update transaction status
    transaction.status = 'FAILED';
    transaction.errorType = 'NETWORK_ERROR';
    transaction.description = `Cannot access remote node ${options.remoteNode}`;
    
    const txnIndex = transactions.findIndex(t => t.id === transactionId);
    if (txnIndex >= 0) {
      transactions[txnIndex] = transaction;
      fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    }
    
    console.log(`Remote transaction ${transactionId} failed due to network error.`);
    return transactionId;
  }
  
  // 3. Update local transaction to approved
  transaction.status = 'APPROVED';
  const txnIndex = transactions.findIndex(t => t.id === transactionId);
  if (txnIndex >= 0) {
    transactions[txnIndex] = transaction;
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  }
  
  // 4. Copy token to remote node (simulate token transfer)
  try {
    // Load remote tokens
    let remoteTokens = [];
    if (fs.existsSync(remoteTokensFile)) {
      remoteTokens = JSON.parse(fs.readFileSync(remoteTokensFile, 'utf8'));
    }
    
    // Check if token already exists on remote node
    const existingTokenIndex = remoteTokens.findIndex(t => t.id.fullId === options.tokenId);
    
    // Update token ownership
    token.telomere.hashPreviousOwner = createOwnerHash(options.fromId, token.id.fullId);
    token.telomere.currentOwner = options.toId;
    token.telomere.hashHistory.push({
      ownerHash: token.telomere.hashPreviousOwner,
      timestamp: now
    });
    token.time.lastTransactionTime = now;
    
    // Add or update token on remote node
    if (existingTokenIndex >= 0) {
      remoteTokens[existingTokenIndex] = token;
    } else {
      remoteTokens.push(token);
    }
    
    // Save updated token data on remote node
    fs.writeFileSync(remoteTokensFile, JSON.stringify(remoteTokens, null, 2));
    
    // Remove token from local node
    const tokenIndex = tokens.findIndex(t => t.id.fullId === options.tokenId);
    if (tokenIndex >= 0) {
      tokens.splice(tokenIndex, 1);
    }
    
    // Save updated token data on local node
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
    
    // 5. Record transaction on remote node
    let remoteTransactions = [];
    if (fs.existsSync(remoteTransactionsFile)) {
      remoteTransactions = JSON.parse(fs.readFileSync(remoteTransactionsFile, 'utf8'));
    }
    
    const remoteTransaction = {
      id: transactionId,
      tokenId: options.tokenId,
      fromId: options.fromId,
      toId: options.toId,
      timestamp: now,
      type: 'TRANSFER',
      status: 'COMPLETED',
      remoteNode: options.nodeId
    };
    
    remoteTransactions.push(remoteTransaction);
    fs.writeFileSync(remoteTransactionsFile, JSON.stringify(remoteTransactions, null, 2));
    
    // 6. Update local transaction to completed
    transaction.status = 'COMPLETED';
    if (txnIndex >= 0) {
      transactions[txnIndex] = transaction;
      fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    }
    
    console.log(`Remote transaction ${transactionId} completed successfully.`);
  } catch (error) {
    console.error(`Error processing remote transaction: ${error.message}`);
    
    // Update transaction status
    transaction.status = 'FAILED';
    transaction.errorType = 'PROCESSING_ERROR';
    transaction.description = `Error: ${error.message}`;
    
    if (txnIndex >= 0) {
      transactions[txnIndex] = transaction;
      fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    }
    
    console.log(`Remote transaction ${transactionId} failed due to processing error.`);
  }
  
  return transactionId;
}

// Execute transaction
if (isRemoteTransaction) {
  processRemoteTransaction();
} else {
  processLocalTransaction();
}

// Return transaction ID
console.log(transactionId); 