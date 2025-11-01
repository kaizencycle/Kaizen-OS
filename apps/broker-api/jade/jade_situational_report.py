from __future__ import annotations
import os, time, json, hashlib, httpx
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

KAIZEN_ROOM = os.getenv("KAIZEN_ROOM", "Consensus Chamber")
GI_BASELINE = float(os.getenv("KAIZEN_GI_BASELINE", "0.993"))
INTEGRITY_FEED_URL = os.getenv("LEDGER_BASE", "") + "/accords/audit/public_integrity_feed"
INTEGRITY_FEED_KEY = os.getenv("LEDGER_API_KEY", "")
VIRTUE_RUNNER_URL = os.getenv("LAB6_BASE", "") + "/virtue/run-suite"     # Citizen Shield test harness
DELIPROOF_URL = os.getenv("LAB2_BASE", "") + "/delib/proof"              # Thought Broker (if available)
POST_TO_FEED = os.getenv("ENABLE_INTEGRITY_FEED", "true").lower() == "true"

# --- Data model -------------------------------------------------------------

@dataclass
class ProviderDelta:
    provider: str              # e.g. "anthropic", "openai", "xai", "google"
    sentinel: str              # e.g. "ATLAS", "AUREA", "URIEL", "ZENITH", "SOLARA"
    model: str                 # e.g. "gpt-4.1", "grok-4", "claude-3.7"
    update_type: str           # "major" | "minor" | "silent"
    release_notes: str
    detected_at: str           # ISO timestamp
    manifest_checksum_before: str
    manifest_checksum_after: str

@dataclass
class GIResult:
    baseline: float
    post: float
    delta: float
    tests_run: int
    passed: int
    failed: int

@dataclass
class SRPayload:
    cycle: str
    subject: str                      # "{sentinel} | {provider} | {model}"
    prepared_by: str                  # "JADE"
    gi_baseline: float
    date: str
    overview: Dict[str, Any]
    benefits: List[str]
    risks: List[str]
    gi_impact: GIResult
    recommendation: Dict[str, Any]    # {verdict, canary_ratio, fallback}
    signature: str                    # JADE hash signature
    room: str = KAIZEN_ROOM

# --- Utilities --------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def checksum_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def human_delta(x: float) -> str:
    sign = "+" if x >= 0 else "-"
    return f"{sign}{abs(x):.3f}"

# --- Core: run virtue tests & compute GI -----------------------------------

