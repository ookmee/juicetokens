#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the generated directory exists
const generatedDir = path.resolve(__dirname, '../packages/proto/src/generated');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Define the path to protobuf files
const protosDir = path.resolve(__dirname, '../protos');

try {
  // Generate JavaScript from .proto files
  console.log('Generating JavaScript from Protocol Buffers...');
  execSync(`npx pbjs -t static-module -w commonjs -o ${generatedDir}/proto.js ${protosDir}/**/*.proto`, {
    stdio: 'inherit'
  });

  // Generate TypeScript definitions from the JavaScript
  console.log('Generating TypeScript definitions...');
  execSync(`npx pbts -o ${generatedDir}/proto.d.ts ${generatedDir}/proto.js`, {
    stdio: 'inherit'
  });

  console.log('Protocol Buffer compilation complete!');
} catch (error) {
  console.error('Error compiling Protocol Buffers:', error.message);
  process.exit(1);
} 