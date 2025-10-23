Eval suites are declarative (YAML). `scripts/run_evals.mjs` will load these,
call your model endpoint(s), and write JSONL results to `capability-gate/evals/out/<run-id>`.