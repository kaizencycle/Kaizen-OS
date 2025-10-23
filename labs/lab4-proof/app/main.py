# app/main.py
from __future__ import annotations
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple, Optional
import os
import json
import re
import time
import logging
from dotenv import load_dotenv

# --- Logging Configuration ------------------------------------------------
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)
log = logging.getLogger("app")

# Load environment variables (with error handling)
try:
    load_dotenv()
    log.info("Environment variables loaded")
except Exception as e:
    log.warning(f"Failed to load .env: {e}")
    # Set default values if .env loading fails
    os.environ.setdefault("NODE_ID", "cursor")
    os.environ.setdefault("AUTHOR", "Cursor AI (Kaizen Node)")
    os.environ.setdefault("NETWORK_ID", "Kaizen-DVA")
    os.environ.setdefault("VERSION", "0.1.0")

# Import your modules
from app.hashing import sha256_json, merkle_root
from app.storage import today_files, read_json, write_json, load_day, build_ledger_obj, DATA_DIR, get_node_metadata
from app.hash_helpers import build_day_root
from app.models import BonusRun

# Create FastAPI app
app = FastAPI(title="HIVE-PAW API (with ledger)", version="0.12.0")

# CORS configuration
ALLOWED_ORIGINS = [
    "https://reflections-app.onrender.com",
    "https://lab4-proof.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Global Error Handler ------------------------------------------------
@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    log.exception(f"Unhandled error: {request.method} {request.url}")
    return JSONResponse(
        {"ok": False, "error": "internal_error", "detail": str(exc)[:300]},
        status_code=500,
    )

# Include routers with error handling
try:
    from app.auth import router as auth_router, admin_router
    app.include_router(auth_router)
    app.include_router(admin_router)
    log.info("✅ Auth routers loaded")
except Exception as e:
    log.error(f"❌ Failed to load auth routers: {e}")

try:
    from app.memory import router as memory_router
    app.include_router(memory_router)
    log.info("✅ Memory router loaded")
except Exception as e:
    log.error(f"❌ Failed to load memory router: {e}")

try:
    from app.companions import router as companions_router
    app.include_router(companions_router)
    log.info("✅ Companions router loaded")
except Exception as e:
    log.error(f"❌ Failed to load companions router: {e}")

# Agent SDK + Genesis + Wallet routers
try:
    from app.routers import agents as agents_router
    app.include_router(agents_router.router)
    log.info("✅ Agents router loaded")
except Exception as e:
    log.error(f"❌ Failed to load agents router: {e}")

try:
    from app.routers import wallet as wallet_router
    app.include_router(wallet_router.router)
    log.info("✅ Wallet router loaded")
except Exception as e:
    log.error(f"❌ Failed to load wallet router: {e}")

try:
    from app.routers import genesis as genesis_router
    app.include_router(genesis_router.router)
    log.info("✅ Genesis router loaded")
except Exception as e:
    log.error(f"❌ Failed to load genesis router: {e}")

# Admin token configuration
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

def _require_admin(x_admin_token: Optional[str] = Header(None)):
    if not ADMIN_TOKEN or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

# GIC REWARDS CONFIG + HELPERS
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

def safe_int(val: str, default: int) -> int:
    """Extract integer from string, ignoring any non-numeric characters."""
    import re
    # Extract just the first number found
    match = re.search(r'\d+', val)
    return int(match.group()) if match else default

if DEMO_MODE:
    GIC_PER_PRIVATE = 1
    GIC_PER_PUBLISH = 2
    REWARD_MIN_LEN = 1
else:
    GIC_PER_PRIVATE = safe_int(os.getenv("GIC_PER_PRIVATE", "10"), 10)
    GIC_PER_PUBLISH = safe_int(os.getenv("GIC_PER_PUBLISH", "25"), 25)
    REWARD_MIN_LEN = safe_int(os.getenv("REWARD_MIN_LEN", "200"), 200)

# New "featured" submission marker
FEATURE_INTENT = "publish_feature"
FEATURE_QUEUE_FILENAME = "{}.featured_queue.jsonl"

# in-memory dedupe: (user_id, date) -> {content_hash, ...}
_gic_seen: Dict[Tuple[str, str], Set[str]] = {}

def _gic_file(date_str: str) -> str:
    """daily GIC transactions file"""
    return f"{date_str}/{date_str}.gic.jsonl"

def _mark_seen(user_id: str, date_str: str, h: str) -> None:
    key = (user_id, date_str)
    s = _gic_seen.setdefault(key, set())
    s.add(h)

def _already_seen(user_id: str, date_str: str, h: str) -> bool:
    key = (user_id, date_str)
    return h in _gic_seen.get(key, set())

def append_jsonl(file_path: str, record: dict) -> str:
    """Append a record to a JSONL file and return the hash"""
    full_path = DATA_DIR / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(full_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    
    return sha256_json(record)

def _sse(data: dict, event: str = "message") -> bytes:
    lines = []
    if event:
        lines.append(f"event: {event}")
    lines.append(f"data: {json.dumps(data)}")
    lines.append("")
    lines.append("")
    return "\n".join(lines).encode("utf-8")

def _humanize_seconds(s: int) -> str:
    if s <= 0: return "now"
    m, sec = divmod(s, 60)
    h, m = divmod(m, 60)
    d, h = divmod(h, 24)
    if d:  return f"{d}d {h}h"
    if h:  return f"{h}h {m}m"
    if m:  return f"{m}m {sec}s"
    return f"{sec}s"

# VERIFY HELPERS
def _day_dir(date_str: str) -> Path:
    base = os.environ.get("LEDGER_PATH", "data")
    return Path(base) / date_str

def _read_json_file(p: Path) -> dict | None:
    if not p.exists():
        return None
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)

def _read_jsonl_file(p: Path) -> list[dict]:
    if not p.exists():
        return []
    rows = []
    with p.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    return rows

# BONUS HELPERS
_BONUS_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_TOP_N = 10
_MIN_LEN_ELIGIBLE = 200
_BONUS_MIN = 50
_BONUS_MAX = 100
_BONUS_REASON = "featured_bonus"

def _day_path(dstr: str) -> Path:
    base = Path(os.environ.get("LEDGER_PATH", "data"))
    return base / dstr

def _read_jsonl(p: Path) -> list[dict]:
    if not p.exists():
        return []
    rows = []
    with p.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    return rows

def _append_jsonl(p: Path, obj: dict):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")

from datetime import date as _date, datetime as _dt, timedelta as _td

def _latest_full_week() -> tuple[_date, _date]:
    today = _date.today()
    weekday = today.weekday()
    end = today - _td(days=weekday + 1)
    start = end - _td(days=6)
    return start, end

def _bonus_rank(cands: list[dict]) -> list[dict]:
    ranked = []
    for c in cands:
        length = int(c.get("len", 0) or 0)
        votes  = int(c.get("votes", 0) or 0)
        score  = length + 10 * votes
        cc = dict(c)
        cc["score"] = score
        ranked.append(cc)
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked

def _already_paid_keys(payout_day: str) -> set[tuple[str, str, str]]:
    gic_p = _day_path(payout_day) / f"{payout_day}.gic.jsonl"
    seen = set()
    for tx in _read_jsonl(gic_p):
        if tx.get("type") == "gic_tx" and tx.get("reason") == _BONUS_REASON:
            seen.add((str(tx.get("user")), str(tx.get("hash")), _BONUS_REASON))
    return seen

# INDEX HELPERS
_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def _list_date_dirs() -> list[str]:
    base = Path(os.environ.get("LEDGER_PATH", "data"))
    if not base.exists():
        return []
    dates = []
    for p in base.iterdir():
        if p.is_dir() and _DATE_RE.match(p.name):
            dates.append(p.name)
    dates.sort()
    return dates

def _safe_counts_for(date_str: str) -> dict:
    day = _day_dir(date_str)
    root = DATA_DIR
    
    seed_p   = root / f"{date_str}.seed.json" if (root / f"{date_str}.seed.json").exists() else day / f"{date_str}.seed.json"
    echo_p_l = root / f"{date_str}.echo.jsonl" if (root / f"{date_str}.echo.jsonl").exists() else day / f"{date_str}.echo.jsonl"
    echo_p_j = root / f"{date_str}.echo.json" if (root / f"{date_str}.echo.json").exists() else day / f"{date_str}.echo.json"
    seal_p   = root / f"{date_str}.seal.json" if (root / f"{date_str}.seal.json").exists() else day / f"{date_str}.seal.json"
    ledger_p = root / f"{date_str}.ledger.json" if (root / f"{date_str}.ledger.json").exists() else day / f"{date_str}.ledger.json"
    gic_p    = root / f"{date_str}.gic.jsonl" if (root / f"{date_str}.gic.jsonl").exists() else day / f"{date_str}.gic.jsonl"

    seed   = _read_json_file(seed_p)
    seal   = _read_json_file(seal_p)
    ledger = _read_json_file(ledger_p)

    if echo_p_l.exists():
        sweeps = _read_jsonl_file(echo_p_l)
    elif echo_p_j.exists():
        arr = _read_json_file(echo_p_j) or []
        sweeps = arr if isinstance(arr, list) else []
    else:
        sweeps = []

    gic_txs = _read_jsonl_file(gic_p)
    gic_sum = sum(int(tx.get("amount", 0) or 0) for tx in gic_txs)

    return {
        "date": date_str,
        "present": {
            "seed": seed is not None,
            "echo": echo_p_l.exists() or echo_p_j.exists(),
            "seal": seal is not None,
            "ledger": ledger is not None,
            "gic": gic_p.exists(),
        },
        "counts": {
            "seeds": 1 if seed else 0,
            "sweeps": len(sweeps),
            "seals": 1 if seal else 0,
            "gic_txs": len(gic_txs),
        },
        "gic": {
            "sum": gic_sum,
            "file": str(gic_p) if gic_p.exists() else None,
        },
        "day_root": (ledger or {}).get("day_root"),
        "links": {
            "seed":   str(seed_p)   if seed   else None,
            "echo":   str(echo_p_l) if echo_p_l.exists() else (str(echo_p_j) if echo_p_j.exists() else None),
            "seal":   str(seal_p)   if seal   else None,
            "ledger": str(ledger_p) if ledger else None,
        },
    }

# MODELS
from pydantic import BaseModel, Field

class Seed(BaseModel):
    date: str
    time: str
    intent: str
    meta: Dict[str, Any] = Field(default_factory=dict)

class Sweep(BaseModel):
    date: str
    chamber: str
    note: str
    meta: Dict[str, Any] = Field(default_factory=dict)

class Seal(BaseModel):
    date: str
    wins: str
    blocks: str
    tomorrow_intent: str
    meta: Dict[str, Any] = Field(default_factory=dict)

# Mock agent summaries helper
async def get_agent_summaries(conn):
    return [
        {"companion_id":"1111-aaaa","name":"Echo","archetype":"sage","user_id":"u-01","reflections":42,"gic":580,"since_last":"00:12:10"},
        {"companion_id":"2222-bbbb","name":"Jade","archetype":"mentor","user_id":"u-02","reflections":18,"gic":230,"since_last":"03:01:55"},
    ]

# STARTUP EVENT
@app.on_event("startup")
async def startup_event():
    log.info("🚀 Hive API starting up...")
    log.info(f"Demo mode: {DEMO_MODE}")
    log.info(f"CORS origins: {ALLOWED_ORIGINS}")

# BASIC ENDPOINTS
@app.get("/")
def read_root():
    return {"status": "API is live", "message": "Hello from Reflections!", "version": "0.12.0"}

@app.get("/health")
async def health():
    return {"ok": True, "ts": datetime.utcnow().isoformat() + "Z"}

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/ping")
def ping():
    return {"pong": True}

@app.get("/routes")
def routes():
    return {
        "count": len(app.router.routes),
        "items": [
            {"path": r.path, "methods": list(getattr(r, "methods", []))}
            for r in app.router.routes
        ],
    }

@app.get("/config")
def config():
    return {
        "demo_mode": DEMO_MODE,
        "gic_per_private": GIC_PER_PRIVATE,
        "gic_per_publish": GIC_PER_PUBLISH,
        "reward_min_len": REWARD_MIN_LEN,
        "service": "HIVE-PAW API",
    }

@app.get("/reflections")
def reflections():
    return {"data": "Here's where your reflections API will serve data"}

# ADMIN ENDPOINTS
@app.get("/admin/metrics")
async def admin_metrics(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    return {
        "totals": {"users": 2, "companions": 2, "reflections": 60, "gic": 810},
        "ts": time.time(),
    }

@app.get("/admin/agents")
async def admin_agents(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    items = [
        {"companion_id":"1111-aaaa","name":"Echo","archetype":"sage","user_id":"u-01","reflections":42,"gic":580,"since_last":"00:12:10"},
        {"companion_id":"2222-bbbb","name":"Jade","archetype":"mentor","user_id":"u-02","reflections":18,"gic":230,"since_last":"03:01:55"},
    ]
    return {"agents": items}

@app.get("/admin/agents/stream")
async def admin_agents_stream(token: Optional[str] = None, x_admin_token: Optional[str] = Header(None)):
    """SSE stream for real-time admin dashboard updates"""
    admin_token = token or x_admin_token
    if not ADMIN_TOKEN or admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    async def event_stream():
        yield _sse({"message": "Connected to admin stream"}, "hello")
        
        while True:
            try:
                agents = [
                    {"companion_id":"1111-aaaa","name":"Echo","archetype":"sage","user_id":"u-01","reflections":42,"gic":580,"since_last":"00:12:10"},
                    {"companion_id":"2222-bbbb","name":"Jade","archetype":"mentor","user_id":"u-02","reflections":18,"gic":230,"since_last":"03:01:55"},
                ]
                totals = {"users": 2, "companions": 2, "reflections": 60, "gic": 810}
                
                yield _sse({"agents": agents, "totals": totals}, "snapshot")
                
                import asyncio
                await asyncio.sleep(30)
                
            except Exception as e:
                yield _sse({"error": str(e)}, "error")
                break
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# WRITE ENDPOINTS
@app.post("/reflect")
async def reflect(note: dict):
    return {"status": "success", "data": note}

@app.post("/seed")
def post_seed(payload: Seed):
    files = today_files(payload.date)
    node_meta = get_node_metadata()
    record = {
        "type": "seed",
        "date": payload.date,
        "time": payload.time,
        "intent": payload.intent,
        "meta": {**payload.meta, **node_meta},
        "ts": datetime.utcnow().isoformat() + "Z",
    }
    write_json(files["seed"], record)
    return {"seed_hash": sha256_json(record), "file": files["seed"]}

@app.post("/sweep")
def post_sweep(payload: Sweep):
    date_str = payload.date
    files = today_files(date_str)
    node_meta = get_node_metadata()
    
    # Load existing sweeps or start with empty list
    sweeps = read_json(files["echo"]) if (DATA_DIR / files["echo"]).exists() else []
    if isinstance(sweeps, dict):
        sweeps = [sweeps]
    
    record = {
        "type": "sweep",
        "date": date_str,
        "chamber": payload.chamber,
        "note": payload.note,
        "meta": {**payload.meta, **node_meta},
        "ts": datetime.utcnow().isoformat() + "Z",
    }
    sweeps.append(record)
    write_json(files["echo"], sweeps)
    attestation = sha256_json(record)

    # GIC REWARD LOGIC
    meta = payload.meta or {}
    tier = meta.get("gic_intent", "private").lower()
    user_id = meta.get("user", "anon")
    content_hash = meta.get("content_hash")
    note_text = payload.note or ""

    # Base reward by tier
    if tier == "publish":
        gic = GIC_PER_PUBLISH
    elif tier == FEATURE_INTENT:
        gic = GIC_PER_PUBLISH
        record["meta"]["featured"] = True
    else:
        gic = GIC_PER_PRIVATE

    # Publish tiers require minimum length
    if tier in ("publish", FEATURE_INTENT) and len(note_text) < REWARD_MIN_LEN:
        gic = GIC_PER_PRIVATE

    # Duplicate guard per user/day by content hash
    if content_hash:
        if _already_seen(user_id, date_str, content_hash):
            gic = 0
        else:
            _mark_seen(user_id, date_str, content_hash)

    # Append GIC transaction
    gic_tx = {
        "type": "gic_tx",
        "date": date_str,
        "user": user_id,
        "amount": gic,
        "reason": f"reflection:{tier}",
        "hash": content_hash,
        "ts": datetime.utcnow().isoformat() + "Z",
    }
    gic_file = _gic_file(date_str)
    gic_att = append_jsonl(gic_file, gic_tx)

    # If featured, queue for weekly bonus review
    if tier == FEATURE_INTENT:
        feature_item = {
            "type": "feature_candidate",
            "date": date_str,
            "user": user_id,
            "hash": content_hash,
            "len": len(note_text),
            "ts": datetime.utcnow().isoformat() + "Z"
        }
        append_jsonl(f"{date_str}/{FEATURE_QUEUE_FILENAME.format(date_str)}", feature_item)

    return {
        "attestation": attestation,
        "sweep_file": files["echo"],
        "gic": gic,
        "gic_file": gic_file,
        "gic_attestation": gic_att,
    }

@app.post("/seal")
def seal(payload: Dict[str, Any]):
    date = payload["date"]
    files = today_files(date)
    node_meta = get_node_metadata()
    
    # Load
    seed, sweeps, seal_obj = load_day(date)
    
    # If caller provided the seal body now, use it & persist
    if payload.get("wins") or payload.get("blocks") or payload.get("tomorrow_intent"):
        seal_obj = {
            "type": "seal",
            "date": date,
            "wins": payload.get("wins", ""),
            "blocks": payload.get("blocks", ""),
            "tomorrow_intent": payload.get("tomorrow_intent", ""),
            "meta": {**payload.get("meta", {}), **node_meta},
            "ts": datetime.utcnow().isoformat() + "Z",
        }
        write_json(files["seal"], seal_obj)

    if not seed or not seal_obj:
        raise HTTPException(status_code=400, detail="Seed and Seal are required to build ledger")

    ledger = build_ledger_obj(date, seed, sweeps, seal_obj)
    write_json(files["ledger"], ledger)

    # Build and write day root
    try:
        root_obj = build_day_root(date, DATA_DIR)
        root_file = f"data/{date}/{date}.root.json"
        return {
            "ok": True, 
            "seal_file": files["seal"], 
            "ledger_file": files["ledger"], 
            "root_file": root_file,
            "day_root": ledger["day_root"], 
            "counts": ledger["counts"]
        }
    except FileNotFoundError as e:
        return {
            "ok": True, 
            "seal_file": files["seal"], 
            "ledger_file": files["ledger"], 
            "day_root": ledger["day_root"], 
            "counts": ledger["counts"],
            "warning": f"Day root not created: {str(e)}"
        }

# READ / VERIFY / INDEX / EXPORT ENDPOINTS
@app.get("/ledger/{date}")
def get_ledger(date: str):
    files = today_files(date)
    if not (DATA_DIR / files["ledger"]).exists():
        raise HTTPException(status_code=404, detail="No ledger for this date")
    return read_json(files["ledger"])

@app.get("/ledger/latest")
def ledger_latest():
    dates = [p.name for p in DATA_DIR.iterdir() if p.is_dir()]
    if not dates:
        raise HTTPException(status_code=404, detail="No data directory or no days yet")
    latest = sorted(dates)[-1]
    return {"date": latest, "ledger": get_ledger(latest)}

@app.get("/verify/{date}")
def verify_day(date: str):
    """Verifies the day's presence of seed/echo/seal files, returns counts, and includes GIC totals."""
    return _safe_counts_for(date)

@app.get("/export/{date}")
def export_day(date: str):
    files = today_files(date)
    out = {"date": date, "files": {}}
    for key, rel in files.items():
        if not (DATA_DIR / rel).exists():
            continue
        out["files"][rel] = read_json(rel)
    return out

@app.get("/index")
def index_all(order: str = "desc", limit: int = 100):
    """Lists days in the ledger with counts, gic.sum, and day_root."""
    dates = _list_date_dirs()
    if order.lower() == "desc":
        dates = list(reversed(dates))
    if limit and limit > 0:
        dates = dates[:limit]

    rows = [_safe_counts_for(d) for d in dates]
    return {
        "total_days": len(_list_date_dirs()),
        "returned": len(rows),
        "order": order.lower(),
        "items": rows,
    }

@app.post("/bonus/run")
def bonus_run(req: BonusRun, x_admin_key: str = Header(default="")):
    """Admin: compute weekly featured bonuses and write GIC txs."""
    ADMIN_KEY = os.environ.get("ADMIN_KEY", "")
    if not ADMIN_KEY or x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # resolve window
    if req.week == "latest":
        start_d, end_d = _latest_full_week()
    else:
        if not (req.start and req.end):
            raise HTTPException(status_code=400, detail="Provide week='latest' OR start+end")
        try:
            start_d = _date.fromisoformat(req.start)
            end_d   = _date.fromisoformat(req.end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Bad date format (YYYY-MM-DD)")

    # payout day
    if req.payout_day:
        try:
            payout_day = _date.fromisoformat(req.payout_day)
        except ValueError:
            raise HTTPException(status_code=400, detail="Bad payout_day")
    else:
        payout_day = _date.today()
    payout_str = payout_day.strftime("%Y-%m-%d")

    # parameters
    TOP_N   = max(1, req.top_n or _TOP_N)
    MIN_LEN = max(1, req.min_len or _MIN_LEN_ELIGIBLE)
    BMIN    = max(1, req.bonus_min or _BONUS_MIN)
    BMAX    = max(BMIN, req.bonus_max or _BONUS_MAX)

    # collect candidates
    cands = []
    cur = start_d
    while cur <= end_d:
        dstr = cur.strftime("%Y-%m-%d")
        qpath = _day_path(dstr) / f"{dstr}.featured_queue.jsonl"
        for r in _read_jsonl(qpath):
            L = int(r.get("len", 0) or 0)
            if L < MIN_LEN: 
                continue
            cands.append({
                "date": r.get("date", dstr),
                "user": r.get("user", "anon"),
                "hash": r.get("hash"),
                "len": L,
                "votes": int(r.get("votes", 0) or 0),
                "ts": r.get("ts"),
            })
        cur += _td(days=1)

    if not cands:
        return {"ok": True, "message": "No eligible candidates", "window": [start_d.isoformat(), end_d.isoformat()]}

    ranked = _bonus_rank(cands)
    winners = ranked[:TOP_N]

    # idempotency
    already = _already_paid_keys(payout_str)

    # payout schedule (linear spread high->low)
    span = max(1, len(winners) - 1)
    def bonus_for(i: int) -> int:
        if len(winners) == 1:
            return (BMIN + BMAX) // 2
        frac = 1 - (i / span)
        return int(round(BMIN + frac * (BMAX - BMIN)))

    # write gic txs
    payout_file = _day_path(payout_str) / f"{payout_str}.gic.jsonl"
    wrote = 0
    dry_dumps = []

    for i, w in enumerate(winners):
        key = (str(w["user"]), str(w["hash"]), _BONUS_REASON)
        if key in already:
            continue
        tx = {
            "type": "gic_tx",
            "date": payout_str,
            "user": w["user"],
            "amount": bonus_for(i),
            "reason": _BONUS_REASON,
            "hash": w["hash"],
            "source_date": w["date"],
            "score": w.get("score"),
            "votes": w.get("votes", 0),
            "ts": _dt.utcnow().isoformat() + "Z",
        }
        if req.dry:
            dry_dumps.append(tx)
        else:
            _append_jsonl(payout_file, tx)
            wrote += 1

    return {
        "ok": True,
        "window": [start_d.isoformat(), end_d.isoformat()],
        "payout_day": payout_str,
        "eligible": len(cands),
        "winners": len(winners),
        "written": wrote,
        "dry": req.dry,
        "preview": dry_dumps if req.dry else None,
        "file": str(payout_file),
    }
    










