# EPICON — U.S. → New York State → New York City Budget Trace

**Record status:** PROVISIONAL / UNSEALED  
**Cycle:** C-367  
**Action tier:** EPICON-2 (public-record synthesis; no autonomous financial action)  
**Operator:** Michael Judan  
**Recorder:** AUREA / OpenAI  
**Recorded:** 2026-07-10 America/New_York  
**Proposed vault class:** Civic public-record audit  
**Proposed Reserve Block status:** CANDIDATE — requires human review, source verification, quorum, seal, and vault ingestion  

## 1. Intent

Test whether a citizen can trace public budgeting across three nested jurisdictions:

1. United States federal government
2. New York State
3. New York City

The purpose is not to declare that every dollar can already be traced end to end. The purpose is to record what is publicly discoverable, preserve accounting distinctions, identify gaps, and create a replayable research receipt.

## 2. Constitutional constraints

- No UI-derived truth.
- Do not equate a proposed budget with enacted authority.
- Do not equate an appropriation with an obligation.
- Do not equate an obligation with a cash outlay.
- Do not add federal, state, and city totals together; transfers can appear at multiple levels.
- Preserve fiscal-year differences.
- Preserve uncertainty and contradictory public reporting.
- This EPICON records research. It authorizes no expenditure, procurement, enforcement, or policy action.

## 3. Scope and accounting boundary

This trace uses the latest clearly available public figures as of 2026-07-10. The periods are not identical:

| Layer | Budget period used | Accounting stage |
|---|---|---|
| Federal | FY2025 actuals, with FY2026 process context | Treasury-recorded receipts and outlays for the last complete fiscal year |
| New York State | FY2026–27 | Enacted legislative budget reported after passage |
| New York City | FY2027 | Adopted city budget reported after Council passage |

This mismatch is intentional and disclosed. A single comparable FY2026 chain was not asserted because the federal year was still in progress and appropriations were enacted through multiple measures.

## 4. High-level public budget map

### 4.1 United States federal government

Latest complete fiscal-year anchor identified:

- FY2025 receipts: approximately **$5.235 trillion**
- FY2025 outlays: approximately **$7.010 trillion**
- FY2025 deficit: approximately **$1.775 trillion**

FY2026 runs from 2025-10-01 through 2026-09-30. Its funding process involved continuing resolutions and multiple appropriations measures rather than one simple public ledger entry.

Primary public record families:

- Treasury Monthly Treasury Statements and Fiscal Data
- Office of Management and Budget budget collections and historical tables
- Congressional Budget Office baselines and analyses
- Congress / GovInfo appropriations statutes
- USAspending obligations, contracts, grants, loans, and awards

### 4.2 New York State

Latest enacted figure identified:

- FY2026–27 enacted budget: approximately **$269 billion**
- Reported increase over the prior year: approximately **$14.5 billion**, or **5.4%**

The state total includes state operating funds, federal resources, capital activity, transfers, and major programs that may later flow to local governments or providers. It must not be interpreted as a single pot of unrestricted state cash.

Primary public record families:

- New York State Division of the Budget enacted financial plan
- Appropriation and Article VII bills
- State Comptroller Open Book New York
- Agency financial and contract records
- Authorities Budget Office records for public authorities

### 4.3 New York City

Latest adopted figure identified:

- FY2027 adopted city budget: approximately **$125.8 billion**
- NYC public schools / Department of Education: approximately **$38.6 billion**
- DOE share of the total: approximately **30.7%**

Calculation:

```text
$38.6B / $125.8B = 0.3068 ≈ 30.7%
```

The city budget combines city tax revenue with state and federal aid. Therefore, part of the federal and state totals can reappear inside the city total. Summing all three would double-count intergovernmental transfers.

Primary public record families:

- NYC Office of Management and Budget adopted budget and financial plan
- NYC Council budget documents
- NYC Comptroller Checkbook NYC
- Mayor’s Management Report
- City Record procurement notices and contract awards
- NYC Open Data

## 5. What a citizen can and cannot conclude

### Supported conclusions

1. Budget totals are public and discoverable.
2. The three levels publish different document families and accounting stages.
3. Education is one of New York City’s largest identifiable spending areas.
4. Intergovernmental aid makes simple addition invalid.
5. A credible trace requires links from authority to obligation to expenditure to outcome.

### Unsupported conclusions

1. That the three headline totals measure the same thing.
2. That every appropriated dollar was spent.
3. That every expenditure produced the intended public result.
4. That an agency budget alone reveals contractor-level or recipient-level flows.
5. That a headline total can identify fraud, waste, or effectiveness.

