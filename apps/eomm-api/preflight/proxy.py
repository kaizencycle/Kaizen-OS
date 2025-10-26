#!/usr/bin/env python3
"""
HIVE-PAW Preflight Proxy
Validates and auto-fixes JSON requests before forwarding to the main API.
"""

import json
import re
import asyncio
from typing import Any, Dict, Optional, Union
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import httpx
from pydantic import BaseModel, Field, ValidationError
import uvicorn

# Target API (your main FastAPI)
TARGET_API = "http://127.0.0.1:8000"

# Pydantic models for validation
class SeedModel(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(..., pattern=r"^\d{2}:\d{2}:\d{2}$")
    intent: str
    meta: Dict[str, Any] = Field(default_factory=dict)

class SweepModel(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    chamber: str
    note: str
    meta: Dict[str, Any] = Field(default_factory=dict)

class SealModel(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    wins: str
    blocks: str
    tomorrow_intent: str
    meta: Dict[str, Any] = Field(default_factory=dict)

# Create FastAPI app
app = FastAPI(title="HIVE-PAW Preflight Proxy", version="1.0.0")

def try_parse_json_smart(text: str) -> Union[Dict[str, Any], str]:
    """Auto-fix common JSON issues and parse."""
    if not isinstance(text, str):
        return text
    
    s = text.strip()
    
    # Skip if already parsed
    if not s.startswith(("{", "[")):
        return text
    
    # 1) Replace single quotes with double quotes
    s = re.sub(r"([{,\s])'([^']+?)'\s*:", r'\1"\2":', s)  # keys
    s = re.sub(r":\s*'([^']*)'", r': "\1"', s)            # values
    
    # 2) Remove trailing commas
    s = re.sub(r",(\s*[}\]])", r"\1", s)
    
    # 3) Try to parse
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return text

def autofix_payload(payload: Any, endpoint: str) -> Dict[str, Any]:
    """Apply auto-fixes to payload."""
    # Parse if string
    if isinstance(payload, str):
        payload = try_parse_json_smart(payload)
    
    # If still string, return as-is (will cause validation error)
    if isinstance(payload, str):
        return {"raw": payload}
    
    # Ensure meta exists
    if "meta" not in payload:
        payload["meta"] = {}
    
    # Default time for seed
    if endpoint == "/seed" and "time" not in payload:
        payload["time"] = "12:45:00"
    
    return payload

def validate_payload(payload: Dict[str, Any], endpoint: str) -> Optional[Dict[str, Any]]:
    """Validate payload against schema."""
    try:
        if endpoint == "/seed":
            SeedModel(**payload)
        elif endpoint == "/sweep":
            SweepModel(**payload)
        elif endpoint == "/seal":
            SealModel(**payload)
        return None
    except ValidationError as e:
        return {
            "error": "Validation failed",
            "endpoint": endpoint,
            "issues": [
                {
                    "field": ".".join(str(x) for x in err["loc"]),
                    "message": err["msg"],
                    "input": err.get("input")
                }
                for err in e.errors()
            ]
        }

@app.post("/seed")
async def proxy_seed(request: Request):
    """Proxy /seed with validation and auto-fix."""
    body = await request.body()
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = body.decode()
    
    # Auto-fix
    payload = autofix_payload(payload, "/seed")
    
    # If still string, return error
    if isinstance(payload, str):
        return JSONResponse(
            status_code=422,
            content={
                "detail": "JSON decode error",
                "hint": "Use double quotes for keys/values and remove trailing commas.",
                "example": {
                    "date": "2025-09-21",
                    "time": "12:45:00",
                    "intent": "iterate",
                    "meta": {}
                }
            }
        )
    
    # Validate
    validation_error = validate_payload(payload, "/seed")
    if validation_error:
        return JSONResponse(status_code=422, content=validation_error)
    
    # Forward to main API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TARGET_API}/seed",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            return JSONResponse(
                status_code=response.status_code,
                content=response.json()
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": "Upstream error", "message": str(e)}
            )

@app.post("/sweep")
async def proxy_sweep(request: Request):
    """Proxy /sweep with validation and auto-fix."""
    body = await request.body()
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = body.decode()
    
    # Auto-fix
    payload = autofix_payload(payload, "/sweep")
    
    # If still string, return error
    if isinstance(payload, str):
        return JSONResponse(
            status_code=422,
            content={
                "detail": "JSON decode error",
                "hint": "Use double quotes for keys/values and remove trailing commas.",
                "example": {
                    "date": "2025-09-21",
                    "chamber": "LAB4",
                    "note": "first sweep",
                    "meta": {}
                }
            }
        )
    
    # Validate
    validation_error = validate_payload(payload, "/sweep")
    if validation_error:
        return JSONResponse(status_code=422, content=validation_error)
    
    # Forward to main API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TARGET_API}/sweep",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            return JSONResponse(
                status_code=response.status_code,
                content=response.json()
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": "Upstream error", "message": str(e)}
            )

@app.post("/seal")
async def proxy_seal(request: Request):
    """Proxy /seal with validation and auto-fix."""
    body = await request.body()
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = body.decode()
    
    # Auto-fix
    payload = autofix_payload(payload, "/seal")
    
    # If still string, return error
    if isinstance(payload, str):
        return JSONResponse(
            status_code=422,
            content={
                "detail": "JSON decode error",
                "hint": "Use double quotes for keys/values and remove trailing commas.",
                "example": {
                    "date": "2025-09-21",
                    "wins": "seed+sweep working",
                    "blocks": "none",
                    "tomorrow_intent": "polish",
                    "meta": {}
                }
            }
        )
    
    # Validate
    validation_error = validate_payload(payload, "/seal")
    if validation_error:
        return JSONResponse(status_code=422, content=validation_error)
    
    # Forward to main API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TARGET_API}/seal",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            return JSONResponse(
                status_code=response.status_code,
                content=response.json()
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": "Upstream error", "message": str(e)}
            )

@app.get("/{path:path}")
async def proxy_get(path: str, request: Request):
    """Proxy all GET requests to main API."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TARGET_API}/{path}")
            return JSONResponse(
                status_code=response.status_code,
                content=response.json()
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": "Upstream error", "message": str(e)}
            )

if __name__ == "__main__":
    print(f"[preflight] Starting proxy on http://127.0.0.1:8999 → proxying to {TARGET_API}")
    uvicorn.run(app, host="127.0.0.1", port=8999)

