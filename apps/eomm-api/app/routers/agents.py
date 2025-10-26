# app/routers/agents.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os

router = APIRouter(prefix="/agents", tags=["agents"])

class Msg(BaseModel):
    prompt: str

# if you’re using OpenAI’s SDK:
from openai import OpenAI
_client = None
def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY", "") or os.getenv("OPENAI_API_KEY_1", "")
        if not api_key:
            # still let the request finish with JSON
            return None
        _client = OpenAI(api_key=api_key)
    return _client

AGENTS = ["jade","eve","zeus","hermes"]

@router.get("/ping")
def ping():
    return {"status": "ok", "agents": [a.title() for a in AGENTS]}

@router.post("/message/{name}")
def message(name: str, body: Msg):
    name = name.lower()
    if name not in AGENTS:
        return JSONResponse({"ok": False, "error": f"Unknown agent '{name}'"}, status_code=404)

    if not body.prompt or not body.prompt.strip():
        return JSONResponse({"ok": False, "error": "Empty prompt"}, status_code=400)

    client = get_client()
    if client is None:
        # Don’t crash—return JSON the UI can render
        return JSONResponse(
            {"ok": False, "error": "OPENAI_API_KEY missing on server"},
            status_code=500
        )

    try:
        # minimal example – swap to your chosen model + settings
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are {name.title()}, a helpful core agent."},
                {"role": "user", "content": body.prompt},
            ],
            temperature=0.7,
        )
        text = resp.choices[0].message.content if resp and resp.choices else ""
        return JSONResponse({"ok": True, "agent": name, "reply": text or ""})
    except Exception as e:
        # Always JSON
        return JSONResponse({"ok": False, "error": f"upstream_error: {str(e)}"}, status_code=502)
