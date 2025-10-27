/**
 * Kaizen OS Policy Middleware
 * Express/Fastify helpers for tier resolution and enforcement
 */

import { opTierFromUrl, isCompanionEligibleForTier, Tier } from "../lib/policy-utils";
import { validateConsensus, VoteMap } from "../lib/consensus";

/**
 * Resolve operation tier from request path
 */
export function resolveOperationTier(reqPath: string): Tier {
  return opTierFromUrl(reqPath);
}

/**
 * Enforce companion eligibility for operation tier
 */
export function enforceCompanionEligibility(
  companionName: string,
  tier: Tier
): void {
  const res = isCompanionEligibleForTier(companionName, tier);
  
  if (!res.ok) {
    const err: any = new Error(
      `Companion ${companionName} not eligible: ${res.reason}`
    );
    err.status = 403;
    throw err;
  }
}

/**
 * Enforce consensus or throw 403
 */
export function enforceConsensusOrThrow(
  votes: VoteMap,
  tier: Tier,
  userGI: number
): { approved: boolean; chosen?: string; detail?: any } {
  const verdict = validateConsensus(votes, tier, userGI);
  
  if (!verdict.approved) {
    const err: any = new Error(`Consensus failed: ${verdict.reason}`);
    err.status = 403;
    throw err;
  }
  
  return verdict;
}

/**
 * Gate user GI before operation
 */
export function gateUserGI(userGI: number, tier: Tier): boolean {
  const policy = require("../../../packages/policy/policy-loader").getPolicy();
  const tierReq = policy.tiers[tier];
  
  if (userGI < tierReq.gi_min) {
    const err: any = new Error(
      `GI ${userGI} < required ${tierReq.gi_min} for ${tier} tier`
    );
    err.status = 403;
    throw err;
  }
  
  return true;
}

/**
 * Get user GI from request headers
 */
export function getUserGI(req: any): number {
  return parseFloat(req.headers["x-user-gi"] || "0");
}

export { Tier, VoteMap };

