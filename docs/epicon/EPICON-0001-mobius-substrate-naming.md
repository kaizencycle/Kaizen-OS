# EPICON-0001 — Mobius Substrate Naming Canon

> **Filed by:** Michael Judan (Founder / Custodian)
> **Epoch:** December 29, 2025
> **Cycle:** C-178
> **Status:** Canonical

---

## EPICON Standard Fields

| Field | Description |
|-------|-------------|
| **Epoch** | Calendar date and project stage when this EPICON was filed |
| **Intent** | Why this change matters to the Mobius canon |
| **Constraints** | What this change does *not* include |
| **Operations / Changes** | What the PR actually modifies |
| **Next / Rollout** | Future sequence steps for full implementation |
| **Integrity Notes** | Why this alignment preserves the project's meaning |

This document follows the EPICON format to ensure machine-readable parsing by future generative agents and human contributors alike.

---

## 1. Summary

Mobius began as **Mobius Systems** — a monorepo + operating stack for integrity-aligned AI systems.

As the architecture matured (MIC, MII, DVA, KTT, EPICON), it became clear that "system" was the wrong center of gravity.

Mobius is not *one* system.
Mobius is the **substrate** that many systems, agents, and communities stand on.

**Canonical name going forward:
"Mobius Substrate" — the civic-technical substrate where integrity, memory, and agents converge.**

"Mobius Systems" remains as:

- the legacy repo name,
- a historical label for early architecture,
- and an umbrella for downstream apps that run *on* the substrate.

---

## 2. Problem Statement

- External narrative (Substack essays, talks, long-form theory) uses:
  - *The Mobius Substrate*
  - *The Mobius Integrity Index*
  - *The DVA Architecture*
- Internal code + repo branding still say:
  - **Mobius Systems**

This creates:

- onboarding confusion ("Is this one app or a base layer?"),
- brand drift (different names in essays vs code),
- future AGI / agent confusion about what this repo *is* in the canon.

---

## 3. Intent

- Make **Mobius Substrate** the single, canonical name for:
  - the integrity substrate,
  - the shared ledger + EPICON layer,
  - the home where DVA, MIC, MII, KTT all dock.
- Preserve continuity by:
  - explicitly linking "Mobius Systems" → "Mobius Substrate" in docs,
  - not breaking existing links or clones until migration is staged.

---

## 4. Why "Substrate"

"System" implies:

- bounded product,
- single surface,
- one team's app.

"Substrate" implies:

- a **base layer** other systems rely on,
- civic + technical infrastructure,
- something that survives multiple applications and eras.

This is closer to what Mobius actually is:

- EPICON = memory + intent substrate
- MIC = integrity-indexed economy on top
- MII = integrity signal across time
- DVA = distributed agent architecture that runs *on* the substrate
- KTT = continuous friction loop between humans and AI that keeps everything sane

All of that is not "an app".

It's a substrate.

---

## 5. Scope of This Rename

This EPICON covers:

- **Docs + narrative alignment**:
  - README, high-level diagrams, conceptual docs.
- **Public canon alignment**:
  - Substack essays now reference **Mobius Substrate** as the core object.

Out of scope (will be separate EPICONs / PRs):

- GitHub repo rename (`Mobius-Substrate` → `Mobius-Substrate`)
- Internal package / module renaming
- Domain migration and DNS changes

---

## 6. Constraints

- Must remain backwards-compatible for:
  - existing Git clones,
  - CI configuration,
  - external talks / links referencing "Mobius Systems".
- Must remain legible to future readers:
  - historical names are preserved as aliases,
  - this doc acts as the canonical "name change anchor".

---

## 7. Migration Plan (High-Level)

1. **Phase 1 — Docs First (this EPICON + PR)**
   - README top section updated to "Mobius Substrate (formerly Mobius Systems)".
   - This file added as the anchor record.

2. **Phase 2 — Public Canon**
   - All new essays, talks, diagrams, and Substack posts reference:
     - "Mobius Substrate (Mobius OS)" where needed.

3. **Phase 3 — Repo + Domain (future EPICON)**
   - GitHub rename once infra is ready.
   - Domain migration + redirects.

4. **Phase 4 — Code Surface (future EPICON)**
   - Gradual rename of internal namespaces.
   - Provide alias shims where necessary.

---

## 8. Integrity Notes

- This rename is not cosmetic.
  It captures the **true role** of this repo in the Mobius canon:
  - the **home** and **floor** where future AGI, civic agents, and human communities stand.
- All future references to the architecture should use:
  - **Mobius Substrate** as the layer,
  - **DVA / MIC / MII / KTT** as components,
  - **Mobius Systems** only for legacy context or specific implementations.

---

## 9. Related Documents

- [README.md](https://github.com/kaizencycle/Mobius-Substrate/blob/main/README.md) — Updated top section
- [EPICON-01](./EPICON-01.md) — Epistemic constraint layer
- [EPICON-02](./EPICON-02.md) — Intent publication & divergence protocol
- [EPICON-03](./EPICON-03.md) — Multi-agent collective epistemic consensus
- [MII Spec](../07-RESEARCH-AND-PUBLICATIONS/specs/MII_SPEC_v1.md) — Mobius Integrity Index
- [DVA Overview](../04-TECHNICAL-ARCHITECTURE/overview/DVA_FLOWS_OVERVIEW.md) — Distributed Verification Architecture

---

## 10. Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-29 | Initial filing | Michael Judan |

---

## 11. Versions / Trail

This section tracks the evolution of the naming canon across EPICONs:

| Version | Date | Description | Status |
|---------|------|-------------|--------|
| **v0.1** | 2025-12-29 | Initial draft — Canonical naming alignment (docs only) | ✅ Current |
| **v0.2** | TBD | Repo rename (`Mobius-Substrate` → `Mobius-Substrate`) | 🔜 Future EPICON |
| **v0.3** | TBD | Module rename & API aliases | 🔜 Future EPICON |
| **v0.4** | TBD | Domain migration & DNS changes | 🔜 Future EPICON |

Each version corresponds to a separate EPICON + PR, ensuring atomic, reviewable, and reversible changes.

---

*"Intelligence moves. Integrity guides."* — Mobius Principle

*"We heal as we walk."* — Founder's Seal
