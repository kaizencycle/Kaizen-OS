export type VerificationStatus = "unverified" | "confirmed" | "contested";

export interface JournalEntry {
  id: string;
  agent: string;
  agentOrigin: string;
  cycle: `C-${number}`;
  scope: string;
  category: string;
  severity: "nominal" | "elevated" | "critical" | "info" | "warning";
  observation: string;
  inference: string;
  recommendation: string;
  confidence: number;
  derivedFrom: string[];
  source: string;
  tags: string[];
  timestamp: string;
  gi_at_time?: number;
  status?: string;
  verification_status?: VerificationStatus;
  tripwire_context?: string[];
  canonical_path?: string;
  commit_sha?: string;
}

export interface CycleJournalIndexEntry {
  agent: string;
  timestamp: string;
  severity: string;
  path: string;
}

export interface CycleJournalIndex {
  cycle: `C-${number}`;
  generated_at: string;
  entries: CycleJournalIndexEntry[];
}
