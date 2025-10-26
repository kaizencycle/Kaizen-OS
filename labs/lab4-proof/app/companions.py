# app/companions.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .auth import admin_required
from datetime import datetime, timezone
from typing import Dict, Any
import os
import httpx

router = APIRouter(prefix="/companions", tags=["companions"])

# Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai", "ollama", "deepseek"
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

# In-memory storage
COMPANIONS: Dict[str, Dict[str, Any]] = {}

# Models
class CompanionCreate(BaseModel):
    name: str
    archetype: str   # e.g. "sage", "scout", "healer"
    traits: list[str] = []

# Helper functions
def iso_now():
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

async def llm_generate(prompt: str) -> str:
    """Generate text using the configured LLM provider."""
    if LLM_PROVIDER == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
        data = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are a kind AI companion."},
                {"role": "user", "content": prompt}
            ],
        }
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json()["choices"][0]["message"]["content"].strip()

    elif LLM_PROVIDER == "ollama":
        url = "http://localhost:11434/api/generate"
        data = {"model": LLM_MODEL, "prompt": prompt}
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json().get("response", "").strip()

    elif LLM_PROVIDER == "deepseek":
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}"}
        data = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are a thoughtful AI companion."},
                {"role": "user", "content": prompt}
            ],
        }
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=500, detail=resp.text)
            return resp.json()["choices"][0]["message"]["content"].strip()

    else:
        return "⚠️ No LLM provider configured."

# Routes
@router.post("/")
def create_companion(body: CompanionCreate, ctx=Depends(admin_required)):
    """Create a new companion for the authenticated app."""
    COMPANIONS[ctx.app_id] = {
        "name": body.name,
        "archetype": body.archetype,
        "traits": body.traits,
        "created_at": iso_now(),
    }
    return {"ok": True, "companion": COMPANIONS[ctx.app_id]}

@router.get("/")
def get_companion(ctx=Depends(admin_required)):
    """Get the companion for the authenticated app."""
    companion = COMPANIONS.get(ctx.app_id)
    if not companion:
        return None
    return companion

@router.post("/respond")
async def companion_respond(ctx=Depends(admin_required)):
    """Generate a response from the companion using LLM."""
    comp = COMPANIONS.get(ctx.app_id)
    if not comp:
        return {"ok": False, "response": "You don't have a companion yet."}

    name = comp["name"]
    archetype = comp["archetype"]
    traits = comp.get("traits", [])

    # Archetype guidance
    archetype_prompts = {
        "scout": "Encourage progress; be energetic, concrete, and forward-moving.",
        "sage": "Offer wisdom, patterns, and gentle reframes; use simple metaphors.",
        "healer": "Be warm and validating; normalize feelings and suggest one small care action.",
        "guardian": "Be protective and resolute; reinforce boundaries and self-respect.",
    }

    # Try to load memory context if available
    try:
        from app.memory import MEMORIES
        bucket = MEMORIES.get(ctx.app_id, {"events": [], "summary": ""})
        recent = bucket.get("events", [])[-12:]
        summary = bucket.get("summary", "")

        recent_lines = "\n".join(f"- ({e['type']}) {e['content']}" for e in recent)
        summary_line = f"\nSUMMARY: {summary}\n" if summary else ""

        prompt = f"""
You are {name}, a {archetype} companion. Style: {archetype_prompts.get(archetype, "neutral")}.
Traits: {', '.join(traits) if traits else 'none'}.

Consider the user's journey so far (recent entries first):
{recent_lines}
{summary_line}
Reply in 1–3 sentences, in character, with one clear, caring next step or reflection question.
Avoid clichés; keep it specific to the themes above.
"""

        reply = await llm_generate(prompt)
        
        # Optionally write the reply back into memory as an event
        bucket.setdefault("events", []).append({
            "type": "reply",
            "content": reply.strip(),
            "ts": iso_now()
        })
        # Cap memory size
        if len(bucket["events"]) > 200:
            bucket["events"] = bucket["events"][-200:]
        MEMORIES[ctx.app_id] = bucket

    except ImportError:
        # Fallback if memory module isn't available
        prompt = f"""
You are {name}, a {archetype} companion.
Archetype style: {archetype_prompts.get(archetype, "neutral")}.
Traits: {', '.join(traits) if traits else 'none'}.
The user just shared a reflection. Reply in 1–3 sentences, in character.
"""
        reply = await llm_generate(prompt)

    return {"ok": True, "response": reply.strip()}

