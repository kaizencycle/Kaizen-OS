from fastapi import APIRouter, Header, BackgroundTasks
from pydantic import BaseModel
from typing import List, Literal, Dict, Any
from datetime import datetime, timezone
from app.auth import introspect
from app.anchor import anchor_event

router = APIRouter(prefix="/memory", tags=["memory"])

BUCKETS: Dict[str, Dict[str, Any]] = {}
def nowz(): return datetime.now(tz=timezone.utc).isoformat().replace("+00:00","Z")
def bucket(app_id): return BUCKETS.setdefault(app_id, {"events": []})

class Ev(BaseModel):
    type: Literal["reflection","note","system"] = "reflection"
    content: str
class AppendReq(BaseModel):
    events: List[Ev]

@router.post("/append")
def append(body: AppendReq, background: BackgroundTasks, authorization: str = Header(None)):
    info = introspect(authorization)
    b = bucket(info["admin"])
    token = authorization.split(" ", 1)[1]
    for e in body.events:
        rec = {"type": e.type, "content": e.content, "ts": nowz()}
        b["events"].append(rec)
        att_type = "reflection_appended" if e.type in ("reflection","note") else "identity_onboarded"
        background.add_task(anchor_event, token, att_type, {"content": e.content, "ts": rec["ts"]})
    if len(b["events"]) > 200: b["events"] = b["events"][-200:]
    return {"ok": True, "count": len(b["events"])}

