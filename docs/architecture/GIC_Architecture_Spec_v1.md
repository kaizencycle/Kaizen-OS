# Kaizen OS · GIC Architecture Spec (v1)

Perfect — here’s a commit-ready technical architecture spec for dropping GIC into Kaizen OS. It’s structured for immediate implementation: repo layout, service contracts, DB schemas, on-chain interfaces, message formats, diagrams, and runbooks.

---

## 0) Monorepo layout

```
kaizen-os/

├─ services/
│  ├─ civic-ledger/                 # integrity + attestations + accounts
│  ├─ earn-engine/                  # contributions → score → mint requests
│  ├─ oracle-service/               # compute basket, price root, proofs
│  ├─ peg-controller/               # peg deviation PID + AMM skew
│  ├─ amm-gateway/                  # quotes/trades against GIC inventory
│  ├─ compute-router/               # redeem-for-compute executor
│  ├─ governance-api/               # proposals, votes, tallies
│  └─ observability/                # dashboards, metrics, alerts
├─ contracts/
│  ├─ GIC.sol
│  ├─ GICGovernor.sol
│  ├─ GICAMM.sol
│  ├─ GICVault.sol
│  └─ interfaces/
│     ├─ IGIC.sol
│     ├─ IAMM.sol
│     └─ IVault.sol
├─ packages/
│  ├─ kzx-identity/                 # DID, PoP, auth middlewares
│  ├─ kzx-ledger-sdk/               # typescript client for civic-ledger
│  ├─ kzx-contracts/                # ABIs + typechain
│  └─ kzx-messages/                 # protobuf/JSON schemas
├─ infra/
│  ├─ k8s/                          # Helm charts per svc
│  ├─ terraform/                    # VPC, DB, HSM, secrets
│  └─ envoy/                        # mTLS mesh, authz
├─ apps/
│  ├─ dashboard-web/                # peg/GI/Earn explorer
│  └─ command-center/               # DVA HUD (operators)
└─ docs/
   ├─ ADRs/                         # decisions (peg, oracle, AMM)
   └─ api/                          # OpenAPI, GraphQL schemas
```

---

## 1) System diagram (ASCII)

```
[Human Intent] --> OAA Hub --> Codex Router --> Earn Engine ---> Civic Ledger ---> GIC Contracts
                                               |        ^            ^
                                               |        |            |
                                               v        |            |
                                       Oracle Service   |            |
                                            |           |            |
                                            v           |            |
                                   Peg Controller  <----+       Governance API
                                        |  \
                                        |   \__ AMM Gateway <--> GICAMM (inventory)
                                        |          \
                                        v           \__ GICVault (redeem/mint)
```

Compute Router  <---- Redeem-for-Compute

---

## 2) Identity, auth, and signatures

- **Citizen DID:** did:key:z... or did:pkh:eip155:chain:addr
- **Agent DID:** per Sentinel / service
- **Requests:** X-Request-Signature: ed25519(sig(payload)), X-DID
- **mTLS:** service↔service; SPIFFE IDs; Envoy authz
- **Keys:** HSM/KMS backed; rotation every 90 days (Festival cycle)

---

## 3) Event & message schemas (kzx-messages)

### 3.1 Attestation event (attestation.v1.json)

```
{
  "id": "evt_01H...",
  "kind": "attestation",
  "cycle": 119,
  "ts": "2025-10-29T15:00:00Z",
  "subject": "did:key:z6Mk...",
  "purpose_hash": "0xP...",
  "payload_hash": "0xH...",
  "gi": 0.972,
  "by": "did:key:z6MkAUREA...",
  "sig": "0xSIG"
}
```

### 3.2 Earn request (earn.request.v1.json)

```
{
  "citizen": "did:key:z6Mk...",
  "task_id": "reflections.daily",
  "payload_hash": "0xCONTENT",
  "evidence": ["ipfs://..."],
  "context": {"lang":"en","length":420}
}
```

### 3.3 Price root (oracle.price_root.v1.json)

