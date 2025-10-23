<#  verify_api.ps1 - Comprehensive API Test Suite
    Tests all main endpoints with detailed telemetry
    Logs results to logs/api_check_YYYY-MM-DD.txt
#>

param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"

# Ensure logs directory exists
$LogsDir = "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

$LogFile = Join-Path $LogsDir "api_check_$Date.txt"
$StartTime = Get-Date

# Helper function to log with timestamp
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

# Helper function to make API calls with timing
function Invoke-ApiTest {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [hashtable]$Body = $null
    )
    
    $url = "$BaseUrl$Path"
    Write-Log "Testing $Name" "TEST"
    
    $requestStart = Get-Date
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $url -Method $Method -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers @{accept="application/json"}
        }
        
        $duration = [math]::Round(((Get-Date) - $requestStart).TotalSeconds, 3)
        $status = "SUCCESS"
        
        Write-Log "STATUS=200 Duration=${duration}s" "RESULT"
        Write-Log ($response | ConvertTo-Json -Depth 10) "RESPONSE"
        
        return @{ Success = $true; Duration = $duration; Response = $response }
    }
    catch {
        $duration = [math]::Round(((Get-Date) - $requestStart).TotalSeconds, 3)
        $status = "ERROR"
        $errorMsg = $_.Exception.Message
        
        Write-Log "STATUS=ERROR Duration=${duration}s Error=$errorMsg" "RESULT"
        Write-Log $errorMsg "ERROR"
        
        return @{ Success = $false; Duration = $duration; Error = $errorMsg }
    }
}

# Start logging
Write-Log "===============================" "HEADER"
Write-Log "Testing Civic AI Ledger API" "HEADER"
Write-Log "Date: $Date  Time: $(Get-Date -Format 'HH:mm:ss')" "HEADER"
Write-Log "Base URL: $BaseUrl" "HEADER"
Write-Log "===============================" "HEADER"
Write-Log "" "HEADER"

$Results = @{}

# Test 1: /seed
Write-Log "--- SEED TEST ---" "SECTION"
$seedBody = @{
    date = $Date
    time = "12:00:00"
    intent = "API test"
    meta = @{}
}
$Results.Seed = Invoke-ApiTest -Name "SEED" -Method "POST" -Path "/seed" -Body $seedBody

# Test 2: /sweep
Write-Log "--- SWEEP TEST ---" "SECTION"
$sweepBody = @{
    date = $Date
    chamber = "LAB4"
    note = "API test sweep"
    meta = @{}
}
$Results.Sweep = Invoke-ApiTest -Name "SWEEP" -Method "POST" -Path "/sweep" -Body $sweepBody

# Test 3: /seal
Write-Log "--- SEAL TEST ---" "SECTION"
$sealBody = @{
    date = $Date
    wins = "API test successful"
    blocks = "none"
    tomorrow_intent = "continue testing"
    meta = @{}
}
$Results.Seal = Invoke-ApiTest -Name "SEAL" -Method "POST" -Path "/seal" -Body $sealBody

# Test 4: /ledger
Write-Log "--- LEDGER TEST ---" "SECTION"
$Results.Ledger = Invoke-ApiTest -Name "LEDGER" -Method "GET" -Path "/ledger/$Date"

# Test 5: /verify
Write-Log "--- VERIFY TEST ---" "SECTION"
$Results.Verify = Invoke-ApiTest -Name "VERIFY" -Method "GET" -Path "/verify/$Date"

# Test 6: /export
Write-Log "--- EXPORT TEST ---" "SECTION"
$Results.Export = Invoke-ApiTest -Name "EXPORT" -Method "GET" -Path "/export/$Date"

# Test 7: /index
Write-Log "--- INDEX TEST ---" "SECTION"
$Results.Index = Invoke-ApiTest -Name "INDEX" -Method "GET" -Path "/index"

# Summary
$TotalDuration = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 3)
$SuccessCount = ($Results.Values | Where-Object { $_.Success }).Count
$TotalTests = $Results.Count

Write-Log "===============================" "SUMMARY"
Write-Log "Tests complete at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "SUMMARY"
Write-Log "Total Duration: ${TotalDuration}s" "SUMMARY"
Write-Log "Success Rate: $SuccessCount/$TotalTests" "SUMMARY"
Write-Log "===============================" "SUMMARY"

# Display summary on console
Write-Host ""
Write-Host "=== API TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $TotalTests" -ForegroundColor White
Write-Host "Successful: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $($TotalTests - $SuccessCount)" -ForegroundColor Red
Write-Host "Total Duration: ${TotalDuration}s" -ForegroundColor Yellow
Write-Host "Log File: $LogFile" -ForegroundColor Cyan

# Return exit code based on results
if ($SuccessCount -eq $TotalTests) {
    Write-Host "All tests passed! ✅" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed! ❌" -ForegroundColor Red
    exit 1
}
