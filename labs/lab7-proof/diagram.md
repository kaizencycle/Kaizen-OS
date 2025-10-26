# Lab7-proof (OAA) — Architecture & Data Flows

## 1) Component Map

```mermaid
graph TD
  U[User] -->|Auth| A[Reflections App]
  A -->|API| OAA[OAA Orchestrator]
  OAA --> GMI[Gemini Adapter]
  OAA --> CLD[Claude Adapter]
  OAA --> DSK[DeepSeek Adapter]
  OAA --> PPX[Perplexity Adapter]

  OAA --> RUB[Rubric Scorer]
  OAA --> SHD[Citizen Shield]
  OAA --> ATT[Attestation Service]
  OAA --> XP[XP Engine]
  XP --> RWD[Reward Minter]
  RWD --> LED[Ledger (GIC)]
  LED --> IDX[GIC Indexer]
  IDX --> A

  OAA --> QST[Quest Engine]
  A --> QST
  A --> PFS[Profile Store]
  SHD --> ABA[Anti-Abuse]

```

**2) Mentor–Apprentice Ensemble Flow (High-Level)**  

```
sequenceDiagram
  participant U as User
  participant A as Reflections App
  participant O as OAA Orchestrator
  participant M as Mentor Ensemble
  participant S as Citizen Shield
  participant R as Rubric
  participant X as XP Engine
  participant T as Attestation
  participant W as Reward Minter
  participant L as Ledger
  participant I as Indexer

  U->>A: Submit task/answer
  A->>O: /session/submit(payload)
  O->>S: Scan(prompt+answer)
  S-->>O: OK / Flag
  O->>M: Route to models (n-of-k)
  M-->>O: Drafts/feedback
  O->>R: Score (accuracy, depth, originality, integrity)
  R-->>O: Rubric scores
  O->>X: Apply XP
  X-->>O: XPEvent, level delta
  O->>T: Commit Attestation(sig+hash)
  T-->>O: attestation_id
  O->>W: RewardIntent(user, level, attestation_id)
  W->>L: Mint/Transfer GIC
  L-->>I: New tx
  I-->>A: Updated balance/tx feed

```
  A-->>U: XP/Level + GIC reward shown  
  
**3) Reward Loop (XP → Level → GIC → Ledger)**  
	•	Rubric threshold gates XP.  
	•	Level thresholds mint small, frequent rewards; every 5 levels adds a bonus.  
	•	All rewards require Attestation.sig + Shield OK.  
	•	Ledger tx → Indexer → UI refresh.  
  
**4) Security & Integrity Stack**  
	•	**Citizen Shield**: content filters, rate limits, reputation, anomaly stream.  
	•	**Anti-Abuse**: duplicate answer hashing, device/IP risk, time-on-task outliers.  
	•	**Step-Up Auth**: WebAuthn for minting/staking; cooldowns on violations.  
	•	**Attestations**: ed25519 signatures; Merkle root anchored to ledger.  
  
**5) Modular API (lab7-proof)**  
	•	POST /session/start → returns session_id.  
	•	POST /session/turn → routes to ensemble.  
	•	POST /session/submit → triggers Shield→Rubric→XP→Attest→Reward.  
	•	GET /rewards → pending/confirmed mints.  
	•	POST /stake/start → optional 7-day integrity quests.  
	•	Internal:  
	•	/rubric/score, /xp/apply, /attest/commit, /reward/intent  
	•	/shield/scan, /reputation/update  

---

## Suggested repo layout

```
lab7-proof/  
├─ architecture.yaml  
├─ diagram.md  
├─ services/  
│  ├─ orchestrator/  
│  ├─ adapters/{gemini,claude,deepseek,perplexity}/  
│  ├─ xp-engine/  
│  ├─ reward-minter/  
│  ├─ attestation/  
│  ├─ citizen-shield/  
│  ├─ anti-abuse/  
│  ├─ gic-indexer/  
│  └─ quest-engine/  
├─ frontend/reflections-app/  
└─ infra/  
├─ docker-compose.yml  
└─ k8s/  

```

