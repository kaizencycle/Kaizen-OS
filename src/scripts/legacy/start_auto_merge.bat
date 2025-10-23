@echo off
echo Starting OAA Auto-Merge Agent...
powershell -ExecutionPolicy Bypass -File "%~dp0auto_merge_agent.ps1" -Start
pause
