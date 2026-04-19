// Kaizen OS Integrity Core - GI scoring and integrity checks
export * from './crdt/CRDTLedger';
export * from './gi-calculator';
export * from './integrity-checker';
export * from './middleware';
export * from './types';
export * from './crypto/mii_sign';

// MIC (Mobius Integrity Credits) and Kaizen Shards
export * from './mic/types';
export * from './mic/micMinting';
export * from './mic/shardWeights';
export * from './mic/micMintService';

// MIC/KS Constants and Conversions (C-151)
export * from './mic/constants';
export * from './mic/conversions';

// Mobius Habits (C-150)
export * from './habits';

// Mobius Pulse (Sentinel-ready repo heartbeat)
export * from './pulse';

// C-151 Sentinel Coordination MIC Economy
export * from './sentinel';

// C-152 Constitutional Enforcement (v1.1.2)
export * from './constitutional';

import { GICalculator } from './gi-calculator';
import { IntegrityChecker } from './integrity-checker';
import { IntegrityChecks, IntegrityResult } from './types';

// Main integrity check function
export async function checkIntegrity(service: string, checks: IntegrityChecks): Promise<IntegrityResult> {
  const calculator = new GICalculator();
  const checker = new IntegrityChecker();
  
  const mii = calculator.calculateGI(checks);
  const status = checker.evaluateStatus(mii, checks);
  
  return {
    service,
    mii,
    status,
    timestamp: new Date().toISOString(),
    checks,
    recommendations: checker.getRecommendations(mii, checks)
  };
}


