#!/bin/bash

# Kaizen OS Portal API Test Script
# Usage: ./test-api.sh [API_BASE_URL]

API_BASE=${1:-${NEXT_PUBLIC_API_BASE:-https://api.kaizen.os}}
JWT=${KAIZEN_JWT:-}

echo "Testing Kaizen OS API endpoints..."
echo "API Base: $API_BASE"
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -sSf "$API_BASE/v1/status" | jq '.' || echo "❌ Health check failed"
echo ""

# Test companions endpoint
echo "2. Testing companions endpoint..."
curl -sSf "$API_BASE/v1/companions" | jq '.' || echo "❌ Companions endpoint failed"
echo ""

# Test GI endpoint (requires JWT)
if [ -n "$JWT" ]; then
    echo "3. Testing GI endpoint..."
    curl -sSf -H "Authorization: Bearer $JWT" "$API_BASE/v1/gi/me" | jq '.' || echo "❌ GI endpoint failed"
    echo ""
    
    echo "4. Testing reflections endpoint..."
    curl -sSf -H "Authorization: Bearer $JWT" "$API_BASE/v1/reflections/me" | jq '.' || echo "❌ Reflections endpoint failed"
    echo ""
else
    echo "3. Skipping authenticated endpoints (no JWT provided)"
    echo "   Set KAIZEN_JWT environment variable to test authenticated endpoints"
    echo ""
fi

echo "API testing complete!"