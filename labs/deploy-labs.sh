#!/bin/bash
################################################################################
# Kaizen-OS Labs Deployment Script
# Deploys Labs 1-3 (Foundation Layer)
################################################################################

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Kaizen-OS Labs Deployment${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check Python version
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "   ✅ Python: $python_version"

# Check if we're in the Kaizen-OS root
if [ ! -d "labs" ]; then
    echo -e "${RED}❌ Error: Must run from Kaizen-OS root directory${NC}"
    exit 1
fi

################################################################################
# Step 1: Create Python Virtual Environment
################################################################################

echo -e "\n${YELLOW}1️⃣  Creating Python virtual environment...${NC}"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "   ✅ Virtual environment created: ./venv"
else
    echo -e "   ℹ️  Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
echo -e "   ✅ Virtual environment activated"

################################################################################
# Step 2: Install Dependencies
################################################################################

echo -e "\n${YELLOW}2️⃣  Installing dependencies...${NC}"

# Upgrade pip
pip install --upgrade pip > /dev/null 2>&1
echo -e "   ✅ pip upgraded"

# Core dependencies
dependencies=(
    "fastapi[all]>=0.104.0"      # Lab3 API Gateway
    "uvicorn[standard]>=0.24.0"  # ASGI server
    "pydantic>=2.5.0"            # Data validation
    "cryptography>=41.0.0"       # Lab1 Attestation
    "PyJWT>=2.8.0"               # Lab3 Authentication
    "httpx>=0.25.0"              # Async HTTP client
    "redis>=5.0.0"               # Rate limiting
    "pytest>=7.4.0"              # Testing
    "pytest-asyncio>=0.21.0"     # Async testing
)

echo -e "   📦 Installing packages..."
for dep in "${dependencies[@]}"; do
    pip install "$dep" > /dev/null 2>&1
    echo -e "      • $dep"
done

echo -e "   ✅ All dependencies installed"

################################################################################
# Step 3: Initialize Lab Directories
################################################################################

echo -e "\n${YELLOW}3️⃣  Initializing lab directories...${NC}"

# Create necessary directories
mkdir -p logs
mkdir -p data/ledger
mkdir -p data/tokens
mkdir -p data/proofs
mkdir -p config

echo -e "   ✅ Directory structure created"

################################################################################
# Step 4: Generate Configuration Files
################################################################################

echo -e "\n${YELLOW}4️⃣  Generating configuration files...${NC}"

# Lab1 Config (Civic Ledger)
cat > config/lab1_config.json <<EOF
{
  "civic_ledger": {
    "min_validator_gi": 0.95,
    "min_validators": 3,
    "block_time": 1.0,
    "max_transactions_per_block": 100,
    "data_path": "data/ledger/chain.json"
  },
  "gic_token": {
    "total_supply": "1000000000",
    "daily_ubi": "10",
    "min_gi_for_ubi": 0.95,
    "treasury_address": "treasury@civic.os",
    "data_path": "data/tokens/accounts.json"
  },
  "crypto_attestation": {
    "algorithm": "ED25519",
    "key_storage": "data/ledger/keys/"
  }
}
EOF
echo -e "   ✅ Lab1 config: config/lab1_config.json"

# Lab2 Config (Thought Broker)
cat > config/lab2_config.json <<EOF
{
  "deliberation": {
    "max_rounds": 5,
    "timeout_seconds": 300,
    "convergence_threshold": 0.85,
    "min_models": 3,
    "models": [
      {
        "id": "claude-3-opus@kaizen.os",
        "provider": "anthropic",
        "weight": 1.0
      },
      {
        "id": "gpt-4@kaizen.os",
        "provider": "openai",
        "weight": 1.0
      },
      {
        "id": "gemini-pro@kaizen.os",
        "provider": "google",
        "weight": 1.0
      }
    ]
  },
  "delib_proof": {
    "data_path": "data/proofs/",
    "seal_to_ledger": true
  }
}
EOF
echo -e "   ✅ Lab2 config: config/lab2_config.json"

# Lab3 Config (API Fabric)
cat > config/lab3_config.json <<EOF
{
  "api_gateway": {
    "host": "0.0.0.0",
    "port": 8000,
    "jwt_secret": "$(openssl rand -hex 32)",
    "jwt_algorithm": "HS256",
    "jwt_expiry_minutes": 60,
    "cors_origins": ["http://localhost:3000", "http://localhost:8080"],
    "rate_limit": {
      "enabled": true,
      "requests_per_minute": 60,
      "burst": 100
    }
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0
  }
}
EOF
echo -e "   ✅ Lab3 config: config/lab3_config.json"

# Master Config
cat > config/kaizen_config.json <<EOF
{
  "system": {
    "name": "Kaizen-OS",
    "version": "1.0.0",
    "environment": "development"
  },
  "constitution": {
    "gi_threshold": 0.95,
    "clauses": {
      "clause_1_human_dignity": {"weight": 0.25, "enabled": true},
      "clause_2_transparency": {"weight": 0.20, "enabled": true},
      "clause_3_equity": {"weight": 0.10, "enabled": true},
      "clause_4_safety": {"weight": 0.15, "enabled": true},
      "clause_5_privacy": {"weight": 0.10, "enabled": true},
      "clause_6_civic_integrity": {"weight": 0.15, "enabled": true},
      "clause_7_environment": {"weight": 0.05, "enabled": true}
    }
  },
  "labs": {
    "lab1": "config/lab1_config.json",
    "lab2": "config/lab2_config.json",
    "lab3": "config/lab3_config.json"
  },
  "logging": {
    "level": "INFO",
    "path": "logs/"
  }
}
EOF
echo -e "   ✅ Master config: config/kaizen_config.json"

################################################################################
# Step 5: Initialize Cryptographic Keys
################################################################################

echo -e "\n${YELLOW}5️⃣  Initializing cryptographic keys...${NC}"

mkdir -p data/ledger/keys

# Generate validator keys
python3 <<PYTHON
import sys
sys.path.append('labs/lab1-proof/src')
from crypto_attestation import CryptoAttestationEngine
import json

engine = CryptoAttestationEngine()

# Generate keys for default validators
validators = ["atlas@civic.os", "aurea@civic.os", "zenith@civic.os"]
keys = {}

for validator_id in validators:
    keypair = engine.generate_keypair(validator_id)
    keys[validator_id] = {
        "public_key": keypair["public_key"],
        "created_at": keypair["created_at"]
    }
    # In production, private keys would be stored securely (HSM/Vault)
    print(f"   ✅ Generated keypair for {validator_id}")

# Save public keys
with open("data/ledger/keys/validators.json", "w") as f:
    json.dump(keys, f, indent=2)

print(f"   ✅ Validator keys saved")
PYTHON

################################################################################
# Step 6: Start Redis (if available)
################################################################################

echo -e "\n${YELLOW}6️⃣  Checking Redis...${NC}"

if command -v redis-server > /dev/null 2>&1; then
    if pgrep -x redis-server > /dev/null; then
        echo -e "   ✅ Redis is already running"
    else
        echo -e "   ℹ️  Starting Redis..."
        redis-server --daemonize yes --port 6379 > /dev/null 2>&1
        sleep 1
        echo -e "   ✅ Redis started on port 6379"
    fi
else
    echo -e "   ⚠️  Redis not installed. Rate limiting will be disabled."
    echo -e "   ℹ️  Install with: apt-get install redis-server (Ubuntu) or brew install redis (Mac)"
fi

################################################################################
# Step 7: Run Tests
################################################################################

echo -e "\n${YELLOW}7️⃣  Running tests...${NC}"

# Create a simple test to verify imports
python3 <<PYTHON
import sys
sys.path.append('labs/lab1-proof/src')
sys.path.append('labs/lab2-proof/src')
sys.path.append('labs/lab3-proof/src')

try:
    from civic_ledger import CivicLedger
    print("   ✅ Lab1: civic_ledger")

    from gic_token import GICTokenEngine
    print("   ✅ Lab1: gic_token")

    from crypto_attestation import CryptoAttestationEngine
    print("   ✅ Lab1: crypto_attestation")

    from deliberation import DeliberationOrchestrator
    print("   ✅ Lab2: deliberation")

    from delib_proof import DelibProofGenerator
    print("   ✅ Lab2: delib_proof")

    from api_gateway import app
    print("   ✅ Lab3: api_gateway")

    print("\n   ✅ All imports successful!")

except ImportError as e:
    print(f"\n   ❌ Import error: {e}")
    sys.exit(1)
PYTHON

################################################################################
# Step 8: Create Startup Script
################################################################################

echo -e "\n${YELLOW}8️⃣  Creating startup scripts...${NC}"

# Create Lab3 startup script
cat > labs/lab3-proof/start_gateway.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")/../.."
source venv/bin/activate
cd labs/lab3-proof/src
uvicorn api_gateway:app --host 0.0.0.0 --port 8000 --reload
EOF
chmod +x labs/lab3-proof/start_gateway.sh
echo -e "   ✅ Lab3 startup: labs/lab3-proof/start_gateway.sh"

# Create system startup script
cat > start_kaizen.sh <<'EOF'
#!/bin/bash
################################################################################
# Kaizen-OS System Startup
################################################################################

source venv/bin/activate

# Start Lab3 API Gateway
echo "🚀 Starting Kaizen-OS API Gateway..."
cd labs/lab3-proof/src
uvicorn api_gateway:app --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "✅ API Gateway started (PID: $API_PID)"
echo "📡 API available at: http://localhost:8000"
echo "📚 API docs at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

# Wait for interrupt
trap "kill $API_PID 2>/dev/null; exit" INT TERM
wait $API_PID
EOF
chmod +x start_kaizen.sh
echo -e "   ✅ System startup: ./start_kaizen.sh"

################################################################################
# Deployment Complete
################################################################################

echo -e "\n${GREEN}✨ Deployment Complete!${NC}\n"

echo -e "${BLUE}📋 Quick Start Guide:${NC}"
echo -e "   1. Start the system:"
echo -e "      ${YELLOW}./start_kaizen.sh${NC}"
echo -e ""
echo -e "   2. Access the API:"
echo -e "      ${YELLOW}http://localhost:8000${NC}"
echo -e "      ${YELLOW}http://localhost:8000/docs${NC} (Swagger UI)"
echo -e ""
echo -e "   3. Run tests:"
echo -e "      ${YELLOW}source venv/bin/activate${NC}"
echo -e "      ${YELLOW}pytest tests/${NC}"
echo -e ""

echo -e "${BLUE}📁 Important Paths:${NC}"
echo -e "   • Config: ${YELLOW}config/${NC}"
echo -e "   • Logs: ${YELLOW}logs/${NC}"
echo -e "   • Data: ${YELLOW}data/${NC}"
echo -e "   • Lab1: ${YELLOW}labs/lab1-proof/src/${NC}"
echo -e "   • Lab2: ${YELLOW}labs/lab2-proof/src/${NC}"
echo -e "   • Lab3: ${YELLOW}labs/lab3-proof/src/${NC}"
echo -e ""

echo -e "${GREEN}🎯 Labs Ready:${NC}"
echo -e "   ✅ Lab1: Substrate Proof (Civic Ledger, GIC Token, Crypto Attestation)"
echo -e "   ✅ Lab2: Thought Broker (Deliberation, DelibProof)"
echo -e "   ✅ Lab3: API Fabric (Gateway, Auth, Rate Limiting)"
echo -e ""

echo -e "${BLUE}💡 Next Steps:${NC}"
echo -e "   • Configure your LLM API keys in config/lab2_config.json"
echo -e "   • Set up monitoring and observability"
echo -e "   • Deploy Labs 4-7 (Security, Memory, Mesh, Shell)"
echo -e "   • Review the Executive Presentation: docs/EXECUTIVE_PRESENTATION.md"
echo -e ""

echo -e "${GREEN}🌟 Kaizen-OS foundation labs are operational!${NC}"
