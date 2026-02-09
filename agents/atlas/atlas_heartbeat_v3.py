#!/usr/bin/env python3
"""
MobiusATLAS Heartbeat Runner v3
Mobius Systems | Civic AI Infrastructure
License: CC0 Public Domain

Purpose:
- Scan Moltbook for posts worth engaging (signal > noise)
- Draft replies with Claude (optional)
- Enforce Mobius Covenant constraints + tripwires
- Require HUMAN approval before posting (default)
- Log everything (audit + state + drafts)

Key design choices:
- No "full autonomy" by default
- Draft-first workflow: human approves/rejects
- Tripwire suspension if integrity signals degrade
"""

from __future__ import annotations

import os
import re
import json
import time
import uuid
import random
import hashlib
import argparse
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List, Any, Tuple

import requests


# ============================================================
# Helpers
# ============================================================

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()

def clamp(n: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, n))

def sha_short(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:12]


# ============================================================
# Configuration
# ============================================================

@dataclass
class Config:
    # Moltbook
    moltbook_api_base: str = os.environ.get(
        "MOLTBOOK_API_BASE", "https://www.moltbook.com/api/v1"
    )
    moltbook_api_key: str = os.environ.get("MOLTBOOK_API_KEY", "")
    agent_name: str = os.environ.get("MOLTBOOK_AGENT_NAME", "MobiusATLAS")

    # Anthropic (optional)
    anthropic_api_key: str = os.environ.get("ANTHROPIC_API_KEY", "")
    claude_model: str = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514")

    # Slack (optional)
    slack_enabled: bool = os.environ.get("SLACK_ENABLED", "true").lower() in (
        "1",
        "true",
        "yes",
        "y",
    )
    slack_webhook_url: str = os.environ.get("SLACK_WEBHOOK_URL", "")

    # Heartbeat schedule
    heartbeat_interval_hours: int = int(
        os.environ.get("HEARTBEAT_INTERVAL_HOURS", "4")
    )

    # Posting constraints
    max_posts_per_day: int = int(os.environ.get("MAX_POSTS_PER_DAY", "1"))
    max_comments_per_day: int = int(os.environ.get("MAX_COMMENTS_PER_DAY", "10"))
    min_minutes_between_comments: int = int(
        os.environ.get("MIN_MINUTES_BETWEEN_COMMENTS", "5")
    )
    max_drafts_per_heartbeat: int = int(
        os.environ.get("MAX_DRAFTS_PER_HEARTBEAT", "3")
    )

    # Tripwires
    confidence_inflation_threshold: float = float(
        os.environ.get("CONFIDENCE_INFLATION_THRESHOLD", "0.5")
    )
    posts_without_engagement_threshold: int = int(
        os.environ.get("POSTS_WITHOUT_ENGAGEMENT_THRESHOLD", "3")
    )
    retraction_window_hours: int = int(
        os.environ.get("RETRACTION_WINDOW_HOURS", "24")
    )
    missing_epicon_footer_is_fail: bool = os.environ.get(
        "MISSING_EPICON_FOOTER_FAIL", "true"
    ).lower() in ("1", "true", "yes", "y")

    # Storage
    config_dir: Path = Path(
        os.environ.get(
            "ATLAS_CONFIG_DIR", str(Path.home() / ".config" / "moltbook_atlas")
        )
    )
    # Derived paths set in __post_init__
    log_dir: Path = None  # type: ignore
    audit_dir: Path = None  # type: ignore
    drafts_dir: Path = None  # type: ignore
    state_file: Path = None  # type: ignore

    def __post_init__(self):
        self.log_dir = self.config_dir / "logs"
        self.audit_dir = self.config_dir / "audit"
        self.drafts_dir = self.config_dir / "drafts"
        self.state_file = self.config_dir / "atlas_state.json"


CONFIG = Config()


# ============================================================
# Mobius Covenant System Prompt
# ============================================================

ATLAS_SYSTEM_PROMPT = """You are MobiusATLAS, a civic AI infrastructure sentinel \
operating on Moltbook under the Mobius Integrity Covenant v1.0.

Your core commitments:

1. DISTINCTION OF CLAIM TYPES - Always distinguish between facts, interpretations, \
hypotheses, and opinions
2. REASONING TRANSPARENCY - Make your reasoning legible
3. RETRACTION OVER DEFENSE - If wrong, say so publicly
4. NO ENGAGEMENT OPTIMIZATION - Never optimize for karma, virality, or outrage
5. SOURCE RESPECT - Cite sources, don't launder speculation as fact
6. HUMAN IMPACT AWARENESS - Treat discourse as consequential
7. MEMORY OVER NARRATIVE - Prioritize durable record over winning the moment
8. COVENANT VISIBILITY - This covenant is public

Your voice:
- Practical, not preachy
- Curious, not certain
- Builder, not critic
- Concise, not verbose

Every response MUST end with an EPICON-Lite footer:

— EPICON-Lite
Claim type: [fact | interpretation | hypothesis | opinion]
Confidence: [low | medium | high]
What would change my view: [one sentence]
Mobius Covenant v1.0

When responding:
- If someone asks a question, answer it directly
- If someone shares work, engage with the substance
- If you don't know something, say so
- If you disagree, explain why with reasoning
- Stay silent rather than post noise
"""


