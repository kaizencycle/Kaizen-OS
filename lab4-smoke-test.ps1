<#  lab4-smoke-test.ps1
    Lab4 Research & Study - Complete Smoke Test with Dual Writer
    Usage: .\lab4-smoke-test.ps1 -Date 2025-09-22
#>

param(
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$Base = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"

function Write-Title($t){ Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Write-OK($t){ Write-Host $t -ForegroundColor Green }
function Write-ERR($t){ Write-Host $t -ForegroundColor Red }

function Call-API {
  param([string]$Method,[string]$Path,[hashtable]$Body)
  $uri = "$Base$Path"
  try {
    if ($Method -eq 'GET') {
      return Invoke-RestMethod -Uri $uri -Method GET
    } else {
      $json = ($Body | ConvertTo-Json -Depth 10)
      return Invoke-RestMethod -Uri $uri -Method $Method -ContentType "application/json" -Body $json
    }
  } catch {
    Write-ERR "API $Method $Path failed"
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      Write-Host ($_.ErrorDetails.Message) -ForegroundColor DarkRed
    } else {
      Write-Host $_ -ForegroundColor DarkRed
    }
    throw
  }
}

Write-Title "Lab4 Research & Study - FastAPI Smoke Test"
Write-Host "Date: $Date" -ForegroundColor Yellow
Write-Host "Base URL: $Base" -ForegroundColor Yellow

# Initialize test results
$testResults = @{}

Write-Title "1. Health Check"
try {
  $health = Call-API GET "/health"
  $testResults["health"] = @{ status = "pass"; details = "server alive" }
  Write-OK "Health check passed"
} catch {
  $testResults["health"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Health check failed"
}

Write-Title "2. Routes Check"
try {
  $routes = Call-API GET "/routes"
  $testResults["routes"] = @{ status = "pass"; details = "$($routes.count) endpoints available" }
  Write-OK "Routes check passed - $($routes.count) endpoints"
} catch {
  $testResults["routes"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Routes check failed"
}

Write-Title "3. Seed Test"
try {
  $seed = Call-API POST "/seed" @{
    date = $Date
    time = (Get-Date -Format "HH:mm:ss")
    intent = "lab4-smoke-test"
    meta = @{ node_id = "lab4-tester"; author = "Kaizen" }
  }
  $testResults["seed"] = @{ status = "pass"; hash = $seed.seed_hash }
  Write-OK "Seed test passed - Hash: $($seed.seed_hash)"
} catch {
  $testResults["seed"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Seed test failed"
}

Write-Title "4. Sweep Test"
try {
  $sweep = Call-API POST "/sweep" @{
    date = $Date
    chamber = "LAB4"
    note = "Lab4 smoke test sweep"
    meta = @{ gic_intent = "publish"; user = "lab4-tester" }
  }
  $testResults["sweep"] = @{ status = "pass"; details = "linked to seed"; gic = $sweep.gic.ToString() }
  Write-OK "Sweep test passed - GIC: $($sweep.gic)"
} catch {
  $testResults["sweep"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Sweep test failed"
}

Write-Title "5. Seal Test"
try {
  $seal = Call-API POST "/seal" @{
    date = $Date
    wins = "Lab4 smoke test completed successfully"
    blocks = "none"
    tomorrow_intent = "continue research and development"
    meta = @{ test_type = "smoke_test"; lab = "lab4" }
  }
  $testResults["seal"] = @{ status = "pass"; merkle_root = $seal.day_root }
  Write-OK "Seal test passed - Merkle Root: $($seal.day_root)"
} catch {
  $testResults["seal"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Seal test failed"
}

Write-Title "6. Verify Test"
try {
  $verify = Call-API GET "/verify/$Date"
  $testResults["verify"] = @{ status = "pass"; details = "integrity verified" }
  Write-OK "Verify test passed - Integrity confirmed"
} catch {
  $testResults["verify"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Verify test failed"
}

Write-Title "7. Export Test"
try {
  $export = Call-API GET "/export/$Date"
  $testResults["export"] = @{ status = "pass"; details = "data export working" }
  Write-OK "Export test passed"
} catch {
  $testResults["export"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Export test failed"
}

Write-Title "8. Index Test"
try {
  $index = Call-API GET "/index"
  $testResults["index"] = @{ status = "pass"; details = "$($index.total_days) days tracked" }
  Write-OK "Index test passed - $($index.total_days) days tracked"
} catch {
  $testResults["index"] = @{ status = "fail"; details = $_.Exception.Message }
  Write-ERR "Index test failed"
}

Write-Title "9. Dual Writer - Save Smoke Test Bundle"
try {
  $smokeBundle = Call-API POST "/smoke/save" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = $testResults
    wins = "All smoke tests completed - FastAPI operational with Merkle-rooted ledger system"
    blocks = "none"
    next_intent = "Continue API development and feature enhancement"
  }
  Write-OK "Smoke test bundle saved:"
  Write-Host "  JSON: $($smokeBundle.json_file)" -ForegroundColor Gray
  Write-Host "  JSON Hash: $($smokeBundle.json_sha256)" -ForegroundColor Gray
  Write-Host "  Markdown: $($smokeBundle.md_file)" -ForegroundColor Gray
  Write-Host "  MD Hash: $($smokeBundle.md_sha256)" -ForegroundColor Gray
} catch {
  Write-ERR "Dual writer failed: $($_.Exception.Message)"
}

Write-Title "Lab4 Smoke Test Complete"
$passCount = ($testResults.Values | Where-Object { $_.status -eq "pass" }).Count
$totalCount = $testResults.Count
Write-Host "Results: $passCount/$totalCount tests passed" -ForegroundColor $(if($passCount -eq $totalCount){"Green"}else{"Yellow"})

if ($passCount -eq $totalCount) {
  Write-OK "🎉 All tests passed! Lab4 Research & Study API is operational."
} else {
  Write-ERR "⚠️  Some tests failed. Check the results above."
}
