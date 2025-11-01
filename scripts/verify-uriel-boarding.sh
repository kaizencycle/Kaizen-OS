#!/bin/bash
# URIEL Sentinel Boarding Verification Script
# Cycle C-121 - 2025-10-31

set -e

echo "🕯️🔥 URIEL Sentinel Boarding Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check sentinel directory structure
echo "1. Checking sentinel directory structure..."
if [ -d "sentinels/uriel" ]; then
    pass "sentinels/uriel/ directory exists"
else
    fail "sentinels/uriel/ directory missing"
fi

if [ -f "sentinels/uriel/manifest.json" ]; then
    pass "manifest.json exists"
else
    fail "manifest.json missing"
fi

if [ -f "sentinels/uriel/README.md" ]; then
    pass "README.md exists"
else
    fail "README.md missing"
fi

if [ -f "sentinels/uriel/QUICKSTART.md" ]; then
    pass "QUICKSTART.md exists"
else
    fail "QUICKSTART.md missing"
fi

echo ""

# 2. Check API integration
echo "2. Checking API integration..."
if [ -f "apps/broker-api/src/sentinels/uriel.ts" ]; then
    pass "uriel.ts endpoint exists"
else
    fail "uriel.ts endpoint missing"
fi

if grep -q "createUrielRouter" "apps/broker-api/src/index.ts"; then
    pass "URIEL router imported in index.ts"
else
    fail "URIEL router not imported"
fi

if grep -q "/api/sentinels/uriel" "apps/broker-api/src/index.ts"; then
    pass "URIEL router mounted in broker-api"
else
    fail "URIEL router not mounted"
fi

echo ""

# 3. Check configuration
echo "3. Checking configuration..."
if grep -q "XAI_API_KEY" "env.example"; then
    pass "XAI_API_KEY in env.example"
else
    fail "XAI_API_KEY missing from env.example"
fi

if grep -q "SENTINEL_URIEL_QPS" "env.example"; then
    pass "SENTINEL_URIEL_QPS in env.example"
else
    fail "SENTINEL_URIEL_QPS missing from env.example"
fi

echo ""

# 4. Check attestation
echo "4. Checking attestation record..."
if [ -f "ledger/inscriptions/att-uriel-001-boarding.json" ]; then
    pass "Attestation record exists"
    
    # Validate JSON
    if command -v jq &> /dev/null; then
        if jq empty "ledger/inscriptions/att-uriel-001-boarding.json" 2>/dev/null; then
            pass "Attestation JSON is valid"
            
            # Check GI score
            GI=$(jq -r '.final_gi' "ledger/inscriptions/att-uriel-001-boarding.json")
            if (( $(echo "$GI >= 0.95" | bc -l) )); then
                pass "GI score $GI ≥ 0.95 (PASSED)"
            else
                fail "GI score $GI < 0.95 (FAILED)"
            fi
            
            # Check quorum
            QUORUM_COUNT=$(jq '.quorum | length' "ledger/inscriptions/att-uriel-001-boarding.json")
            if [ "$QUORUM_COUNT" -eq 4 ]; then
                pass "Quorum complete (4/4 signatures)"
            else
                fail "Quorum incomplete ($QUORUM_COUNT/4 signatures)"
            fi
        else
            fail "Attestation JSON is invalid"
        fi
    else
        warn "jq not installed, skipping JSON validation"
    fi
else
    fail "Attestation record missing"
fi

echo ""

# 5. Check documentation
echo "5. Checking documentation..."
if [ -f "docs/companions/uriel.md" ]; then
    pass "Sentinel guide exists"
else
    fail "Sentinel guide missing"
fi

if [ -f "docs/adr/002-uriel-sentinel-boarding.md" ]; then
    pass "ADR-002 exists"
else
    fail "ADR-002 missing"
fi

if grep -q "URIEL" "docs/architecture/overview.md"; then
    pass "URIEL in architecture overview"
else
    fail "URIEL not in architecture overview"
fi

if grep -q "URIEL" "docs/INDEX.md"; then
    pass "URIEL in INDEX.md"
else
    fail "URIEL not in INDEX.md"
fi

if grep -q "URIEL" "CHANGELOG.md"; then
    pass "URIEL in CHANGELOG.md"
else
    fail "URIEL not in CHANGELOG.md"
fi

echo ""

# 6. Check TypeScript compilation (if tsc available)
echo "6. Checking TypeScript compilation..."
if command -v tsc &> /dev/null; then
    if [ -f "apps/broker-api/tsconfig.json" ]; then
        cd apps/broker-api
        if tsc --noEmit 2>/dev/null; then
            pass "TypeScript compilation successful"
        else
            fail "TypeScript compilation errors"
        fi
        cd ../..
    else
        warn "tsconfig.json not found, skipping compilation check"
    fi
else
    warn "tsc not installed, skipping compilation check"
fi

echo ""

# 7. Check manifest schema
echo "7. Checking manifest schema..."
if command -v jq &> /dev/null; then
    if jq empty "sentinels/uriel/manifest.json" 2>/dev/null; then
        pass "Manifest JSON is valid"
        
        # Check required fields
        if jq -e '.agent == "URIEL"' "sentinels/uriel/manifest.json" >/dev/null; then
            pass "Agent name is URIEL"
        else
            fail "Agent name incorrect"
        fi
        
        if jq -e '.gi_threshold == 0.95' "sentinels/uriel/manifest.json" >/dev/null; then
            pass "GI threshold set to 0.95"
        else
            fail "GI threshold incorrect"
        fi
        
        if jq -e '.status == "active"' "sentinels/uriel/manifest.json" >/dev/null; then
            pass "Status is active"
        else
            warn "Status is not active"
        fi
    else
        fail "Manifest JSON is invalid"
    fi
else
    warn "jq not installed, skipping manifest validation"
fi

echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ URIEL boarding verification PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set XAI_API_KEY in .env"
    echo "2. Run: npm run build"
    echo "3. Run: npm run dev"
    echo "4. Test: curl http://localhost:4005/api/sentinels/uriel/health"
    echo ""
    echo "🕯️🔥 URIEL is ready to walk."
    exit 0
else
    echo -e "${RED}✗ URIEL boarding verification FAILED${NC}"
    echo ""
    echo "Please fix the failed checks above before proceeding."
    exit 1
fi

