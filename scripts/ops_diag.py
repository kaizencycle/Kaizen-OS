#!/usr/bin/env python3
import os, sys, json, hmac, hashlib, requests, pathlib

SECRET = os.getenv("OPS_AGENT_SECRET")
BASE   = os.getenv("OPS_AGENT_URL", "").rstrip("/")
DIAG_FILE = os.getenv("OPS_DIAG_FILE", "ops_requests/diagnostic.json")

def hmac_hex(secret: str, data: bytes) -> str:
    return hmac.new(secret.encode(), data, hashlib.sha256).hexdigest()

def main():
    if not SECRET:
        print("Missing OPS_AGENT_SECRET", file=sys.stderr)
        sys.exit(1)
    if not BASE:
        print("Missing OPS_AGENT_URL", file=sys.stderr)
        sys.exit(1)

    p = pathlib.Path(DIAG_FILE)
    if not p.exists():
        # default fallback diagnostic if file absent
        payload = {"name":"docker_ps","args":[]}
    else:
        try:
            payload = json.loads(p.read_text())
        except Exception as e:
            print(f"Failed to read diagnostic file: {e}", file=sys.stderr)
            sys.exit(1)

    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    signature = hmac_hex(SECRET, raw)

    url = f"{BASE}/diagnostics/run"
    try:
        r = requests.post(url, headers={
            "Content-Type":"application/json",
            "X-Approval-Signature": signature
        }, data=raw, timeout=30)
        ok = r.ok
        try:
            resp = r.json()
        except Exception:
            resp = {"text": r.text}
    except Exception as e:
        ok = False
        resp = {"error": str(e)}

    # Write markdown result
    lines = []
    emoji = ":mag_right:" if ok and resp.get("ok") else ":warning:"
    lines.append(f"{emoji} **Diagnostics** → `{payload['name']} {payload.get('args',[])}`")
    lines.append("")
    lines.append("<details><summary>details</summary>")
    lines.append("")
    lines.append("```json")
    lines.append(json.dumps(resp, indent=2))
    lines.append("```")
    lines.append("")
    lines.append("</details>")

    with open("OPS_DIAG_RESULT.md","w") as f:
        f.write("\n".join(lines))

    if not (ok and resp.get("ok")):
        sys.exit(2)

if __name__ == "__main__":
    main()
