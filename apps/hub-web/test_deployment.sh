#!/bin/bash

# Civic Internet Deployment Test Script
# Run this after deploying to Render to verify all services are working

set -e

echo "🏛️ Testing Civic Internet Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL=${GATEWAY_URL:-"https://gic-gateway.onrender.com"}
HUB_URL=${HUB_URL:-"https://oaa-hub.onrender.com"}

echo -e "${BLUE}Testing services at:${NC}"
echo "  Gateway: $GATEWAY_URL"
echo "  Hub: $HUB_URL"
echo ""

# Test 1: Gateway Health Check
echo -e "${YELLOW}1. Testing Gateway Health...${NC}"
if curl -s "$GATEWAY_URL/" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Gateway is healthy${NC}"
else
    echo -e "${RED}❌ Gateway health check failed${NC}"
    exit 1
fi

# Test 2: Hub Health Check
echo -e "${YELLOW}2. Testing Hub Health...${NC}"
if curl -s "$HUB_URL/api/tools/status" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Hub is healthy${NC}"
else
    echo -e "${RED}❌ Hub health check failed${NC}"
    exit 1
fi

# Test 3: Companion Feed API
echo -e "${YELLOW}3. Testing Companion Feed API...${NC}"
FEED_RESPONSE=$(curl -s "$HUB_URL/api/companions/feed?companion=jade")
if echo "$FEED_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Companion feed API working${NC}"
    ITEM_COUNT=$(echo "$FEED_RESPONSE" | grep -o '"items"' | wc -l)
    echo "   Found $ITEM_COUNT feed items"
else
    echo -e "${RED}❌ Companion feed API failed${NC}"
    exit 1
fi

# Test 4: Constitution Viewer
echo -e "${YELLOW}4. Testing Constitution Viewer...${NC}"
if curl -s "$HUB_URL/constitution" | grep -q "Virtue Accords"; then
    echo -e "${GREEN}✅ Constitution viewer accessible${NC}"
else
    echo -e "${RED}❌ Constitution viewer failed${NC}"
    exit 1
fi

# Test 5: Hologram UI
echo -e "${YELLOW}5. Testing Hologram UI...${NC}"
if curl -s "$HUB_URL/holo" | grep -q "Hologram"; then
    echo -e "${GREEN}✅ Hologram UI accessible${NC}"
else
    echo -e "${RED}❌ Hologram UI failed${NC}"
    exit 1
fi

# Test 6: Domain Resolution (if registry is configured)
echo -e "${YELLOW}6. Testing Domain Resolution...${NC}"
RESOLVE_RESPONSE=$(curl -s "$GATEWAY_URL/resolve/jade" || echo '{"ok":false}')
if echo "$RESOLVE_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Domain resolution working${NC}"
else
    echo -e "${YELLOW}⚠️ Domain resolution not configured (this is expected for initial setup)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All tests passed! Civic Internet is online.${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Visit $HUB_URL/holo to see the hologram UI"
echo "2. Visit $HUB_URL/constitution to view the Virtue Accords"
echo "3. Configure your .gic domains to point to $GATEWAY_URL"
echo "4. Set up your GIC registry and ledger endpoints"
echo ""
echo -e "${GREEN}The bio-digital microcosm is alive! 🌱${NC}"