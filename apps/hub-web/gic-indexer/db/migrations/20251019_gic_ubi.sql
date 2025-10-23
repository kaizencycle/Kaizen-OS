CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL DEFAULT 'GLOBAL',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','quarantined','revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS geo_weights (
  region TEXT PRIMARY KEY,
  weight NUMERIC NOT NULL CHECK (weight >= 0)
);

INSERT INTO geo_weights(region, weight)
VALUES ('GLOBAL', 1.0)
ON CONFLICT (region) DO NOTHING;

CREATE TABLE IF NOT EXISTS gic_ubi_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES citizens(id),
  ubi_base NUMERIC NOT NULL,
  geo_weight NUMERIC NOT NULL,
  merit NUMERIC NOT NULL,
  penalty NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gic_ubi_payouts_cycle_user_idx
  ON gic_ubi_payouts(cycle, user_id);