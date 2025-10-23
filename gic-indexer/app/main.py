from fastapi import FastAPI, Query
from pydantic import BaseModel
from sqlitedict import SqliteDict
from dateutil import parser as dtp
import os, httpx, json, math, time
from collections import defaultdict

LAB4 = os.getenv("LAB4_BASE", "").rstrip("/")
POLICY_PATH = os.getenv("POLICY_PATH", "./policy.yaml")
INDEX_DB_PATH = os.getenv("INDEX_DB", "./data/index.db")

app = FastAPI(title="GIC Indexer", version="0.1.0")
os.makedirs(os.path.dirname(INDEX_DB_PATH), exist_ok=True)

def load_policy():
    import yaml
    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

POL = load_policy()

def epoch_of(ts_iso):
    # 10-min epochs
    t = int(dtp.isoparse(ts_iso).timestamp())
    return t // POL["rewards"]["epoch_seconds"]

def day_of(ts_iso):
    return dtp.isoparse(ts_iso).date().isoformat()

def reward_for(event):
    base = 0
    if event["type"] == "sweep":
        vis = event.get("meta", {}).get("visibility", "private")
        base = POL["rewards"]["per_event_baseline"]["reflection_private"]
        if vis == "public":
            base = POL["rewards"]["per_event_baseline"]["reflection_public"]
    elif event["type"] == "seed":
        base = POL["rewards"]["per_event_baseline"]["seed"]
    elif event["type"] == "seal":
        base = POL["rewards"]["per_event_baseline"]["seal"]
    return base

def address_for(event):
    # TEMP: derive from companion_id or a supplied addr; replace with real addr later
    cmp_id = (event.get("meta", {}) or {}).get("companion_id") or "anon"
    return f"cmp::{cmp_id}"

@app.get("/health")
def health():
    return {"ok": True, "ts": int(time.time())}

@app.post("/recompute")
def recompute(from_date: str = Query(None), to_date: str = Query(None)):
    """
    Pulls day ledgers from Lab4 and recomputes balances.
    """
    done = []
    with SqliteDict(INDEX_DB_PATH, autocommit=True) as db:
        db["balances"] = db.get("balances", {})
        db["events"] = db.get("events", {})

        # naive: query the last N days from Lab4 (add your own /index endpoint later)
        # here we assume you know which dates to pull; or maintain a pointer
        candidate_dates = []
        if from_date and to_date:
            start = dtp.isoparse(from_date).date()
            end = dtp.isoparse(to_date).date()
            d = start
            while d <= end:
                candidate_dates.append(d.isoformat())
                d = dtp.isoparse((d + (dtp.relativedelta(days=+1))).isoformat()).date()
        else:
            # fallback: try today only
            candidate_dates.append(time.strftime("%Y-%m-%d"))

        balances = defaultdict(int)
        events = db["events"]

        for date_str in candidate_dates:
            try:
                # pull aggregated day JSON (you already printed this structure in lab4)
                url = f"{LAB4}/ledger/{date_str}"
                r = httpx.get(url, timeout=10.0)
                if r.status_code != 200:
                    continue
                day = r.json()
            except Exception:
                continue

            # apply events
            echo = day["files"].get(f"{date_str}.echo.json", [])
            seed = day["files"].get(f"{date_str}.seed.json")
            seal = day["files"].get(f"{date_str}.seal.json")

            if seed:
                ev = seed | {"type": "seed"}
                amt = reward_for(ev)
                addr = address_for(ev)
                balances[addr] += amt
                events.setdefault(date_str, []).append({"addr": addr, "amt": amt, "ev": "seed", "ts": seed["ts"]})

            for e in echo:
                ev = e | {"type": "sweep"}
                amt = reward_for(ev)
                addr = address_for(ev)
                balances[addr] += amt
                events.setdefault(date_str, []).append({"addr": addr, "amt": amt, "ev": "sweep", "ts": e["ts"]})

            if seal:
                ev = seal | {"type": "seal"}
                amt = reward_for(ev)
                addr = address_for(ev)
                balances[addr] += amt
                events.setdefault(date_str, []).append({"addr": addr, "amt": amt, "ev": "seal", "ts": seal["ts"]})

            done.append(date_str)

        # enforce per-user daily cap
        cap = POL["rewards"]["daily_user_cap_gic"]
        # (Simple demo: not implemented per-day-per-user here; add when you promote to prod.)

        # save
        db["events"] = events
        # merge balances
        b = db["balances"]
        for k,v in balances.items():
            b[k] = b.get(k, 0) + v
        db["balances"] = b

    return {"ok": True, "days": done}

@app.get("/balance/{addr}")
def balance(addr: str):
    with SqliteDict(INDEX_DB_PATH, autocommit=False) as db:
        b = db.get("balances", {})
        return {"addr": addr, "balance": int(b.get(addr, 0))}

@app.get("/earn/events")
def earn_events(date: str | None = None):
    with SqliteDict(INDEX_DB_PATH, autocommit=False) as db:
        ev = db.get("events", {})
        if date:
            return {"date": date, "events": ev.get(date, [])}
        return {"dates": list(ev.keys())}

@app.get("/policy")
def get_policy():
    return POL

@app.get("/stats")
def stats():
    with SqliteDict(INDEX_DB_PATH, autocommit=False) as db:
        balances = db.get("balances", {})
        events = db.get("events", {})
        
        total_balance = sum(balances.values())
        total_events = sum(len(day_events) for day_events in events.values())
        
        return {
            "total_balance": total_balance,
            "total_events": total_events,
            "unique_addresses": len(balances),
            "days_processed": len(events),
            "policy_version": POL.get("version", "unknown")
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