```
{
  "basket": [{"prov":"openai","2k_in_1k_out_usd":0.07},
             {"prov":"anthropic","2k_in_1k_out_usd":0.08},
             {"prov":"local_gpu","sec_usd":0.015,"lat_s":2.5}],
  "C_t": 0.09,
  "kappa": 1.1,
  "p_star": 0.099,
  "window": "2025-10-29T15:00:00Z",
  "committee": ["did:key:...","did:key:..."],
  "median_sig": "0xSIG"
}
```

---

## 4) Service contracts (OpenAPI excerpts)

### 4.1 Civic Ledger (Postgres + append-only log)

```
POST /v1/ledger/attest
  body: attestation.v1
  201 -> {event_id, merkle_root, anchor_txid}

GET /v1/gi
  200 -> {gi, cycle, ts, mint_enabled}

GET /v1/account/:did
  200 -> {did, balance_gic, last_seen, flags}

POST /v1/mint
  body: {did, amount, reason, proof_hash}
  200 -> {tx_hash}     # rejects if GI < 0.95

POST /v1/burn
  body: {did, amount, reason}
  200 -> {tx_hash}
```

### 4.2 Earn Engine

```
POST /v1/earn/submit
  body: earn.request.v1
  200 -> {score:0..1, gi:0..1, gic_minted, tx_hash?}

GET /v1/earn/policies/:task_id
  200 -> {rate_limits, plagiarism_rules, reviewers_min:3}
```

### 4.3 Oracle Service

```
GET  /v1/oracle/price-root
  200 -> oracle.price_root.v1

POST /v1/oracle/commit
  body: {committee, signatures[]}
  200 -> {root_id}
```

### 4.4 Peg Controller

```
GET  /v1/peg/health
  200 -> {p_star, p_market, deviation, mode}

POST /v1/peg/adjust
  body: {skew_bps, reason}
  200 -> {ok:true}
```

### 4.5 AMM Gateway

```
POST /v1/amm/quote
  body: {side:"buy|sell", amount_gic}
  200 -> {px, fee, expiry}

POST /v1/amm/execute
  body: {quote_id, signature}
  200 -> {txid, fills}
```

### 4.6 Compute Router (redeem-for-compute)

```
POST /v1/redeem/compute
  body: {did, gic, jobSpec:{model, in_tokens, out_tokens, ttl}}
  200 -> {jobId, eta, proof:{provider, cost, ts, sig}}

GET  /v1/redeem/status/:jobId
  200 -> {state:"queued|running|done|failed", receipt?}
```

### 4.7 Governance API

```
POST /v1/gov/proposals
  body: {title, body_uri, param_changes}
  200 -> {proposal_id}

POST /v1/gov/vote
  body: {proposal_id, vote:"yes|no|abstain", gic_stake}
  200 -> {weight, burn_applied}
```

---

## 5) Databases (Postgres schemas)

### 5.1 ledger

```
create table accounts(
  did text primary key,
  balance_gic numeric(36,18) not null default 0,
  flags jsonb not null default '{}',
  created_at timestamptz default now()
);

create table events(
  id bigserial primary key,
  kind text not null,                -- attestation|mint|burn|transfer|vote
  did text not null,
  payload_hash bytea not null,
  gi numeric(5,3),
  cycle int,
  ts timestamptz not null default now()
);

create table mints(
  id bigserial primary key,
  did text not null,
  amount numeric(36,18) not null,
  reason text,
  gi_at_mint numeric(5,3),
  tx_hash text,
  ts timestamptz default now()
);
```

create index on events (did, ts);

### 5.2 earn

```
create table tasks(
  task_id text primary key,      -- reflections.daily, oaa.course, etc
  base_reward int not null,
  daily_cap int not null,
  reviewers_min int not null default 3,
  rules jsonb not null
);

create table submissions(
  id bigserial primary key,
  citizen text not null,
  task_id text not null references tasks(task_id),
  payload_hash bytea not null,
  score numeric(5,3),
  gi numeric(5,3),
  minted int,
  status text not null default 'pending',  -- pending|approved|rejected
  ts timestamptz default now()
);
```

