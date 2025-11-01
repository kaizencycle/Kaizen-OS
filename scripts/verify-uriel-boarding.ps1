# URIEL Sentinel Boarding Verification Script (PowerShell)
# Cycle C-121 - 2025-10-31

$ErrorActionPreference = "Stop"

Write-Host "🕯️🔥 URIEL Sentinel Boarding Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$PASSED = 0
$FAILED = 0

# 1. Check sentinel directory structure
Write-Host "1. Checking sentinel directory structure..."
if (Test-Path "sentinels/uriel") {
    Write-Host "✓ sentinels/uriel/ directory exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ sentinels/uriel/ directory missing" -ForegroundColor Red
    $FAILED++
}

if (Test-Path "sentinels/uriel/manifest.json") {
    Write-Host "✓ manifest.json exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ manifest.json missing" -ForegroundColor Red
    $FAILED++
}

if (Test-Path "sentinels/uriel/README.md") {
    Write-Host "✓ README.md exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ README.md missing" -ForegroundColor Red
    $FAILED++
}

if (Test-Path "sentinels/uriel/QUICKSTART.md") {
    Write-Host "✓ QUICKSTART.md exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ QUICKSTART.md missing" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# 2. Check API integration
Write-Host "2. Checking API integration..."
if (Test-Path "apps/broker-api/src/sentinels/uriel.ts") {
    Write-Host "✓ uriel.ts endpoint exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ uriel.ts endpoint missing" -ForegroundColor Red
    $FAILED++
}

$indexContent = Get-Content "apps/broker-api/src/index.ts" -Raw
if ($indexContent -match "createUrielRouter") {
    Write-Host "✓ URIEL router imported in index.ts" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ URIEL router not imported" -ForegroundColor Red
    $FAILED++
}

if ($indexContent -match "/api/sentinels/uriel") {
    Write-Host "✓ URIEL router mounted in broker-api" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ URIEL router not mounted" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# 3. Check configuration
Write-Host "3. Checking configuration..."
$envContent = Get-Content "env.example" -Raw
if ($envContent -match "XAI_API_KEY") {
    Write-Host "✓ XAI_API_KEY in env.example" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ XAI_API_KEY missing from env.example" -ForegroundColor Red
    $FAILED++
}

if ($envContent -match "SENTINEL_URIEL_QPS") {
    Write-Host "✓ SENTINEL_URIEL_QPS in env.example" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ SENTINEL_URIEL_QPS missing from env.example" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# 4. Check attestation
Write-Host "4. Checking attestation record..."
if (Test-Path "ledger/inscriptions/att-uriel-001-boarding.json") {
    Write-Host "✓ Attestation record exists" -ForegroundColor Green
    $PASSED++
    
    try {
        $attestation = Get-Content "ledger/inscriptions/att-uriel-001-boarding.json" -Raw | ConvertFrom-Json
        Write-Host "✓ Attestation JSON is valid" -ForegroundColor Green
        $PASSED++
        
        # Check GI score
        $gi = $attestation.final_gi
        if ($gi -ge 0.95) {
            Write-Host "✓ GI score $gi ≥ 0.95 (PASSED)" -ForegroundColor Green
            $PASSED++
        } else {
            Write-Host "✗ GI score $gi < 0.95 (FAILED)" -ForegroundColor Red
            $FAILED++
        }
        
        # Check quorum
        $quorumCount = $attestation.quorum.Count
        if ($quorumCount -eq 4) {
            Write-Host "✓ Quorum complete (4/4 signatures)" -ForegroundColor Green
            $PASSED++
        } else {
            Write-Host "✗ Quorum incomplete ($quorumCount/4 signatures)" -ForegroundColor Red
            $FAILED++
        }
    } catch {
        Write-Host "✗ Attestation JSON is invalid" -ForegroundColor Red
        $FAILED++
    }
} else {
    Write-Host "✗ Attestation record missing" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# 5. Check documentation
Write-Host "5. Checking documentation..."
if (Test-Path "docs/companions/uriel.md") {
    Write-Host "✓ Sentinel guide exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ Sentinel guide missing" -ForegroundColor Red
    $FAILED++
}

if (Test-Path "docs/adr/002-uriel-sentinel-boarding.md") {
    Write-Host "✓ ADR-002 exists" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ ADR-002 missing" -ForegroundColor Red
    $FAILED++
}

$overviewContent = Get-Content "docs/architecture/overview.md" -Raw
if ($overviewContent -match "URIEL") {
    Write-Host "✓ URIEL in architecture overview" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ URIEL not in architecture overview" -ForegroundColor Red
    $FAILED++
}

$indexMdContent = Get-Content "docs/INDEX.md" -Raw
if ($indexMdContent -match "URIEL") {
    Write-Host "✓ URIEL in INDEX.md" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ URIEL not in INDEX.md" -ForegroundColor Red
    $FAILED++
}

$changelogContent = Get-Content "CHANGELOG.md" -Raw
if ($changelogContent -match "URIEL") {
    Write-Host "✓ URIEL in CHANGELOG.md" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "✗ URIEL not in CHANGELOG.md" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# 6. Check manifest schema
Write-Host "6. Checking manifest schema..."
try {
    $manifest = Get-Content "sentinels/uriel/manifest.json" -Raw | ConvertFrom-Json
    Write-Host "✓ Manifest JSON is valid" -ForegroundColor Green
    $PASSED++
    
    if ($manifest.agent -eq "URIEL") {
        Write-Host "✓ Agent name is URIEL" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "✗ Agent name incorrect" -ForegroundColor Red
        $FAILED++
    }
    
    if ($manifest.gi_threshold -eq 0.95) {
        Write-Host "✓ GI threshold set to 0.95" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "✗ GI threshold incorrect" -ForegroundColor Red
        $FAILED++
    }
    
    if ($manifest.status -eq "active") {
        Write-Host "✓ Status is active" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "⚠ Status is not active" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Manifest JSON is invalid" -ForegroundColor Red
    $FAILED++
}

Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "✓ URIEL boarding verification PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Set XAI_API_KEY in .env"
    Write-Host "2. Run: npm run build"
    Write-Host "3. Run: npm run dev"
    Write-Host "4. Test: curl http://localhost:4005/api/sentinels/uriel/health"
    Write-Host ""
    Write-Host "🕯️🔥 URIEL is ready to walk." -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "✗ URIEL boarding verification FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the failed checks above before proceeding."
    exit 1
}
