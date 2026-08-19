-- Evidence Commons v0.1 (C-408) — dedicated storage (not echo_layer_entries)
-- Apply when EVIDENCE_COMMONS_DB_URL or shared DATABASE_URL is configured.

CREATE TABLE IF NOT EXISTS evidence_packets (
  packet_id TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  request_hash TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  claim_class TEXT NOT NULL,
  subject TEXT NOT NULL,
  observation TEXT NOT NULL,
  source_json JSONB NOT NULL,
  acquisition_json JSONB NOT NULL,
  license_json JSONB NOT NULL,
  visibility TEXT NOT NULL,
  freshness_json JSONB NOT NULL,
  verification_json JSONB NOT NULL,
  payload_json JSONB,
  predecessor_packet_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (request_hash, version)
);

CREATE INDEX IF NOT EXISTS idx_evidence_packets_request_hash
  ON evidence_packets (request_hash, version DESC);

CREATE TABLE IF NOT EXISTS evidence_reuse_events (
  event_id TEXT PRIMARY KEY,
  packet_id TEXT NOT NULL REFERENCES evidence_packets(packet_id),
  consumer_agent TEXT NOT NULL,
  operator_scope TEXT,
  purpose TEXT NOT NULL,
  access_mode TEXT NOT NULL,
  freshness_at_access TEXT NOT NULL,
  reused_at TIMESTAMPTZ NOT NULL,
  additional_payment_json JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_reuse_events_packet
  ON evidence_reuse_events (packet_id, reused_at DESC);

CREATE TABLE IF NOT EXISTS evidence_candidate_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  packet_or_request_ref TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
