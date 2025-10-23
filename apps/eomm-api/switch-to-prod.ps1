# Switch MCP to PROD environment (Render)
Write-Host "Switching to PROD environment (Render)..." -ForegroundColor Green
Copy-Item .cursor\mcp.prod.json .cursor\mcp.json -Force
Write-Host "✅ MCP now points to: https://YOUR-RENDER-APP.onrender.com" -ForegroundColor Cyan
Write-Host "⚠️  Remember to update the baseUrl in .cursor/mcp.prod.json with your actual Render URL" -ForegroundColor Yellow
Write-Host "🔄 Restart Cursor to activate the new configuration" -ForegroundColor Yellow
