#!/usr/bin/env python3
import os, sys, json, hmac, hashlib

SECRET = os.getenv("OPS_AGENT_SECRET", "CHANGE_ME")

def sign_body(raw: bytes) -> str:
    return hmac.new(SECRET.encode(), raw, hashlib.sha256).hexdigest()

def token_for(payload: dict) -> str:
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    return hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()

if __name__ == "__main__":
    import argparse, json
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", help="path to JSON body to sign", required=True)
    ap.add_argument("--token", action="store_true", help="print approval token for body")
    args = ap.parse_args()
    raw = open(args.file, "rb").read()
    print("X-Approval-Signature:", sign_body(raw))
    if args.token:
        payload = json.loads(raw.decode())
        print("approval_token:", token_for(payload))

