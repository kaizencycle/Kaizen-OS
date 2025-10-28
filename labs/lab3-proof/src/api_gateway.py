"""
Lab3: API Gateway - Unified Entry Point
FastAPI-based gateway for all Kaizen-OS services
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import jwt
import time
from datetime import datetime, timedelta


app = FastAPI(
    title="Kaizen-OS API Fabric",
    description="Unified gateway for all Kaizen-OS services",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
JWT_SECRET = "kaizen_os_secret_key_change_in_production"
JWT_ALGORITHM = "HS256"


# --- Models ---

class GIScoreRequest(BaseModel):
    agent: str
    action: Dict

class DeliberationRequest(BaseModel):
    question: str
    models: List[str]
    context: Optional[Dict] = None

class TransferRequest(BaseModel):
    from_address: str
    to_address: str
    amount: float
    memo: Optional[str] = ""


# --- Authentication ---

def create_token(user_id: str, role: str = "citizen") -> str:
    """Create JWT token"""
    payload = {
        "sub": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def verify_token(authorization: Optional[str] = Header(None)) -> Dict:
    """Verify JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Health Check ---

@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


# --- Lab1: Substrate API ---

@app.get("/api/v1/gi/score/{agent_id}")
async def get_gi_score(agent_id: str, user=Depends(verify_token)):
    """Get GI score for agent"""
    # In production, this would call Lab1 service
    return {
        "agent_id": agent_id,
        "score": 0.994,
        "threshold_met": True,
        "trend": "improving",
        "breakdown": {
            "clause_1_human_dignity": 0.98,
            "clause_2_transparency": 0.96,
            "clause_3_equity": 0.92,
            "clause_4_safety": 0.95,
            "clause_5_privacy": 0.94,
            "clause_6_civic_integrity": 0.97,
            "clause_7_environment": 0.91
        }
    }


@app.post("/api/v1/gi/calculate")
async def calculate_gi(request: GIScoreRequest, user=Depends(verify_token)):
    """Calculate GI score for action"""
    # In production, this would call Lab1 GI scoring engine
    return {
        "score": 0.994,
        "threshold_met": True,
        "breakdown": {},
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/v1/ledger/blocks/{block_number}")
async def get_block(block_number: int, user=Depends(verify_token)):
    """Get block by number"""
    # In production, this would call Lab1 Civic Ledger
    return {
        "block_number": block_number,
        "timestamp": datetime.utcnow().isoformat(),
        "transactions": [],
        "validator": "atlas@civic.os",
        "merkle_root": "0x1a2b3c..."
    }


# --- Lab2: Thought Broker API ---

@app.post("/api/v1/deliberation")
async def create_deliberation(
    request: DeliberationRequest,
    user=Depends(verify_token)
):
    """Create deliberation session"""
    # In production, this would call Lab2 Thought Broker
    session_id = f"delib_{int(time.time() * 1000)}"

    return {
        "id": session_id,
        "question": request.question,
        "models": request.models,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }


@app.get("/api/v1/deliberation/{delib_id}")
async def get_deliberation(delib_id: str, user=Depends(verify_token)):
    """Get deliberation status"""
    # In production, this would query Lab2
    return {
        "id": delib_id,
        "status": "completed",
        "consensus": {
            "reached": True,
            "decision": "APPROVED",
            "agreement_score": 0.91,
            "summary": "All models agree to proceed"
        }
    }


# --- Lab4: E.O.M.M. API ---

@app.post("/api/v1/reflections")
async def submit_reflection(reflection: Dict, user=Depends(verify_token)):
    """Submit reflection"""
    # In production, this would call Lab4 E.O.M.M.
    return {
        "reflection_id": f"refl_{int(time.time() * 1000)}",
        "status": "recorded",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/v1/reflections")
async def get_reflections(
    agent_id: Optional[str] = None,
    user=Depends(verify_token)
):
    """Get reflections"""
    # In production, this would query Lab4
    return []


# --- Lab6: Citizen Shield API ---

@app.post("/api/v1/security/validate")
async def validate_security(content: Dict, user=Depends(verify_token)):
    """Validate content security"""
    # In production, this would call Lab6 Citizen Shield
    return {
        "safe": True,
        "threats": [],
        "gi_score": 0.95
    }


# --- Lab7: OAA Hub API ---

@app.post("/api/v1/oaa/parse")
async def parse_intent(intent: Dict, user=Depends(verify_token)):
    """Parse user intent"""
    # In production, this would call Lab7 OAA Hub
    return {
        "spec": {
            "type": "deliberation_request",
            "question": intent.get("intent", ""),
            "parsed_at": datetime.utcnow().isoformat()
        }
    }


# --- Authentication Endpoints ---

@app.post("/api/v1/auth/login")
async def login(credentials: Dict):
    """Login and get JWT token"""
    username = credentials.get("username")
    password = credentials.get("password")

    # In production, verify against database
    if username == "test_user" and password == "test_password":
        token = create_token(user_id=username, role="citizen")
        return {"token": token}

    raise HTTPException(status_code=401, detail="Invalid credentials")


# --- Rate Limiting (Simple In-Memory) ---

request_counts: Dict[str, List[float]] = {}

async def check_rate_limit(user: Dict = Depends(verify_token)):
    """Simple rate limiting (60 req/min)"""
    user_id = user["sub"]
    now = time.time()

    if user_id not in request_counts:
        request_counts[user_id] = []

    # Clean old requests (older than 60 seconds)
    request_counts[user_id] = [
        t for t in request_counts[user_id]
        if now - t < 60
    ]

    # Check limit
    if len(request_counts[user_id]) >= 60:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # Add current request
    request_counts[user_id].append(now)


# Run server
if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting Kaizen-OS API Gateway on http://localhost:5003")
    print("📚 API Documentation: http://localhost:5003/docs")

    uvicorn.run(app, host="0.0.0.0", port=5003)
