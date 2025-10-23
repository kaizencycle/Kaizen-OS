#!/usr/bin/env python3
import os, time, json, hashlib, pathlib, sys
from datetime import datetime, timezone, timedelta

import requests

# -------- Config (env or defaults) --------
SERVICES = {
    "Lab4":       os.getenv("LAB4_URL",       "https://hive-api-2le8.onrender.com/health"),
    "Lab6":       os.getenv("LAB6_URL",       "https://lab6-proof-api.onrender.com/health"),
    "CivicLedger":os.getenv("LEDGER_URL",     "https://civic-protocol-core-ledger.onrender.com/health"),
    "GICIndexer": os.getenv("GIC_URL",        "https://gic-indexer.onrender.com/health"),
    "Lab7":       os.getenv("LAB7_URL",       "https://lab7-proof.onrender.com/health"),
}

TIMEOUT_SEC     = int(os.getenv("TIMEOUT_SEC", "10"))
RETRY_COUNT     = int(os.getenv("RETRY_COUNT", "1"))      # quick retry per service
INTERVAL_SEC    = int(os.getenv("INTERVAL_SEC", "300"))    # 300s = 5min if you run loop mode
STATE_PATH      = os.getenv("STATE_PATH", "./sentinel_state.json")
LOG_DIR         = os.getenv("LOG_DIR", "./sentinel_logs")
ALERT_THRESHOLD = int(os.getenv("ALERT_THRESHOLD", "2"))   # services down to trigger alert
ALERT_WINDOW_M  = int(os.getenv("ALERT_WINDOW_MIN", "15")) # must persist ≥ 15 minutes
ALERT_WEBHOOK   = os.getenv("ALERT_WEBHOOK", "")           # optional Slack/webhook URL

# Optional: auto-post attestation to Ledger (set URL/token if you want)
ATTEST_POST_URL   = os.getenv("ATTEST_POST_URL", "")       # e.g. https://civic-protocol-core-ledger.onrender.com/ledger/attest
ATTEST_BEARER     = os.getenv("ATTEST_BEARER", "")         # token if needed

pathlib.Path(LOG_DIR).mkdir(parents=True, exist_ok=True)

def utcnow_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def http_get(url: str) -> tuple[str, float | None, str | None]:
    """Return (status, latency_ms, error) where status in {'UP','DOWN'}."""
    t0 = time.perf_counter()
    try:
        r = requests.get(url, timeout=TIMEOUT_SEC)
        latency = round((time.perf_counter() - t0) * 1000, 2)
        if r.ok:
            return "UP", latency, None
        else:
            return "DOWN", latency, f"HTTP {r.status_code}"
    except Exception as e:
        return "DOWN", None, str(e)

def check_once() -> dict:
    summary = {}
    for name, url in SERVICES.items():
        status, latency, err = http_get(url)
        if status == "DOWN" and RETRY_COUNT > 0:
            # one quick retry
            status2, latency2, err2 = http_get(url)
            if status2 == "UP":
                status, latency, err = status2, latency2, None
        summary[name] = {"status": status, "latency_ms": latency, "error": err, "url": url}
    return summary

def load_state() -> dict:
    if not os.path.exists(STATE_PATH):
        return {"alerts": []}
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"alerts": []}

def save_state(state: dict):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def should_alert(state: dict, now: datetime, down_count: int) -> bool:
    # Maintain a rolling window of "down_count >= threshold" spans.
    # If sustained for ALERT_WINDOW_M minutes → alert.
    window_start_iso = state.get("window_start")
    if down_count >= ALERT_THRESHOLD:
        if not window_start_iso:
            state["window_start"] = now.isoformat()
            return False
        else:
            start = datetime.fromisoformat(window_start_iso)
            return (now - start) >= timedelta(minutes=ALERT_WINDOW_M)
    else:
        state["window_start"] = None
        return False

def post_webhook(message: str, payload: dict | None = None):
    if not ALERT_WEBHOOK:
        return
    try:
        data = {"text": message, "payload": payload or {}}
        requests.post(ALERT_WEBHOOK, json=data, timeout=10)
    except Exception:
        pass

def write_log(record: dict):
    # Append JSON line
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    p = pathlib.Path(LOG_DIR) / f"health_{day}.jsonl"
    with open(p, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, separators=(",", ":")) + "\n")

def build_attestation(summary: dict) -> dict:
    ts = utcnow_iso()
    att = {
        "timestamp": ts,
        "services": {k: {"status": v["status"], "latency_ms": v["latency_ms"]} for k, v in summary.items()},
    }
    # include a deterministic fingerprint over the statuses
    att_str = json.dumps(att, sort_keys=True)
    att["fingerprint_sha256"] = sha256_hex(att_str)
    return att

def maybe_post_attestation(att: dict):
    if not ATTEST_POST_URL:
        return
    headers = {"Content-Type": "application/json"}
    if ATTEST_BEARER:
        headers["Authorization"] = f"Bearer {ATTEST_BEARER}"
    try:
        r = requests.post(ATTEST_POST_URL, headers=headers, json=att, timeout=15)
        att["post_result"] = {"status": r.status_code, "text": r.text[:200]}
    except Exception as e:
        att["post_result"] = {"status": "error", "text": str(e)}

def run_once():
    now = datetime.now(timezone.utc)
    summary = check_once()
    down = [k for k, v in summary.items() if v["status"] == "DOWN"]
    rec = {
        "timestamp": now.isoformat(),
        "summary": summary,
        "down_count": len(down),
        "down_list": down,
    }
    write_log(rec)

    # Build attestation
    att = build_attestation(summary)
    maybe_post_attestation(att)

    # Persist window + alert decision
    state = load_state()
    alert = should_alert(state, now, len(down))
    save_state(state)

    # Print tight human summary
    lines = ["Health Sentinel Summary:"]
    for name, v in summary.items():
        lines.append(f"- {name}: {v['status']} | latency={v['latency_ms']} ms | err={v['error']}")
    lines.append(f"Attestation fingerprint: {att['fingerprint_sha256']}")
    print("\n".join(lines))

    # Alert if needed
    if alert:
        msg = f"[ALERT] {len(down)} services DOWN for ≥{ALERT_WINDOW_M}m: {', '.join(down)}"
        print(msg)
        post_webhook(msg, {"down": down, "attestation": att})

    # Also dump the attestation JSON for sealing on demand
    att_path = pathlib.Path(LOG_DIR) / f"attestation_{now.strftime('%Y%m%dT%H%M%S')}.json"
    with open(att_path, "w", encoding="utf-8") as f:
        json.dump(att, f, indent=2)
    print(f"Attestation saved → {att_path}")

if __name__ == "__main__":
    # Single run (default) or loop if "loop" arg passed
    loop = len(sys.argv) > 1 and sys.argv[1].lower() == "loop"
    if not loop:
        run_once()
    else:
        while True:
            run_once()
            time.sleep(INTERVAL_SEC)
