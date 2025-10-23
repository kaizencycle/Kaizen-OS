# MCP Setup Script for Reflections Ledger
Write-Host "🚀 Setting up MCP for Reflections Ledger..." -ForegroundColor Green

# Check if .cursor directory exists
if (!(Test-Path ".cursor")) {
    Write-Host "📁 Creating .cursor directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".cursor" | Out-Null
}

# Check if MCP files exist
$mcpFiles = @("mcp.json", "mcp.dev.json")
foreach ($file in $mcpFiles) {
    if (Test-Path ".cursor\$file") {
        Write-Host "✅ .cursor\$file already exists" -ForegroundColor Green
    } else {
        Write-Host "❌ .cursor\$file not found" -ForegroundColor Red
    }
}

# Check if helper scripts exist
$scripts = @("reflect.ps1", "reflect_and_seal.ps1", "Test-LedgerApi.ps1")
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script ready" -ForegroundColor Green
    } else {
        Write-Host "❌ $script not found" -ForegroundColor Red
    }
}

# Check if env template exists
if (Test-Path "env.template") {
    Write-Host "✅ env.template ready" -ForegroundColor Green
    Write-Host "📝 Copy env.template to .env and add your API keys:" -ForegroundColor Yellow
    Write-Host "   Copy-Item env.template .env" -ForegroundColor Cyan
} else {
    Write-Host "❌ env.template not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Green
Write-Host "1. Copy env.template to .env and add your API keys" -ForegroundColor White
Write-Host "2. Update .cursor/mcp.json with your Render URL" -ForegroundColor White
Write-Host "3. Reload Cursor to activate MCP tools" -ForegroundColor White
Write-Host "4. Test with: .\Test-LedgerApi.ps1 -Env dev" -ForegroundColor White
Write-Host ""
Write-Host "✨ MCP setup complete!" -ForegroundColor Magenta
