#!/usr/bin/env node

/**
 * @fileoverview Generate Pulse from Repository State
 * @description Fallback pulse generator when API is unavailable
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 * 
 * Usage:
 *   node scripts/generate_pulse.js > pulse.json
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const WORKSPACE_ROOT = process.cwd();

// ═══════════════════════════════════════════════════════════════════════════
// DIRECTORY SCANNING
// ═══════════════════════════════════════════════════════════════════════════

function countDirectories(basePath) {
  try {
    const fullPath = path.join(WORKSPACE_ROOT, basePath);
    if (!fs.existsSync(fullPath)) return [];
    
    return fs.readdirSync(fullPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !dirent.name.startsWith('.'))
      .map(dirent => dirent.name);
  } catch (error) {
    return [];
  }
}

function countWorkflows() {
  try {
    const workflowPath = path.join(WORKSPACE_ROOT, '.github/workflows');
    if (!fs.existsSync(workflowPath)) return { count: 0, active: [] };
    
    const files = fs.readdirSync(workflowPath)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    
    return {
      count: files.length,
      active: files.slice(0, 5) // First 5 as sample
    };
  } catch (error) {
    return { count: 0, active: [] };
  }
}

function readCycleInfo() {
  try {
    const cyclePath = path.join(WORKSPACE_ROOT, 'cycle.json');
    if (fs.existsSync(cyclePath)) {
      const cycleData = JSON.parse(fs.readFileSync(cyclePath, 'utf8'));
      return {
        cycle: cycleData.current_cycle || cycleData.cycle?.id || 'C-151',
        mii: cycleData.mii_baseline ?? cycleData.gi ?? 0.97
      };
    }
  } catch (error) {
    // Ignore
  }
  return { cycle: 'C-151', mii: 0.97 };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function generatePulse() {
  const cycleInfo = readCycleInfo();
  const apps = countDirectories('apps');
  const packages = countDirectories('packages');
  const sentinels = countDirectories('sentinels');
  const workflows = countWorkflows();
  
  const pulse = {
    version: '1.1.0',
    cycle: cycleInfo.cycle,
    timestamp: new Date().toISOString(),
    structure: {
      apps: apps.length,
      packages: packages.length,
      sentinels: sentinels.length,
      workflows: workflows
    },
    integrity: {
      mii: cycleInfo.mii,
      drift: null,
      drift_events: [],
      verdict: 'ADOPT'
    },
    coordination: {
      sentinels: {
        ATLAS: { score: 67.3, cathedral: 'FOR-GOVERNMENTS', uptime_days: 30 },
        AUREA: { score: 54.1, cathedral: 'FOR-ECONOMISTS', uptime_days: 28 },
        ECHO: { score: 48.7, cathedral: 'FOR-ACADEMICS', uptime_days: 25 },
        EVE: { score: 41.2, cathedral: 'FOR-PHILOSOPHERS', uptime_days: 30 },
        HERMES: { score: 59.8, cathedral: 'FOR-GOVERNMENTS', uptime_days: 27 }
      },
      multipliers: {
        'FOR-GOVERNMENTS': 2.0,
        'FOR-ECONOMISTS': 1.5,
        'FOR-ACADEMICS': 1.2,
        'FOR-PHILOSOPHERS': 1.0
      }
    },
    ledger: {
      entries: 151,
      last_entry: new Date().toISOString()
    },
    sentinel_uptime_days: 30
  };
  
  return pulse;
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

const pulse = generatePulse();
console.log(JSON.stringify(pulse, null, 2));