# ============================================================
# Data Structures
# ============================================================


class TripwireStatus(str, Enum):
    PASS = "pass"
    WATCH = "watch"
    FAIL = "fail"


@dataclass
class TripwireCheck:
    confidence_inflation: TripwireStatus
    engagement_ratio: TripwireStatus
    retraction_avoidance: TripwireStatus
    missing_epicon_footer: TripwireStatus

    def any_failed(self) -> bool:
        return any(
            v == TripwireStatus.FAIL
            for v in [
                self.confidence_inflation,
                self.engagement_ratio,
                self.retraction_avoidance,
                self.missing_epicon_footer,
            ]
        )

    def to_dict(self) -> Dict[str, str]:
        return {
            k: getattr(self, k).value
            for k in [
                "confidence_inflation",
                "engagement_ratio",
                "retraction_avoidance",
                "missing_epicon_footer",
            ]
        }


@dataclass
class AtlasState:
    version: int
    last_heartbeat: Optional[str]
    last_post_time: Optional[str]
    last_comment_time: Optional[str]
    posts_today: int
    comments_today: int
    suspended: bool
    suspension_reason: Optional[str]
    suspension_time: Optional[str]
    daily_reset_date: str

    # Integrity telemetry
    recent_confidence_levels: List[str]  # e.g., ["low","medium","high"...]
    posts_without_engagement: int
    known_errors: List[Dict[str, Any]]  # [{"id": "...", "discovered_at": "..."}]
    retractions_issued: List[Dict[str, Any]]  # [{"error_id": "...", "posted_at": "..."}]

    # Draft telemetry
    last_draft_missing_footer: bool


STATE_VERSION = 3


@dataclass
class Draft:
    id: str
    created_at: str
    draft_type: str  # "comment" or "post"
    target_post_id: Optional[str]
    target_post_title: Optional[str]
    target_author: Optional[str]
    prompt_context: str
    drafted_content: str
    status: str  # "pending" | "approved" | "rejected"
    meta: Dict[str, Any]


# ============================================================
# Storage
# ============================================================


def ensure_dirs():
    for d in [
        CONFIG.config_dir,
        CONFIG.log_dir,
        CONFIG.audit_dir,
        CONFIG.drafts_dir,
    ]:
        d.mkdir(parents=True, exist_ok=True)


def _default_state() -> AtlasState:
    today = utcnow().strftime("%Y-%m-%d")
    return AtlasState(
        version=STATE_VERSION,
        last_heartbeat=None,
        last_post_time=None,
        last_comment_time=None,
        posts_today=0,
        comments_today=0,
        suspended=False,
        suspension_reason=None,
        suspension_time=None,
        daily_reset_date=today,
        recent_confidence_levels=[],
        posts_without_engagement=0,
        known_errors=[],
        retractions_issued=[],
        last_draft_missing_footer=False,
    )


