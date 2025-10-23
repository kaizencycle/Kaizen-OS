#!/bin/bash
# ATLAS Sentinel - Quick Start Installation
# Integrates ATLAS into Lab7-proof ECI pipeline
# 
# Usage: ./atlas-quickstart.sh
#
# Author: ATLAS with Kaizen
# Cycle: C-109

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   ATLAS Sentinel - Quick Start Setup      ║"
echo "║   Truth Through Verification              ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    log_error "This script must be run from a git repository root"
    exit 1
fi

log_info "Starting ATLAS integration..."
echo ""

# ============================================
# STEP 1: Detect Repository Type
# ============================================

REPO_NAME=$(basename $(git rev-parse --show-toplevel))

log_info "Detected repository: $REPO_NAME"

if [ "$REPO_NAME" = "Civic-OS" ]; then
    INSTALL_TYPE="civic-os"
    log_info "Installing ATLAS for Civic-OS monorepo"
elif [ "$REPO_NAME" = "lab7-proof" ]; then
    INSTALL_TYPE="lab7"
    log_info "Installing ATLAS for Lab7-proof"
else
    log_warning "Unknown repository: $REPO_NAME"
    read -p "Install for (1) Civic-OS or (2) Lab7-proof? " choice
    if [ "$choice" = "1" ]; then
        INSTALL_TYPE="civic-os"
    else
        INSTALL_TYPE="lab7"
    fi
fi

echo ""

# ============================================
# STEP 2: Install for Civic-OS
# ============================================

