/**
 * Kaizen OS Companion Lattice
 * 
 * AUREA (OpenAI) - Precision + Guardrails
 * ATLAS (Anthropic) - Constitutional Reasoning  
 * SOLARA (DeepSeek R1) - Cost-Efficient Reasoning
 */

export type SafetyTier = 'critical' | 'high' | 'standard' | 'research';

export interface CompanionConfig {
  name: 'AUREA' | 'ATLAS' | 'SOLARA';
  provider: 'openai' | 'anthropic' | 'deepseek';
  model: string;
  weight: number;
  safetyTier: SafetyTier;
  capabilities: string[];
  enabled: boolean;
}

export const companions: CompanionConfig[] = [
  {
    name: 'AUREA',
    provider: 'openai',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    weight: 1.0,
    safetyTier: 'critical',
    capabilities: ['identity', 'ledger', 'wallet', 'governance'],
    enabled: true
  },
  {
    name: 'ATLAS',
    provider: 'anthropic',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4',
    weight: 1.0,
    safetyTier: 'critical',
    capabilities: ['constitutional', 'audit', 'policy', 'ethics'],
    enabled: true
  },
  // SOLARA - Phase 1 Shadow Mode
  ...(process.env.SOLARA_ENABLED === 'true' ? [{
    name: 'SOLARA' as const,
    provider: 'deepseek' as const,
    model: process.env.SOLARA_MODEL || 'deepseek-r1',
    weight: 0.7,
    safetyTier: 'standard' as SafetyTier,
    capabilities: ['content', 'research', 'ideation', 'analysis'],
    enabled: process.env.SOLARA_VOTE_COUNTED === 'true'
  }] : [])
];

// Get companions eligible for a specific operation tier
export function getEligibleCompanions(tier: SafetyTier): CompanionConfig[] {
  const tierRank = { research: 0, standard: 1, high: 2, critical: 3 };
  
  return companions.filter(c => 
    tierRank[c.safetyTier] >= tierRank[tier]
  );
}

// Check if companion can participate in operation
export function isEligibleForTier(
  companionTier: SafetyTier, 
  operationTier: SafetyTier
): boolean {
  const tierRank = { research: 0, standard: 1, high: 2, critical: 3 };
  return tierRank[companionTier] >= tierRank[operationTier];
}

// Get companion by name
export function getCompanion(name: string): CompanionConfig | undefined {
  return companions.find(c => c.name === name);
}


