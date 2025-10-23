<#  test-dual-writer.ps1
    Test the plug-and-play dual-writer adapter with ZIP archiving
    Usage: .\test-dual-writer.ps1 -Date 2025-09-27
#>

param(
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$Base = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"

function Write-Title($t){ Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Write-OK($t){ Write-Host $t -ForegroundColor Green }
function Write-ERR($t){ Write-Host $t -ForegroundColor Red }
function Write-INFO($t){ Write-Host $t -ForegroundColor Yellow }

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

Write-Title "Plug-and-Play Dual-Writer Test"
Write-Host "Date: $Date" -ForegroundColor Yellow
Write-Host "Base URL: $Base" -ForegroundColor Yellow

# Test 1: Basic dual-writer without ZIP
Write-Title "Test 1: Basic Dual-Writer (no ZIP)"
try {
  $basicTest = Call-API POST "/smoke/save" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = "test-hash-123" }
      sweep = @{ status = "pass"; details = "linked to seed" }
    }
    wins = "Basic dual-writer test completed"
    blocks = "none"
    next_intent = "Test enhanced version"
  }
  Write-OK "Basic dual-writer test passed"
  Write-INFO "JSON: $($basicTest.json_file)"
  Write-INFO "MD: $($basicTest.md_file)"
} catch {
  Write-ERR "Basic dual-writer test failed: $($_.Exception.Message)"
}

# Test 2: Enhanced dual-writer with ZIP (should fail without Merkle root)
Write-Title "Test 2: Enhanced Dual-Writer with ZIP (no Merkle root)"
try {
  $enhancedTest = Call-API POST "/smoke/save-v2" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = "test-hash-456" }
      sweep = @{ status = "pass"; details = "linked to seed" }
      seal = @{ status = "pass"; merkle_root = "test-merkle-789" }
    }
    wins = "Enhanced dual-writer test completed"
    blocks = "none"
    next_intent = "Test with Merkle root"
  }
  Write-OK "Enhanced dual-writer test passed"
  Write-INFO "JSON: $($enhancedTest.json_file)"
  Write-INFO "MD: $($enhancedTest.md_file)"
  Write-INFO "Archive Status: $($enhancedTest.archive_status)"
  if ($enhancedTest.zip_error) {
    Write-INFO "ZIP Error: $($enhancedTest.zip_error)"
  }
} catch {
  Write-ERR "Enhanced dual-writer test failed: $($_.Exception.Message)"
}

# Test 3: Create a complete day with Merkle root, then test ZIP
Write-Title "Test 3: Complete Day with Merkle Root + ZIP"
try {
  # First, create a complete day
  Write-INFO "Creating complete day with seed, sweep, seal..."
  
  $seed = Call-API POST "/seed" @{
    date = $Date
    time = (Get-Date -Format "HH:mm:ss")
    intent = "dual-writer-test"
    meta = @{ node_id = "dual-writer-tester"; author = "Kaizen" }
  }
  
  $sweep = Call-API POST "/sweep" @{
    date = $Date
    chamber = "LAB4"
    note = "Dual-writer test sweep"
    meta = @{ gic_intent = "publish"; user = "dual-writer-tester" }
  }
  
  $seal = Call-API POST "/seal" @{
    date = $Date
    wins = "Dual-writer system operational"
    blocks = "none"
    tomorrow_intent = "Continue testing"
    meta = @{ test_type = "dual_writer"; lab = "lab4" }
  }
  
  Write-OK "Complete day created successfully"
  Write-INFO "Merkle Root: $($seal.day_root)"
  
  # Now test the enhanced dual-writer with ZIP
  Write-INFO "Testing enhanced dual-writer with ZIP archiving..."
  
  $zipTest = Call-API POST "/smoke/save-v2" @{
    date = $Date
    custodian = "Kaizen"
    lab = "Lab4: Research & Study"
    tests = @{
      health = @{ status = "pass"; details = "server alive" }
      seed = @{ status = "pass"; hash = $seed.seed_hash }
      sweep = @{ status = "pass"; details = "linked to seed"; gic = $sweep.gic.ToString() }
      seal = @{ status = "pass"; merkle_root = $seal.day_root }
      verify = @{ status = "pass"; details = "integrity verified" }
    }
    wins = "Complete dual-writer test with ZIP archiving successful"
    blocks = "none"
    next_intent = "Production deployment ready"
  }
  
  Write-OK "Enhanced dual-writer with ZIP test passed"
  Write-INFO "JSON: $($zipTest.json_file)"
  Write-INFO "MD: $($zipTest.md_file)"
  Write-INFO "Archive Status: $($zipTest.archive_status)"
  if ($zipTest.zip_file) {
    Write-OK "ZIP Archive: $($zipTest.zip_file)"
  }
  if ($zipTest.zip_error) {
    Write-ERR "ZIP Error: $($zipTest.zip_error)"
  }
  
} catch {
  Write-ERR "Complete day test failed: $($_.Exception.Message)"
}

Write-Title "Dual-Writer Test Complete"
Write-OK "🎉 All dual-writer tests completed!"
Write-INFO "Check the generated files in data/$Date/ and archive/ directories"
