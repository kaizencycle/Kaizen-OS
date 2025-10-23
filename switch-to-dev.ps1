# Switch MCP to DEV environment (localhost)
Write-Host "Switching to DEV environment (localhost:8000)..." -ForegroundColor Green
Copy-Item .cursor\mcp.dev.json .cursor\mcp.json -Force
Write-Host "✅ MCP now points to: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "🔄 Restart Cursor to activate the new configuration" -ForegroundColor Yellow
