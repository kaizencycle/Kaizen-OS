/**
 * Governance Integrity (GI) Metrics
 * Computes GI scores for deliberations
 */

import type { ProviderId, CodexVote } from '../../types';

export interface GIScoreParams {
  agent: string;
  agreement: number;
  votes: { provider: ProviderId }[];
}

/**
 * Calculate GI score based on agreement and provider diversity
 *
 * The score is a blend of:
 * - Agreement weight (85%): How much the providers agreed
 * - Diversity bonus (15%): How many different providers were used
 *
 * Higher scores indicate better governance integrity
 */
export function giScoreFor(params: GIScoreParams): number {
  const { agreement, votes } = params;

  // Calculate provider diversity (unique providers / total providers)
  const uniqueProviders = new Set(votes.map((v) => v.provider)).size;
  const diversity = uniqueProviders / Math.max(1, votes.length);

  // Weighted blend: 85% agreement + 15% diversity
  const score = 0.85 * agreement + 0.15 * diversity;

  // Clamp to [0, 1]
  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate agreement level between votes using text similarity
 */
export function calculateAgreement(votes: CodexVote[], threshold = 0.80): number {
  if (votes.length === 0) return 0;
  if (votes.length === 1) return 1.0;

  const groups = groupByTextSimilarity(votes, threshold);
  const largestGroup = groups.sort((a, b) => b.length - a.length)[0];

  return largestGroup.length / votes.length;
}

/**
 * Group votes by text similarity using Jaccard similarity
 */
export function groupByTextSimilarity(votes: CodexVote[], threshold: number): CodexVote[][] {
  const groups: CodexVote[][] = [];

  for (const vote of votes) {
    const terms = tokenize(vote.output);
    let placed = false;

    for (const group of groups) {
      const base = group[0];
      const baseTerms = tokenize(base.output);
      const jaccard = jaccardSimilarity(terms, baseTerms);

      if (jaccard >= threshold) {
        group.push(vote);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([vote]);
    }
  }

  return groups;
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/g)
      .filter(Boolean)
  );
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = [...set1].filter((x) => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;

  return union === 0 ? 0 : intersection / union;
}
