# Evidence Commons — x402 Acquisition Policy v0.1

## Scope

v0.1 implements **mock/manual receipt only**. Real x402 settlement, wallet custody, and MIC conversion are explicitly out of scope.

## Allowed acquisition modes

| Mode | v0.1 |
|------|------|
| `FREE` | Yes |
| `MANUAL_RECEIPT` | Yes (operator-entered reference) |
| `MOCK_X402` | Yes — UI must label **SIMULATED ACQUISITION** |

## Mock receipt format

```
paymentReference: mock:<uuid>
acquisitionMode: MOCK_X402
```

Never display mock receipts as settled blockchain payments.

## Future (PR D)

Managed wallet, stablecoin settlement, spending policy, human confirmation thresholds, refund/dispute — deferred until PRs A/B validated.
