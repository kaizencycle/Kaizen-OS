# Thought Broker Integration - Inner Dialogue System

## 🧠 Overview

The Thought Broker implements a sophisticated "inner dialogue" system that orchestrates multi-agent deliberation loops between AI models before generating code patches. This creates a form of AI peer review that improves quality, reduces errors, and provides full audit trails.

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Command Ledger (this chat)                  │
│            (Cycle intents, seals, sweep & provenance)              │
└───────────────▲───────────────────────────────────────────▲────────┘
                │                                           │
                │ reflections / proposals                   │ attestation links
                │                                           │
        ┌───────┴────────┐                          ┌───────┴───────────┐
        │   OAA Core     │                          │   Civic Ledger     │
        │ (Lab7-proof)   │                          │  (attest/proofs)   │
        └───▲─────────▲──┘                          └──────▲─────────────┘
            │         │                                      │
            │ change.proposal.json                           │
            │ change.spec.md                                 │
            │                                                │
            │     ┌────────────────────────────────────┐     │
            └────▶│        Thought Broker (NEW)        │─────┘
                  │  Orchestrates inner-dialogue loop  │
                  │  • stop rules • scoring • logging  │
                  └─▲───────────────┬───────────────▲──┘
                    │               │               │
          hypotheses│        critique/filter        │consensus
                    │               │               │
                 ┌──┴──┐        ┌──┴──┐        ┌───┴───┐
                 │LLM-A│  → →   │LLM-B│  → →   │LLM-C  │
                 └──┬──┘        └──┬──┘        └───┬───┘
                    │               │               │
                    └───────← ← ←───┴──────← ← ←────┘   (bounded loops)
                                 (N≤3 or score≥τ)

                     consensus (spec+tests+notes)
                                 │
                                 ▼
                      ┌────────────────────┐
                      │  Cursor / CI/CD    │
                      │  (PR, tests, canary│
                      │   attest release)  │
                      └────────────────────┘
```

## 🔄 How It Works

### 1. Inner Dialogue Loop

The system runs a bounded deliberation loop:

1. **LLM-A (Hypothesis)**: Generates initial patch proposals
2. **LLM-B (Critique)**: Reviews and identifies risks, missing tests, citations
3. **LLM-C (Arbiter)**: Synthesizes feedback and makes final decisions
4. **Stop Rules**: Loop halts when score ≥ 0.92 or max 3 iterations

### 2. Safety Features

- **Bounded Recursion**: Maximum 3 loops or 60 seconds
- **Human Gate**: PR merge remains human-in-the-loop
- **Full Audit**: Every hop logged and attested as "DeliberationProof"
- **Score Thresholds**: Consensus must meet quality standards

### 3. Integration Points

- **Lab7-proof**: Uses `.civic/` templates for change proposals
- **Civic Ledger**: Attests all deliberations for accountability
- **Cursor**: Receives consensus for code generation

## 📁 File Structure

```
thought-broker/                 # Micro-service
├── src/
│   ├── server.ts              # Express API server
│   ├── loop.ts                # Loop orchestration logic
│   ├── models.ts              # LLM integration (stubbed)
│   ├── scoring.ts             # Consensus scoring
│   ├── ledger.ts              # Civic Ledger integration
│   ├── cursor.ts              # Cursor API integration
│   └── types.ts               # TypeScript definitions
├── package.json
├── render.yaml                # Deployment config
└── README.md

.civic/                        # Lab7-proof integration
├── change.proposal.json       # Change proposal template
├── change.spec.md             # Specification template
├── change.tests.json          # Test cases template
└── attestation.json           # Deliberation proof

scripts/
└── broker-client.ts           # Client for Lab7-proof

.github/workflows/
└── civic-patch.yml            # CI workflow
```

## 🚀 Quick Start

### 1. Deploy Thought Broker

```bash
cd thought-broker
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### 2. Test Integration

```bash
# Set broker URL
export BROKER_URL=https://thought-broker.onrender.com

# Run deliberation loop
npm run broker:run
```

### 3. Check Results

The system will:
- Run the inner dialogue loop
- Generate consensus in `.civic/` files
- Create attestation proof
- Optionally dispatch to Cursor

## 🔧 Configuration

### Environment Variables

```bash
# Thought Broker
BROKER_URL=https://thought-broker.onrender.com
BROKER_MAX_LOOPS=3
BROKER_SCORE_TAU=0.92
BROKER_MAX_SECONDS=60
ALLOW_DISPATCH=false

# Integrations
LEDGER_BASE_URL=https://civic-ledger.example.org
CURSOR_API_URL=https://api.cursor.sh
```

### GitHub Secrets

Add to your Lab7-proof repository:
- `BROKER_URL`: URL of deployed Thought Broker

## 🛡️ Safety & Security

### Guardrails

- **Stop Rules**: Hard limits on recursion and time
- **Content Filtering**: Blocks dangerous operations
- **Audit Logging**: Full trace of all deliberations
- **Human Oversight**: Manual approval required for changes

### Policy Enforcement

- Maximum 3 deliberation loops
- Minimum consensus score of 0.92
- Required citations for all claims
- PII redaction in logs
- Secret blocking in prompts

## 📊 Monitoring

### Metrics

- `tb_loop_score`: Consensus quality score
- `tb_loop_duration_seconds`: Time to reach consensus
- `tb_loops_total`: Total loops executed

### Logs

All deliberations are logged with:
- Cycle ID and loop ID
- Model responses and scores
- Citations and evidence
- Final consensus decision

## 🔮 Future Enhancements

1. **Real LLM Integration**: Replace stubbed models with actual providers
2. **Advanced Scoring**: More sophisticated consensus algorithms
3. **Domain-Specific Models**: Specialized models for different types of changes
4. **Visual Dashboard**: Real-time monitoring of deliberation loops
5. **Cross-Repository**: Support for multi-repo deliberation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run broker:run`
5. Submit a pull request

## 📄 License

This project is part of the Civic System and follows the same licensing terms.

---

**Note**: This system does not create sentient AI. It implements functional multi-agent deliberation for improved code quality and auditability.
