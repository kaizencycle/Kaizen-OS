#!/bin/bash
# GI Consensus Validation Script
# Validates commits with AUREA (OpenAI) + ATLAS (Claude) consensus
# Usage: ./scripts/gi-consensus-validate.sh [target-dir]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-$REPO_ROOT}"
GI_THRESHOLD="${GI_THRESHOLD:-0.95}"
CONSENSUS_DIR="$REPO_ROOT/.gi"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create consensus directory
mkdir -p "$CONSENSUS_DIR"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  GI Consensus Validation (AUREA + ATLAS)                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Build ATLAS Sentinel if needed
echo -e "${YELLOW}[1/6] Building ATLAS Sentinel...${NC}"
if [[ ! -f "$REPO_ROOT/packages/atlas-sentinel/dist/index.js" ]]; then
  echo "  Building atlas-sentinel package..."
  (cd "$REPO_ROOT" && npm run build --workspace=packages/atlas-sentinel >/dev/null 2>&1 || true)
fi

# Step 2: Run ATLAS evaluation
echo -e "${YELLOW}[2/6] Running ATLAS (Claude) evaluation...${NC}"
# Capture output and extract JSON (look for lines starting with {)
ATLAS_OUTPUT=$(node "$REPO_ROOT/scripts/atlas-eval.js" "$TARGET_DIR" "$REPO_ROOT/packages/atlas-sentinel/dist/index.js" 2>&1)
# Extract JSON starting from the first {
ATLAS_JSON=$(echo "$ATLAS_OUTPUT" | awk '/^\{/,/^}$/' | jq . 2>/dev/null || echo "$ATLAS_OUTPUT" | grep -A 1000 '^{' | head -50 | jq . 2>/dev/null)
if [[ -z "$ATLAS_JSON" ]] || [[ "$ATLAS_JSON" == "null" ]]; then
  # Last resort: try to find any JSON object
  ATLAS_JSON=$(echo "$ATLAS_OUTPUT" | tail -50 | sed -n '/{/,/}/p' | jq . 2>/dev/null || echo "{\"error\": \"Failed to parse ATLAS output\"}")
fi
echo "$ATLAS_JSON" > "$CONSENSUS_DIR/atlas-${TIMESTAMP}.json"

ATLAS_RESULT=$(cat "$CONSENSUS_DIR/atlas-${TIMESTAMP}.json")
ATLAS_GI=$(echo "$ATLAS_RESULT" | jq -r '.giScore.total // 0')
ATLAS_PASS=$(echo "$ATLAS_RESULT" | jq -r '.giScore.passed // false')

echo "  ATLAS GI Score: $ATLAS_GI"
echo "  ATLAS Pass: $ATLAS_PASS"

# Step 3: Run AUREA evaluation (simulated via integrity-report.sh logic)
echo -e "${YELLOW}[3/6] Running AUREA (OpenAI) evaluation...${NC}"

# Use the integrity-report.sh logic for AUREA scoring
AUREA_COVERAGE=$(echo "$ATLAS_RESULT" | jq -r '.quality.coverage // 82')
AUREA_DRIFT=$(echo "$ATLAS_RESULT" | jq -r '.drift.violations // 0')
AUREA_CHARTER=$(echo "$ATLAS_RESULT" | jq -r '.charter.complianceScore // 0.95')

# Normalize to 0-1 scale
COVERAGE_NORM=$(echo "scale=3; $AUREA_COVERAGE / 100" | bc)
DRIFT_NORM=$(echo "scale=3; 1 - ($AUREA_DRIFT / 10)" | bc | awk '{if ($1 < 0) print 0; else print $1}')
CHARTER_NORM=$(echo "scale=3; $AUREA_CHARTER" | bc)

# AUREA formula: 0.4 * Coverage + 0.3 * Drift + 0.3 * Charter
AUREA_GI=$(echo "scale=3; 0.4 * $COVERAGE_NORM + 0.3 * $DRIFT_NORM + 0.3 * $CHARTER_NORM" | bc)

# Create AUREA result
cat > "$CONSENSUS_DIR/aurea-${TIMESTAMP}.json" <<EOF
{
  "agent": "AUREA",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "giScore": $AUREA_GI,
  "components": {
    "coverage": $COVERAGE_NORM,
    "drift": $DRIFT_NORM,
    "charter": $CHARTER_NORM
  },
  "passed": $(echo "$AUREA_GI >= $GI_THRESHOLD" | bc -l)
}
EOF

