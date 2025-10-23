#!/usr/bin/env node
/**
 * Copilot Diff Verifier
 * 
 * Compares actual code changes against Copilot suggestions to compute
 * an overlap score and optionally seal the proof to the Civic Ledger.
 * 
 * Environment Variables:
 * - BASE_REF: Git ref to compare against (default: HEAD~1)
 * - HEAD_REF: Git ref to compare from (default: HEAD)
 * - MIN_SCORE: Minimum overlap score threshold (default: 0.35)
 * - MIN_SCORE_FAIL: Whether to fail if below threshold (default: false)
 * - LEDGER_BASE_URL: Civic Ledger API base URL
 * - LEDGER_ADMIN_TOKEN: Bearer token for /seal endpoint
 * - PROOF_OUT: Output file for proof JSON (default: .copilot/proof.json)
 */

import fs from 'fs';
import { execSync } from 'child_process';
import crypto from 'crypto';

// Configuration from environment
const BASE_REF = process.env.BASE_REF || 'HEAD~1';
const HEAD_REF = process.env.HEAD_REF || 'HEAD';
const MIN_SCORE = parseFloat(process.env.MIN_SCORE || '0.35');
const MIN_SCORE_FAIL = process.env.MIN_SCORE_FAIL === 'true';
const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL;
const LEDGER_ADMIN_TOKEN = process.env.LEDGER_ADMIN_TOKEN;
const PROOF_OUT = process.env.PROOF_OUT || '.copilot/proof.json';

// Utility functions
function sh(cmd, options = {}) {
  try {
    return execSync(cmd, { 
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
      ...options 
    }).trim();
  } catch (e) {
    console.warn(`Command failed: ${cmd}`);
    return '';
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function computeOverlap(actual, suggested) {
  const actualNorm = normalizeText(actual);
  const suggestedNorm = normalizeText(suggested);
  
  if (!actualNorm || !suggestedNorm) return 0;
  
  const actualWords = new Set(actualNorm.split(' '));
  const suggestedWords = new Set(suggestedNorm.split(' '));
  
  const intersection = new Set([...actualWords].filter(x => suggestedWords.has(x)));
  const union = new Set([...actualWords, ...suggestedWords]);
  
  return intersection.size / union.size;
}

function getGitDiff(baseRef, headRef) {
  try {
    return sh(`git diff ${baseRef}..${headRef} --unified=0 --no-color`);
  } catch (e) {
    console.warn(`Failed to get git diff: ${e.message}`);
    return '';
  }
}

function loadSuggestions() {
  try {
    const suggestionsPath = '.copilot/suggestions.json';
    if (!fs.existsSync(suggestionsPath)) {
      console.warn('No suggestions file found at .copilot/suggestions.json');
      return [];
    }
    
    const content = fs.readFileSync(suggestionsPath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch (e) {
    console.warn(`Failed to load suggestions: ${e.message}`);
    return [];
  }
}

function parseDiffToChunks(diff) {
  const chunks = [];
  const lines = diff.split('\n');
  let currentChunk = null;
  
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = {
        file: line.split(' ')[2]?.replace('a/', '') || '',
        additions: [],
        deletions: []
      };
    } else if (line.startsWith('@@')) {
      // Skip hunk headers
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      currentChunk?.additions.push(line.substring(1));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      currentChunk?.deletions.push(line.substring(1));
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

function computeOverallScore(diffChunks, suggestions) {
  if (diffChunks.length === 0) {
    console.log('No code changes detected');
    return { score: 1.0, details: [] };
  }
  
  if (suggestions.length === 0) {
    console.log('No suggestions available for comparison');
    return { score: 0.0, details: [] };
  }
  
  const details = [];
  let totalScore = 0;
  let validComparisons = 0;
  
  for (const chunk of diffChunks) {
    const chunkText = [...chunk.additions, ...chunk.deletions].join('\n');
    if (!chunkText.trim()) continue;
    
    let bestScore = 0;
    let bestSuggestion = null;
    
    for (const suggestion of suggestions) {
      const suggestionText = suggestion.text || '';
      const score = computeOverlap(chunkText, suggestionText);
      
      if (score > bestScore) {
        bestScore = score;
        bestSuggestion = suggestion;
      }
    }
    
    details.push({
      file: chunk.file,
      score: bestScore,
      suggestion: bestSuggestion?.text?.substring(0, 100) + '...' || 'N/A'
    });
    
    totalScore += bestScore;
    validComparisons++;
  }
  
  const overallScore = validComparisons > 0 ? totalScore / validComparisons : 0;
  return { score: overallScore, details };
}

async function sealToLedger(proof) {
  if (!LEDGER_BASE_URL || !LEDGER_ADMIN_TOKEN) {
    console.log('Skipping ledger sealing: missing LEDGER_BASE_URL or LEDGER_ADMIN_TOKEN');
    return null;
  }
  
  try {
    const response = await fetch(`${LEDGER_BASE_URL}/seal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEDGER_ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proof)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Proof sealed to ledger: ${result.id || 'unknown'}`);
      return result;
    } else {
      console.warn(`Failed to seal proof: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (e) {
    console.warn(`Error sealing to ledger: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Copilot Diff Verifier');
  console.log(`Comparing ${BASE_REF}..${HEAD_REF}`);
  
  // Get actual changes
  const diff = getGitDiff(BASE_REF, HEAD_REF);
  const diffChunks = parseDiffToChunks(diff);
  
  // Load suggestions
  const suggestions = loadSuggestions();
  
  // Compute overlap score
  const { score, details } = computeOverallScore(diffChunks, suggestions);
  
  // Create proof
  const proof = {
    timestamp: new Date().toISOString(),
    baseRef: BASE_REF,
    headRef: HEAD_REF,
    diffHash: crypto.createHash('sha256').update(diff).digest('hex'),
    overlapScore: score,
    minScore: MIN_SCORE,
    conforms: score >= MIN_SCORE,
    details: details,
    metadata: {
      totalChunks: diffChunks.length,
      totalSuggestions: suggestions.length,
      validComparisons: details.length
    }
  };
  
  // Save proof
  fs.mkdirSync('.copilot', { recursive: true });
  fs.writeFileSync(PROOF_OUT, JSON.stringify(proof, null, 2));
  
  // Seal to ledger if configured
  const ledgerResult = await sealToLedger(proof);
  if (ledgerResult) {
    proof.ledgerSeal = ledgerResult;
  }
  
  // Report results
  console.log(`\n📊 Results:`);
  console.log(`  Overlap Score: ${(score * 100).toFixed(1)}%`);
  console.log(`  Threshold: ${(MIN_SCORE * 100).toFixed(1)}%`);
  console.log(`  Status: ${proof.conforms ? '✅ CONFORMS' : '❌ DIVERGES'}`);
  console.log(`  Proof: ${PROOF_OUT}`);
  
  if (details.length > 0) {
    console.log(`\n📋 Details:`);
    details.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.file}: ${(d.score * 100).toFixed(1)}%`);
    });
  }
  
  // Exit with appropriate code
  if (MIN_SCORE_FAIL && !proof.conforms) {
    console.log(`\n❌ Failing due to low overlap score (${(score * 100).toFixed(1)}% < ${(MIN_SCORE * 100).toFixed(1)}%)`);
    process.exit(1);
  }
  
  console.log(`\n✅ Verification complete`);
}

main().catch(e => {
  console.error('❌ Verification failed:', e.message);
  process.exit(1);
});
