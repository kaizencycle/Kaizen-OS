@echo off
echo ========================================
echo    Lab4-Proof Auto-Commit Setup
echo ========================================
echo.

echo Current git status:
git status --short
echo.

echo Current remotes:
git remote -v
echo.

echo To set up auto-commit and auto-merge:
echo 1. Add your GitHub repository as remote:
echo    git remote add origin https://github.com/YOURUSERNAME/lab4-proof.git
echo.
echo 2. Push your changes:
echo    git push -u origin main
echo.
echo 3. Run auto-commit:
echo    .\auto-commit-push.ps1
echo.

pause
