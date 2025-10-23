# Test script to verify commit message generation
Write-Host "🧪 Testing commit message generation..."

# Test scope detection
Write-Host "`n1. Testing scope detection:"
try {
    $scope = bash -lc "scripts/detect-scope.sh"
    Write-Host "   Detected scope: '$scope'" -ForegroundColor Green
} catch {
    Write-Host "   Error detecting scope: $($_.Exception.Message)" -ForegroundColor Red
}

# Test commit message generation
Write-Host "`n2. Testing commit message generation:"
try {
    $msg = powershell -ExecutionPolicy Bypass -File scripts/generate-commit-msg.ps1
    Write-Host "   Generated message: '$msg'" -ForegroundColor Green
} catch {
    Write-Host "   Error generating message: $($_.Exception.Message)" -ForegroundColor Red
}

# Test redaction scan
Write-Host "`n3. Testing redaction scan:"
try {
    powershell -ExecutionPolicy Bypass -File scripts/redaction-scan.ps1
    Write-Host "   Redaction scan completed" -ForegroundColor Green
} catch {
    Write-Host "   Redaction scan failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test completed!"
