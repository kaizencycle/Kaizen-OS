/**
 * Kaizen OS Consensus Engine
 * Validates votes, enforces weights, and determines approval
 */

import { getPolicy } from "../../../packages/policy/policy-loader";
import { Tier, tierRequirements, isCriticalRequired, isCriticalCompanion, isAdvancedCompanion, getCompanionWeight } from "./policy-utils";

export interface Vote {
  approved: boolean;
  constitutional_score: number; // 0..100
  latency_ms?: number;
}

export interface VoteMap {
  [companion: string]: Vote;
}

export interface ConsensusResult {
  approved: boolean;
  reason?: string;
  chosen?: string;
  detail?: {
    approvals: string[];
    chosen_score?: number;
    chosen_weight?: number;
    total_weight?: number;
  };
}

/**
 * Validate consensus based on votes and tier requirements
 */
export function validateConsensus(
  votes: VoteMap,
  tier: Tier,
  userGI: number
): ConsensusResult {
  const policy = getPolicy();
  const req = tierRequirements(tier);

  // GI threshold check
  if (userGI < req.gi_min) {
    return {
      approved: false,
      reason: `GI ${userGI} < required ${req.gi_min}`,
    };
  }

  // Count approvals that meet constitutional minimum
  const approvals = Object.entries(votes).filter(
    ([_, v]) => v.approved && v.constitutional_score >= req.constitutional_min
  );

  // Required vote count
  if (approvals.length < req.required_votes) {
    return {
      approved: false,
      reason: `insufficient approvals: ${approvals.length}/${req.required_votes}`,
    };
  }

  // Critical-member rule (for high/critical tiers)
  if (isCriticalRequired(tier)) {
    const hasCritical = approvals.some(([name]) => isCriticalCompanion(name));
    if (!hasCritical) {
      return {
        approved: false,
        reason: "missing critical companion approval (AUREA/ATLAS required)",
      };
    }

    // For high tier: need 2 advanced companions
    if (tier === "high" && req.required_critical_votes >= 2) {
      const advanced = approvals.filter(([name]) => 
        isAdvancedCompanion(name)
      );
      if (advanced.length < req.required_critical_votes) {
        return {
          approved: false,
          reason: `high-tier requires ${req.required_critical_votes} advanced companions, got ${advanced.length}`,
        };
      }
    }
  }

  // Calculate total weight of approvals
  const totalWeight = approvals.reduce(
    (sum, [name]) => sum + getCompanionWeight(name),
    0
  );

  // Tie-break: choose best companion
  const weighted = approvals
    .map(([name, v]) => ({
      name,
      v,
      weight: getCompanionWeight(name),
    }))
    .sort((a, b) => {
      // Order: constitutional_score desc, latency asc, weight desc
      if (b.v.constitutional_score !== a.v.constitutional_score) {
        return b.v.constitutional_score - a.v.constitutional_score;
      }
      if ((a.v.latency_ms ?? 0) !== (b.v.latency_ms ?? 0)) {
        return (a.v.latency_ms ?? 0) - (b.v.latency_ms ?? 0);
      }
      return (b.weight ?? 0) - (a.weight ?? 0);
    });

  return {
    approved: true,
    chosen: weighted[0]?.name,
    detail: {
      approvals: approvals.map(([n]) => n),
      chosen_score: weighted[0]?.v.constitutional_score,
      chosen_weight: weighted[0]?.weight,
      total_weight: totalWeight,
    },
  };
}

/**
 * Collect votes from all eligible companions
 */
export async function collectVotes(
  eligibleCompanions: string[],
  prompt: string,
  tier: Tier
): Promise<VoteMap> {
  const votes: VoteMap = {};

  // Mock vote collection - in production, call actual companions
  for (const name of eligibleCompanions) {
    try {
      // Call companion provider
      const result = await callCompanion(name, prompt);
      
      // Mock constitutional validation
      const constitutionalScore = await validateConstitutional(result, tier);

      votes[name] = {
        approved: constitutionalScore >= 70,
        constitutional_score: constitutionalScore,
        latency_ms: 1234, // Mock latency
      };
    } catch (error) {
      votes[name] = {
        approved: false,
        constitutional_score: 0,
      };
    }
  }

  return votes;
}

/**
 * Call companion provider (mock - implement actual calls)
 */
async function callCompanion(name: string, prompt: string): Promise<string> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[${name}] Response to: ${prompt.substring(0, 50)}...`);
    }, 500);
  });
}

/**
 * Validate constitutional score (mock - implement actual validation)
 */
async function validateConstitutional(text: string, tier: Tier): Promise<number> {
  // Mock constitutional validation
  return 85;
}

