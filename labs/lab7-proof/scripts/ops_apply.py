#!/usr/bin/env python3
import os, sys, json, hmac, hashlib, requests, pathlib, time

SECRET = os.getenv("OPS_AGENT_SECRET")
BASE   = os.getenv("OPS_AGENT_URL", "").rstrip("/")
ACTION_FILE = os.getenv("OPS_ACTION_FILE", "ops_requests/pending.json")

def hmac_hex(secret: str, data: bytes) -> str:
    return hmac.new(secret.encode(), data, hashlib.sha256).hexdigest()

def token_for(payload: dict, secret: str) -> str:
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    return hmac_hex(secret, body)

def main():
    out_md = []
    if not SECRET:
        print("Missing OPS_AGENT_SECRET", file=sys.stderr)
        sys.exit(1)
    if not BASE:
        print("Missing OPS_AGENT_URL", file=sys.stderr)
        sys.exit(1)

    p = pathlib.Path(ACTION_FILE)
    if not p.exists():
        print(f"No action file found at {ACTION_FILE}; skipping.", file=sys.stderr)
        # produce a note so the workflow can comment
        with open("OPS_APPLY_RESULT.md","w") as f:
            f.write(f":grey_question: No action file (`{ACTION_FILE}`) found; nothing to apply.\n")
        return

    try:
        data = json.loads(p.read_text())
    except Exception as e:
        print(f"Failed to read action file: {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(data, dict) or "name" not in data or "args" not in data:
        print("Action file must be JSON: {\"name\": str, \"args\": list}", file=sys.stderr)
        sys.exit(1)

    payload = {"name": data["name"], "args": data.get("args", [])}
    # Approval token over canonical payload
    token = token_for(payload, SECRET)
    body = {**payload, "approval_token": token}
    raw = json.dumps(body, separators=(",", ":"), sort_keys=True).encode()
    signature = hmac_hex(SECRET, raw)

    url = f"{BASE}/actions/apply"
    try:
        r = requests.post(url, headers={
            "Content-Type":"application/json",
            "X-Approval-Signature": signature
        }, data=raw, timeout=30)
        ok = r.ok
        resp = {}
        try:
            resp = r.json()
        except Exception:
            resp = {"text": r.text}
    except Exception as e:
        ok = False
        resp = {"error": str(e)}

    status_emoji = ":white_check_mark:" if ok and resp.get("ok") else ":x:"
    out_md.append(f"{status_emoji} **Ops apply** → `{payload['name']} {payload['args']}`")
    out_md.append("")
    out_md.append("<details><summary>details</summary>")
    out_md.append("")
    out_md.append("```json")
    out_md.append(json.dumps(resp, indent=2))
    out_md.append("```")
    out_md.append("")
    out_md.append("</details>")

    with open("OPS_APPLY_RESULT.md","w") as f:
        f.write("\n".join(out_md))

    # exit nonzero if apply failed
    if not (ok and resp.get("ok")):
        sys.exit(2)

if __name__ == "__main__":
    main()
