# app/memory.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Literal, Dict, Any
from app.auth import admin_required, AdminContext
import time

router = APIRouter(prefix="/memory", tags=["memory"])

# In-memory store (swap to SQLite/Postgres later)
# MEMORIES[app_id] = {"events": [ {type, content, ts}, ... ], "summary": str}
MEMORIES: Dict[str, Dict[str, Any]] = {}

# limits
MAX_EVENTS_PER_APP = 200          # rolling window
SUMMARIZE_AFTER_N = 10            # auto-summarize cadence

class MemoryEvent(BaseModel):
    type: Literal["reflection", "reply", "note", "system"] = "reflection"
    content: str

class MemoryAppendReq(BaseModel):
    events: List[MemoryEvent]

def now_iso():
    """Generate current timestamp in ISO format."""
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

def get_bucket(app_id: str) -> Dict[str, Any]:
    """Get or create memory bucket for app_id."""
    b = MEMORIES.get(app_id)
    if not b:
        b = {"events": [], "summary": ""}
        MEMORIES[app_id] = b
    return b

@router.get("/")
def get_memory(ctx: AdminContext = Depends(admin_required)):
    """Get all memory data for the authenticated app."""
    b = get_bucket(ctx.app_id)
    return {
        "ok": True,
        "summary": b.get("summary", ""),
        "events": b.get("events", []),
        "count": len(b.get("events", [])),
    }

@router.post("/append")
def append_memory(body: MemoryAppendReq, ctx: AdminContext = Depends(admin_required)):
    """Append new events to memory."""
    b = get_bucket(ctx.app_id)
    for ev in body.events:
        b["events"].append({
            "type": ev.type, 
            "content": ev.content, 
            "ts": now_iso()
        })
    
    # trim rolling window
    if len(b["events"]) > MAX_EVENTS_PER_APP:
        b["events"] = b["events"][-MAX_EVENTS_PER_APP:]
    
    return {"ok": True, "count": len(b["events"])}

@router.delete("/clear")
def clear_memory(ctx: AdminContext = Depends(admin_required)):
    """Clear all memory for the authenticated app."""
    if ctx.app_id in MEMORIES:
        MEMORIES[ctx.app_id] = {"events": [], "summary": ""}
    return {"ok": True, "message": "Memory cleared"}

@router.get("/stats")
def memory_stats(ctx: AdminContext = Depends(admin_required)):
    """Get memory statistics."""
    b = get_bucket(ctx.app_id)
    events = b.get("events", [])
    
    # Count by type
    type_counts = {}
    for event in events:
        event_type = event.get("type", "unknown")
        type_counts[event_type] = type_counts.get(event_type, 0) + 1
    
    return {
        "ok": True,
        "total_events": len(events),
        "has_summary": bool(b.get("summary", "").strip()),
        "summary_length": len(b.get("summary", "")),
        "type_breakdown": type_counts,
        "oldest_event": events[0].get("ts") if events else None,
        "newest_event": events[-1].get("ts") if events else None,
    }

# --- Optional: summarization via your LLM bridge (async) ---
@router.post("/summarize")
async def summarize(ctx: AdminContext = Depends(admin_required)):
    """Generate a summary of recent memory events using LLM."""
    b = get_bucket(ctx.app_id)
    events = b.get("events", [])
    
    if not events:
        raise HTTPException(400, "No events to summarize.")
    
    try:
        # Import here to avoid circular imports
        from app.companions import llm_generate
        
        # build a compact prompt with last 40 items
        tail = events[-40:]
        lines = [f"- ({e['type']}) {e['content']}" for e in tail]
        prompt = (
            "Summarize the user's journey so far in <120 words, "
            "keeping it neutral, supportive, and useful for future coaching.\n"
            "Focus on recurring themes, values, goals, and concerns.\n\n"
            "Recent entries:\n" + "\n".join(lines)
        )
        
        summary = await llm_generate(prompt)
        b["summary"] = summary.strip()
        
        return {"ok": True, "summary": b["summary"]}
        
    except ImportError:
        # Fallback if companions module isn't available
        raise HTTPException(500, "LLM summarization not available")
    except Exception as e:
        raise HTTPException(500, f"Error generating summary: {str(e)}")

@router.put("/summary")
def update_summary(
    summary: str, 
    ctx: AdminContext = Depends(admin_required)
):
    """Manually update the memory summary."""
    if not summary or not summary.strip():
        raise HTTPException(400, "Summary cannot be empty")
    
    b = get_bucket(ctx.app_id)
    b["summary"] = summary.strip()
    
    return {"ok": True, "summary": b["summary"]}

@router.get("/recent/{limit}")
def get_recent_events(
    limit: int, 
    ctx: AdminContext = Depends(admin_required)
):
    """Get the most recent N events."""
    if limit < 1 or limit > 100:
        raise HTTPException(400, "Limit must be between 1 and 100")
    
    b = get_bucket(ctx.app_id)
    events = b.get("events", [])
    recent = events[-limit:] if events else []
    
    return {
        "ok": True,
        "events": recent,
        "count": len(recent),
        "total_available": len(events)
    }
