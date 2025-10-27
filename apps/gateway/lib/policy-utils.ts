/**
 * Kaizen OS Policy Utilities
 * Tier resolution, eligibility checks, and policy helpers
 */

import { getPolicy, Tier } from "../../../packages/policy/policy-loader";

const tierRank: Record<Tier, number> = { 
  research: 0, 
  standard: 1, 
  high: 2, 
  critical: 3 
};

/**
 * Determine operation tier from URL path
 */
export function opTierFromUrl(urlPath: string): Tier {
  const policy = getPolicy();
  const { high_impact_paths, op_tier_mapping } = policy.eligibility;

  const matches = (patterns: string[]) =>
    patterns.some((rx) => new RegExp(rx).test(urlPath));

  if (matches(high_impact_paths.critical)) return "critical";
  if (matches(high_impact_paths.high)) return "high";

  for (const t of ["high", "standard", "research"] as Tier[]) {
    if (matches(op_tier_mapping[t])) return t;
  }

  return "research";
}

/**
 * Check if companion is eligible for operation tier
 */
export function isCompanionEligibleForTier(
  companionName: string, 
  tier: Tier
): { ok: boolean; reason?: string } {
  const policy = getPolicy();
  const c = policy.companions[companionName];
  
  if (!c) {
    return { ok: false, reason: "unknown companion" };
  }

  // Companion tier must be >= operation tier (tier floor)
  if (tierRank[c.safety_tier] < tierRank[tier]) {
    return { 
      ok: false, 
      reason: `tier-floor: ${c.safety_tier} < ${tier}` };
  }

  // Check flags (e.g., SOLARA/ZENITH allowed tiers)
  if (c.flags?.allowed_tiers && !c.flags.allowed_tiers.includes(tier)) {
    return { 
      ok: false, 
      reason: `not in allowed_tiers for ${companionName}` 
    };
  }

  // Check explicit forbid rules
  for (const rule of policy.eligibility.rules) {
    if (rule.type === "forbid" && rule.when?.companion === companionName) {
      const op = rule.when.op_tier ?? [];
      if (op.includes(tier)) {
        return { ok: false, reason: `forbidden by rule ${rule.name}` };
      }
    }
  }

  return { ok: true };
}

/**
 * Get tier requirements (constitutional, GI, votes)
 */
export function tierRequirements(tier: Tier) {
  const policy = getPolicy();
  const t = policy.tiers[tier];
  
  return {
    constitutional_min: t.constitutional_min,
    gi_min: t.gi_min,
    required_votes: t.required_votes,
    required_critical_votes: t.required_critical_votes,
  };
}

/**
 * Check if tier requires critical companion
 */
export function isCriticalRequired(tier: Tier): boolean {
  const policy = getPolicy();
  return policy.consensus.require_critical_member_for.includes(tier);
}

/**
 * Check if companion is critical tier
 */
export function isCriticalCompanion(name: string): boolean {
  return name === "AUREA" || name === "ATLAS";
}

/**
 * Check if companion is advanced tier (AUREA, ATLAS, ZENITH)
 */
export function isAdvancedCompanion(name: string): boolean {
  return name === "AUREA" || name === "ATLAS" || name === "ZENITH";
}

/**
 * Get companion weight
 */
export function getCompanionWeight(name: string): number {
  const policy = getPolicy();
  return policy.consensus.weights[name] || 0;
}

export { Tier };