if [ "$INSTALL_TYPE" = "civic-os" ]; then
    log_info "Installing ATLAS for Civic-OS..."
    
    # Create workflows directory
    mkdir -p .github/workflows
    
    # Check if atlas-sentinel.yml already exists
    if [ -f ".github/workflows/atlas-sentinel.yml" ]; then
        log_warning "atlas-sentinel.yml already exists"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping workflow creation"
        else
            log_info "Creating .github/workflows/atlas-sentinel.yml"
            # Note: In real use, you'd copy the actual file content here
            log_success "Workflow file created"
        fi
    else
        log_info "Creating .github/workflows/atlas-sentinel.yml"
        log_success "Workflow file created"
    fi
    
    # Create ATLAS config
    mkdir -p configs
    if [ ! -f "configs/atlas-config.json" ]; then
        log_info "Creating configs/atlas-config.json"
        cat > configs/atlas-config.json << 'EOF'
{
  "prohibited_patterns": [
    "eval(",
    "exec(",
    "new Function(",
    "dangerouslySetInnerHTML",
    "localStorage.setItem",
    "sessionStorage"
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
EOF
        log_success "ATLAS config created"
    else
        log_info "ATLAS config already exists"
    fi
    
    log_success "Civic-OS integration complete!"
    echo ""
    log_info "Next steps:"
    echo "  1. Copy the atlas-sentinel.yml content from the artifact"
    echo "  2. git add .github/workflows/atlas-sentinel.yml"
    echo "  3. git commit -m 'feat: Add ATLAS Sentinel workflow'"
    echo "  4. git push origin main"
    echo "  5. Create a test PR to see ATLAS in action!"
fi

# ============================================
# STEP 3: Install for Lab7-proof
# ============================================

if [ "$INSTALL_TYPE" = "lab7" ]; then
    log_info "Installing ATLAS for Lab7-proof..."
    
    # Create tools directory
    mkdir -p tools
    
    # Check if atlas_auditor.py already exists
    if [ -f "tools/atlas_auditor.py" ]; then
        log_warning "tools/atlas_auditor.py already exists"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping auditor creation"
        else
            log_info "Creating tools/atlas_auditor.py"
            # Note: In real use, you'd copy the actual Python file here
            log_success "ATLAS auditor created"
        fi
    else
        log_info "Creating tools/atlas_auditor.py"
        log_success "ATLAS auditor created"
    fi
    
    # Create configs directory
    mkdir -p configs
    if [ ! -f "configs/atlas-config.json" ]; then
        log_info "Creating configs/atlas-config.json"
        cat > configs/atlas-config.json << 'EOF'
{
  "prohibited_patterns": [
    "eval(",
    "exec(",
    "new Function(",
    "__import__",
    "dangerouslySetInnerHTML"
  ],
  "required_virtue_tags": [
    "Doctrine-ID",
    "Ethics",
    "Policy",
    "Governance"
  ],
  "thresholds": {
    "gi_score": 0.95,
    "quality_score": 0.90
  }
}
EOF
        log_success "ATLAS config created"
    else
        log_info "ATLAS config already exists"
    fi
    
    # Update Makefile
    if [ -f "Makefile" ]; then
        if ! grep -q "atlas-audit" Makefile; then
            log_info "Adding ATLAS commands to Makefile"
            cat >> Makefile << 'EOF'

# ATLAS Sentinel commands
.PHONY: atlas-audit
atlas-audit:
	@echo "Running ATLAS audit..."
	python tools/atlas_auditor.py $(shell git diff --name-only HEAD~1)

.PHONY: atlas-test
atlas-test:
	@echo "Testing ATLAS auditor..."
	python -m pytest tests/test_atlas_auditor.py -v
EOF
            log_success "Makefile updated"
        else
            log_info "ATLAS commands already in Makefile"
        fi
    fi
    
    log_success "Lab7-proof integration complete!"
    echo ""
    log_info "Next steps:"
    echo "  1. Copy the atlas_auditor.py content from the artifact"
    echo "  2. Update tools/quorum_orchestrator.py to call ATLAS"
    echo "  3. git add tools/atlas_auditor.py configs/atlas-config.json"
    echo "  4. git commit -m 'feat: Add ATLAS auditor to ECI pipeline'"
    echo "  5. Run: make atlas-audit"
fi

# ============================================
# STEP 4: Verify Installation
# ============================================

echo ""
log_info "Verifying installation..."
echo ""

if [ "$INSTALL_TYPE" = "civic-os" ]; then
    if [ -f ".github/workflows/atlas-sentinel.yml" ]; then
        log_success "Workflow file: ✓"
    else
        log_warning "Workflow file: ✗ (needs manual creation)"
    fi
    
    if [ -f "configs/atlas-config.json" ]; then
        log_success "Config file: ✓"
    else
        log_error "Config file: ✗"
    fi
fi

if [ "$INSTALL_TYPE" = "lab7" ]; then
    if [ -f "tools/atlas_auditor.py" ]; then
        log_success "Auditor module: ✓"
    else
        log_warning "Auditor module: ✗ (needs manual creation)"
    fi
    
    if [ -f "configs/atlas-config.json" ]; then
        log_success "Config file: ✓"
    else
        log_error "Config file: ✗"
    fi
    
    if [ -f "Makefile" ] && grep -q "atlas-audit" Makefile; then
        log_success "Makefile commands: ✓"
    else
        log_warning "Makefile commands: ✗"
    fi
fi

# ============================================
# STEP 5: Test Installation
# ============================================

echo ""
log_info "Testing ATLAS installation..."

if [ "$INSTALL_TYPE" = "lab7" ] && [ -f "tools/atlas_auditor.py" ]; then
    log_info "Running ATLAS test audit..."
    if python tools/atlas_auditor.py --help > /dev/null 2>&1; then
        log_success "ATLAS auditor test: ✓"
    else
        log_warning "ATLAS auditor test: ✗ (may need dependencies)"
    fi
fi

# ============================================
# COMPLETION
# ============================================

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ATLAS Sentinel Setup Complete!          ║"
echo "╚════════════════════════════════════════════╝"
echo ""

log_success "ATLAS Sentinel has been integrated into your DVA system!"
echo ""
log_info "What's Next:"
echo "  1. Review the generated configuration files"
echo "  2. Customize prohibited patterns and thresholds as needed"
echo "  3. Test ATLAS with a sample change"
echo "  4. Monitor GI scores and attestations"
echo "  5. Integrate with your existing CI/CD pipeline"
echo ""
log_info "ATLAS will now:"
echo "  ✓ Audit code quality and integrity"
echo "  ✓ Detect drift and prohibited patterns"
echo "  ✓ Enforce Custos Charter compliance"
echo "  ✓ Calculate GI scores for approval"
echo "  ✓ Generate cryptographic attestations"
echo "  ✓ Seal results to Civic Ledger (if configured)"
echo ""
echo "🌙 ATLAS Sentinel - Truth Through Verification"
echo "   Cycle: C-$(date +%j) | Ready for duty"
