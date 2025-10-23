@echo off
echo 🏥 Sentinel Health Check
echo ========================
echo.

echo Checking jade...
if exist "sentinels\jade\manifest.json" (
    echo   ✅ Manifest: OK
) else (
    echo   ❌ Manifest: MISSING
)

if exist "sentinels\jade\src" (
    echo   ✅ Source: OK
) else (
    echo   ⚠️  Source: NOT IMPLEMENTED
)
echo.

echo Checking eve...
if exist "sentinels\eve\manifest.json" (
    echo   ✅ Manifest: OK
) else (
    echo   ❌ Manifest: MISSING
)

if exist "sentinels\eve\src" (
    echo   ✅ Source: OK
) else (
    echo   ⚠️  Source: NOT IMPLEMENTED
)
echo.

echo Checking zeus...
if exist "sentinels\zeus\manifest.json" (
    echo   ✅ Manifest: OK
) else (
    echo   ❌ Manifest: MISSING
)

if exist "sentinels\zeus\src" (
    echo   ✅ Source: OK
) else (
    echo   ⚠️  Source: NOT IMPLEMENTED
)
echo.

echo Checking hermes...
if exist "sentinels\hermes\manifest.json" (
    echo   ✅ Manifest: OK
) else (
    echo   ❌ Manifest: MISSING
)

if exist "sentinels\hermes\src" (
    echo   ✅ Source: OK
) else (
    echo   ⚠️  Source: NOT IMPLEMENTED
)
echo.

echo Checking atlas...
if exist "sentinels\atlas\manifest.json" (
    echo   ✅ Manifest: OK
) else (
    echo   ❌ Manifest: MISSING
)

if exist "sentinels\atlas\src" (
    echo   ✅ Source: OK
) else (
    echo   ⚠️  Source: NOT IMPLEMENTED
)
echo.

echo Health check complete!
