Write-Host "[AGENT] Lab7 Background Agent - 'made lab7 edit'" -ForegroundColor Green
Write-Host "[AGENT] Processing any pending changes..." -ForegroundColor Yellow
python scripts/lab7_background_agent.py --once
Write-Host "[AGENT] Command complete!" -ForegroundColor Green
Read-Host "Press Enter to continue"
