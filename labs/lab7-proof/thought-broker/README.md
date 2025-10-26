# Thought Broker

Inner-dialogue orchestrator for the OAA → Cursor pipeline.
Runs bounded multi-agent loops, scores consensus, attests to the Civic Ledger, and (optionally) dispatches to Cursor for PR generation.

## Run
```bash
cp .env.example .env
npm i
npm run dev
# GET http://localhost:8080/v1/loop/health
```

## Start a loop

```bash
curl -s -X POST http://localhost:8080/v1/loop/start \
  -H 'content-type: application/json' \
  -d '{
    "cycle":"C-109",
    "proposalRef":"/.civic/change.proposal.json",
    "specRef":"/.civic/change.spec.md",
    "testsRef":"/.civic/change.tests.json",
    "goal":"Produce consensus patch plan with test cases",
    "models":[{"id":"oaa-llm-a"},{"id":"oaa-llm-b"},{"id":"oaa-llm-c"}]
  }'
```

## Poll status

```bash
curl -s http://localhost:8080/v1/loop/<loopId>/status | jq
```

## Get consensus

```bash
curl -s http://localhost:8080/v1/loop/<loopId>/consensus | jq
```

## Notes
- Stop rules: BROKER_MAX_LOOPS, BROKER_SCORE_TAU, BROKER_MAX_SECONDS.
- Dispatch to Cursor only when ALLOW_DISPATCH=true.
- All external calls are stubbed; swap src/models.ts and src/cursor.ts with real providers.
