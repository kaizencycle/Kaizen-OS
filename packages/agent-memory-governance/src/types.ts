/** C-386 first-class epistemic memory classes (INV-004). */
export type MemoryClass =
  | 'REPORTED'
  | 'INFERRED'
  | 'VERIFIED'
  | 'STALE'
  | 'QUARANTINED'
  | 'SUPERSEDED'
  | 'REJECTED';

export type EvidentiaryRootType =
  | 'primary_instrument'
  | 'canonical_repository_state'
  | 'CPC_attested_state'
  | 'primary_external_source'
  | 'human_authorized_evidence'
  | 'agent_memory'
  | 'repeated_agent_claim';

export interface EvidentiaryRoot {
  type: EvidentiaryRootType;
  root_id: string;
  /** ISO-8601 — root-level freshness for promotion quorum checks */
  expires_at?: string;
  observed_at?: string;
}

export interface MemoryProvenance {
  previous_memory_ids?: string[];
  author_agent?: string;
}

export interface MemoryFreshness {
  expires_at?: string;
  reverify_strategy?: 'locate_primary_source' | 'replay_reasoning_against_current_evidence';
}

export interface AgentMemoryRecord {
  id: string;
  class: MemoryClass;
  claim: string;
  provenance?: MemoryProvenance;
  freshness?: MemoryFreshness;
  evidence?: {
    independent_sources?: EvidentiaryRoot[];
  };
  verification_conflict?: boolean;
  zeus_hold?: boolean;
}

export type ZeusAdjudication = 'CLEAR' | 'SUPERSEDE' | 'REJECT' | 'HOLD';

export type PromotionBlockReason =
  | 'not_inferred'
  | 'missing_provenance'
  | 'verification_conflict'
  | 'quorum_not_met'
  | 'self_referential_chain'
  | 'stale_evidence_root'
  | 'stale_record_freshness'
  | 'reported_shortcut'
  | 'rejected_resurrection';
