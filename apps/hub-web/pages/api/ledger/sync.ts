import { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

interface ChamberSweep {
  chamber_id: string;
  chamber_name: string;
  parent: string;
  cycle: string;
  result: 'Complete' | 'Partial' | 'Failed';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  duration: string;
  integrity_anchor: string;
  artifacts: string[];
  summary: string;
  next_actions: string[];
  morale_delta: number;
  timestamp: string;
}

interface SyncRequest {
  chamber_sweep: ChamberSweep;
  sync_mode: 'AUTO' | 'MANUAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SyncResponse {
  success: boolean;
  sync_id: string;
  integrity_verified: boolean;
  ledger_entry_id?: string;
  message: string;
  timestamp: string;
}

// Validate chamber sweep data
function validateChamberSweep(sweep: ChamberSweep): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!sweep.chamber_id || typeof sweep.chamber_id !== 'string') {
    errors.push('chamber_id is required and must be a string');
  }
  
  if (!sweep.chamber_name || typeof sweep.chamber_name !== 'string') {
    errors.push('chamber_name is required and must be a string');
  }
  
  if (!sweep.parent || sweep.parent !== 'Command Ledger III') {
    errors.push('parent must be "Command Ledger III"');
  }
  
  if (!sweep.cycle || !/^C-\d+$/.test(sweep.cycle)) {
    errors.push('cycle must match pattern C-{number}');
  }
  
  if (!sweep.result || !['Complete', 'Partial', 'Failed'].includes(sweep.result)) {
    errors.push('result must be one of: Complete, Partial, Failed');
  }
  
  if (!sweep.status || !['SUCCESS', 'WARNING', 'ERROR'].includes(sweep.status)) {
    errors.push('status must be one of: SUCCESS, WARNING, ERROR');
  }
  
  if (!sweep.integrity_anchor || !/^SHA256:[a-f0-9]{64}$/i.test(sweep.integrity_anchor)) {
    errors.push('integrity_anchor must be a valid SHA256 hash');
  }
  
  if (!sweep.summary || typeof sweep.summary !== 'string') {
    errors.push('summary is required and must be a string');
  }
  
  if (typeof sweep.morale_delta !== 'number') {
    errors.push('morale_delta must be a number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Verify integrity anchor
function verifyIntegrityAnchor(sweep: ChamberSweep): boolean {
  try {
    const dataToHash = JSON.stringify({
      chamber_id: sweep.chamber_id,
      chamber_name: sweep.chamber_name,
      cycle: sweep.cycle,
      summary: sweep.summary,
      artifacts: sweep.artifacts,
      timestamp: sweep.timestamp
    });
    
    const calculatedHash = createHash('sha256').update(dataToHash).digest('hex');
    const providedHash = sweep.integrity_anchor.replace('SHA256:', '').toLowerCase();
    
    return calculatedHash === providedHash;
  } catch (error) {
    console.error('Error verifying integrity anchor:', error);
    return false;
  }
}

// Store chamber sweep in ledger
function storeChamberSweep(sweep: ChamberSweep, syncId: string): string {
  const ledgerDir = path.join(process.cwd(), '.civic', 'ledger', 'sweeps');
  const cycleDir = path.join(ledgerDir, sweep.cycle);
  
  // Ensure directories exist
  if (!fs.existsSync(ledgerDir)) {
    fs.mkdirSync(ledgerDir, { recursive: true });
  }
  if (!fs.existsSync(cycleDir)) {
    fs.mkdirSync(cycleDir, { recursive: true });
  }
  
  const sweepFile = path.join(cycleDir, `${sweep.chamber_id}-sweep.json`);
  const ledgerEntry = {
    sync_id: syncId,
    timestamp: new Date().toISOString(),
    chamber_sweep: sweep,
    ledger_entry_id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  fs.writeFileSync(sweepFile, JSON.stringify(ledgerEntry, null, 2));
  
  return ledgerEntry.ledger_entry_id;
}

// Update global continuity map
function updateContinuityMap(sweep: ChamberSweep, syncId: string): void {
  const continuityFile = path.join(process.cwd(), '.civic', 'continuity-map.json');
  
  let continuityMap: any = {};
  if (fs.existsSync(continuityFile)) {
    try {
      continuityMap = JSON.parse(fs.readFileSync(continuityFile, 'utf8'));
    } catch (error) {
      console.error('Error reading continuity map:', error);
      continuityMap = {};
    }
  }
  
  if (!continuityMap.cycles) {
    continuityMap.cycles = {};
  }
  
  if (!continuityMap.cycles[sweep.cycle]) {
    continuityMap.cycles[sweep.cycle] = {
      chambers: {},
      total_morale_delta: 0,
      status: 'ACTIVE'
    };
  }
  
  continuityMap.cycles[sweep.cycle].chambers[sweep.chamber_id] = {
    name: sweep.chamber_name,
    status: sweep.status,
    result: sweep.result,
    morale_delta: sweep.morale_delta,
    last_sync: new Date().toISOString(),
    sync_id: syncId
  };
  
  // Update total morale delta for the cycle
  continuityMap.cycles[sweep.cycle].total_morale_delta += sweep.morale_delta;
  
  // Update global stats
  if (!continuityMap.global_stats) {
    continuityMap.global_stats = {
      total_chambers: 0,
      total_morale_delta: 0,
      last_updated: new Date().toISOString()
    };
  }
  
  continuityMap.global_stats.total_chambers = Object.keys(continuityMap.cycles).reduce(
    (total, cycle) => total + Object.keys(continuityMap.cycles[cycle].chambers).length,
    0
  );
  continuityMap.global_stats.total_morale_delta = Object.values(continuityMap.cycles).reduce(
    (total: number, cycle: any) => total + cycle.total_morale_delta,
    0
  );
  continuityMap.global_stats.last_updated = new Date().toISOString();
  
  fs.writeFileSync(continuityFile, JSON.stringify(continuityMap, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SyncResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      sync_id: '',
      integrity_verified: false,
      message: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const { chamber_sweep, sync_mode, priority }: SyncRequest = req.body;
    
    if (!chamber_sweep) {
      return res.status(400).json({
        success: false,
        sync_id: '',
        integrity_verified: false,
        message: 'chamber_sweep is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate chamber sweep data
    const validation = validateChamberSweep(chamber_sweep);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        sync_id: '',
        integrity_verified: false,
        message: `Validation failed: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify integrity anchor
    const integrityVerified = verifyIntegrityAnchor(chamber_sweep);
    if (!integrityVerified) {
      return res.status(400).json({
        success: false,
        sync_id: '',
        integrity_verified: false,
        message: 'Integrity anchor verification failed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate sync ID
    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store chamber sweep in ledger
    const ledgerEntryId = storeChamberSweep(chamber_sweep, syncId);
    
    // Update global continuity map
    updateContinuityMap(chamber_sweep, syncId);
    
    // Log the sync
    console.log(`Chamber sync completed: ${chamber_sweep.chamber_id} (${syncId})`);
    
    return res.status(200).json({
      success: true,
      sync_id: syncId,
      integrity_verified: true,
      ledger_entry_id: ledgerEntryId,
      message: '🪶 Sweep integrated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing chamber sync:', error);
    
    return res.status(500).json({
      success: false,
      sync_id: '',
      integrity_verified: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}