#!/bin/bash
# Lab4 Smoke Test - cURL Example
# Usage: ./curl-smoke-test.sh

BASE_URL="http://127.0.0.1:8000"
DATE=$(date +%Y-%m-%d)

echo "🧪 Lab4 Research & Study - FastAPI Smoke Test"
echo "Date: $DATE"
echo "Base URL: $BASE_URL"
echo ""

# Test the dual-writer endpoint
echo "Testing dual-writer endpoint..."
curl -s -X POST "$BASE_URL/smoke/save" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$DATE\",
    \"custodian\": \"Kaizen\",
    \"lab\": \"Lab4: Research & Study\",
    \"tests\": {
      \"health\": {\"status\": \"pass\", \"details\": \"server alive\"},
      \"seed\": {\"status\": \"pass\", \"hash\": \"test-hash-123\"},
      \"sweep\": {\"status\": \"pass\", \"details\": \"linked to seed\"},
      \"seal\": {\"status\": \"pass\", \"merkle_root\": \"test-merkle-456\"},
      \"verify\": {\"status\": \"pass\", \"details\": \"integrity verified\"},
      \"export\": {\"status\": \"pass\", \"details\": \"data export working\"},
      \"index\": {\"status\": \"pass\", \"details\": \"days tracked\"}
    },
    \"wins\": \"All smoke tests passed - FastAPI operational\",
    \"blocks\": \"none\",
    \"next_intent\": \"Continue API development\"
  }" | jq '.'

echo ""
echo "✅ Smoke test bundle saved successfully!"
