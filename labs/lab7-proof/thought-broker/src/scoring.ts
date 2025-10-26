import { ThoughtMessage } from './types.js';

export function computeConsensusScore(messages: ThoughtMessage[]): number {
  // Weight: accuracy 0.35, citations 0.25, security 0.20, coherence 0.20 (mocked)
  const arb = messages.filter(m => m.role === 'arbiter').at(-1);
  const base = arb?.score ?? 0.9;
  const hasCitations = (arb?.citations?.length || 0) > 0 ? 0.02 : -0.05;
  return Math.max(0, Math.min(1, base + hasCitations));
}

export function mustHalt(score: number, loopCount: number, tau: number, maxLoops: number) {
  if (score >= tau) return true;
  if (loopCount >= maxLoops) return true;
  return false;
}
