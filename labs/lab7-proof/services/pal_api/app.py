from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, Optional
import json, os, time, uuid

EPISODES_PATH = os.environ.get("PAL_EPISODES_PATH", "ledger/episodes.jsonl")
POLICY_PATH   = os.environ.get("PAL_POLICY_PATH", "ledger/policies/linucb_v1.json")
MODELCARD_DIR = os.environ.get("PAL_MODELCARD_DIR", "ledger/model_cards")

app = FastAPI(title="PAL Sentinel-Learn (Lab7)")

class Feedback(BaseModel):
    episode_id: str
    thumbs: str  # 'up' or 'down'
    notes: Optional[str] = None

class RewardLog(BaseModel):
    episode_id: str
    dwell_ms: Optional[int] = 0
    retries: Optional[int] = 0
    errors: Optional[int] = 0
    custom: Optional[Dict[str, Any]] = None

class Context(BaseModel):
    context: Dict[str, Any]

class TrainReq(BaseModel):
    reason: Optional[str] = "scheduled"
    notes: Optional[str] = None

def _append_jsonl(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(obj) + "\n")

def _load_policy(path):
    if not os.path.exists(path):
        return {"type": "linucb", "version": "v1", "arms": ["default"], "theta": {}, "alpha": 1.0}
    return json.load(open(path))

def _linucb_infer(policy, ctx):
    # Place your real LinUCB / policy logic here
    arms = policy.get("arms", ["default"])
    action = arms[0]
    uncertainty = 0.5
    return action, uncertainty

@app.post("/pal/feedback")
def pal_feedback(f: Feedback):
    rec = {"ts": time.time(), "episode_id": f.episode_id, "thumbs": f.thumbs, "notes": f.notes}
    _append_jsonl(EPISODES_PATH, {"type": "explicit_feedback", **rec})
    return {"ok": True}

@app.post("/pal/reward/log")
def pal_reward(r: RewardLog):
    rec = {"ts": time.time(), **r.model_dump()}
    _append_jsonl(EPISODES_PATH, {"type": "implicit_feedback", **rec})
    return {"ok": True}

@app.post("/pal/policy/infer")
def pal_infer(c: Context):
    policy = _load_policy(POLICY_PATH)
    if policy.get("type") == "linucb":
        act, unc = _linucb_infer(policy, c.context)
    else:
        act, unc = "default", 1.0
    episode_id = str(uuid.uuid4())
    _append_jsonl(EPISODES_PATH, {"type": "decision", "episode_id": episode_id, "context": c.context, "action": act, "uncertainty": unc, "policy_version": policy.get("version","v?")})
    return {"episode_id": episode_id, "action": act, "uncertainty": unc, "policy_version": policy.get("version","v?")}

@app.post("/pal/train")
def pal_train(t: TrainReq):
    job_id = str(uuid.uuid4())
    _append_jsonl(EPISODES_PATH, {"type": "train_request", "job_id": job_id, "reason": t.reason, "notes": t.notes})
    return {"accepted": True, "job_id": job_id}

@app.get("/pal/model-card/{version}")
def pal_model_card(version: str):
    p = os.path.join(MODELCARD_DIR, f"{version}.json")
    if not os.path.exists(p):
        return {"error": "model card not found"}
    return json.load(open(p))


