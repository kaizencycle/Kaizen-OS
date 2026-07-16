#!/usr/bin/env python3
"""
C-373 Phase 1 — HMAC-signed OAA sentinel broker request for CI.

Broker unreachable → synthesize SKIPPED verdicts for every requested sentinel
with skip_reason `oaa_unreachable HTTP <code>` (or transport detail), write
verdicts file, exit 0. Absence of the witness is recorded; merge is not blocked.

Exit non-zero only for local preflight failures (missing context files).
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

PROMPT_VERSION = "c373-v1"
DEFAULT_AGENT_ID = "mobius-ci-sentinel"
DEFAULT_BROKER_URL = "https://oaa-api-library.onrender.com/v1/sentinel/review"

META_PATH = Path("/tmp/pr.meta.json")
DIFF_PATH = Path("/tmp/pr.diff")
FILES_PATH = Path("/tmp/changed_files.txt")
VERDICTS_PATH = Path(os.environ.get("SENTINEL_VERDICTS_PATH", "/tmp/oaa_verdicts.json"))


def _read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except FileNotFoundError as exc:
        raise SystemExit(f"Missing required context file: {path}") from exc


def _context_hash(meta: dict[str, Any], files: str, diff: str) -> str:
    payload = json.dumps(
        {"meta": meta, "files": files, "diff": diff},
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _parse_sentinels(raw: str) -> list[str]:
    names = [s.strip().lower() for s in raw.split(",") if s.strip()]
    if not names:
        raise SystemExit("SENTINELS env must list at least one sentinel (aurea, atlas)")
    return names


def _skipped_verdict(sentinel: str, reason: str) -> dict[str, Any]:
    display = sentinel.upper()
    return {
        "verdict": "skipped",
        "skip_reason": reason,
        "blocking": [],
        "non_blocking": [],
        "summary": f"{display} review skipped — OAA broker unreachable (witness absence, not FAIL).",
        "attestation": None,
    }


def _broker_verdict_to_ci(raw: dict[str, Any]) -> dict[str, Any]:
    verdict = str(raw.get("verdict", "fail")).lower()
    out: dict[str, Any] = {
        "verdict": verdict,
        "blocking": raw.get("blocking") or [],
        "non_blocking": raw.get("non_blocking") or [],
        "summary": raw.get("summary") or "",
    }
    if raw.get("skip_reason"):
        out["skip_reason"] = raw["skip_reason"]
    if raw.get("attestation"):
        out["attestation"] = raw["attestation"]
    return out


def _sign_request(body: dict[str, Any], secret: str, agent_id: str) -> tuple[str, dict[str, str]]:
    timestamp = str(int(time.time()))
    raw = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
    payload = f"{timestamp}.{raw}"
    signature = hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    headers = {
        "Content-Type": "application/json",
        "x-oaa-agent": agent_id,
        "x-oaa-timestamp": timestamp,
        "x-oaa-signature": signature,
    }
    return raw, headers


def _post_broker(url: str, raw_body: str, headers: dict[str, str], timeout: float) -> tuple[int, str]:
    req = urllib.request.Request(url, data=raw_body.encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body
    except urllib.error.URLError as exc:
        raise OSError(str(exc.reason)) from exc


def _write_verdicts(verdicts: dict[str, dict[str, Any]]) -> None:
    VERDICTS_PATH.write_text(json.dumps(verdicts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote verdicts to {VERDICTS_PATH}")


def _synthesize_unreachable(sentinels: list[str], reason: str) -> dict[str, dict[str, Any]]:
    return {name: _skipped_verdict(name, reason) for name in sentinels}


def main() -> int:
    sentinels = _parse_sentinels(os.environ.get("SENTINELS", ""))
    broker_url = os.environ.get("OAA_BROKER_URL", DEFAULT_BROKER_URL).strip()
    agent_id = os.environ.get("OAA_AGENT_ID", DEFAULT_AGENT_ID).strip()
    hmac_secret = os.environ.get("MOBIUS_CI_SENTINEL_HMAC_KEY", "").strip()
    timeout = float(os.environ.get("OAA_BROKER_TIMEOUT_SEC", "180"))

    meta = json.loads(_read_text(META_PATH))
    files = _read_text(FILES_PATH)
    diff = _read_text(DIFF_PATH)
    context_hash = _context_hash(meta, files, diff)

    if not hmac_secret:
        reason = "MOBIUS_CI_SENTINEL_HMAC_KEY not configured"
        print(f"::warning::{reason} — synthesizing SKIPPED for all requested sentinels")
        _write_verdicts(_synthesize_unreachable(sentinels, reason))
        return 0

    body = {
        "task": "pr_sentinel_review",
        "sentinels": sentinels,
        "tier": int(os.environ.get("OAA_TIER", "1")),
        "policy_ref": os.environ.get("OAA_POLICY_REF", "base"),
        "context_hash": context_hash,
        "context": {"meta": meta, "files": files, "diff": diff},
        "prompt_version": PROMPT_VERSION,
    }

    raw_body, headers = _sign_request(body, hmac_secret, agent_id)

    try:
        status, response_text = _post_broker(broker_url, raw_body, headers, timeout)
    except OSError as exc:
        reason = f"oaa_unreachable transport {exc}"
        print(f"::warning::{reason}")
        _write_verdicts(_synthesize_unreachable(sentinels, reason))
        return 0

    if status < 200 or status >= 300:
        reason = f"oaa_unreachable HTTP {status}"
        print(f"::warning::{reason}")
        if response_text:
            print(response_text[:800])
        _write_verdicts(_synthesize_unreachable(sentinels, reason))
        return 0

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        reason = "oaa_unreachable invalid JSON response"
        print(f"::warning::{reason}")
        _write_verdicts(_synthesize_unreachable(sentinels, reason))
        return 0

    by_sentinel: dict[str, dict[str, Any]] = {}
    for item in data.get("verdicts") or []:
        name = str(item.get("sentinel", "")).lower()
        if name:
            by_sentinel[name] = _broker_verdict_to_ci(item)

    verdicts: dict[str, dict[str, Any]] = {}
    for name in sentinels:
        if name in by_sentinel:
            verdicts[name] = by_sentinel[name]
        else:
            verdicts[name] = _skipped_verdict(name, "oaa_unreachable missing sentinel in broker response")

    _write_verdicts(verdicts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
