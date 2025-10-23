@echo off
setlocal enabledelayedexpansion

REM ====== CONFIGURATION ======
set API_URL=https://reflections.onrender.com
set API_KEY=<your_api_key>

echo ==============================
echo  Testing Ledger API on Render
echo ==============================

REM --- 1. Health check ---
echo.
echo [1] Checking API health...
curl %API_URL%/docs

REM --- 2. Seed ---
echo.
echo [2] Sending seed...
curl -X POST %API_URL%/seed ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: %API_KEY%" ^
  -d "{\"date\": \"2025-09-20\", \"intent\": \"iterate\"}"

REM --- 3. Sweep ---
echo.
echo [3] Sending sweep...
curl -X POST %API_URL%/sweep ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: %API_KEY%" ^
  -d "{\"chamber\":\"Lab4\",\"note\":\"first sweep\"}"

REM --- 4. Seal ---
echo.
echo [4] Sending seal...
curl -X POST %API_URL%/seal ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: %API_KEY%" ^
  -d "{\"wins\":\"API live\",\"blocks\":\"none\",\"tomorrow_intent\":\"reflections\"}"

REM --- 5. Verify ---
echo.
echo [5] Verifying ledger...
curl -X GET %API_URL%/verify ^
  -H "x-api-key: %API_KEY%"

echo.
echo ==============================
echo   Ledger test complete!
echo ==============================
pause
