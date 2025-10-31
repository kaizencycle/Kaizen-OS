#!/usr/bin/env node
// ATLAS evaluation script for GI consensus validation

const path = require('path');
const fs = require('fs');

const targetDir = process.argv[2] || process.cwd();
const atlasDist = process.argv[3];

(async () => {
  try {
    // Suppress console.log from ATLAS for cleaner JSON output
    const originalConsoleLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
    };
    
    const { AtlasSentinel } = require(atlasDist);
    
    const atlas = new AtlasSentinel({
      giThreshold: 0.95,
      qualityThreshold: 0.9,
      driftThreshold: 0.15
    });

    const attestation = await atlas.audit(targetDir);
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Output only JSON
    console.log(JSON.stringify(attestation, null, 2));
  } catch (error) {
    console.error('ATLAS evaluation failed:', error.message);
    process.exit(1);
  }
})();