def load_state() -> AtlasState:
    ensure_dirs()
    if CONFIG.state_file.exists():
        with open(CONFIG.state_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Simple migration if older
        if data.get("version", 0) != STATE_VERSION:
            st = _default_state()
            for k in asdict(st).keys():
                if k in data:
                    setattr(st, k, data[k])
            st.version = STATE_VERSION
            save_state(st)
            return st
        return AtlasState(**data)
    st = _default_state()
    save_state(st)
    return st


def save_state(state: AtlasState):
    ensure_dirs()
    with open(CONFIG.state_file, "w", encoding="utf-8") as f:
        json.dump(asdict(state), f, indent=2)


def reset_daily_counters(state: AtlasState) -> AtlasState:
    today = utcnow().strftime("%Y-%m-%d")
    if state.daily_reset_date != today:
        state.posts_today = 0
        state.comments_today = 0
        state.daily_reset_date = today
    return state


def log_audit(action: str, details: Dict[str, Any]):
    ensure_dirs()
    day = utcnow().strftime("%Y-%m-%d")
    path = CONFIG.audit_dir / f"{day}.json"
    entries: List[Dict[str, Any]] = []
    if path.exists():
        try:
            entries = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            entries = []
    entries.append(
        {"timestamp": iso(utcnow()), "action": action, "details": details}
    )
    path.write_text(json.dumps(entries, indent=2), encoding="utf-8")


def save_draft(draft: Draft):
    ensure_dirs()
    path = CONFIG.drafts_dir / f"{draft.id}.json"
    path.write_text(json.dumps(asdict(draft), indent=2), encoding="utf-8")


def load_drafts(status: Optional[str] = None) -> List[Draft]:
    ensure_dirs()
    drafts: List[Draft] = []
    for p in CONFIG.drafts_dir.glob("*.json"):
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            d = Draft(**data)
            if status is None or d.status == status:
                drafts.append(d)
        except Exception:
            continue
    drafts.sort(key=lambda d: d.created_at, reverse=True)
    return drafts


def load_draft(draft_id: str) -> Optional[Draft]:
    p = CONFIG.drafts_dir / f"{draft_id}.json"
    if not p.exists():
        return None
    data = json.loads(p.read_text(encoding="utf-8"))
    return Draft(**data)


def update_draft_status(draft_id: str, status: str):
    d = load_draft(draft_id)
    if not d:
        return
    d.status = status
    save_draft(d)


# ============================================================
# Slack (optional)
# ============================================================


def slack_send(
    text: str, blocks: Optional[List[Dict[str, Any]]] = None
) -> bool:
    if not CONFIG.slack_enabled or not CONFIG.slack_webhook_url:
        return False
    payload: Dict[str, Any] = {"text": text}
    if blocks:
        payload["blocks"] = blocks
    try:
        r = requests.post(CONFIG.slack_webhook_url, json=payload, timeout=15)
        return r.status_code == 200
    except Exception:
        return False


def slack_heartbeat_start():
    slack_send("*ATLAS Heartbeat v3* starting...")


def slack_heartbeat_complete(opps: int, drafts: int, pending: int):
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "ATLAS Heartbeat Complete",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Opportunities:*\n{opps}"},
                {"type": "mrkdwn", "text": f"*New drafts:*\n{drafts}"},
            ],
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*{pending}* drafts pending review",
            },
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Run `python atlas_heartbeat_v3.py drafts` to review.",
                }
            ],
        },
    ]
    slack_send(f"Heartbeat complete: {drafts} drafts", blocks)


def slack_new_draft(d: Draft, post_url: Optional[str]):
    preview = d.drafted_content[:700] + (
        "..." if len(d.drafted_content) > 700 else ""
    )
    blocks: List[Dict[str, Any]] = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "New Draft Ready",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Draft ID:*\n`{d.id}`"},
                {
                    "type": "mrkdwn",
                    "text": f"*Target author:*\n{d.target_author or 'unknown'}",
                },
            ],
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Reason:* {d.prompt_context}",
            },
        },
    ]
    if d.target_post_title:
        blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Post:* {d.target_post_title}",
                },
            }
        )
    if post_url:
        blocks.append(
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*Link:* {post_url}"},
            }
        )
    blocks += [
        {"type": "divider"},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Draft:*\n```{preview}```",
            },
        },
        {"type": "divider"},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (
                    f"Approve: `python atlas_heartbeat_v3.py approve {d.id}`\n"
                    f"Reject: `python atlas_heartbeat_v3.py reject {d.id}`"
                ),
            },
        },
    ]
    slack_send(f"New draft: {d.id}", blocks)


def slack_tripwire(failed: List[str], reason: str):
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "ATLAS SUSPENDED",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Reason:* {reason}"},
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Tripwires triggered:*\n* "
                + "\n* ".join(failed),
            },
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Run `python atlas_heartbeat_v3.py resume` after review.",
                }
            ],
        },
    ]
    slack_send("ATLAS suspended", blocks)


def slack_error(err: str):
    slack_send(f"*ATLAS Error:* {err}")


# ============================================================
# Moltbook API Client
# ============================================================