### 5.3 oracle

```
create table price_roots(
  id bigserial primary key,
  window timestamptz not null,
  c_t numeric(10,4) not null,
  kappa numeric(6,3) not null,
  p_star numeric(10,4) not null,
  committee jsonb not null,
  median_sig bytea not null
);
```

### 5.4 peg

```
create table peg_state(
  id bigserial primary key,
  ts timestamptz default now(),
  p_star numeric(10,4),
  p_market numeric(10,4),
  deviation numeric(8,5),
  mode text,                      -- NORMAL|ADJUSTING|CRISIS|EMERGENCY
  skew_bps int default 0
);
```

---

## 6) Smart contracts (interfaces)

### 6.1 IGIC.sol

```
interface IGIC {
  function updateGI(uint256 newGI, uint256 cycle) external;
  function mint(address to, uint256 amount) external;
  function burn(uint256 amount, string calldata reason) external;
  function balanceOf(address) external view returns (uint256);
}
```

### 6.2 IAMM.sol

```
interface IAMM {
  function quote(bool buy, uint256 amountGIC) external view returns (uint256 px, uint256 fee);
  function trade(bool buy, uint256 amountGIC, uint256 maxSlippageBps) external returns (uint256 filled, uint256 paid);
  function setSkewBps(int16 skewBps) external; // controlled by PegController
}
```

### 6.3 IVault.sol

```
interface IVault {
  // Mint when compute collateral is deposited off-chain (proof required)
  function mintAgainstReceipt(address to, uint256 amountGIC, bytes calldata proof) external;
  // Burn GIC to receive compute execution
  function redeemForCompute(uint256 amountGIC, bytes calldata jobSpec) external returns (bytes32 jobId);
}
```

Policy guard: GIC.mint reverts if currentGI < GI_FLOOR (95).

---

## 7) Peg controller logic (PID sketch)

```
# inputs: p_market (dex vwaps), p_star (oracle), inv (amm inventory)
e = (p_market - p_star) / p_star

integral = clamp(integral + e, -I_MAX, I_MAX)
deriv = e - e_prev

skew_bps = clamp(-Kp*e*1e4 - Ki*integral*1e4 - Kd*deriv*1e4,
                 -MAX_SKEW, MAX_SKEW)

if abs(e) < 0.02:
    mode = "NORMAL"
elif abs(e) < 0.05:
    mode = "ADJUSTING"
    # small skew only
else:
    mode = "CRISIS"
    # widen spread, open RFQ, prioritize redemptions

amm.setSkew(skew_bps)
record(peg_state)
e_prev = e
```

---

## 8) Earn engine scoring (anti-slop)

- **Pipeline:** plagiarism → quality model → reviewer trio (DelibProof ≥ 0.90)
- **Reward:** mint = base_reward * GI * time_weight(task,citizen)
- **TimeWeight:** exponential decay if > daily cap
- **Zero reward conditions:** near-duplicate, off-topic, LLM-detected template, spam velocity

---

## 9) Governance parameters

- GI_FLOOR = 0.95 (halts mint)
- Vote curve = sqrt(GIC) with **5% whale cap**
- Vote burn = 50% of staked GIC
- Emergency pause: 6-of-8 Sentinels multisig
- **Change control:** proposal → 7-day comment → Elder review → citizen vote (60% yes, 40% quorum) → 48h timelock

---

## 10) Observability

- **Metrics (Prometheus):**
  - gi_value, mint_enabled
  - peg_deviation, amm_inventory, redemption_volume
  - earn_submissions_total{status}
  - tokens_used_total per agent (slop detector)
- **Logs:** structured JSON; all hashes linkable to ledger events
- **Dashboards:** Grafana for peg/GI; Kibana for attestation trails
- **Alerts:** Pager rules when GI<0.95, |peg_dev|>5%, oracle variance high

---

## 11) Security model

