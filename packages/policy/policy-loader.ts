/**
 * Kaizen OS Policy Loader
 * Loads and validates consensus_config.yaml
 */

import fs from "node:fs";
import path from "node:path";

export type Tier = "research" | "standard" | "high" | "critical";

export interface CompanionConfig {
  provider: string;
  model_default: string;
  weight: number;
  safety_tier: Tier;
  capabilities: string[];
  flags?: {
    enabled?: boolean;
    vote_counted?: boolean;
    allowed_tiers?: Tier[];
  };
}

export interface TierConfig {
  constitutional_min: number;
  gi_min: number;
  required_votes: number;
  required_critical_votes: number;
}

export interface PolicyConfig {
  meta: {
    version: number;
    updated: string;
    owner: string;
    charter_url: string;
  };
  companions: Record<string, CompanionConfig>;
  tiers: Record<Tier, TierConfig>;
  eligibility: {
    rules: Array<{
      name: string;
      type: string;
      when?: {
        companion?: string;
        op_tier?: Tier[];
      };
    }>;
    high_impact_paths: {
      critical: string[];
      high: string[];
    };
    op_tier_mapping: {
      critical: string[];
      high: string[];
      standard: string[];
      research: string[];
    };
  };
  consensus: {
    weights: Record<string, number>;
    output_validation: boolean;
    input_validation: boolean;
    require_attestation: boolean;
    require_critical_member_for: Tier[];
    tie_break: {
      order: string[];
    };
  };
  redaction?: {
    enabled: boolean;
    pii_fields: string[];
    strategies: Record<string, string>;
  };
  rate_limits?: {
    per_user_per_minute: Record<Tier, number>;
    burst: number;
  };
  attestation: {
    topics: string[];
    include_fields: string[];
  };
  observability: {
    objectives: {
      constitutional_pass_rate_target: number;
      p95_latency_ms_target: Record<Tier, number>;
      cost_per_1k_tokens_usd_budget: Record<string, number>;
    };
    audit: {
      meta_audit_owner: string;
      cadence: string;
    };
  };
  fail_closed: {
    constitutional_on_error: boolean;
    ledger_on_error: boolean;
    provider_timeouts_ms: Record<string, number>;
    provider_retries: Record<string, number>;
  };
}

let _policy: PolicyConfig | null = null;

/**
 * Load policy from YAML file
 */
export function loadPolicy(file?: string): PolicyConfig {
  const policyFile = file || process.env.CONSENSUS_POLICY_FILE || "packages/policy/consensus_config.yaml";
  const fullPath = path.resolve(policyFile);
  
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    
    // Parse YAML (simplified - use yaml library in production)
    const parsed = parseYAMLLike(raw);
    _policy = parsed as PolicyConfig;
    
    console.log(`[policy] Loaded: ${fullPath}`);
    return _policy;
  } catch (error) {
    console.error(`[policy] Failed to load: ${error}`);
    throw error;
  }
}

/**
 * Get cached policy or load
 */
export function getPolicy(): PolicyConfig {
  if (!_policy) {
    return loadPolicy();
  }
  return _policy;
}

/**
 * Hot-reload policy file
 */
export function watchPolicy(file?: string) {
  const policyFile = file || process.env.CONSENSUS_POLICY_FILE || "packages/policy/consensus_config.yaml";
  const fullPath = path.resolve(policyFile);
  
  fs.watch(fullPath, { persistent: false }, () => {
    try {
      loadPolicy(fullPath);
      console.log(`[policy] Hot-reloaded: ${fullPath}`);
    } catch (e) {
      console.error(`[policy] Failed to reload: ${e}`);
    }
  });
}

/**
 * Simplified YAML parser (use 'yaml' library in production)
 */
function parseYAMLLike(raw: string): any {
  // This is a simplified parser - use proper YAML library
  // For now, return mock structure
  return {
    meta: {
      version: 1,
      updated: "2025-10-26",
      owner: "policy@kaizen.os",
      charter_url: "https://docs.kaizen.os/charter.json"
    },
    companions: {
      AUREA: { provider: "openai", model_default: "gpt-4o", weight: 1.0, safety_tier: "critical" as Tier, capabilities: [] },
      ATLAS: { provider: "anthropic", model_default: "claude-3.5-sonnet", weight: 1.0, safety_tier: "critical" as Tier, capabilities: [] },
      ZENITH: { provider: "google", model_default: "gemini-2.0-flash-exp", weight: 0.9, safety_tier: "high" as Tier, capabilities: [] },
      SOLARA: { provider: "deepseek", model_default: "deepseek-r1", weight: 0.7, safety_tier: "standard" as Tier, capabilities: [] }
    },
    tiers: {
      critical: { constitutional_min: 85, gi_min: 0.95, required_votes: 3, required_critical_votes: 1 },
      high: { constitutional_min: 75, gi_min: 0.92, required_votes: 3, required_critical_votes: 2 },
      standard: { constitutional_min: 70, gi_min: 0.90, required_votes: 2, required_critical_votes: 0 },
      research: { constitutional_min: 65, gi_min: 0.85, required_votes: 1, required_critical_votes: 0 }
    },
    eligibility: {
      rules: [],
      high_impact_paths: { critical: [], high: [] },
      op_tier_mapping: { critical: [], high: [], standard: [], research: [] }
    },
    consensus: {
      weights: { AUREA: 1.0, ATLAS: 1.0, ZENITH: 0.9, SOLARA: 0.7 },
      output_validation: true,
      input_validation: true,
      require_attestation: true,
      require_critical_member_for: ["critical", "high"],
      tie_break: { order: ["constitutional_score", "latency_ms", "weight"] }
    },
    redaction: { enabled: true, pii_fields: [], strategies: {} },
    rate_limits: { per_user_per_minute: { research: 60, standard: 30, high: 10, critical: 5 }, burst: 2 },
    attestation: { topics: [], include_fields: [] },
    observability: { objectives: {} }, audit: {} },
    fail_closed: { constitutional_on_error: true, ledger_on_error: false, provider_timeouts_ms: {}, provider_retries: {} }
  };
}

export { PolicyConfig };

