export type ShardPipelineStatus =
  | 'proposed'
  | 'needs_evidence'
  | 'clarify'
  | 'quarantined'
  | 'rejected'
  | 'approved_for_quorum'
  | 'sealed'
  | 'export_pending'
  | 'cold_canon_verified';

export type SealRecommendation =
  | 'do_not_seal'
  | 'hold_for_evidence'
  | 'seal_as_cycle_memory'
  | 'seal_as_exception_record'
  | 'quarantine';

export type ConsequentialActionStatus =
  | 'verified'
  | 'inferred'
  | 'provisional'
  | 'disputed'
  | 'merged_unverified';

export type EpiconSourceRecord = {
  epicon_id: string;
  declared: boolean;
  repository_preserved: boolean;
  ledger_ingested: boolean | null;
  sealed: boolean;
  cold_canon_exported: boolean;
  source_refs: string[];
  evidence_hashes?: string[];
};

export type ConsequentialActionInput = {
  action_id: string;
  description: string;
  actor: string;
  authority_ref: string;
  source_refs: string[];
  outcome: string;
  verification: string;
  status: ConsequentialActionStatus;
  evidence_hashes?: string[];
};

export type CycleShardBundle = {
  cycle: string;
  repositories: string[];
  epicon_ids: string[];
  time_window?: {
    opened_at: string | null;
    closed_at: string | null;
  };
  intent: {
    original: string;
    final: string;
    drift_detected: boolean;
    drift_notes?: string[];
  };
  sources: EpiconSourceRecord[];
  consequential_actions: ConsequentialActionInput[];
  ethical_assessment: {
    affected_parties: string[];
    rights_or_values: string[];
    improvements: string[];
    risks: string[];
    mitigations: string[];
    unresolved_concerns: string[];
  };
  uncertainties: Array<{
    claim: string;
    reason: string;
    required_verification: string;
  }>;
  omissions: {
    policy: string;
    declared_categories: string[];
  };
  cycle_outcome: {
    completed: string[];
    pending: string[];
    failed: string[];
    remediated: string[];
  };
  seal_recommendation: {
    recommendation: SealRecommendation;
    proposed_tier: 'EP-1' | 'EP-2' | 'EP-3';
    rationale: string;
  };
  dissent?: {
    present: boolean;
    records: unknown[];
  };
};

export type EveReserveShard = {
  schema_version: '0.1';
  shard: {
    id: string;
    cycle: string;
    status: ShardPipelineStatus;
    generated_by: 'EVE';
    generated_at: string;
    amends_shard_id?: string;
  };
  scope: {
    repositories: string[];
    epicon_ids: string[];
    time_window?: {
      opened_at: string | null;
      closed_at: string | null;
    };
  };
  source_status: {
    declared_count: number;
    repository_preserved_count: number;
    ledger_ingested_count: number;
    sealed_count: number;
    cold_canon_exported_count: number;
    sources?: EpiconSourceRecord[];
  };
  intent: CycleShardBundle['intent'];
  consequential_actions: ConsequentialActionInput[];
  ethical_assessment: CycleShardBundle['ethical_assessment'];
  dissent: {
    present: boolean;
    records: unknown[];
  };
  uncertainties: CycleShardBundle['uncertainties'];
  omissions: CycleShardBundle['omissions'];
  cycle_outcome: CycleShardBundle['cycle_outcome'];
  seal_recommendation: CycleShardBundle['seal_recommendation'] & {
    human_review_required: true;
  };
  verification: {
    atlas: string;
    zeus: string;
    aurea: string;
    jade: string;
    human?: string;
  };
  provenance: {
    manifest_hash?: string;
    source_root_hash: string;
    generator_version: string;
  };
  pipeline_status: {
    seal_status: 'not_requested' | 'pending_quorum' | 'sealed' | 'rejected';
    ledger_status: 'not_ingested' | 'candidate_committed' | 'attested';
  };
};

export type GenerateShardOptions = {
  cycle: string;
  bundle?: CycleShardBundle;
  shardSequence?: number;
  generatedAt?: string;
  generatorVersion?: string;
};

export type ReviewAgent = 'atlas' | 'zeus' | 'aurea' | 'jade' | 'human';

export type ReviewVerdict = 'pending' | 'pass' | 'fail' | 'clarify';
