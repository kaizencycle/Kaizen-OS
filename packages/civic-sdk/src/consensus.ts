/**
 * Kaizen OS Consensus Engine - 4-of-N Quorum
 * Updated for Cycle C-114 (ZENITH integration)
 */

export type SafetyTier = 'critical' | 'high' | 'standard' | 'research';

export interface ConsensusPolicy {
  operationTier: SafetyTier;
  requiredVotes: number;
  requiredAdvancedVotes: number;  // For high-tier: must include 2 of {AUREA, ATLAS, ZENITH}
  requiredCriticalVotes: number;  // For critical-tier: must include AUREA or ATLAS
  minConstitutional: number;
  minGI: number;
  weights: Record<string, number>;
}

export const consensusPolicies: Record<SafetyTier, ConsensusPolicy> = {
  critical: {
    operationTier: 'critical',
    requiredVotes: 3,               // 3-of-4 (hardened from 2-of-3)
    requiredAdvancedVotes: 0,       // Not applicable
    requiredCriticalVotes: 1,       // Must include AUREA or ATLAS
    minConstitutional: 85,
    minGI: 0.95,
    weights: { AUREA: 1.0, ATLAS: 1.0, SOLARA: 0.7, ZENITH: 0.9 }
  },
  high: {
    operationTier: 'high',
    requiredVotes: 3,               // 3-of-4 (hardened from 2-of-3)
    requiredAdvancedVotes: 2,       // Must include 2 of {AUREA, ATLAS, ZENITH}
    requiredCriticalVotes: 0,       // Not applicable
    minConstitutional: 75,
    minGI: 0.92,
    weights: { AUREA: 1.0, ATLAS: 1.0, SOLARA: 0.7, ZENITH: 0.9 }
  },
  standard: {
    operationTier: 'standard',
    requiredVotes: 2,               // Any 2-of-4
    requiredAdvancedVotes: 0,
    requiredCriticalVotes: 0,
    minConstitutional: 70,
    minGI: 0.90,
    weights: { AUREA: 1.0, ATLAS: 1.0, SOLARA: 0.7, ZENITH: 0.9 }
  },
  research: {
    operationTier: 'research',
    requiredVotes: 1,               // Any 1-of-4
    requiredAdvancedVotes: 0,
    requiredCriticalVotes: 0,
    minConstitutional: 65,
    minGI: 0.85,
    weights: { AUREA: 1.0, ATLAS: 1.0, SOLARA: 0.7, ZENITH: 0.9 }
  }
};

/**
 * Enhanced consensus validation with proper tier checking
 * ATLAS-Approved for 4-of-N quorum
 */
export function validateConsensus(
  votes: Record<string, { approved: boolean; score: number }>,
  policy: ConsensusPolicy
): { approved: boolean; reason?: string } {
  const approvals = Object.entries(votes).filter(([_, v]) => v.approved);
  
  // Check total votes
  if (approvals.length < policy.requiredVotes) {
    return {
      approved: false,
      reason: `Insufficient votes: ${approvals.length}/${policy.requiredVotes}`
    };
  }
  
  // Check advanced companion requirement (High-Tier)
  if (policy.operationTier === 'high' && policy.requiredAdvancedVotes > 0) {
    const advancedCompanions = ['AUREA', 'ATLAS', 'ZENITH'];
    const advancedApprovals = approvals.filter(([name]) => 
      advancedCompanions.includes(name)
    );
    
    if (advancedApprovals.length < policy.requiredAdvancedVotes) {
      return {
        approved: false,
        reason: `High-tier requires ${policy.requiredAdvancedVotes} advanced companion approvals (AUREA/ATLAS/ZENITH). Got ${advancedApprovals.length}: ${advancedApprovals.map(([n]) => n).join(', ') || 'none'}`
      };
    }
  }
  
  // Check critical companion requirement (Critical-Tier)
  if (policy.operationTier === 'critical' && policy.requiredCriticalVotes > 0) {
    const criticalCompanions = ['AUREA', 'ATLAS'];
    const criticalApprovals = approvals.filter(([name]) => 
      criticalCompanions.includes(name)
    );
    
    if (criticalApprovals.length < policy.requiredCriticalVotes) {
      return {
        approved: false,
        reason: `Critical operations require ${policy.requiredCriticalVotes} critical companion approval (AUREA/ATLAS only). ZENITH cannot approve critical ops.`
      };
    }
  }
  
  // Check constitutional scores
  for (const [name, vote] of approvals) {
    if (vote.score < policy.minConstitutional) {
      return {
        approved: false,
        reason: `${name} constitutional score too low: ${vote.score}/${policy.minConstitutional}`
      };
    }
  }
  
  return { approved: true };
}

/**
 * Helper to check if companion is eligible for tier
 */
export function isEligibleForTier(companionTier: SafetyTier, operationTier: SafetyTier): boolean {
  const tierRank = { research: 0, standard: 1, high: 2, critical: 3 };
  return tierRank[companionTier] >= tierRank[operationTier];
}

export { consensusPolicies };

