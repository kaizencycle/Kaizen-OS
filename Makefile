PY=python3

.PHONY: eci-run ledger-mock test hooks install-hooks atlas-audit atlas-test

eci-run:
	@echo "Running ECI orchestrator (DRY_RUN=$${DRY_RUN:-true})"
	LEDGER_URL=$${LEDGER_URL:-http://127.0.0.1:8787/attest} \
	DRY_RUN=$${DRY_RUN:-true} \
	ANCHOR_SIGNER=$${ANCHOR_SIGNER:-} \
	CUSTODIAN_SIGNER=$${CUSTODIAN_SIGNER:-} \
	$(PY) tools/quorum_orchestrator.py --prompt PROMPT.md --workdir workrepo --title "Local ECI run"

ledger-mock:
	$(PY) tools/ledger_mock_server.py

test:
	$(PY) -m pytest -q || true

hooks:
	chmod +x .git/hooks/pre-commit

install-hooks: hooks
	@echo "Git hooks installed."

# ATLAS Sentinel commands
atlas-audit:
	@echo "Running ATLAS audit..."
	$(PY) tools/atlas_auditor.py $(shell git diff --name-only HEAD~1)

atlas-test:
	@echo "Testing ATLAS auditor..."
	$(PY) tools/atlas_auditor.py --help

# Convenience: run the whole local loop (mock ledger + orchestrator)
run-local:
	@echo "Start mock ledger in another terminal:  make ledger-mock"
	@echo "Then run:  make eci-run DRY_RUN=false ANCHOR_SIGNER=yes CUSTODIAN_SIGNER=yes"