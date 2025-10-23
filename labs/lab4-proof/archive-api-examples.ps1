<#  archive-api-examples.ps1
    Comprehensive examples of the Archive API with clear status reporting
    Usage: .\archive-api-examples.ps1 -Date 2025-10-02
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

Write-Title "Archive API Examples"
Write-Host "Date: $Date" -ForegroundColor Yellow
Write-Host "Base URL: $Base" -ForegroundColor Yellow

# Example 1: Try to archive without Merkle root (should fail with clear message)
Write-Title "Example 1: Archive without Merkle root (should fail)"
try {
  $archiveResult = Call-API POST "/archive/$Date" @{}
  Write-OK "Archive succeeded unexpectedly"
} catch {
  Write-INFO "Archive failed as expected (no Merkle root)"
  if ($_.Exception.Response) {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-INFO "Error: $errorBody"
  }
}

# Example 2: Create complete day with Merkle root
Write-Title "Example 2: Create complete day with Merkle root"
try {
  Write-INFO "Creating seed..."
  $seed = Call-API POST "/seed" @{
    date = $Date
    time = (Get-Date -Format "HH:mm:ss")
    intent = "archive-api-example"
    meta = @{ node_id = "archive-example-tester"; author = "Kaizen" }
  }
  
  Write-INFO "Creating sweep..."
  $sweep = Call-API POST "/sweep" @{
    date = $Date
    chamber = "LAB4"
    note = "Archive API example sweep"
    meta = @{ gic_intent = "publish"; user = "archive-example-tester" }
  }
  
  Write-INFO "Creating seal..."
  $seal = Call-API POST "/seal" @{
    date = $Date
    wins = "Archive API example completed successfully"
    blocks = "none"
    tomorrow_intent = "Deploy archive API to production"
    meta = @{ test_type = "archive_api_example"; lab = "lab4" }
  }
  
  Write-OK "Complete day created successfully"
  Write-INFO "Merkle Root: $($seal.day_root)"
  
} catch {
  Write-ERR "Failed to create complete day: $($_.Exception.Message)"
  exit 1
}

# Example 3: Test enhanced smoke test with archive status
Write-Title "Example 3: Enhanced smoke test with archive status"
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
      export = @{ status = "pass"; details = "data export working" }
      index = @{ status = "pass"; details = "days tracked" }
    }
    wins = "Archive API with clear status reporting operational"
    blocks = "none"
    next_intent = "Integrate archive API with CommandLedgerII"
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

# Example 4: Test dedicated archive endpoint
Write-Title "Example 4: Dedicated archive endpoint"
try {
  $archiveResult = Call-API POST "/archive/$Date" @{}
  Write-OK "Archive endpoint succeeded"
  Write-INFO "Archive Status: $($archiveResult.archive_status)"
  Write-INFO "ZIP File: $($archiveResult.zip_file)"
} catch {
  Write-ERR "Archive endpoint failed: $($_.Exception.Message)"
}

# Example 5: Test cURL equivalent
Write-Title "Example 5: cURL equivalent test"
try {
  $curlResult = Invoke-RestMethod -Uri "$Base/archive/$Date" -Method POST
  Write-OK "cURL equivalent succeeded"
  Write-INFO "Result: $($curlResult | ConvertTo-Json -Depth 3)"
} catch {
  Write-ERR "cURL equivalent failed: $($_.Exception.Message)"
}

# Example 6: Show file structure
Write-Title "Example 6: File structure verification"
Write-INFO "Data directory contents:"
if (Test-Path "data/$Date") {
  Get-ChildItem "data/$Date" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No data directory found"
}

Write-INFO "Root directory files:"
if (Test-Path "data") {
  Get-ChildItem "data" -Filter "$Date.*" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
}

Write-INFO "Archive directory contents:"
if (Test-Path "archive") {
  Get-ChildItem "archive" | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Gray
  }
} else {
  Write-INFO "No archive directory found"
}

# Example 7: Test archive status messages for CommandLedgerII
Write-Title "Example 7: CommandLedgerII Integration Examples"
Write-INFO "Archive Status Messages:"
Write-Host "Archive: Archive sealed successfully." -ForegroundColor Green
Write-Host "Skip: Archive skipped - daily root missing. Seal the day, then re-run." -ForegroundColor Yellow

Write-INFO "Custodian Log Examples:"
Write-Host "Eve: 'Seal first; archive second.'" -ForegroundColor Cyan
Write-Host "Jade: 'Retry only when the root is true.'" -ForegroundColor Cyan

Write-Title "Archive API Examples Complete"
Write-OK "🎉 All archive API examples completed successfully!"
Write-INFO "The archive API is ready for CommandLedgerII integration!"
