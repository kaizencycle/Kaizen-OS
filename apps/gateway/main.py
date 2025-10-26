"""
Kaizen OS API Gateway
AUREA + ATLAS Unified Architecture

Features:
- Constitutional Middleware (ATLAS): AI integrity validation
- GI Gate (AUREA): Human integrity scoring
- Single API entry point with fan-out routing
- Event bus with ledger attestation
- Multi-LLM agnostic architecture
"""
import os
import json
from typing import Optional
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import jwt
from apps.gateway.settings import CFG
from packages.civic_sdk.constitutional_middleware import ConstitutionalMiddleware
from apps.gateway.events import CivicEventBus

# Configuration
UP = CFG["UP"]
GI_GATE = CFG["GI_GATE"]
JWT_KEY = CFG["JWT_KEY"]
JWT_ALG = CFG["JWT_ALG"]

# Create app
app = FastAPI(
    title="Kaizen OS Gateway",
    version="1.0.0",
    description="Single entry point for all Kaizen OS services"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize ATLAS enhancements (feature-flagged)
constitutional = None
event_bus = None

if CFG["FF_CONSTITUTIONAL"]:
    constitutional = ConstitutionalMiddleware(
        charter_url=CFG["CHARTER_URL"],
        ledger_url=UP["ledger"]
    )
    print("✅ Constitutional middleware enabled")

if CFG["FF_EVENT_ATTEST"]:
    event_bus = CivicEventBus(
        nats_url=CFG["NATS_URL"],
        ledger_url=UP["ledger"]
    )
    print("✅ Event bus enabled")


@app.on_event("startup")
async def startup():
    """Initialize connections"""
    if event_bus:
        await event_bus.connect()


@app.get("/healthz")
def healthz():
    """Health check endpoint"""
    return {
        "ok": True,
        "service": "gateway",
        "features": {
            "constitutional": bool(constitutional),
            "event_attest": bool(event_bus)
        }
    }


def _verify_jwt(auth_header: Optional[str]) -> dict:
    """Verify JWT token"""
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    
    token = auth_header.split(" ", 1)[1]
    try:
        return jwt.decode(
            token,
            JWT_KEY,
            algorithms=[JWT_ALG],
            options={"require": ["sub"]}
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT: {e}")


async def _proxy(req: Request, base: str, prefix: str) -> Response:
    """Proxy request to upstream service"""
    path = req.url.path[len(prefix):] or "/"
    url = base + path + (f"?{req.url.query}" if req.url.query else "")
    
    # Strip incoming auth (will be handled by gateway for service-to-service)
    headers = {
        k: v 
        for k, v in req.headers.items() 
        if k.lower() != "authorization"
    }
    
    body = await req.body()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            req.method,
            url,
            headers=headers,
            content=body
        )
    
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers={
            k: v 
            for k, v in response.headers.items() 
            if k.lower() not in ["content-encoding", "transfer-encoding"]
        }
    )


# ============================================
# MIDDLEWARES (ATLAS + AUREA)
# ============================================

@app.middleware("http")
async def constitutional_gate(request: Request, call_next):
    """
    ATLAS: Constitutional gate - validates AI behavior before processing
    Runs BEFORE GI gate
    """
    if not constitutional or request.method in ("GET", "HEAD", "OPTIONS"):
        return await call_next(request)
    
    claims = _verify_jwt(request.headers.get("Authorization"))
    
    try:
        # Extract prompt from request body
        if request.headers.get("content-type", "").startswith("application/json"):
            body = await request.json()
        else:
            body = {}
        
        prompt = (
            body.get("prompt") or 
            body.get("message") or 
            body.get("input") or 
            json.dumps(body)[:2048]
        )
        
        # Validate constitutionally
        validation = await constitutional.enforce({
            "prompt": prompt,
            "source": request.url.path,
            "userId": claims.get("sub")
        })
        
        # Check integrity score
        integrity_score = validation.get("integrity_score", 100)
        if integrity_score < 70:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Constitutional violation",
                    "integrity_score": integrity_score,
                    "violations": validation.get("clause_violations", [])
                }
            )
        
        # Store score for response headers
        request.state.constitutional_score = integrity_score
        
    except HTTPException:
        raise
    except Exception as e:
        # Graceful degradation - allow request if validation fails
        print(f"⚠️ Constitutional validation error: {e}")
    
    response = await call_next(request)
    
    # Add constitutional metadata to response
    if hasattr(request.state, "constitutional_score"):
        response.headers["X-Constitutional-Score"] = str(request.state.constitutional_score)
        response.headers["X-Constitutional-Enabled"] = "true"
    
    return response


@app.middleware("http")
async def gi_gate(request: Request, call_next):
    """
    AUREA: GI gate - validates human integrity before mutations
    Runs AFTER constitutional gate
    """
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        claims = _verify_jwt(request.headers.get("Authorization"))
        gi = float(claims.get("gi", 0))
        
        if gi < GI_GATE:
            raise HTTPException(
                status_code=403,
                detail=f"GI {gi:.3f} below gate {GI_GATE:.2f}"
            )
    
    response = await call_next(request)
    
    # Add GI metadata to response
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        response.headers["X-GI-Gate-Enforced"] = "true"
    
    return response


# ============================================
# FAN-OUT ROUTES (AUREA)
# ============================================

@app.api_route(
    "/v1/ledger/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
async def ledger(req: Request, path: str):
    return await _proxy(req, UP["ledger"], "/v1/ledger")


@app.api_route(
    "/v1/oaa/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
async def oaa(req: Request, path: str):
    return await _proxy(req, UP["oaa"], "/v1/oaa")


@app.api_route(
    "/v1/reflections/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
async def reflections(req: Request, path: str):
    return await _proxy(req, UP["reflections"], "/v1/reflections")


@app.api_route(
    "/v1/shield/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
async def shield(req: Request, path: str):
    return await _proxy(req, UP["shield"], "/v1/shield")


@app.api_route(
    "/v1/gic/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
async def gic(req: Request, path: str):
    return await _proxy(req, UP["gic"], "/v1/gic")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))


