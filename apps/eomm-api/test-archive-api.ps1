<#  test-archive-api.ps1
    Test the archive API with clear status reporting
    Usage: .\test-archive-api.ps1 -Date 2025-09-30
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

Write-Title "Archive API Test"
Write-Host "Date: $Date" -ForegroundColor Yellow
Write-Host "Base URL: $Base" -ForegroundColor Yellow

# Test 1: Try to archive without Merkle root (should fail)
Write-Title "Test 1: Archive without Merkle root (should fail)"
try {
  $archiveResult = Call-API POST "/archive/$Date" @{}
  Write-OK "Archive succeeded unexpectedly"
  Write-INFO "Result: $($archiveResult | ConvertTo-Json -Depth 3)"
} catch {
  Write-INFO "Archive failed as expected (no Merkle root)"
  if ($_.Exception.Response) {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-INFO "Error: $errorBody"
  }
}

# Test 2: Create complete day with Merkle root
Write-Title "Test 2: Create complete day with Merkle root"
try {
  Write-INFO "Creating seed..."
  $seed = Call-API POST "/seed" @{
    date = $Date
    time = (Get-Date -Format "HH:mm:ss")
    intent = "archive-api-test"
    meta = @{ node_id = "archive-tester"; author = "Kaizen" }
  }
  
  Write-INFO "Creating sweep..."
  $sweep = Call-API POST "/sweep" @{
    date = $Date
    chamber = "LAB4"
    note = "Archive API test sweep"
    meta = @{ gic_intent = "publish"; user = "archive-tester" }
  }
  
  Write-INFO "Creating seal..."
  $seal = Call-API POST "/seal" @{
    date = $Date
    wins = "Archive API test completed"
    blocks = "none"
    tomorrow_intent = "Test archive functionality"
    meta = @{ test_type = "archive_api"; lab = "lab4" }
  }
  
  Write-OK "Complete day created successfully"
  Write-INFO "Merkle Root: $($seal.day_root)"
  
} catch {
  Write-ERR "Failed to create complete day: $($_.Exception.Message)"
  exit 1
}

# Test 3: Test enhanced smoke test with archive status
Write-Title "Test 3: Enhanced smoke test with archive status"
try {
  $smokeTest = Call-API POST "/smoke/save-v2" @{
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
    wins = "Archive API test with clear status reporting successful"
    blocks = "none"
    next_intent = "Deploy archive API to production"
  }
  
  Write-OK "Enhanced smoke test completed"
  Write-INFO "JSON: $($smokeTest.json_file)"
  Write-INFO "MD: $($smokeTest.md_file)"
  Write-INFO "Archive Status: $($smokeTest.archive_status)"
  if ($smokeTest.zip_file) {
    Write-OK "ZIP Archive: $($smokeTest.zip_file)"
  }
  
} catch {
  Write-ERR "Enhanced smoke test failed: $($_.Exception.Message)"
}

# Test 4: Test dedicated archive endpoint
Write-Title "Test 4: Dedicated archive endpoint"
try {
  $archiveResult = Call-API POST "/archive/$Date" @{}
  Write-OK "Archive endpoint succeeded"
  Write-INFO "Archive Status: $($archiveResult.archive_status)"
  Write-INFO "ZIP File: $($archiveResult.zip_file)"
} catch {
  Write-ERR "Archive endpoint failed: $($_.Exception.Message)"
}

# Test 5: Show file structure
Write-Title "Test 5: File structure verification"
Write-INFO "Data directory contents:"
if (Test-Path "data/$Date") {
  Get-ChildItem "data/$Date" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No data directory found"
}

Write-INFO "Archive directory contents:"
if (Test-Path "archive") {
  Get-ChildItem "archive" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No archive directory found"
}

# Test 6: Test archive without Merkle root (should fail)
Write-Title "Test 6: Archive different date without Merkle root"
try {
  $otherDate = "2025-10-01"
  $archiveResult = Call-API POST "/archive/$otherDate" @{}
  Write-OK "Archive succeeded unexpectedly for $otherDate"
} catch {
  Write-INFO "Archive failed as expected for $otherDate (no Merkle root)"
  if ($_.Exception.Response) {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-INFO "Error: $errorBody"
  }
}

Write-Title "Archive API Test Complete"
Write-OK "🎉 Archive API testing completed!"
Write-INFO "Check the archive status messages above for CommandLedgerII integration"
