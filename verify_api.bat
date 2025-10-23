@echo off
REM ===== ensure logs folder =====
if not exist logs mkdir logs

set LOGFILE=logs\api_check_%date:~-4%-%date:~4,2%-%date:~7,2%.txt

echo =============================== >> %LOGFILE%
echo Testing Civic AI Ledger API >> %LOGFILE%
echo Date: %date%  Time: %time% >> %LOGFILE%
echo =============================== >> %LOGFILE%
echo. >> %LOGFILE%

REM ===== helper to compute elapsed seconds since %STARTTIME% =====
REM usage: call :elapsed DURATION
:elapsed
for /f %%E in ('powershell -NoProfile -Command "$t1=Get-Date -Date ''%date% %STARTTIME%''; $t2=Get-Date; [math]::Round(($t2-$t1).TotalSeconds,3)"') do set %1=%%E
goto :eof

REM =========================
REM [SEED]
REM =========================
echo [%date% %time%] [SEED] >> %LOGFILE%
set STARTTIME=%time%
curl -s -o tmp_seed.json -w "STATUS=%%{http_code}" ^
     -X POST http://127.0.0.1:8000/seed ^
     -H "Content-Type: application/json" ^
     -d "{\"date\": \"2025-09-20\", \"intent\": \"test\"}" >> %LOGFILE%
echo. >> %LOGFILE%
call :elapsed DSEED
echo Duration=%DSEED%s >> %LOGFILE%
type tmp_seed.json >> %LOGFILE%
echo. >> %LOGFILE%

REM =========================
REM [SWEEP]
REM =========================
echo [%date% %time%] [SWEEP] >> %LOGFILE%
set STARTTIME=%time%
curl -s -o tmp_sweep.json -w "STATUS=%%{http_code}" ^
     -X POST http://127.0.0.1:8000/sweep ^
     -H "Content-Type: application/json" ^
     -d "{\"date\": \"2025-09-20\", \"chamber\": \"Lab4\", \"note\": \"quick sweep\"}" >> %LOGFILE%
echo. >> %LOGFILE%
call :elapsed DSWEEP
echo Duration=%DSWEEP%s >> %LOGFILE%
type tmp_sweep.json >> %LOGFILE%
echo. >> %LOGFILE%

REM =========================
REM [SEAL]
REM =========================
echo [%date% %time%] [SEAL] >> %LOGFILE%
set STARTTIME=%time%
curl -s -o tmp_seal.json -w "STATUS=%%{http_code}" ^
     -X POST http://127.0.0.1:8000/seal ^
     -H "Content-Type: application/json" ^
     -d "{\"date\": \"2025-09-20\", \"wins\": \"API live\", \"blocks\": \"none\", \"tomorrow_intent\": \"keep going\"}" >> %LOGFILE%
echo. >> %LOGFILE%
call :elapsed DSEAL
echo Duration=%DSEAL%s >> %LOGFILE%
type tmp_seal.json >> %LOGFILE%
echo. >> %LOGFILE%

REM =========================
REM [LEDGER]
REM =========================
echo [%date% %time%] [LEDGER] >> %LOGFILE%
set STARTTIME=%time%
curl -s -o tmp_ledger.json -w "STATUS=%%{http_code}" ^
     http://127.0.0.1:8000/ledger/2025-09-20 >> %LOGFILE%
echo. >> %LOGFILE%
call :elapsed DLEDGER
echo Duration=%DLEDGER%s >> %LOGFILE%
type tmp_ledger.json >> %LOGFILE%
echo. >> %LOGFILE%

REM =========================
REM [VERIFY]
REM =========================
echo [%date% %time%] [VERIFY] >> %LOGFILE%
set STARTTIME=%time%
curl -s -o tmp_verify.json -w "STATUS=%%{http_code}" ^
     http://127.0.0.1:8000/verify/2025-09-20 >> %LOGFILE%
echo. >> %LOGFILE%
call :elapsed DVERIFY
echo Duration=%DVERIFY%s >> %LOGFILE%
type tmp_verify.json >> %LOGFILE%
echo. >> %LOGFILE%

echo =============================== >> %LOGFILE%
echo Tests complete at %date% %time% >> %LOGFILE%
echo =============================== >> %LOGFILE%

echo Done! Results saved to %LOGFILE%
pause
