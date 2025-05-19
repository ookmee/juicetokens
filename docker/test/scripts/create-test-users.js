#!/usr/bin/env node

/**
 * Test user creation script for JuiceTokens
 * 
 * This script creates test users for use in the testing environment.
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  count: 5,
  nodeId: 'node1',
  persist: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    const [key, value] = option.split('=');
    if (key && value !== undefined) {
      if (key === 'count') {
        options[key] = parseInt(value, 10);
      } else if (key === 'persist') {
        options[key] = value.toLowerCase() === 'true';
      } else {
        options[key] = value;
      }
    }
  }
}

console.log(`Creating ${options.count} test users for node ${options.nodeId}`);

// Ensure data directory exists
const dataDir = path.join('/app/data', options.nodeId);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate test users
const users = [];
const now = new Date().toISOString();

// Always create predefined users for testing
const predefinedUsers = [
  { name: 'Alice', role: 'sender' },
  { name: 'Bob', role: 'receiver' },
  { name: 'Charlie', role: 'facilitator' },
  { name: 'Diana', role: 'monitor' },
  { name: 'Eve', role: 'tester' }
];

// Add predefined users (up to the count)
const userCount = Math.min(options.count, predefinedUsers.length);
for (let i = 0; i < userCount; i++) {
  const userId = options.persist ? 
    `user-${predefinedUsers[i].name.toLowerCase()}` : 
    `user-${predefinedUsers[i].name.toLowerCase()}-${uuidv4().substr(0, 8)}`;
  
  const user = {
    id: userId,
    name: predefinedUsers[i].name,
    role: predefinedUsers[i].role,
    publicKey: `pk_${userId}_${uuidv4().replace(/-/g, '')}`,
    creationTime: now,
    tokens: [],
    trustScore: 85 + Math.floor(Math.random() * 15)
  };
  
  users.push(user);
}

// If we need more users than predefined ones, create additional random users
if (options.count > predefinedUsers.length) {
  for (let i = predefinedUsers.length; i < options.count; i++) {
    const userIndex = i + 1;
    const userId = options.persist ? 
      `user-${userIndex}` : 
      `user-${userIndex}-${uuidv4().substr(0, 8)}`;
    
    const user = {
      id: userId,
      name: `User ${userIndex}`,
      role: 'participant',
      publicKey: `pk_${userId}_${uuidv4().replace(/-/g, '')}`,
      creationTime: now,
      tokens: [],
      trustScore: 50 + Math.floor(Math.random() * 50)
    };
    
    users.push(user);
  }
}

// Save users to file
const usersFile = path.join(dataDir, 'users.json');
fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

console.log(`Created and saved ${users.length} users to ${usersFile}`);