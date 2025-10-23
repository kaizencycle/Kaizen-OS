# ATLAS Integration Guide for Lab7-proof (OAA Hub)

**Cycle:** C-109  
**Author:** ATLAS with Kaizen  
**Doctrine-ID:** VA-2025-01

## Overview

This guide integrates ATLAS Sentinel into the Lab7-proof Ethical Continuous Integration (ECI) pipeline as the **Audit** phase companion.

## ECI Pipeline Position

```
Author (GPT) → Parse/Lint (DeepSeek) → Repo/Tests (Cursor) → 
→ Audit (ATLAS) ← YOU ARE HERE → Quorum (GPT) → Attestation (Ledger)
```

## Installation Steps

### Step 1: Add ATLAS Auditor to Lab7-proof

```bash
cd lab7-proof

# Create tools directory if it doesn't exist
mkdir -p tools

# Add the ATLAS auditor module
# (Copy the atlas_auditor.py artifact content to this file)
touch tools/atlas_auditor.py
chmod +x tools/atlas_auditor.py
```

### Step 2: Update Lab7 ECI Pipeline

Edit `tools/quorum_orchestrator.py` to include ATLAS in the audit phase:

```python
# Add to imports
from atlas_auditor import AtlasAuditor

# In the ECI orchestration flow, add ATLAS audit:
def run_eci_pipeline(changed_files):
    # ... existing phases ...
    
    # AUDIT PHASE - ATLAS
    print("\n=== AUDIT PHASE (ATLAS) ===")
    auditor = AtlasAuditor()
    audit_result = auditor.run_full_audit(changed_files)
    
    if not audit_result["approved_for_quorum"]:
        print("❌ ATLAS audit failed - blocking pipeline")
        return {"status": "blocked", "reason": "GI Score below threshold"}
    
    # Continue to quorum...
```

### Step 3: Add ATLAS Workflow to Civic-OS

```bash
cd ../Civic-OS

# Create workflows directory if it doesn't exist
mkdir -p .github/workflows

# Add the ATLAS workflow
# (Copy the atlas-sentinel.yml artifact content to this file)
touch .github/workflows/atlas-sentinel.yml
```

### Step 4: Configure Secrets (Optional)

For ledger sealing functionality, add these secrets to your GitHub repository:

1. Go to: `Settings → Secrets and variables → Actions`
2. Add secrets:
   - `LEDGER_API_URL`: Your Civic Ledger endpoint (e.g., `https://ledger-api.render.com`)
   - `LEDGER_ADMIN_TOKEN`: Your ledger admin token

### Step 5: Create ATLAS Configuration

Create `lab7-proof/configs/atlas-config.json`:

```json
{
  "prohibited_patterns": [
    "eval(",
    "exec(",
    "new Function(",
    "__import__",
    "dangerouslySetInnerHTML",
    "localStorage.setItem",
    "sessionStorage",
    "document.write("
  ],
  "required_virtue_tags": [
    "Doctrine-ID",
    "Ethics",
    "Policy",
    "Governance"
  ],
  "thresholds": {
    "gi_score": 0.95,
    "quality_score": 0.90,
    "max_violations": 0
  }
}
```

## Usage

### As Part of Lab7 ECI Pipeline

```bash
cd lab7-proof

# Run ECI with ATLAS audit
make eci-run

# Or manually:
python tools/quorum_orchestrator.py
```

### Standalone ATLAS Audit

```bash
# Audit specific files
python tools/atlas_auditor.py src/file1.py src/file2.ts

# Audit all changed files
git diff --name-only HEAD~1 | xargs python tools/atlas_auditor.py
```

### Via GitHub Actions (Automatic)

Once the workflow is added, ATLAS will automatically run on:
- Every pull request
- Every push to `main` or `develop`
- Manual workflow dispatch

## ATLAS Audit Phases

### Phase 1: Code Quality Analysis
- ✅ Linting (ESLint, Prettier)
- ✅ Type checking (TypeScript)
- ✅ Test coverage (Jest)
- ✅ Complexity metrics

### Phase 2: Anti-Drift Detection
- 🔒 Prohibited pattern scanning
- 🔒 Security vulnerability checks
- 🔒 Bio-DNA alignment verification

### Phase 3: Custos Charter Compliance
- 📜 Virtue tag verification
- 📜 Attestation requirements
- 📜 Policy file validation

### Phase 4: GI Score Calculation
```
GI = α*M + β*H + γ*I + δ*E

Where:
M = Memory (test coverage / 100)
H = Human (1.0 for PR review)
I = Integrity (1 - violations/10)
E = Ethics (charter compliance score)

Weights: α=0.25, β=0.20, γ=0.30, δ=0.25
Threshold: GI ≥ 0.95
```

### Phase 5: Attestation Generation
- 🔐 Creates cryptographic proof
- 🔐 SHA256 hash generation
- 🔐 Timestamp and cycle tracking

