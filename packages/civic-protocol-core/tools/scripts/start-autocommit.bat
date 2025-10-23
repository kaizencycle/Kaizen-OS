@echo off
echo Starting auto-commit watcher...
echo Press Ctrl+C to stop
powershell -ExecutionPolicy Bypass -File "%~dp0autocommit.ps1"
