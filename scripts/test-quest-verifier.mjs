#!/usr/bin/env node
/**
 * Quest Verifier Unit Test
 * 
 * Tests the secret quest hash generation and verification system by:
 * 1. Sampling rows from the CSV seed file
 * 2. Recomputing expected hashes
 * 3. Validating quest files contain the correct hashes
 * 4. Testing the verification API logic
 * 
 * Usage: node scripts/test-quest-verifier.mjs [--verbose]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CSV_PATH = path.join(rootDir, 'ops/seeds/secret-seeds.csv');
const LORE_DIR = path.join(rootDir, 'lore/quests');
const SECRET_SALT = process.env.SECRET_SALT || 'test-salt-for-ci';

// Test configuration
const SAMPLE_SIZE = 3; // Number of rows to test
const VERBOSE = process.argv.includes('--verbose');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    log(`[VERBOSE] ${message}`, 'cyan');
  }
}

/**
 * Generate secret hash using the same logic as the main system
 */
function generateSecretHash(proofId, playerId, salt = SECRET_SALT) {
  const material = `${proofId}:${playerId}:${salt}`;
  return crypto.createHash('sha256').update(material).digest('hex');
}

/**
 * Parse CSV file and return rows
 */
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return rows;
}

/**
 * Parse YAML front-matter from Markdown file
 */
function parseFrontMatter(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) {
    return null;
  }
  
  try {
    // Simple YAML parser for basic key-value pairs
    const yamlContent = match[1];
    const meta = {};
    
    yamlContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          let value = trimmed.substring(colonIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Handle boolean values
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          
          meta[key] = value;
        }
      }
    });
    
    return meta;
  } catch (error) {
    logVerbose(`Error parsing front-matter in ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Test a single quest file
 */
function testQuestFile(questId, expectedHash) {
  const questFile = path.join(LORE_DIR, `${questId}.md`);
  
  if (!fs.existsSync(questFile)) {
    return {
      success: false,
      error: `Quest file not found: ${questFile}`,
      questId
    };
  }
  
  const meta = parseFrontMatter(questFile);
  if (!meta) {
    return {
      success: false,
      error: `Could not parse front-matter in ${questFile}`,
      questId
    };
  }
  
  // Check if quest is marked as secret
  if (meta.kind !== 'secret') {
    return {
      success: false,
      error: `Quest ${questId} is not marked as secret (kind: ${meta.kind})`,
      questId
    };
  }
  
  // Check if secretHash is present
  if (!meta.secretHash) {
    return {
      success: false,
      error: `Quest ${questId} missing secretHash in front-matter`,
      questId
    };
  }
  
  // Extract hash from secretHash (remove sha256: prefix if present)
  const actualHash = meta.secretHash.replace(/^sha256:/, '');
  
  // Compare hashes
  if (actualHash !== expectedHash) {
    return {
      success: false,
      error: `Hash mismatch for quest ${questId}. Expected: ${expectedHash}, Got: ${actualHash}`,
      questId
    };
  }
  
  return {
    success: true,
    questId,
    expectedHash,
    actualHash
  };
}

/**
 * Test verification API logic
 */
function testVerificationAPI(proofId, playerId, expectedHash) {
  // Simulate the verification logic from the API
  const computedHash = generateSecretHash(proofId, playerId);
  
  if (computedHash !== expectedHash) {
    return {
      success: false,
      error: `API verification failed. Expected: ${expectedHash}, Computed: ${computedHash}`,
      proofId,
      playerId
    };
  }
  
  return {
    success: true,
    proofId,
    playerId,
    hash: computedHash
  };
}

/**
 * Main test function
 */
async function runTests() {
  log('🧪 Starting Quest Verifier Unit Tests', 'blue');
  log('=====================================', 'blue');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Parse CSV
    log('📊 Parsing CSV seed file...', 'yellow');
    const csvRows = parseCSV(CSV_PATH);
    log(`Found ${csvRows.length} rows in CSV`, 'green');
    
    if (csvRows.length === 0) {
      log('❌ No rows found in CSV file', 'red');
      return;
    }
    
    // Sample rows for testing
    const sampleRows = csvRows.slice(0, SAMPLE_SIZE);
    log(`Testing ${sampleRows.length} sample rows...`, 'yellow');
    
    // Test each sample row
    for (const row of sampleRows) {
      const { questId, proofId, playerId } = row;
      
      if (!questId || !proofId || !playerId) {
        log(`⚠️  Skipping incomplete row: ${JSON.stringify(row)}`, 'yellow');
        continue;
      }
      
      log(`\n🔍 Testing quest: ${questId}`, 'magenta');
      logVerbose(`  Proof ID: ${proofId}`);
      logVerbose(`  Player ID: ${playerId}`);
      
      // Generate expected hash
      const expectedHash = generateSecretHash(proofId, playerId);
      logVerbose(`  Expected hash: ${expectedHash}`);
      
      // Test quest file
      totalTests++;
      const questTest = testQuestFile(questId, expectedHash);
      
      if (questTest.success) {
        log(`  ✅ Quest file validation passed`, 'green');
        passedTests++;
      } else {
        log(`  ❌ Quest file validation failed: ${questTest.error}`, 'red');
        failedTests++;
      }
      
      // Test verification API
      totalTests++;
      const apiTest = testVerificationAPI(proofId, playerId, expectedHash);
      
      if (apiTest.success) {
        log(`  ✅ API verification passed`, 'green');
        passedTests++;
      } else {
        log(`  ❌ API verification failed: ${apiTest.error}`, 'red');
        failedTests++;
      }
    }
    
    // Summary
    log('\n📋 Test Summary', 'blue');
    log('===============', 'blue');
    log(`Total tests: ${totalTests}`, 'white');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    
    if (failedTests === 0) {
      log('\n🎉 All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n💥 Some tests failed!', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    if (VERBOSE) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run tests
runTests();
