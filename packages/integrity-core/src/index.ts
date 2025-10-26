// Kaizen OS Integrity Core - GI scoring and integrity checks
export * from './gi-calculator';
export * from './integrity-checker';
export * from './middleware';
export * from './types';

import { GICalculator } from './gi-calculator';
import { IntegrityChecker } from './integrity-checker';
import { IntegrityChecks, IntegrityResult } from './types';

// Main integrity check function
export async function checkIntegrity(service: string, checks: IntegrityChecks): Promise<IntegrityResult> {
  const calculator = new GICalculator();
  const checker = new IntegrityChecker();
  
  const gi = calculator.calculateGI(checks);
  const status = checker.evaluateStatus(gi, checks);
  
  return {
    service,
    gi,
    status,
    timestamp: new Date().toISOString(),
    checks,
    recommendations: checker.getRecommendations(gi, checks)
  };
}


