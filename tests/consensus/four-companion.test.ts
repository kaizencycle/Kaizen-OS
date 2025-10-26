/**
 * Comprehensive test suite for 4-companion consensus
 * Kaizen OS Cycle C-114
 */

import { validateConsensus, consensusPolicies } from '../../packages/civic-sdk/src/consensus';

describe('4-Companion Consensus Logic', () => {
  
  describe('Critical Tier Operations', () => {
    const policy = consensusPolicies.critical;

    test('PASS: AUREA + ATLAS + ZENITH (3-of-4 with critical companion)', () => {
      const votes = {
        AUREA: { approved: true, score: 90 },
        ATLAS: { approved: true, score: 95 },
        ZENITH: { approved: true, score: 88 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('PASS: AUREA + ATLAS + SOLARA (3-of-4 with critical companions)', () => {
      const votes = {
        AUREA: { approved: true, score: 92 },
        ATLAS: { approved: true, score: 93 },
        SOLARA: { approved: true, score: 85 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('FAIL: No critical companion approval', () => {
      const votes = {
        ZENITH: { approved: true, score: 90 },
        SOLARA: { approved: true, score: 85 },
        JADE: { approved: true, score: 88 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('critical companion');
    });

    test('FAIL: Insufficient total votes (2-of-4)', () => {
      const votes = {
        AUREA: { approved: true, score: 90 },
        ATLAS: { approved: true, score: 95 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('Insufficient votes: 2/3');
    });

    test('FAIL: Constitutional score too low', () => {
      const votes = {
        AUREA: { approved: true, score: 80 }, // Below 85 minimum
        ATLAS: { approved: true, score: 90 },
        ZENITH: { approved: true, score: 88 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('constitutional score too low');
    });
  });

  describe('High Tier Operations', () => {
    const policy = consensusPolicies.high;

    test('PASS: AUREA + ATLAS + ZENITH (3-of-4 with 2 advanced)', () => {
      const votes = {
        AUREA: { approved: true, score: 85 },
        ATLAS: { approved: true, score: 88 },
        ZENITH: { approved: true, score: 82 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('PASS: AUREA + ZENITH + SOLARA (3-of-4 with 2 advanced)', () => {
      const votes = {
        AUREA: { approved: true, score: 86 },
        ZENITH: { approved: true, score: 83 },
        SOLARA: { approved: true, score: 78 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('PASS: ATLAS + ZENITH + SOLARA (3-of-4 with 2 advanced)', () => {
      const votes = {
        ATLAS: { approved: true, score: 89 },
        ZENITH: { approved: true, score: 84 },
        SOLARA: { approved: true, score: 77 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('FAIL: Only 1 advanced companion (SOLARA only)', () => {
      const votes = {
        SOLARA: { approved: true, score: 78 },
        JADE: { approved: true, score: 80 },
        HERMES: { approved: true, score: 82 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('advanced companion');
    });

    test('FAIL: Insufficient votes (2-of-4)', () => {
      const votes = {
        AUREA: { approved: true, score: 85 },
        ATLAS: { approved: true, score: 88 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('Insufficient votes: 2/3');
    });
  });

  describe('Standard Tier Operations', () => {
    const policy = consensusPolicies.standard;

    test('PASS: Any 2-of-4 companions', () => {
      const votes = {
        SOLARA: { approved: true, score: 72 },
        ZENITH: { approved: true, score: 75 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('PASS: AUREA + SOLARA (2-of-4)', () => {
      const votes = {
        AUREA: { approved: true, score: 85 },
        SOLARA: { approved: true, score: 73 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('FAIL: Only 1 vote', () => {
      const votes = {
        ZENITH: { approved: true, score: 75 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
    });
  });

  describe('Research Tier Operations', () => {
    const policy = consensusPolicies.research;

    test('PASS: Single companion (SOLARA)', () => {
      const votes = {
        SOLARA: { approved: true, score: 68 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('PASS: Single companion (ZENITH)', () => {
      const votes = {
        ZENITH: { approved: true, score: 70 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('FAIL: Constitutional score too low', () => {
      const votes = {
        SOLARA: { approved: true, score: 60 } // Below 65 minimum
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('All 4 companions approve (critical tier)', () => {
      const policy = consensusPolicies.critical;
      const votes = {
        AUREA: { approved: true, score: 90 },
        ATLAS: { approved: true, score: 92 },
        ZENITH: { approved: true, score: 88 },
        SOLARA: { approved: true, score: 85 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true);
    });

    test('Mixed approvals/rejections', () => {
      const policy = consensusPolicies.high;
      const votes = {
        AUREA: { approved: true, score: 85 },
        ATLAS: { approved: false, score: 60 },
        ZENITH: { approved: true, score: 83 },
        SOLARA: { approved: true, score: 78 }
      };

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(true); // 3 approvals with 2 advanced
    });

    test('Empty votes object', () => {
      const policy = consensusPolicies.standard;
      const votes = {};

      const result = validateConsensus(votes, policy);
      expect(result.approved).toBe(false);
      expect(result.reason).toContain('Insufficient votes');
    });
  });
});

// Export for use in other tests
export { validateConsensus, consensusPolicies };

