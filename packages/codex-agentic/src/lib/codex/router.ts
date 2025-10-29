/**
 * Codex Router - Multi-LLM Deliberation Engine
 * Orchestrates DelibProof consensus across multiple LLM providers
 */

import { getAnchor } from '../../agents/anchors';
import type { CodexRequest, CodexVote, DelibProof, ProviderId } from '../../types';
import { callOpenAI } from './providers/openai';
import { callAnthropic } from './providers/anthropic';
import { callGemini } from './providers/gemini';
import { callDeepSeek } from './providers/deepseek';
import { callLocal } from './providers/local';
import { giScoreFor, calculateAgreement, groupByTextSimilarity } from '../gi/metrics';
import { attestToLedger } from '../gi/ledger';
import { oaaLearn, hasOAAConsent } from '../discourse/oaa';
import { generateTraceId } from '../util/hash';

/**
 * Provider dispatch table
 */
const DISPATCH: Record<ProviderId, (p: string, r?: CodexRequest) => Promise<CodexVote>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  deepseek: callDeepSeek,
  local: callLocal,
};

/**
 * Main deliberation function
 * Executes DelibProof consensus across multiple providers
 */
export async function codexDeliberate(req: CodexRequest): Promise<DelibProof> {
  const anchor = getAnchor(req.agent);

  if (!anchor || !anchor.active) {
    throw new Error(`Anchor not available for agent ${req.agent}`);
  }

  // 1) Build the prompt with constitutional context
  const prompt = buildPrompt(req);

  // 2) Fan out to all providers in the anchor's default route
  console.log(
    `[Codex] Deliberating for ${req.agent} via [${anchor.defaultRoute.join(', ')}]`
  );

  const votes = await Promise.all(
    anchor.defaultRoute.map((provider) => {
      return DISPATCH[provider](prompt, req).catch((error) => {
        console.error(`[Codex] Provider ${provider} failed:`, error);
        // Return a failure vote instead of throwing
        return {
          provider,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        } as CodexVote;
      });
    })
  );

  // Filter out error votes for consensus calculation
  const validVotes = votes.filter((v) => !v.meta?.error);

  if (validVotes.length === 0) {
    throw new Error('All providers failed - no valid votes');
  }

  // 3) Calculate agreement using text similarity
  const agreement = calculateAgreement(validVotes, 0.80);

  // 4) Select winner (first from largest agreement group)
  const groups = groupByTextSimilarity(validVotes, 0.80);
  const topGroup = groups.sort((a, b) => b.length - a.length)[0];
  const winner = topGroup[0];

  // 5) Compute GI score
  const giScore = giScoreFor({
    agent: anchor.agent,
    agreement,
    votes: validVotes,
  });

  // 6) Generate trace ID
  const traceId = generateTraceId({ t: Date.now(), req, votes });

  // 7) Build DelibProof result
  const proof: DelibProof = {
    agreement,
    votes,
    winner,
    traceId,
    giScore,
    timestamp: new Date().toISOString(),
  };

  // 8) Attest to Civic Ledger (fire-and-forget)
  attestToLedger({
    namespace: anchor.ledgerNamespace,
    traceId,
    agent: anchor.agent,
    agreement,
    giScore,
    providers: validVotes.map((v) => v.provider),
  }).catch((err) => console.error('[Ledger] Attestation failed:', err));

  // 9) Teach OAA Hub if webhook configured and consent given
  if (anchor.learnWebhook && hasOAAConsent(anchor.agent)) {
    oaaLearn(anchor.learnWebhook, {
      agent: anchor.agent,
      traceId,
      input: req.input,
      output: winner.output,
      agreement,
      giScore,
    }).catch((err) => console.error('[OAA] Learning failed:', err));
  }

  // 10) Check minimum agreement threshold
  if (agreement < anchor.minAgreement) {
    console.warn(
      `[Codex] Agreement ${agreement.toFixed(2)} below minimum ${anchor.minAgreement} for ${req.agent}`
    );
    // Include warning in proof metadata
    proof.winner.meta = {
      ...proof.winner.meta,
      belowThreshold: true,
      minAgreement: anchor.minAgreement,
    };
  }

  console.log(
    `[Codex] Deliberation complete: agreement=${agreement.toFixed(2)}, gi=${giScore.toFixed(3)}`
  );

  return proof;
}

/**
 * Build a prompt with constitutional context
 */
function buildPrompt(req: CodexRequest): string {
  const systemPrompt =
    process.env.CODEX_SYSTEM ||
    'Follow Virtue Accords. Prioritize integrity, privacy, safety. Cite sources when non-trivial.';

  return `Agent: ${req.agent}
Constitution: ${systemPrompt}
Task: ${req.input}
Constraints: GI >= 0.95, provide clear rationale.

${req.context ? `Context: ${JSON.stringify(req.context)}` : ''}`.trim();
}

/**
 * Execute a council-wide deliberation across all active agents
 */
export async function councilDeliberate(input: string): Promise<{
  councilAgreement: number;
  giAvg: number;
  results: DelibProof[];
}> {
  const { getActiveAnchors } = await import('../../agents/anchors');
  const activeAgents = getActiveAnchors();

  console.log(`[Council] Starting deliberation with ${activeAgents.length} active agents`);

  const results = await Promise.all(
    activeAgents.map((anchor) =>
      codexDeliberate({
        agent: anchor.agent,
        input,
      })
    )
  );

  const councilAgreement =
    results.reduce((sum, r) => sum + r.agreement, 0) / Math.max(1, results.length);

  const giAvg = results.reduce((sum, r) => sum + r.giScore, 0) / Math.max(1, results.length);

  console.log(
    `[Council] Deliberation complete: councilAgreement=${councilAgreement.toFixed(2)}, giAvg=${giAvg.toFixed(3)}`
  );

  return {
    councilAgreement,
    giAvg,
    results,
  };
}