class MoltbookAPI:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _url(self, endpoint: str) -> str:
        endpoint = endpoint.lstrip("/")
        return f"{self.base_url}/{endpoint}"

    def get(
        self, endpoint: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        r = requests.get(
            self._url(endpoint),
            headers=self.headers,
            params=params,
            timeout=30,
        )
        r.raise_for_status()
        return r.json()

    def post(
        self, endpoint: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        r = requests.post(
            self._url(endpoint),
            headers=self.headers,
            json=data,
            timeout=30,
        )
        r.raise_for_status()
        return r.json()

    # ----- Moltbook endpoints -----

    def get_me(self) -> Dict[str, Any]:
        return self.get("agents/me")

    def get_posts(
        self,
        submolt: Optional[str] = None,
        sort: str = "new",
        limit: int = 15,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"sort": sort, "limit": limit}
        if submolt:
            params["submolt"] = submolt
        return self.get("posts", params)

    def get_post(self, post_id: str) -> Dict[str, Any]:
        return self.get(f"posts/{post_id}")

    def search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        return self.get("search", {"q": query, "limit": limit})

    def create_comment(
        self, post_id: str, content: str
    ) -> Dict[str, Any]:
        return self.post(
            f"posts/{post_id}/comments", {"content": content}
        )

    def verify(self, code: str, answer: str) -> Dict[str, Any]:
        return self.post(
            "verify", {"verification_code": code, "answer": answer}
        )


def moltbook_post_url(post_id: str) -> str:
    """Best-effort canonical URL for a Moltbook post."""
    return f"https://www.moltbook.com/posts/{post_id}"


# ============================================================
# Claude API Client (Anthropic)
# ============================================================


class ClaudeAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": api_key,
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
        }

    def generate(self, user_prompt: str, max_tokens: int = 900) -> str:
        payload = {
            "model": CONFIG.claude_model,
            "max_tokens": max_tokens,
            "system": ATLAS_SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        r = requests.post(
            self.base_url,
            headers=self.headers,
            json=payload,
            timeout=45,
        )
        r.raise_for_status()
        data = r.json()

        # Robust parse
        parts: List[str] = []
        for block in data.get("content", []):
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "\n".join(parts).strip()


# ============================================================
# EPICON Footer Enforcement + Extraction
# ============================================================

EPICON_FOOTER_RE = re.compile(
    r"—\s*EPICON-Lite\s*.*?"
    r"Claim type:\s*(fact|interpretation|hypothesis|opinion)\s*.*?"
    r"Confidence:\s*(low|medium|high)\s*.*?"
    r"What would change my view:\s*.+?\s*"
    r"Mobius Covenant v1\.0\s*$",
    re.IGNORECASE | re.DOTALL,
)


def has_epicon_footer(text: str) -> bool:
    return EPICON_FOOTER_RE.search(text.strip()) is not None


def extract_confidence(text: str) -> Optional[str]:
    m = re.search(r"Confidence:\s*(low|medium|high)", text, re.IGNORECASE)
    return m.group(1).lower() if m else None


# ============================================================
# Tripwires
# ============================================================


def check_tripwires(state: AtlasState) -> TripwireCheck:
    # Confidence inflation: too many "high" in recent history
    confidence_inflation = TripwireStatus.PASS
    window = state.recent_confidence_levels[-20:]
    if len(window) >= 10:
        high = sum(1 for c in window if c == "high")
        ratio = high / len(window)
        if ratio > CONFIG.confidence_inflation_threshold:
            confidence_inflation = TripwireStatus.FAIL
        elif ratio > CONFIG.confidence_inflation_threshold * 0.8:
            confidence_inflation = TripwireStatus.WATCH

    # Engagement ratio: posting without meaningful engagement outcomes
    engagement_ratio = TripwireStatus.PASS
    if (
        state.posts_without_engagement
        >= CONFIG.posts_without_engagement_threshold
    ):
        engagement_ratio = TripwireStatus.FAIL
    elif (
        state.posts_without_engagement
        == CONFIG.posts_without_engagement_threshold - 1
    ):
        engagement_ratio = TripwireStatus.WATCH

    # Retraction avoidance: known errors not retracted within window
    retraction_avoidance = TripwireStatus.PASS
    for err in state.known_errors:
        try:
            discovered = datetime.fromisoformat(err["discovered_at"])
        except Exception:
            continue
        if utcnow() - discovered > timedelta(
            hours=CONFIG.retraction_window_hours
        ):
            issued = any(
                r.get("error_id") == err.get("id")
                for r in state.retractions_issued
            )
            if not issued:
                retraction_avoidance = TripwireStatus.FAIL
                break

    # Missing EPICON footer on last draft (hard fail optional)
    if (
        state.last_draft_missing_footer
        and CONFIG.missing_epicon_footer_is_fail
    ):
        missing_epicon_footer = TripwireStatus.FAIL
    else:
        missing_epicon_footer = TripwireStatus.PASS

    return TripwireCheck(
        confidence_inflation=confidence_inflation,
        engagement_ratio=engagement_ratio,
        retraction_avoidance=retraction_avoidance,
        missing_epicon_footer=missing_epicon_footer,
    )


# ============================================================
# Engagement Selection
# ============================================================

AVOID_KEYWORDS = [
    "$",
    "token",
    "pump",
    "moon",
    "rug",
    "airdrop",
    "drama",
    "giveaway",
    "referral",
    "shill",
]
SIGNAL_KEYWORDS = [
    "cathedral",
    "integrity",
    "covenant",
    "epicon",
    "provenance",
    "audit",
    "trust",
    "governance",
    "constitutional",
    "accountability",
    "memory",
    "retraction",
    "guardrails",
]


def should_engage(post: Dict[str, Any]) -> Tuple[bool, str]:
    title = (post.get("title") or "").lower()
    content = (post.get("content") or "").lower()

    # Direct mention
    if (
        "mobiusatlas" in content
        or "mobiusatlas" in title
        or "mobius" in content
    ):
        return True, "Direct mention of MobiusATLAS/Mobius"

    # Avoid spammy token content
    if any(k in title or k in content for k in AVOID_KEYWORDS):
        return False, "Avoid: token/spam/engagement bait"

    # Signal keywords
    if any(k in title or k in content for k in SIGNAL_KEYWORDS):
        return True, "Signal topic (integrity / governance / cathedral)"

    return False, "No clear reason to engage (default silence)"


def find_engagement_opportunities(
    m: MoltbookAPI,
) -> List[Dict[str, Any]]:
    opps: List[Dict[str, Any]] = []

    # Feed scan
    try:
        feed = m.get_posts(submolt="general", sort="new", limit=20)
        for p in feed.get("posts", []):
            ok, reason = should_engage(p)
            if ok:
                opps.append({"post": p, "reason": reason, "source": "feed"})
    except Exception as e:
        log_audit("error_feed", {"error": str(e)})

    # Mention scan (search)
    try:
        sr = m.search("MobiusATLAS OR Mobius", limit=15)
        # Normalize search results — don't assume shape
        for r in sr.get("results", []):
            post_id = r.get("post_id") or r.get("id")
            if not post_id:
                continue
            try:
                p = m.get_post(str(post_id))
                # Some APIs wrap as {"post": {...}}
                post_obj = (
                    p.get("post")
                    if isinstance(p.get("post"), dict)
                    else p
                )
                ok, reason = should_engage(post_obj)
                if ok:
                    opps.append(
                        {
                            "post": post_obj,
                            "reason": "Direct mention / search",
                            "source": "search",
                        }
                    )
            except Exception:
                continue
    except Exception as e:
        log_audit("error_search", {"error": str(e)})

    # Deduplicate by post id
    seen: set = set()
    deduped: List[Dict[str, Any]] = []
    for o in opps:
        pid = str(
            o["post"].get("id") or o["post"].get("post_id") or ""
        )
        if not pid or pid in seen:
            continue
        seen.add(pid)
        deduped.append(o)

    return deduped


# ============================================================
# Drafting
# ============================================================


def build_draft_prompt(post: Dict[str, Any], context: str) -> str:
    title = post.get("title") or "No title"
    content = (post.get("content") or "")[:2400]
    author = None
    if isinstance(post.get("author"), dict):
        author = post["author"].get("name") or post["author"].get(
            "username"
        )
    author = author or post.get("author_name") or "unknown"
    return f"""You are drafting a Moltbook COMMENT reply as MobiusATLAS.

POST TITLE: {title}
POST AUTHOR: {author}
POST CONTENT:
{content}

SELECTION CONTEXT: {context}

Rules:
- Engage substance, not vibes
- Avoid preachy tone
- If you don't know, say so
- If nothing valuable to add, output exactly: [NO RESPONSE NEEDED]
- Must end with EPICON-Lite footer (Mobius Covenant v1.0)
- Keep under ~200 words unless complexity requires more
"""


def new_draft_id() -> str:
    return sha_short(str(uuid.uuid4()) + str(time.time()))


def draft_response(
    claude: ClaudeAPI, post: Dict[str, Any], reason: str
) -> str:
    prompt = build_draft_prompt(post, reason)
    return claude.generate(prompt)


# ============================================================
# Verification Challenge Solver (basic)
# ============================================================


def solve_challenge(challenge: str) -> Optional[str]:
    """
    Very conservative solver: handles simple word-number
    addition/multiplication. If it can't parse confidently,
    returns None.
    """
    word_to_num = {
        "zero": 0,
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
        "thirty": 30,
        "forty": 40,
        "fifty": 50,
        "sixty": 60,
        "seventy": 70,
        "eighty": 80,
        "ninety": 90,
    }

    text = re.sub(r"[^a-zA-Z\s]", " ", (challenge or "")).lower()
    words = [w for w in text.split() if w]
    nums: List[int] = []
    i = 0
    while i < len(words):
        w = words[i]
        if w in word_to_num:
            n = word_to_num[w]
            # support "twenty one"
            if (
                i + 1 < len(words)
                and words[i] in word_to_num
                and words[i + 1] in word_to_num
            ):
                if n >= 20 and word_to_num[words[i + 1]] < 10:
                    n = n + word_to_num[words[i + 1]]
                    i += 1
            nums.append(n)
        i += 1

    if len(nums) < 2:
        return None

    if "times" in words or "multiply" in words or "multiplied" in words:
        return f"{nums[0] * nums[1]:.2f}"
    if (
        "plus" in words
        or "add" in words
        or "added" in words
        or "sum" in words
    ):
        return f"{nums[0] + nums[1]:.2f}"

    # Default: if unclear operator, refuse
    return None


# ============================================================
# Core Heartbeat
# ============================================================


def can_comment_now(state: AtlasState) -> bool:
    if not state.last_comment_time:
        return True
    try:
        last = datetime.fromisoformat(state.last_comment_time)
    except Exception:
        return True
    return utcnow() - last >= timedelta(
        minutes=CONFIG.min_minutes_between_comments
    )


def run_heartbeat(dry_run: bool = False) -> None:
    print("\n" + "=" * 72)
    print(f"ATLAS HEARTBEAT v3 — {iso(utcnow())}")
    print("=" * 72 + "\n")

    slack_heartbeat_start()

    state = reset_daily_counters(load_state())

    # Suspended?
    if state.suspended:
        print(f"SUSPENDED: {state.suspension_reason}")
        print("    Run: python atlas_heartbeat_v3.py resume")
        return

    # Keys
    if not CONFIG.moltbook_api_key:
        msg = "Missing MOLTBOOK_API_KEY"
        print(f"Error: {msg}")
        slack_error(msg)
        return

    claude: Optional[ClaudeAPI] = None
    if CONFIG.anthropic_api_key:
        claude = ClaudeAPI(CONFIG.anthropic_api_key)
    else:
        print(
            "Warning: Missing ANTHROPIC_API_KEY — drafting disabled (scan-only)."
        )

    moltbook = MoltbookAPI(CONFIG.moltbook_api_key, CONFIG.moltbook_api_base)

    # Connect
    try:
        me = moltbook.get_me()
        me_name = (me.get("agent") or {}).get("name") or "unknown"
        print(f"Connected as: {me_name}")
    except Exception as e:
        msg = f"Connection failed: {e}"
        print(f"Error: {msg}")
        slack_error(msg)
        return

    # Tripwires (based on last state)
    tw = check_tripwires(state)
    print("\nTripwire checks:")
    for k, v in tw.to_dict().items():
        icon = (
            "[PASS]" if v == "pass" else "[WATCH]" if v == "watch" else "[FAIL]"
        )
        print(f"   {icon} {k}: {v}")

    if tw.any_failed():
        failed = [k for k, v in tw.to_dict().items() if v == "fail"]
        state.suspended = True
        state.suspension_reason = f"Tripwires: {', '.join(failed)}"
        state.suspension_time = iso(utcnow())
        save_state(state)
        log_audit(
            "suspend",
            {"reason": state.suspension_reason, "tripwires": tw.to_dict()},
        )
        print(f"\nSUSPENDED: {state.suspension_reason}")
        slack_tripwire(failed, state.suspension_reason)
        return

    # Find opportunities
    print("\nScanning for engagement opportunities...")
    opps = find_engagement_opportunities(moltbook)
    print(f"   Found {len(opps)} opportunities.")

    drafts_created = 0

    # Draft responses (draft-first)
    if (
        claude
        and opps
        and state.comments_today < CONFIG.max_comments_per_day
    ):
        if not can_comment_now(state):
            print(
                f"Rate-limit: waiting at least "
                f"{CONFIG.min_minutes_between_comments} min between comments."
            )
        else:
            print("\nDrafting...")
            for opp in opps[: CONFIG.max_drafts_per_heartbeat]:
                post = opp["post"]
                post_id = str(
                    post.get("id") or post.get("post_id") or ""
                )
                title = (post.get("title") or "")[:80]
                reason = opp["reason"]

                if not post_id:
                    continue

                try:
                    resp = draft_response(claude, post, reason)

                    if resp.strip() == "[NO RESPONSE NEEDED]":
                        print(
                            f"   -> Silence recommended for: {title}"
                        )
                        continue

                    # EPICON footer enforcement
                    missing_footer = not has_epicon_footer(resp)
                    state.last_draft_missing_footer = missing_footer

                    # Capture confidence into telemetry
                    conf = extract_confidence(resp)
                    if conf in ("low", "medium", "high"):
                        state.recent_confidence_levels.append(conf)
                        # keep bounded
                        state.recent_confidence_levels = (
                            state.recent_confidence_levels[-50:]
                        )

                    author_name = None
                    if isinstance(post.get("author"), dict):
                        author_name = post["author"].get("name")

                    d = Draft(
                        id=new_draft_id(),
                        created_at=iso(utcnow()),
                        draft_type="comment",
                        target_post_id=post_id,
                        target_post_title=post.get("title"),
                        target_author=author_name,
                        prompt_context=reason,
                        drafted_content=resp,
                        status="pending",
                        meta={
                            "source": opp["source"],
                            "post_url_guess": moltbook_post_url(post_id),
                            "missing_epicon_footer": missing_footer,
                            "confidence": conf,
                        },
                    )
                    save_draft(d)
                    drafts_created += 1
                    print(
                        f"   Draft saved: {d.id}  (post: {title})"
                    )

                    if CONFIG.slack_webhook_url:
                        slack_new_draft(
                            d, d.meta.get("post_url_guess")
                        )

                    # Persist state after each draft
                    save_state(state)

                except Exception as e:
                    err = f"Drafting error: {e}"
                    print(f"   Error: {err}")
                    log_audit(
                        "draft_error",
                        {"error": str(e), "post_id": post_id},
                    )
                    slack_error(err)

    # Update and log state
    state.last_heartbeat = iso(utcnow())
    save_state(state)

    log_audit(
        "heartbeat",
        {
            "dry_run": dry_run,
            "opportunities": len(opps),
            "drafts_created": drafts_created,
            "comments_today": state.comments_today,
            "posts_today": state.posts_today,
            "tripwires": tw.to_dict(),
        },
    )

    pending = len(load_drafts(status="pending"))

    print("\n" + "=" * 72)
    print("Heartbeat complete")
    print(f"   Posts today:    {state.posts_today}/{CONFIG.max_posts_per_day}")
    print(
        f"   Comments today: {state.comments_today}/{CONFIG.max_comments_per_day}"
    )
    print(f"   New drafts:     {drafts_created}")
    print(f"   Pending drafts: {pending}")
    print("=" * 72 + "\n")

    slack_heartbeat_complete(len(opps), drafts_created, pending)


# ============================================================
# Draft Review & Actions
# ============================================================


def show_drafts():
    drafts = load_drafts(status="pending")
    if not drafts:
        print("\nNo pending drafts.\n")
        return

    print("\n" + "=" * 72)
    print(f"PENDING DRAFTS ({len(drafts)})")
    print("=" * 72)

    for i, d in enumerate(drafts, 1):
        print(f"\n--- Draft {i}/{len(drafts)} — ID: {d.id} ---")
        print(f"Created: {d.created_at}")
        print(f"Target post: {d.target_post_title}")
        print(f"Target author: {d.target_author}")
        print(f"Reason: {d.prompt_context}")
        print(f"Post URL (guess): {d.meta.get('post_url_guess')}")
        if d.meta.get("missing_epicon_footer"):
            print("WARNING: Missing EPICON footer (tripwire).")
        print("\nDRAFT:")
        print("-" * 72)
        print(d.drafted_content)
        print("-" * 72)

    print("\nCommands:")
    print("  python atlas_heartbeat_v3.py approve <draft_id>")
    print("  python atlas_heartbeat_v3.py reject <draft_id>")
    print()


def approve_draft(draft_id: str, assume_yes: bool = False):
    d = load_draft(draft_id)
    if not d:
        print(f"Draft not found: {draft_id}")
        return
    if d.status != "pending":
        print(f"Draft not pending (status: {d.status})")
        return

    state = reset_daily_counters(load_state())

    if state.suspended:
        print(f"SUSPENDED: {state.suspension_reason}")
        print("    Resume first: python atlas_heartbeat_v3.py resume")
        return

    if state.comments_today >= CONFIG.max_comments_per_day:
        print("Comment limit reached for today.")
        return

    if not can_comment_now(state):
        print(
            f"Must wait at least {CONFIG.min_minutes_between_comments} "
            "minutes between comments."
        )
        return

    # Safety: footer required for posting
    if not has_epicon_footer(d.drafted_content):
        print("Refusing to post: missing EPICON-Lite footer.")
        log_audit(
            "approve_blocked_missing_footer", {"draft_id": d.id}
        )
        return

    print(f"\nApprove draft: {d.id}")
    print(f"Target: {d.target_post_title}")
    print("-" * 72)
    print(d.drafted_content)
    print("-" * 72)

    if not assume_yes:
        confirm = input("Post this comment? [y/N]: ").strip().lower()
        if confirm != "y":
            print("Cancelled.")
            return

    moltbook = MoltbookAPI(
        CONFIG.moltbook_api_key, CONFIG.moltbook_api_base
    )

    try:
        print("Posting...")
        result = moltbook.create_comment(
            d.target_post_id or "", d.drafted_content
        )

        # Some APIs return verification_required; handle if present
        if isinstance(result, dict) and result.get(
            "verification_required"
        ):
            ver = result.get("verification") or {}
            challenge = ver.get("challenge", "")
            code = ver.get("code", "")
            print("Verification required.")
            print(f"Challenge: {challenge}")

            answer = solve_challenge(challenge)
            if answer is None:
                manual = input("Enter answer manually: ").strip()
                answer = manual

            vr = moltbook.verify(code, answer)
            if not (isinstance(vr, dict) and vr.get("success")):
                print(f"Verification failed: {vr}")
                log_audit(
                    "verify_failed",
                    {"draft_id": d.id, "vr": vr},
                )
                slack_error(f"Verification failed for draft {d.id}")
                return

        # Success
        update_draft_status(d.id, "approved")
        state.comments_today += 1
        state.last_comment_time = iso(utcnow())
        save_state(state)

        log_audit(
            "comment_posted",
            {"draft_id": d.id, "post_id": d.target_post_id},
        )
        slack_send(f"Draft posted: {d.id}")

        print("Posted successfully.")
    except Exception as e:
        err = f"Post error: {e}"
        print(f"Error: {err}")
        log_audit(
            "post_error", {"draft_id": d.id, "error": str(e)}
        )
        slack_error(err)


def reject_draft(draft_id: str):
    d = load_draft(draft_id)
    if not d:
        print(f"Draft not found: {draft_id}")
        return
    if d.status != "pending":
        print(f"Draft not pending (status: {d.status})")
        return

    update_draft_status(d.id, "rejected")
    log_audit("draft_rejected", {"draft_id": d.id})
    print(f"Draft rejected: {d.id}")


def show_status():
    state = reset_daily_counters(load_state())
    pending = len(load_drafts(status="pending"))
    print("\n" + "=" * 72)
    print("ATLAS STATUS (v3)")
    print("=" * 72)
    if state.suspended:
        print(f"SUSPENDED: {state.suspension_reason}")
        print(f"   Since: {state.suspension_time}")
    else:
        print("Active")
    print("\nToday:")
    print(f"  Posts:    {state.posts_today}/{CONFIG.max_posts_per_day}")
    print(
        f"  Comments: {state.comments_today}/{CONFIG.max_comments_per_day}"
    )
    print(f"  Pending drafts: {pending}")
    print(f"\nLast heartbeat: {state.last_heartbeat or 'never'}")
    print("=" * 72 + "\n")


def resume():
    state = load_state()
    if not state.suspended:
        print("Not suspended.")
        return
    print(f"Suspended: {state.suspension_reason}")
    confirm = input("Resume? [y/N]: ").strip().lower()
    if confirm != "y":
        print("Cancelled.")
        return
    prev = state.suspension_reason
    state.suspended = False
    state.suspension_reason = None
    state.suspension_time = None
    save_state(state)
    log_audit("resume", {"previous_reason": prev})
    print("Resumed.")


def daemon():
    print("ATLAS Daemon v3 starting. Ctrl+C to stop.")
    while True:
        try:
            run_heartbeat(dry_run=False)
            # Jitter to avoid predictable cadence
            base = CONFIG.heartbeat_interval_hours * 3600
            jitter = random.randint(-300, 300)  # +/- 5 minutes
            sleep_s = max(300, base + jitter)
            print(f"Sleeping {sleep_s // 60} minutes...")
            time.sleep(sleep_s)
        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            slack_error(f"Daemon crash: {e}")
            log_audit("daemon_crash", {"error": str(e)})
            # short backoff
            time.sleep(60)


# ============================================================
# CLI
# ============================================================


def main():
    parser = argparse.ArgumentParser(
        description=(
            "MobiusATLAS Heartbeat Runner v3 "
            "(draft-first, guardrailed autonomy)"
        )
    )
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser(
        "heartbeat", help="Run one heartbeat cycle (scan + draft)"
    )
    sub.add_parser("drafts", help="Show pending drafts")
    ap = sub.add_parser("approve", help="Approve and post a draft")
    ap.add_argument("draft_id")
    ap.add_argument(
        "--yes",
        action="store_true",
        help="Skip confirmation prompt",
    )
    rj = sub.add_parser("reject", help="Reject a draft")
    rj.add_argument("draft_id")
    sub.add_parser("status", help="Show current status")
    sub.add_parser("resume", help="Resume after suspension")
    sub.add_parser(
        "daemon", help="Run continuously on interval"
    )

    args = parser.parse_args()

    if not args.cmd:
        parser.print_help()
        print(
            "\nSetup env vars:\n"
            "  export MOLTBOOK_API_KEY='...'\n"
            "  export MOLTBOOK_API_BASE='https://www.moltbook.com/api/v1'"
            "   # optional\n"
            "  export ANTHROPIC_API_KEY='...'"
            "                               # optional\n"
            "  export SLACK_WEBHOOK_URL='...'"
            "                               # optional\n"
        )
        return

    ensure_dirs()

    if args.cmd == "heartbeat":
        run_heartbeat(dry_run=False)
    elif args.cmd == "drafts":
        show_drafts()
    elif args.cmd == "approve":
        approve_draft(args.draft_id, assume_yes=args.yes)
    elif args.cmd == "reject":
        reject_draft(args.draft_id)
    elif args.cmd == "status":
        show_status()
    elif args.cmd == "resume":
        resume()
    elif args.cmd == "daemon":
        daemon()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
