#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configuration from environment
const BASE_REF = process.env.BASE_REF || 'HEAD~1';
const HEAD_REF = process.env.HEAD_REF || 'HEAD';
const MIN_SCORE = parseFloat(process.env.MIN_SCORE || '0.35');
const MIN_SCORE_FAIL = process.env.MIN_SCORE_FAIL === 'true';
const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL;
const LEDGER_ADMIN_TOKEN = process.env.LEDGER_ADMIN_TOKEN;
const PROOF_OUT = process.env.PROOF_OUT || '.copilot/proof.json';

console.log('🔍 Copilot Diff Verifier');
console.log(`Base ref: ${BASE_REF}`);
console.log(`Head ref: ${HEAD_REF}`);
console.log(`Min score: ${MIN_SCORE}`);
console.log(`Fail on low: ${MIN_SCORE_FAIL}`);

// Ensure .copilot directory exists
execSync('mkdir -p .copilot', { stdio: 'inherit' });

// Load suggestions if they exist
let suggestions = { suggestions: [] };
if (existsSync('.copilot/suggestions.json')) {
  try {
    suggestions = JSON.parse(readFileSync('.copilot/suggestions.json', 'utf8'));
    console.log(`📝 Loaded ${suggestions.suggestions.length} suggestions`);
  } catch (error) {
    console.warn('⚠️  Could not parse suggestions.json, using empty array');
  }
}

// Get the diff between base and head
let diff = '';
try {
  diff = execSync(`git diff ${BASE_REF}..${HEAD_REF}`, { encoding: 'utf8' });
  console.log(`📊 Diff size: ${diff.length} characters`);
} catch (error) {
  console.error('❌ Failed to get git diff:', error.message);
  process.exit(1);
}

if (!diff.trim()) {
  console.log('ℹ️  No changes detected, skipping verification');
  const proof = {
    timestamp: new Date().toISOString(),
    base_ref: BASE_REF,
    head_ref: HEAD_REF,
    overlap_score: 1.0,
    suggestions_checked: 0,
    changes_detected: 0,
    status: 'no_changes',
    ledger_proof: null
  };
  
  writeFileSync(PROOF_OUT, JSON.stringify(proof, null, 2));
  console.log('✅ Proof written to', PROOF_OUT);
  process.exit(0);
}

// Calculate overlap score
let overlapScore = 0;
let suggestionsChecked = 0;
let changesDetected = 0;

if (suggestions.suggestions.length > 0) {
  // Simple overlap calculation based on common lines
  const diffLines = diff.split('\n').filter(line => line.startsWith('+') || line.startsWith('-'));
  changesDetected = diffLines.length;
  
  for (const suggestion of suggestions.suggestions) {
    suggestionsChecked++;
    const suggestionLines = suggestion.text.split('\n');
    
    // Check for overlap between suggestion and diff
    let matches = 0;
    for (const suggestionLine of suggestionLines) {
      const cleanSuggestionLine = suggestionLine.trim();
      if (cleanSuggestionLine.length < 3) continue; // Skip very short lines
      
      for (const diffLine of diffLines) {
        const cleanDiffLine = diffLine.substring(1).trim(); // Remove +/- prefix
        if (cleanDiffLine.includes(cleanSuggestionLine) || cleanSuggestionLine.includes(cleanDiffLine)) {
          matches++;
          break;
        }
      }
    }
    
    if (suggestionLines.length > 0) {
      overlapScore += matches / suggestionLines.length;
    }
  }
  
  if (suggestionsChecked > 0) {
    overlapScore = overlapScore / suggestionsChecked;
  }
} else {
  console.log('ℹ️  No suggestions to verify against');
  overlapScore = 0.5; // Default score when no suggestions available
}

console.log(`📈 Overlap score: ${overlapScore.toFixed(3)} (${suggestionsChecked} suggestions checked)`);
console.log(`📊 Changes detected: ${changesDetected}`);

// Create proof object
const proof = {
  timestamp: new Date().toISOString(),
  base_ref: BASE_REF,
  head_ref: HEAD_REF,
  overlap_score: overlapScore,
  suggestions_checked: suggestionsChecked,
  changes_detected: changesDetected,
  status: overlapScore >= MIN_SCORE ? 'verified' : 'low_score',
  ledger_proof: null
};

// Seal to ledger if configured
if (LEDGER_BASE_URL && LEDGER_ADMIN_TOKEN) {
  try {
    console.log('🔐 Sealing proof to Civic Ledger...');
    
    const ledgerPayload = {
      type: 'copilot_verification',
      data: {
        repository: process.env.GITHUB_REPOSITORY || 'unknown',
        commit: HEAD_REF,
        overlap_score: overlapScore,
        suggestions_checked: suggestionsChecked,
        changes_detected: changesDetected,
        verification_timestamp: proof.timestamp
      }
    };
    
    const response = await fetch(`${LEDGER_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEDGER_ADMIN_TOKEN}`
      },
      body: JSON.stringify(ledgerPayload)
    });
    
    if (response.ok) {
      const ledgerResult = await response.json();
      proof.ledger_proof = {
        transaction_id: ledgerResult.transaction_id,
        block_height: ledgerResult.block_height,
        sealed_at: new Date().toISOString()
      };
      console.log('✅ Proof sealed to ledger:', ledgerResult.transaction_id);
    } else {
      console.warn('⚠️  Failed to seal to ledger:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('⚠️  Error sealing to ledger:', error.message);
  }
} else {
  console.log('ℹ️  Ledger sealing not configured (missing LEDGER_BASE_URL or LEDGER_ADMIN_TOKEN)');
}

// Write proof file
writeFileSync(PROOF_OUT, JSON.stringify(proof, null, 2));
console.log('✅ Proof written to', PROOF_OUT);

// Check if we should fail
if (overlapScore < MIN_SCORE) {
  console.log(`❌ Overlap score ${overlapScore.toFixed(3)} is below minimum ${MIN_SCORE}`);
  if (MIN_SCORE_FAIL) {
    console.log('💥 Failing build due to low overlap score');
    process.exit(1);
  } else {
    console.log('⚠️  Low overlap score detected but not failing build');
  }
} else {
  console.log('✅ Verification passed');
}