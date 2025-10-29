/**
 * Tests for Codex Router
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { codexDeliberate } from '../src/lib/codex/router';
import { getAnchor } from '../src/agents/anchors';

describe('Codex Router', () => {
  it('should get AUREA stability anchor', () => {
    const anchor = getAnchor('AUREA');
    expect(anchor).toBeDefined();
    expect(anchor?.agent).toBe('AUREA');
    expect(anchor?.defaultRoute).toContain('openai');
    expect(anchor?.minAgreement).toBeGreaterThan(0);
  });

  it('should execute a deliberation for AUREA', async () => {
    const proof = await codexDeliberate({
      agent: 'AUREA',
      input: 'Explain GI succinctly in one sentence.',
    });

    expect(proof).toBeDefined();
    expect(proof.winner).toBeDefined();
    expect(proof.winner.output).toBeTruthy();
    expect(proof.agreement).toBeGreaterThan(0);
    expect(proof.agreement).toBeLessThanOrEqual(1);
    expect(proof.giScore).toBeGreaterThan(0);
    expect(proof.giScore).toBeLessThanOrEqual(1);
    expect(proof.traceId).toBeTruthy();
    expect(proof.timestamp).toBeTruthy();
  });

  it('should handle multiple providers', async () => {
    const proof = await codexDeliberate({
      agent: 'ATLAS',
      input: 'What is the 90-day epoch system?',
    });

    expect(proof.votes.length).toBeGreaterThan(0);
    // ATLAS routes to ['anthropic', 'openai']
    expect(proof.votes.length).toBeGreaterThanOrEqual(2);
  });

  it('should reject invalid agent', async () => {
    await expect(async () => {
      await codexDeliberate({
        agent: 'INVALID' as any,
        input: 'Test',
      });
    }).rejects.toThrow();
  });
});