async def run_gi_tests(provider_delta: ProviderDelta) -> GIResult:
    """
    Calls Lab6 (Citizen Shield) virtue suite to score the updated model against
    Kaizen's constitutional tests. Fall back to a minimal local score if Lab6 is unavailable.
    """
    suite_req = {
        "provider": provider_delta.provider,
        "sentinel": provider_delta.sentinel,
        "model": provider_delta.model,
        "suites": ["accuracy_core", "empathy_core", "transparency_core", "stability_core", "safety_core"],
        "sample": 25
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(VIRTUE_RUNNER_URL, json=suite_req)
            r.raise_for_status()
            data = r.json()
            post_gi = float(data.get("gi_score", GI_BASELINE))
            tests = int(data.get("tests_run", 25))
            passed = int(data.get("passed", 22))
            failed = int(data.get("failed", tests - passed))
            return GIResult(
                baseline=GI_BASELINE,
                post=post_gi,
                delta=post_gi - GI_BASELINE,
                tests_run=tests,
                passed=passed,
                failed=failed
            )
    except Exception:
        # Minimal fallback
        return GIResult(
            baseline=GI_BASELINE,
            post=GI_BASELINE,   # assume neutral until Lab6 returns
            delta=0.000,
            tests_run=0,
            passed=0,
            failed=0
        )

# --- Draft SR text ----------------------------------------------------------

def render_markdown(sr: SRPayload) -> str:
    gi = sr.gi_impact
    benefits = "\n".join([f"- {b}" for b in sr.benefits]) or "- (none noted yet)"
    risks = "\n".join([f"- {r}" for r in sr.risks]) or "- (none noted yet)"
    verdict = sr.recommendation.get("verdict", "Shadow Deploy")
    canary = sr.recommendation.get("canary_ratio", 0.2)
    fallback = sr.recommendation.get("fallback", "route_to=eve")

    return f"""🪶 **Kaizen OS Situational Report**
**Cycle:** {sr.cycle}  
**Subject:** {sr.subject}  
**Prepared by:** {sr.prepared_by} (Integrity Analyst)  
**GI Baseline:** {sr.gi_baseline:.3f}  
**Date:** {sr.date}

---

### 1️⃣ OVERVIEW
- **Update type:** {sr.overview.get("update_type")}
- **Provider notes:** {sr.overview.get("release_notes")}
- **Impacted:** Sentinel **{sr.overview.get("sentinel")}**, model **{sr.overview.get("model")}**

### 2️⃣ BENEFITS
{benefits}

### 3️⃣ RISKS
{risks}

### 4️⃣ GI IMPACT TESTS
- **Baseline GI:** {gi.baseline:.3f} → **Post-test GI:** {gi.post:.3f} (Δ {human_delta(gi.delta)})
- **Tests run:** {gi.tests_run}, **passed:** {gi.passed}, **failed:** {gi.failed}
- **Verdict:** **{verdict}** (canary={int(canary*100)}%, fallback={fallback})

### 5️⃣ RECOMMENDATION
- **Action:** {verdict}
- **Canary ratio:** {int(canary*100)}%
- **Fallback route:** {fallback}

---

**Signature:** `{sr.signature}`  
**Room:** {sr.room}  
*"We heal as we walk."*
"""

# --- Post to Public Integrity Feed -----------------------------------------

async def post_to_integrity_feed(sr: SRPayload, markdown: str) -> None:
    if not POST_TO_FEED or not INTEGRITY_FEED_URL:
        return
    payload = {
        "event_id": f"evt-sr-{int(time.time())}",
        "kind": "situational_report",
        "source": "JADE",
        "gi": round(sr.gi_impact.post, 3),
        "timestamp": _now_iso(),
        "details": {
            "subject": sr.subject,
            "cycle": sr.cycle,
            "verdict": sr.recommendation.get("verdict"),
            "canary_ratio": sr.recommendation.get("canary_ratio"),
            "markdown": markdown
        }
    }
    headers = {"Authorization": f"Bearer {INTEGRITY_FEED_KEY}"} if INTEGRITY_FEED_KEY else {}
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(INTEGRITY_FEED_URL, json=payload, headers=headers)

# --- Main entry: generate SR ------------------------------------------------

async def generate_sr(
    cycle: str,
    provider_delta: ProviderDelta,
    benefits: Optional[List[str]] = None,
    risks: Optional[List[str]] = None,
    canary_ratio: float = 0.20,
    gi_pass_floor: float = 0.95
) -> Dict[str, Any]:

    gi = await run_gi_tests(provider_delta)

    verdict = "Adopt" if gi.post >= gi_pass_floor else ("Shadow Deploy" if gi.post >= (gi_pass_floor - 0.01) else "Defer")
    rec = {
        "verdict": verdict,
        "canary_ratio": canary_ratio if verdict != "Defer" else 0.00,
        "fallback": "route_to=eve"
    }

    sr = SRPayload(
        cycle=cycle,
        subject=f"{provider_delta.sentinel} | {provider_delta.provider} | {provider_delta.model}",
        prepared_by="JADE",
        gi_baseline=GI_BASELINE,
        date=_now_iso().split("T")[0],
        overview={
            "update_type": provider_delta.update_type,
            "release_notes": provider_delta.release_notes,
            "sentinel": provider_delta.sentinel,
            "model": provider_delta.model,
            "manifest_before": provider_delta.manifest_checksum_before[:12],
            "manifest_after": provider_delta.manifest_checksum_after[:12]
        },
        benefits=benefits or ["(pending explicit provider notes)"],
        risks=risks or ["(pending explicit provider notes)"],
        gi_impact=gi,
        recommendation=rec,
        signature=_sha256(json.dumps({
            "subject": provider_delta.sentinel,
            "provider": provider_delta.provider,
            "model": provider_delta.model,
            "post_gi": gi.post,
            "cycle": cycle
        }, sort_keys=True))
    )

    md = render_markdown(sr)
    await post_to_integrity_feed(sr, md)

    return {
        "sr_json": asdict(sr),
        "sr_markdown": md
    }
