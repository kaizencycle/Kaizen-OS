#!/bin/bash

# Sentinel Suite Setup Script
# Run with: bash scripts/setup-sentinel-suite.sh

set -e

echo "🚀 Setting up Sentinel Suite for OAA Hub"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the companion_site_starter directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Check required environment variables
echo ""
echo "🔍 Checking environment configuration..."

# Check DEV_MODE
if grep -q "DEV_MODE=1" .env; then
    echo "✅ DEV_MODE is enabled"
else
    echo "⚠️  DEV_MODE not set to 1. Sentinel Suite requires DEV_MODE=1"
fi

# Check REDIS_URL
if grep -q "REDIS_URL=" .env && ! grep -q "REDIS_URL=$" .env; then
    echo "✅ REDIS_URL is configured"
else
    echo "⚠️  REDIS_URL not configured. Please set it in .env"
fi

# Check DEV_ADMIN_TOKEN
if grep -q "DEV_ADMIN_TOKEN=" .env && ! grep -q "DEV_ADMIN_TOKEN=$" .env; then
    echo "✅ DEV_ADMIN_TOKEN is configured"
else
    echo "⚠️  DEV_ADMIN_TOKEN not configured. Please set a secure token in .env"
fi

# Check GitHub configuration
if grep -q "GITHUB_OWNER=" .env && ! grep -q "GITHUB_OWNER=$" .env; then
    echo "✅ GitHub configuration found"
else
    echo "⚠️  GitHub configuration incomplete. Please set GITHUB_OWNER, GITHUB_REPO, etc."
fi

# Check if Redis is running
echo ""
echo "🔍 Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running and accessible"
    else
        echo "⚠️  Redis is not running. Please start Redis with: redis-server"
    fi
else
    echo "⚠️  redis-cli not found. Please install Redis"
fi

# Check if dependencies are installed
echo ""
echo "🔍 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies are installed"
else
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows
echo "✅ Directories created"

# Check if files exist
echo ""
echo "🔍 Checking Sentinel Suite files..."

files=(
    "pages/dev/queue.tsx"
    "pages/api/dev/queue/stats.ts"
    "pages/api/dev/queue/pause.ts"
    "pages/api/dev/queue/resume.ts"
    "pages/api/dev/queue/retryFailed.ts"
    "pages/api/dev/queue/drain.ts"
    "pages/api/dev/sentinel/notify.ts"
    "components/SentinelBadge.tsx"
    ".github/ISSUE_TEMPLATE/operational_incident.yml"
    ".github/workflows/incident-auto.yml"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Missing!"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo ""
    echo "🎉 Sentinel Suite setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env with your configuration"
    echo "2. Start Redis: redis-server"
    echo "3. Start the application: npm run dev"
    echo "4. Test the implementation: node scripts/test-sentinel-suite.mjs"
    echo "5. Open http://localhost:3000/dev/queue in your browser"
    echo ""
    echo "For production deployment:"
    echo "1. Set up GitHub repository variables (HUB_BASE_URL)"
    echo "2. Configure Command Ledger webhook URL"
    echo "3. Deploy with DEV_MODE=1 for dev routes"
    echo "4. Set DEV_MODE=0 in production to disable dev routes"
else
    echo ""
    echo "❌ Some files are missing. Please check the implementation."
    exit 1
fi