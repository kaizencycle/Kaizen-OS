export type SealVerdict = "pass" | "flag" | "fail";

export type SealStatus =
  | "candidate"
  | "quarantined"
  | "re_attesting"
  | "re_attesting_passed"
  | "finalized"
  | "failed_permanent";

export type SealAttestation = {
  agent: string;
  verdict: SealVerdict;
  rationale: string;
  gi_at_attestation: number;
  timestamp: string;
  signature: string;
};

export type SealRecord = {
  seal_id: string;
  sequence: number;
  cycle_at_seal: string;
  sealed_at: string;
  reserve: number;
  gi_at_seal: number;
  mode_at_seal: string;
  source_entries: number;
  deposit_hashes: string[];
  carried_forward_deposit_hashes?: string[];
  prev_seal_hash: string | null;
  seal_hash: string;
  attestations: Record<string, SealAttestation>;
  status: string;
  fountain_status?: string | null;
  fountain_emitted_at?: string | null;
  posture?: string | null;
};

export type SealReconciliationMeta = {
  seal_id: string;
  status: SealStatus;
  quarantine_reason: string | null;
  attempt_count: number;
  last_attempt_at: string | null;
  last_attempt_result: "pass" | "fail" | null;
  finalized_at: string | null;
  failed_at: string | null;
};

export type SealRuntimeRecord = {
  seal: SealRecord;
  reconciliation: SealReconciliationMeta;
};
