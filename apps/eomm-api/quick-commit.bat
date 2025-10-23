@echo off
echo Auto-committing changes...

git add -A
git commit -m "Auto-commit: %date% %time%"
git push origin main

echo Done!
pause
