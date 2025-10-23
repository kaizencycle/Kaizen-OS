@echo off
echo 🚀 Setting up Reflections App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first:
    echo    https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm found!

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    copy "env.template" ".env.local"
    echo ✅ .env.local created. Please edit it with your API details.
) else (
    echo ✅ .env.local already exists.
)

echo.
echo 🎉 Setup complete! Next steps:
echo 1. Edit .env.local with your API URL and key
echo 2. Start your API server (in lab4-proof directory):
echo    uvicorn app.main:app --reload --port 8000
echo 3. Start the frontend:
echo    npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
echo Happy reflecting! ✨
pause