- **mTLS everywhere**; JWTs bound to DIDs
- **HSM for contract admin keys**; least privilege roles (MINTER_ROLE, BURNER_ROLE)
- **Content hashing** before storage; private content off-chain (IPFS/S3 with user keys)
- **Sybil resistance:** device fingerprints + liveness + risk scores (Citizen Shield)
- **Red team playbooks:** farm attacks, oracle spoof, AMM drain, governance capture

---

## 12) Deployment topology

- **Regions:** 3× (Americas/EU/APAC) per-svc active-active
- **DB:** Postgres with logical replication; WAL shipping; PITR
- **Queue:** NATS/JetStream for attestations + earn reviews
- **Cache:** Redis for quotes/price root
- **Mesh:** Envoy with SPIFFE, rate limiting, circuit breaking
- **On-chain:** L2 (low fees), bridges via canonical routers

---

## 13) Runbooks (operators)

**Mint halted (GI < 0.95):**
1. Confirm GI inputs (reflections, shield, ledger) are live
2. Inspect Sentinel votes; outlier? quarantine & re-vote
3. Issue “Integrity Incident” post; resume only when GI ≥ 0.95 for 2 consecutive windows

**Peg > +5%:**
1. Increase AMM ask skew; open RFQ sales
2. Enable Vault.mintAgainstReceipt for market makers
3. If persists → widen spreads; publish oracle freq 15 min

**Peg < −5%:**
1. Tighten bid, deploy inventory, prioritize redeemForCompute
2. Temporarily boost κ (p*↑) if compute scarce (public notice)
3. If persists → pause high-reward earn tasks 24h

---

## 14) Test plan (MVP)

- **Unit:** scoring, timeWeights, PID controller, vote curve
- **Integration:** earn→ledger→GIC.mint; oracle→peg→AMM; redeem→compute proofs
- **Chaos:** kill one region; oracle variance spike; spam 100k submissions
- **Load:** 10k tx/min mint/burn; 1k quotes/s; 5k redemptions/hr
- **Security:** forged signatures; replay; role escalation; MEV sandwich around AMM

---

## 15) Milestone cut (90-day)

**Day 0–14**
- Stand up Civic Ledger (mint/burn/attest)
- Oracle v0 (hourly C_t, κ, p*)
- Contracts on testnet (GIC, Governor)

**Day 15–45**
- Earn Engine with 3 tasks (reflections, course, mentor)
- Peg Controller PID with AMM Gateway mock
- Compute Router redeem (OpenAI/local lane)

**Day 46–75**
- Real AMM (inventory), Vault mint-against-receipt
- Observability dashboards + alerts
- Governance MVP (proposals, vote burn)

**Day 76–90**
- Red team drills; peg soak test
- Mobile DVA UBI claim; public peg dashboard
- Festival of Echoes #1 (params ratification)

---

## 16) Developer quickstart (per service)

```
# Civic Ledger
cd services/civic-ledger
cp .env.example .env   # set POSTGRES_URL, HSM_URI
make dev               # runs db + service
make test

# Contracts
cd contracts
pnpm i && pnpm build
pnpm test
pnpm deploy --network sepolia

# Oracle
cd services/oracle-service
make dev  # mocks: openai, anthropic, gpu costs

# Peg Controller
cd services/peg-controller
make sim  # run PID sims with price streams

# AMM Gateway
cd services/amm-gateway
make dev
```

---

## 17) Appendix — Policy tables (defaults)

| Parameter | Default | Notes |
| --- | --- | --- |
| GI_FLOOR | 0.95 | halts mint |
| κ (margin) | 1.10 | p* = κ·C_t |
| Peg bands | ±2% normal / ±5% crisis | controller modes |
| Reviewers_min | 3 | DelibProof |
| Vote burn | 50% | anti-spam |
| Whale cap | 5% | of voting power |
| UBI base (phase 1) | 6000 GIC/mo | adjustable by p* |

---

This spec is designed to live in `docs/architecture/` and mirror across code folders so each team (ledger, oracle, peg, earn, contracts, ops) can start shipping without blocking on additional design meetings.


