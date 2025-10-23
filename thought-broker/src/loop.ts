import { v4 as uuid } from 'uuid';
import { callModel } from './models.js';
import { computeConsensusScore, mustHalt } from './scoring.js';
import { attestDeliberation } from './ledger.js';
import { dispatchToCursor } from './cursor.js';
import { SafetyGuards } from './guards.js';
import { AuditLogger } from './audit.js';
import type { LoopState, StartLoopBody, ThoughtMessage } from './types.js';

const loops = new Map<string, LoopState>();

export function getLoop(id: string) {
  return loops.get(id);
}

export async function startLoop(body: StartLoopBody, policy: {
  maxLoops: number; tau: number; maxSeconds: number; allowDispatch: boolean;
}, integration: {
  ledgerBase: string; ledgerToken: string; cursorUrl: string; cursorToken: string;
}) {
  const id = `tb_${uuid().slice(0, 8)}`;
  const now = Date.now();
  const state: LoopState = {
    id, cycle: body.cycle, step: 0, startedAt: now, lastUpdatedAt: now,
    messages: [], status: 'running'
  };
  loops.set(id, state);

  // Log loop start
  AuditLogger.logLoopStart(id, body.cycle, body.goal);

  // Orchestration (bounded)
  let loopsRun = 0;
  const startWall = Date.now();

  while (state.status === 'running') {
    if (Date.now() - startWall > policy.maxSeconds * 1000) {
      state.status = 'failed';
      AuditLogger.logLoopHalt(id, 'timeout', 0, loopsRun);
      break;
    }
    loopsRun++;

    try {
      // 1) Hypothesis
      const hypo = await callModel('oaa-llm-a', 'hypothesis',
        `goal=${body.goal} proposalRef=${body.proposalRef} specRef=${body.specRef || ''} testsRef=${body.testsRef || ''}`);
      
      // Safety check
      const hypoValidation = SafetyGuards.validateMessage(hypo);
      if (!hypoValidation.valid) {
        throw new Error(`Hypothesis validation failed: ${hypoValidation.reason}`);
      }
      
      record(state, hypo);
      AuditLogger.logMessage(id, hypo, state.step);

      // 2) Critique
      const crit = await callModel('oaa-llm-b', 'critique', hypo.content);
      const critValidation = SafetyGuards.validateMessage(crit);
      if (!critValidation.valid) {
        throw new Error(`Critique validation failed: ${critValidation.reason}`);
      }
      
      record(state, crit);
      AuditLogger.logMessage(id, crit, state.step);

      // 3) Arbiter
      const arb = await callModel('oaa-llm-c', 'arbiter', `${hypo.content}\n${crit.content}`);
      const arbValidation = SafetyGuards.validateMessage(arb);
      if (!arbValidation.valid) {
        throw new Error(`Arbiter validation failed: ${arbValidation.reason}`);
      }
      
      record(state, arb);
      AuditLogger.logMessage(id, arb, state.step);
    } catch (error) {
      AuditLogger.logError(id, error as Error, `Loop step ${loopsRun}`);
      state.status = 'failed';
      break;
    }

    // Score & stop rules
    const score = computeConsensusScore(state.messages);
    const halt = mustHalt(score, loopsRun, policy.tau, policy.maxLoops);

    if (halt) {
      state.status = 'halted';
      state.consensus = {
        summary: 'Implement endpoints + tests per arbiter synthesis.',
        specDelta: '…(spec changes derived from arbiter)…',
        testsDelta: [{ name: 'payout-200', input: { path: '/ubi/summary' }, expect: { status: 200 } }],
        riskNotes: ['no migrations', 'read-only public endpoints'],
        citations: arb.citations || [],
        score
      };

      // Validate consensus before proceeding
      const consensusValidation = SafetyGuards.validateConsensus(state.consensus);
      if (!consensusValidation.valid) {
        state.status = 'failed';
        AuditLogger.logError(id, new Error(`Consensus validation failed: ${consensusValidation.reason}`), 'consensus_validation');
        break;
      }

      AuditLogger.logConsensus(id, state.consensus, score);

      // Attest the deliberation
      try {
        state.attestRef = await attestDeliberation(integration.ledgerBase, integration.ledgerToken, {
          cycle: state.cycle,
          loopId: state.id,
          score,
          citations: state.consensus.citations
        });
        AuditLogger.logAttestation(id, state.attestRef, true);
      } catch (error) {
        AuditLogger.logAttestation(id, 'failed', false);
        AuditLogger.logError(id, error as Error, 'attestation');
      }
      
      AuditLogger.logLoopHalt(id, 'consensus_reached', score, loopsRun);
      break;
    }

    if (loopsRun >= policy.maxLoops) {
      state.status = 'halted';
      AuditLogger.logLoopHalt(id, 'max_loops_reached', computeConsensusScore(state.messages), loopsRun);
      break;
    }
  }

  // Optional: dispatch to Cursor if allowed and we have consensus
  if (state.status === 'halted' && state.consensus && policy.allowDispatch) {
    try {
      await dispatchToCursor(integration.cursorUrl, integration.cursorToken, {
        repo: 'kaizencycle/OAA-API-Library',
        branch: `feature/${state.id}`,
        commitMessage: `feat: consensus ${state.id} (GI≥${policy.tau})`,
        files: [
          { path: '/.civic/change.spec.md', content: state.consensus.specDelta },
          { path: '/.civic/change.tests.json', content: JSON.stringify(state.consensus.testsDelta, null, 2) }
        ]
      });
      AuditLogger.logDispatch(id, 'kaizencycle/OAA-API-Library', `feature/${state.id}`, true);
    } catch (error) {
      AuditLogger.logDispatch(id, 'kaizencycle/OAA-API-Library', `feature/${state.id}`, false);
      AuditLogger.logError(id, error as Error, 'cursor_dispatch');
    }
  }

  return state;
}

function record(state: LoopState, msg: ThoughtMessage) {
  state.messages.push(msg);
  state.step++;
  state.lastUpdatedAt = Date.now();
}