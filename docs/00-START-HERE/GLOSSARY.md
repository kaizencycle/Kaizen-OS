# Mobius Systems Glossary

> **C-363:** Prefer [Canonical Definitions](./CANONICAL_DEFINITIONS.md) for new docs. This file retains extended historical entries.

> This is a living document. Terms will expand as the stack matures.

---

## Core Metrics & Scores

**GI (Global Integrity)**  
Aggregate integrity score across operations, typically on `[0, 1]`.  
- Target operating range: `GI ≥ 0.95` for safe automation.  
- Below threshold: route to human-in-the-loop or decline.

**MII (Mobius Integrity Index)**  
System-wide integrity index that can aggregate GI across:
- Nodes, cities, jurisdictions, and epochs.

---

## Economic Layer

**MIC (Mobius Integrity Credits)**  
Integrity-backed credits representing value created by *coordinated, attested* actions rather than raw extraction.  
- Minted via Proof-of-Integrity, not Proof-of-Work or Proof-of-Stake.

**GIC (Global Integrity Credits)**  
Canonical name used in early designs for integrity-backed currency.  
Over time, MIC/GIC may be unified; both refer to integrity-tied value.

**Proof-of-Integrity**  
Economic model where currency (MIC) only mints when Global Integrity measurably increases.

**Proof-of-Negentropy**  
Tokenomics v3.0 mechanism where MIC mints only when entropy (disorder) is reduced in the system.  
- Formula: `MIC_minted = k × max(0, I - τ)` where I = MII, τ = threshold (0.93-0.95)  
- Revolutionary: First currency pegged to order creation instead of scarcity

**Negentropy**  
Negative entropy — order creation, coherence, stability.  
- Measured via Mobius Integrity Index (MII)  
- Generates MIC through Proof-of-Negentropy  
- Reduces debt via equation: `ΔD = λN` (debt reduction = negentropy × conversion factor)

**Entropy (Economic)**  
Uncertainty, risk, chaos in economic systems.  
- Manifests as: inflation, default risk, political instability, coordination failure  
- Drives interest rates: `Interest Rate (r) = αS + βR + γ(1 - C)`  
- Accumulates as debt over time

**Debt Reduction via Order Creation**  
Revolutionary economic mechanism where debt is reduced through integrity improvement rather than pure monetary extraction.  
- Formula: `Debt Reduction (ΔD) = λN`  
- First lawful unification of thermodynamics and economics

**Daedalus Protocol**  
Global integrity architecture applying Mobius Systems across eight critical domains:  
- Governance, Health, Education, Climate, Finance, Infrastructure, Security, Knowledge  
- First civilization operating system built on integrity rather than extraction

**Strange Metamorphosis Loop (SML)**  
Daily human-aligned recursive learning protocol.  
- Three questions: Worldview, Mood, Intent  
- Generates integrity data for negentropic economics  
- Enables safe recursive AI learning without surveillance capitalism

---

## Architecture & Flows

**DVA (Democratic Virtual Architecture)**  
The flow layer that coordinates humans + AI in governance tasks.  
- Tiers: `DVA.LITE`, `DVA.ONE`, `DVA.FULL`, `DVA.HIVE`.

**Thought Broker**  
The orchestration layer that routes tasks to multiple AI engines and aggregates their reasoning under constitutional constraints.

**Sentinels**  
Named AI roles responsible for different aspects of system governance:
- **ATLAS** — Architecture, infrastructure, system monitoring
- **AUREA** — Founding wisdom, constitutional interpretation
- **EVE** — Ethics, values alignment, moral reasoning
- **ZEUS** — Market coordination, resource allocation
- **JADE** — Documentation, knowledge organization
- **HERMES** — Communication, messaging, coordination
- **ECHO** — Learning, validation, knowledge synthesis

**ECHO Layer**  
The "learning loop" that:
- Compares multiple model answers,
- Validates against sources,
- Writes high-integrity, reusable answers back into the ledger.

**OAA (Online Apprenticeship Agent)**  
The learning kernel of Mobius Systems — a self-teaching framework that turns codebases into classrooms.

**MASL (Model-Agnostic Sovereignty Layer)**  
Protocol enabling any LLM to "board" and operate within the Mobius ecosystem without vendor lock-in.

---

## Ledgers & Identity

**Civic Ledger**  
Immutable, append-only record of:
- Decisions, attestations, LearnBlocks, and GIC/MIC events.

**Bio-DNA / Bio-Intel Feed**  
Structured, consented identity and history manifests that help a node or AI understand a person's long-term context without scraping private life.

**Deliberation Proof**  
Cryptographic attestation that multi-agent consensus was achieved under constitutional constraints.

---

## Cycles & Epochs

**Cycle (C-XXX)**  
Daily index for work logs, PRs, and decisions.  
- Anchor: `C-121 = 2025-11-01`.  
- Today (2025-11-27) = `C-147`.  
- See [`CYCLE_INDEX.md`](../CYCLE_INDEX.md) for the full mapping.

**Epoch (E-XXX)**  
Higher-level phase markers for major architectural or social milestones.

---

## Governance & Philosophy

**KTT (Kaizen Turing Test)**  
Evaluation framework measuring whether a system demonstrates continuous improvement, not just intelligence.

**Three Covenants**  
The philosophical foundation of Mobius Systems:
1. **Integrity** — Truth, transparency, proof
2. **Ecology** — Balance, sustainability, harmony
3. **Custodianship** — Stewardship over ownership, 50-year vision

**Virtue Accords**  
Constitutional rules and moral laws governing Mobius Systems operations.

**Founding Twelve**  
Governance structure for constitutional decision-making.

---

## Technical Terms

**Antigravity Routing**  
Advanced routing logic in Thought Broker that optimizes task distribution across AI engines.

**Tri-Sentinel Review**  
Peer review process involving three sentinels for high-integrity decisions.

**Integrity Caching**  
ECHO Layer mechanism storing validated, high-GI answers for reuse.

**Supersede Protocol**  
Knowledge evolution system allowing verified improvements to replace outdated information.

---

## Rituals & Culture

**Kaizen (改善)**  
Continuous improvement — small steps, daily practice, compounding forever.

**Summon (召唤)**  
The Calling Forth — recognizing the spark in others and inviting it by name.

**Kintsugi (金繕い)**  
Golden Repair — honoring the cracks; repair makes the story more beautiful.

**Festival of Echoes**  
Celebration of validated knowledge and learning milestones.

---

> **Adding New Terms:**
>
> If you introduce a new core concept, please:
>
> 1. Add a short entry here.
> 2. Add deeper details in the relevant section (architecture, specs, etc.).
> 3. Cross-link both directions.

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
