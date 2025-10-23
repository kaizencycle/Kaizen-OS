#!/bin/bash
# Check health of all sentinels

echo "🏥 Sentinel Health Check"
echo "========================"
echo ""

SENTINELS=("jade" "eve" "zeus" "hermes" "atlas")

for sentinel in "${SENTINELS[@]}"; do
    echo "Checking $sentinel..."
    if [ -f "sentinels/$sentinel/manifest.json" ]; then
        echo "  ✅ Manifest: OK"
    else
        echo "  ❌ Manifest: MISSING"
    fi
    
    if [ -d "sentinels/$sentinel/src" ]; then
        echo "  ✅ Source: OK"
    else
        echo "  ⚠️  Source: NOT IMPLEMENTED"
    fi
    echo ""
done

echo "Health check complete!"