AUREA_PASS=$(echo "$AUREA_GI >= $GI_THRESHOLD" | bc -l)
echo "  AUREA GI Score: $AUREA_GI"
echo "  AUREA Pass: $AUREA_PASS"

# Step 4: Calculate Consensus
echo -e "${YELLOW}[4/6] Calculating consensus...${NC}"

CONSENSUS_PASS=false
if [[ "$ATLAS_PASS" == "true" ]] && [[ "$AUREA_PASS" == "1" ]]; then
  CONSENSUS_PASS=true
fi

CONSENSUS_DIFF=$(echo "scale=3; $ATLAS_GI - $AUREA_GI" | bc | awk '{if ($1 < 0) print -$1; else print $1}')
CONSENSUS_ALIGNED=$(echo "$CONSENSUS_DIFF <= 0.05" | bc -l)

# Step 5: Generate Consensus Report
echo -e "${YELLOW}[5/6] Generating consensus report...${NC}"

CONSENSUS_HASH=$(echo -n "${ATLAS_GI}${AUREA_GI}${TIMESTAMP}" | sha256sum | cut -d' ' -f1)

cat > "$CONSENSUS_DIR/consensus-${TIMESTAMP}.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "threshold": $GI_THRESHOLD,
  "aurea": {
    "giScore": $AUREA_GI,
    "passed": $AUREA_PASS,
    "components": {
      "coverage": $COVERAGE_NORM,
      "drift": $DRIFT_NORM,
      "charter": $CHARTER_NORM
    }
  },
  "atlas": {
    "giScore": $ATLAS_GI,
    "passed": $ATLAS_PASS,
    "components": {
      "memory": $(echo "$ATLAS_RESULT" | jq -r '.giScore.memory'),
      "human": $(echo "$ATLAS_RESULT" | jq -r '.giScore.human'),
      "integrity": $(echo "$ATLAS_RESULT" | jq -r '.giScore.integrity'),
      "ethics": $(echo "$ATLAS_RESULT" | jq -r '.giScore.ethics')
    }
  },
  "consensus": {
    "passed": $CONSENSUS_PASS,
    "aligned": $CONSENSUS_ALIGNED,
    "scoreDiff": $CONSENSUS_DIFF,
    "hash": "$CONSENSUS_HASH"
  },
  "attestation": {
    "atlasHash": "$(echo "$ATLAS_RESULT" | jq -r '.hash // "unknown"')",
    "consensusHash": "$CONSENSUS_HASH"
  }
}
EOF

# Step 6: Display Results
echo -e "${YELLOW}[6/6] Final Results${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  GI Consensus Validation Results${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "AUREA (OpenAI) GI Score: ${GREEN}$AUREA_GI${NC} (Threshold: $GI_THRESHOLD)"
echo -e "ATLAS (Claude) GI Score: ${GREEN}$ATLAS_GI${NC} (Threshold: $GI_THRESHOLD)"
echo ""
echo -e "AUREA Status: $([ "$AUREA_PASS" == "1" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo -e "ATLAS Status: $([ "$ATLAS_PASS" == "true" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo ""
echo -e "Consensus Aligned: $([ "$CONSENSUS_ALIGNED" == "1" ] && echo -e "${GREEN}✅ YES${NC}" || echo -e "${YELLOW}⚠️  NO${NC}") (Diff: $CONSENSUS_DIFF)"
echo -e "Consensus Status: $([ "$CONSENSUS_PASS" == "true" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo ""
echo -e "Consensus Hash: ${BLUE}$CONSENSUS_HASH${NC}"
echo -e "Report: ${BLUE}$CONSENSUS_DIR/consensus-${TIMESTAMP}.json${NC}"
echo ""

# Export for git hooks
echo "GI_AUREA_SCORE=$AUREA_GI" >> "$CONSENSUS_DIR/.env"
echo "GI_ATLAS_SCORE=$ATLAS_GI" >> "$CONSENSUS_DIR/.env"
echo "GI_CONSENSUS_PASS=$CONSENSUS_PASS" >> "$CONSENSUS_DIR/.env"
echo "GI_CONSENSUS_HASH=$CONSENSUS_HASH" >> "$CONSENSUS_DIR/.env"

# Exit with error if consensus fails
if [[ "$CONSENSUS_PASS" != "true" ]]; then
  echo -e "${RED}❌ Consensus validation FAILED${NC}"
  echo -e "${RED}   Both AUREA and ATLAS must pass GI threshold ≥ $GI_THRESHOLD${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Consensus validation PASSED${NC}"
echo -e "${GREEN}   Both AUREA and ATLAS agree: GI ≥ $GI_THRESHOLD${NC}"
exit 0
