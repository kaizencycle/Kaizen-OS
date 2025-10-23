from fastapi import APIRouter, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Literal, Dict, Any
from datetime import datetime, timezone
from app.auth import introspect
from app.anchor import anchor_event

router = APIRouter(prefix="/shield", tags=["shield"])

def nowz(): return datetime.now(tz=timezone.utc).isoformat().replace("+00:00","Z")

class SweepReq(BaseModel):
    target: Literal["inbox","memories","alerts"] = "inbox"
    note: str = ""

@router.post("/sweep")
def sweep(body: SweepReq, background: BackgroundTasks, authorization: str = Header(None)):
    info = introspect(authorization)
    token = authorization.split(" ", 1)[1]
    payload = {"target": body.target, "note": body.note, "ts": nowz()}
    background.add_task(anchor_event, token, "shield_sweep", payload)
    return {"ok": True, "sweep": payload}

class ReportReq(BaseModel):
    category: Literal["abuse","fraud","misinfo","other"] = "other"
    details: str

@router.post("/report")
def report(body: ReportReq, background: BackgroundTasks, authorization: str = Header(None)):
    info = introspect(authorization)
    token = authorization.split(" ", 1)[1]
    payload = {"category": body.category, "details": body.details, "ts": nowz()}
    background.add_task(anchor_event, token, "shield_report", payload)
    return {"ok": True, "report": payload}
