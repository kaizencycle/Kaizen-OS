/**
 * Tests for GI Metrics
 */

import { describe, it, expect } from 'vitest';
import { giScoreFor, calculateAgreement, groupByTextSimilarity } from '../src/lib/gi/metrics';
import type { CodexVote } from '../src/types';

describe('GI Metrics', () => {
  describe('giScoreFor', () => {
    it('should calculate GI score with high agreement', () => {
      const score = giScoreFor({
        agent: 'AUREA',
        agreement: 0.95,
        votes: [
          { provider: 'openai', output: 'test' },
          { provider: 'anthropic', output: 'test' },
        ],
      });

      expect(score).toBeGreaterThan(0.85);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it('should calculate GI score with low agreement', () => {
      const score = giScoreFor({
        agent: 'ZEUS',
        agreement: 0.60,
        votes: [
          { provider: 'deepseek', output: 'test' },
        ],
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(0.95);
    });

    it('should reward provider diversity', () => {
      const highDiversity = giScoreFor({
        agent: 'EVE',
        agreement: 0.90,
        votes: [
          { provider: 'openai', output: 'test' },
          { provider: 'anthropic', output: 'test' },
          { provider: 'gemini', output: 'test' },
        ],
      });

      const lowDiversity = giScoreFor({
        agent: 'EVE',
        agreement: 0.90,
        votes: [
          { provider: 'openai', output: 'test' },
          { provider: 'openai', output: 'test' },
        ],
      });

      expect(highDiversity).toBeGreaterThan(lowDiversity);
    });
  });

  describe('calculateAgreement', () => {
    it('should return 1.0 for identical outputs', () => {
      const votes: CodexVote[] = [
        { provider: 'openai', output: 'The answer is 42.' },
        { provider: 'anthropic', output: 'The answer is 42.' },
      ];

      const agreement = calculateAgreement(votes, 0.80);
      expect(agreement).toBeGreaterThanOrEqual(0.80);
    });

    it('should return low agreement for different outputs', () => {
      const votes: CodexVote[] = [
        { provider: 'openai', output: 'The sky is blue.' },
        { provider: 'anthropic', output: 'The ocean is deep.' },
      ];

      const agreement = calculateAgreement(votes, 0.80);
      expect(agreement).toBeLessThan(1.0);
    });
  });

  describe('groupByTextSimilarity', () => {
    it('should group similar texts together', () => {
      const votes: CodexVote[] = [
        { provider: 'openai', output: 'The quick brown fox jumps over lazy dog' },
        { provider: 'anthropic', output: 'The quick brown fox jumps over the lazy dog' },
        { provider: 'gemini', output: 'Something completely different about cats' },
      ];

      const groups = groupByTextSimilarity(votes, 0.70);
      expect(groups.length).toBeGreaterThanOrEqual(2);
    });

    it('should create one group for identical texts', () => {
      const votes: CodexVote[] = [
        { provider: 'openai', output: 'Identical text' },
        { provider: 'anthropic', output: 'Identical text' },
      ];

      const groups = groupByTextSimilarity(votes, 0.80);
      expect(groups.length).toBe(1);
      expect(groups[0].length).toBe(2);
    });
  });
});