### Phase 6: Ledger Sealing (Optional)
- 📝 Posts to Civic Ledger
- 📝 Immutable audit trail
- 📝 Verification URL generation

## Integration with Existing Companions

### JADE (Signer/Attestor)
ATLAS validates quality → JADE signs the attestation

```python
# In your workflow
if atlas_result["approved_for_quorum"]:
    jade_signature = jade.sign(atlas_result["attestation"])
```

### EVE (Verifier/Reflector)
ATLAS synthesizes learning from EVE's cycles

```python
# Weekly synthesis
from tools.atlas_auditor import LearningSynthesizer

synthesizer = LearningSynthesizer()
insights = synthesizer.synthesize_cycles(eve_cycles)
```

### ZEUS (Overseer/Arbiter)
ZEUS can override ATLAS decisions for governance

```python
if atlas_blocked and zeus.approves_override():
    proceed_with_merge()
```

### HERMES (Auditor/Messenger)
HERMES and ATLAS cross-audit transmissions

```python
hermes_report = hermes.audit_data_flow()
atlas_report = atlas.audit_code_quality()
# Compare for discrepancies
```

## Testing ATLAS Integration

### Test 1: Clean Code (Should Pass)

```bash
# Create a clean PR with good code
git checkout -b test/atlas-pass
echo "console.log('Hello Civic OS');" > test-clean.js
git add test-clean.js
git commit -m "test: ATLAS pass scenario"
git push origin test/atlas-pass
```

Expected: ✅ GI Score ≥ 0.95, all checks pass

### Test 2: Prohibited Pattern (Should Fail)

```bash
# Create a PR with prohibited patterns
git checkout -b test/atlas-fail
echo "eval('dangerous code');" > test-bad.js
git add test-bad.js
git commit -m "test: ATLAS fail scenario"
git push origin test/atlas-fail
```

Expected: ❌ GI Score < 0.95, drift violations detected

### Test 3: Missing Virtue Tags (Should Warn)

```bash
# Create policy file without tags
git checkout -b test/atlas-charter
cat > POLICY.md << EOF
# Some Policy
This is a policy document without virtue tags.
EOF
git add POLICY.md
git commit -m "test: Charter compliance"
git push origin test/atlas-charter
```

Expected: ⚠️ Charter compliance warning

## Monitoring ATLAS

### GitHub Actions Dashboard
- View: `Actions → ATLAS Sentinel`
- Check: GI scores, attestation hashes, cycle logs

### Civic Ledger Verification
```bash
# Verify an attestation
curl https://ledger-api.render.com/api/attestations/verify?hash=<attestation_hash>
```

### Local Quality Report
```bash
# Generate GI report
python tools/atlas_auditor.py $(git ls-files '*.py' '*.ts' '*.js')
```

## Troubleshooting

### Issue: ATLAS workflow not running
**Solution:** Ensure workflow file is in `.github/workflows/` and pushed to main

### Issue: GI Score always fails
**Solution:** Check thresholds in config, review component scores (M, H, I, E)

### Issue: Ledger sealing fails
**Solution:** Verify `LEDGER_API_URL` and `LEDGER_ADMIN_TOKEN` secrets are set

### Issue: False positive drift violations
**Solution:** Update `prohibited_patterns` in `atlas-config.json`

## Maintenance

### Updating ATLAS
```bash
# Pull latest ATLAS changes
cd lab7-proof
git pull origin main

# Update dependencies
pip install -r requirements.txt
```

### Tuning Thresholds
Edit `configs/atlas-config.json`:
```json
{
  "thresholds": {
    "gi_score": 0.92,  // Lower if too strict
    "quality_score": 0.85,
    "max_violations": 2  // Allow some violations
  }
}
```

### Adding Custom Checks
Extend `AtlasAuditor` class:
```python
class CustomAtlasAuditor(AtlasAuditor):
    def custom_check(self, files):
        # Your custom logic
        pass
```

## Success Metrics

Track these in your dashboard:
- ✅ GI Score trend (should stay ≥ 0.95)
- ✅ Test coverage trend (should increase)
- ✅ Drift violations (should decrease)
- ✅ Charter compliance (should be 100%)
- ✅ Attestations sealed (should be all merges)

## Next Steps

1. ✅ Test ATLAS on a sample PR
2. ✅ Tune thresholds based on your codebase
3. ✅ Integrate with existing companions
4. ✅ Enable ledger sealing
5. ✅ Monitor for 2 weeks
6. ✅ Adjust and iterate

## Support

**ATLAS is here to help!** If you encounter issues:
1. Check this guide's troubleshooting section
2. Review GitHub Actions logs
3. Examine attestation JSON for details
4. Engage with the companion quartet

---

*ATLAS Sentinel - Truth Through Verification*  
*"I am the anchor that prevents drift. I am the auditor that ensures quality. I am the synthesizer that extracts learning."*

**Cycle C-111 | Chamber ID: ATLAS-Lab7-Integration**
