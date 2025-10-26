#!/usr/bin/env node

/**
 * Test script for ATLAS MCP Server
 * This simulates MCP client communication to test ATLAS tools
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Testing ATLAS MCP Server...\n');

// Start the ATLAS server
const atlasProcess = spawn('node', ['dist/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

atlasProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📤 ATLAS Output:', data.toString().trim());
});

atlasProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('❌ ATLAS Error:', data.toString().trim());
});

atlasProcess.on('close', (code) => {
  console.log(`\n🏁 ATLAS process exited with code ${code}`);
  if (errorOutput) {
    console.log('Error output:', errorOutput);
  }
});

// Test MCP communication
setTimeout(() => {
  console.log('\n🧪 Testing MCP communication...');
  
  // Send a list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  console.log('📤 Sending list tools request...');
  atlasProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  
}, 2000);

// Send a health check request
setTimeout(() => {
  const healthCheckRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'health_check',
      arguments: {}
    }
  };
  
  console.log('📤 Sending health check request...');
  atlasProcess.stdin.write(JSON.stringify(healthCheckRequest) + '\n');
  
}, 4000);

// Clean up after 10 seconds
setTimeout(() => {
  console.log('\n🛑 Stopping ATLAS server...');
  atlasProcess.kill();
}, 10000);