## 6. Proposed end-to-end trace schema

A future Mobius civic-budget trace should preserve:

```text
SOURCE AUTHORITY
  → appropriation / adopted budget line
  → agency allocation
  → grant or contract identifier
  → obligation / encumbrance
  → cash expenditure
  → recipient / vendor / subrecipient
  → project geography
  → output or service delivered
  → audit finding / amendment / clawback
  → source hashes and retrieval timestamps
```

Minimum fields:

- jurisdiction
- fiscal year
- accounting stage
- fund type
- agency
- program
- appropriation identifier
- award or contract identifier
- original amount
- amended amount
- obligated amount
- paid amount
- recipient
- source URL
- publication date
- retrieval time
- content hash
- confidence
- known gaps

## 7. Provenance register

| Ref | Source | Role | Confidence |
|---|---|---|---|
| F1 | U.S. Treasury final FY2025 reporting, as summarized in the 2025 federal budget record | Complete-year federal receipts, outlays, and deficit anchor | Medium-high; primary record should be re-fetched before seal |
| F2 | GovInfo FY2026 Budget of the U.S. Government collection and enacted appropriations records | FY2026 process and legal-source index | High for document existence; totals require document-level extraction |
| S1 | Reporting on New York’s enacted FY2026–27 budget | State headline total and reported year-over-year increase | Medium; replace with enacted Division of Budget financial plan before seal |
| C1 | Reporting on NYC’s adopted FY2027 budget | City headline total | Medium; replace with NYC OMB adopted financial plan before seal |
| C2 | Reporting citing adopted city documents for NYC DOE | DOE amount | Medium; replace with exact NYC OMB agency table before seal |

## 8. Known gaps and quarantine conditions

The record must remain **UNSEALED** until all conditions below are satisfied:

- [ ] Fetch the final FY2025 Monthly Treasury Statement directly.
- [ ] Fetch the FY2026 federal appropriations status table and all enacted measures.
- [ ] Fetch the New York State FY2026–27 enacted financial plan directly.
- [ ] Fetch the NYC FY2027 adopted expense and revenue tables directly.
- [ ] Capture document publication dates and SHA-256 hashes.
- [ ] Reconcile gross totals, fund types, and intergovernmental transfers.
- [ ] Confirm whether the proposed Reserve Block number is available.
- [ ] Obtain required Sentinel review and human merge.
- [ ] Ingest through the canonical Vault / Ledger path when healthy.

If direct primary documents contradict the figures above, the primary documents control and this EPICON must be amended through a new append-only record.

## 9. Risk assessment

| Risk | Level | Mitigation |
|---|---|---|
| Double-counting transfers | High | Never sum jurisdiction totals; tag source and destination funds |
| Mixing proposed, enacted, obligated, and spent values | High | Mandatory `accounting_stage` field |
| Stale documents | Medium | Retrieval timestamps and hashes |
| Political framing contaminating facts | Medium | Separate numeric claims from interpretation |
| False completeness | High | Publish known gaps and coverage limits |
| Accidental canonization of provisional data | High | UNSEALED marker and human/quorum gate |

## 10. Decision

**Decision:** Record as a provisional EPICON and submit as a candidate civic public-record Reserve Block payload.

**Not authorized:** Calling this record sealed, attested, canonical, or vaulted before the actual quorum and ledger/vault workflow completes.

## 11. Proposed Reserve Block manifest

```yaml
reserve_block:
  status: candidate
  sealed: false
  canonical: false
  cycle: C-367
  class: civic-public-record-audit
  title: US-NY-NYC Public Budget Trace
  epicon_tier: 2
  jurisdictions:
    - US-FEDERAL
    - US-NY
    - US-NY-NYC
  operator: Michael Judan
  recorder: AUREA
  created_at: 2026-07-10T00:00:00-04:00
  accounting_warning: "Do not sum cross-jurisdiction totals; transfers may be counted more than once."
  vault_preconditions:
    primary_sources_verified: false
    source_hashes_recorded: false
    quorum_complete: false
    human_merge_complete: false
    ledger_ingestion_complete: false
```

## 12. Replay prompt

> Re-fetch the latest primary federal, New York State, and New York City budget documents. Preserve each fiscal year and accounting stage. Verify the headline totals, calculate the NYC DOE share, identify intergovernmental transfers, hash all source documents, compare against this EPICON, and issue either PASS, CLARIFY, or QUARANTINE. Do not seal or vault without human approval and the canonical quorum.

---

**Integrity statement:** This record demonstrates a traceable method and explicitly records its incomplete primary-source verification. It is a research receipt, not proof that the full public-money chain has yet been reconstructed.
