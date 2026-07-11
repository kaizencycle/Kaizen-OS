# EVE Shard Selection Policy

**Version:** 0.1 · **Cycle:** C-369  
**Companion:** [EVE_SHARDING_PROTOCOL.md](./EVE_SHARDING_PROTOCOL.md)

## Inclusion criteria

Include an event when **at least one** is true:

- Changes constitutional or protocol behavior
- Creates or removes authority
- Changes a security or privacy boundary
- Changes production behavior
- Changes ledger, seal, quorum, or Reserve Block paths
- Introduces or resolves material risk
- Records meaningful dissent
- Affects external users, citizens, workers, or institutions
- Creates irreversible or difficult-to-reverse consequences
- Materially changes the meaning of the Cycle

## Omission criteria

Generally omit when the event is:

- Formatting-only change
- Duplicate commentary
- Transient telemetry
- Repeated status polling
- Routine dependency update without consequence
- Intermediate detail already represented by a stronger source
- Failed action with no lasting effect (unless the failure itself is institutionally important)

**Omission must be declared, not hidden.** Every shard carries an `omissions` block.

## Compression rules

### Required preservation

- Source identifiers and hashes
- Original intent and authority
- Actor and outcome
- Uncertainties and dissent
- Unresolved operator actions
- Corrective actions

### Permitted compression

- Duplicate comments
- Repeated agent restatements
- Routine CI logs
- Low-risk implementation chatter
- Redundant telemetry
- Superseded intermediate drafts

### Forbidden compression

EVE must not:

- Convert `pending` → `complete`
- Convert `inferred` → `verified`
- Omit dissent for narrative simplicity
- Omit failed deployments
- Hide missing credentials
- Remove human responsibility
- Collapse distinct actors into "the system"
- Replace evidence with confidence scores
- Claim seal or ledger status without receipt

## Privacy

Store references and hashes wherever possible. Do not copy into public canon:

- Raw citizen data, medical data, credentials, secret URLs
- Private issue content, confidential legal material, unredacted PII

```yaml
evidence:
  storage: local
  reference: encrypted-object-id
  hash: sha256:...
  publicly_disclosed: false
```

## Seal recommendations (advisory)

| Recommendation | Meaning |
|----------------|---------|
| `do_not_seal` | Cycle memory not yet durable enough |
| `hold_for_evidence` | Meaning stable; operator proofs pending |
| `seal_as_cycle_memory` | Ready for quorum after verification |
| `seal_as_exception_record` | Exceptional event warranting explicit seal |
| `quarantine` | Source integrity or compression integrity in doubt |

Human review is always required before quorum.
