/**
 * Example: Kaizen OS Consensus Route
 * Demonstrates how to use policy middleware in gateway routes
 */

import { Router } from "express";
import {
  resolveOperationTier,
  enforceCompanionEligibility,
  enforceConsensusOrThrow,
  getUserGI,
} from "../middleware/policy";
import { collectVotes } from "../lib/consensus";

const router = Router();

/**
 * POST /v1/oaa/consensus
 * Multi-companion consensus endpoint
 */
router.post("/v1/oaa/consensus", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const userGI = getUserGI(req);
    
    // Resolve operation tier from URL
    const tier = resolveOperationTier(req.path);

    console.log(`[consensus] Request: ${prompt.substring(0, 50)}... | Tier: ${tier} | User GI: ${userGI}`);

    // Get eligible companions for this tier
    const eligibleCompanions = ["AUREA", "ATLAS", "ZENITH", "SOLARA"].filter(
      (name) => {
        try {
          enforceCompanionEligibility(name, tier);
          return true;
        } catch {
          return false;
        }
      }
    );

    console.log(`[consensus] Eligible companions: ${eligibleCompanions.join(", ")}`);

    if (eligibleCompanions.length === 0) {
      return res.status(403).json({
        error: "No eligible companions for tier",
        tier,
      });
    }

    // Collect votes from all eligible companions
    const votes = await collectVotes(eligibleCompanions, prompt, tier);

    // Enforce consensus rules
    const verdict = enforceConsensusOrThrow(votes, tier, userGI);

    // Choose winning response
    const winner = verdict.chosen || eligibleCompanions[0];
    const winnerResponse = votes[winner]?.approved 
      ? `[${winner}] Consensus response` 
      : "No approved response";

    console.log(`[consensus] Approved: ${verdict.approved} | Chosen: ${verdict.chosen}`);

    // Seal to ledger (mock)
    await sealToLedger({
      action: "consensus.evaluated",
      tier,
      votes,
      chosen: verdict.chosen,
      user_gi: userGI,
      timestamp: new Date().toISOString(),
    });

    res.json({
      ok: true,
      approved: verdict.approved,
      tier,
      chosen: verdict.chosen,
      response: winnerResponse,
      scores: Object.fromEntries(
        Object.entries(votes).map(([n, v]) => [n, v.constitutional_score])
      ),
    });
  } catch (err: any) {
    if (err.status === 403) {
      return res.status(403).json({
        error: "Consensus failed",
        reason: err.message,
      });
    }
    next(err);
  }
});

/**
 * Mock ledger sealing
 */
async function sealToLedger(data: any): Promise<void> {
  console.log(`[ledger] Sealing: ${JSON.stringify(data)}`);
  // In production, POST to Ledger API
}

export default router;

