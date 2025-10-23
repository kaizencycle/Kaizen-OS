import { ThoughtMessage, ModelId } from './types.js';

function fabricate(text: string) {
  // Tiny helper to keep the demo deterministic-ish
  return text.replace(/\s+/g, ' ').trim();
}

export async function callModel(
  id: ModelId,
  role: ThoughtMessage['role'],
  context: string
): Promise<ThoughtMessage> {
  // In production: route to your provider with safety filters.
  let content = '';
  if (role === 'hypothesis') {
    content = fabricate(`HYPOTHESIS: propose patch plan for: ${context}`);
  } else if (role === 'critique') {
    content = fabricate(`CRITIQUE: find risks, missing tests, missing citations: ${context}`);
  } else {
    content = fabricate(`ARBITER: synthesize and decide; include citations and a final score for: ${context}`);
  }
  // Dummy citations
  const citations = role !== 'hypothesis'
    ? [{ url: '/specs/07-incentives-gic.md', hash: 'sha256:abc123' }]
    : [];

  // Dummy score heuristic
  const score = role === 'arbiter' ? 0.93 : 0.88;

  return { role, from: id, content, citations, score, continue: score < 0.92 };
}