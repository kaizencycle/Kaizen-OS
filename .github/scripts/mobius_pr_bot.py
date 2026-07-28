#!/usr/bin/env python3
"""
Mobius PR Bot — EPICON-02 Intent Publication Enforcer

This bot enforces:
1. Intent Publication block in PR body (required fields)
2. Scope containment (changed files match declared scope)
3. Time-bounded authority (≤90 days, ≤72h for emergency)
4. Intent evolution tracking (hash changes require explicit declaration)
5. Divergence severity scoring (low/medium/high)
6. Emergency transparency debt (auto-creates issue)
7. Auto-generated intent templates on failure

Reference: docs/epicon/EPICON-02.md
"""

import os
import re
import json
import hashlib
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone, timedelta

# Import template generator if available
try:
    from epicon_intent_template import generate_template, detect_scope
    HAS_TEMPLATE_GEN = True
except ImportError:
    HAS_TEMPLATE_GEN = False

# -----------------------------
# Environment
# -----------------------------
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
PR_NUMBER = os.environ.get("PR_NUMBER")
REPO = os.environ.get("REPO")
PR_BODY = os.environ.get("PR_BODY") or ""
PR_BASE_SHA = os.environ.get("PR_BASE_SHA")
PR_HEAD_SHA = os.environ.get("PR_HEAD_SHA")
PR_USER = os.environ.get("PR_USER") or ""

# -----------------------------
# Configuration
# -----------------------------
REQUIRED_BLOCK_HEADER = "EPICON-02 INTENT PUBLICATION"
MAX_WINDOW_DAYS = 90
EMERGENCY_MAX_HOURS = 72
TRANSPARENCY_DEBT_HOURS = 24
BOT_MARKER = "<!-- MOBIUS_PR_BOT -->"

# Scope definitions: label -> allowed file path prefixes
SCOPE_MAP = {
    "docs": [
        "docs/",
        "epicon/",
        "README.md",
        "CHANGELOG.md",
        "LICENSE",
        "mkdocs.yml",
        "journals/cycles/",
        "catalog/",
    ],
    "ci": [".github/", "ci/", "scripts/", "STATE/"],
    "core": ["src/", "packages/", "apps/", "services/", "package.json", "package-lock.json"],
    "infra": ["infra/", "deploy/", "docker/", "monitoring/", "grafana/"],
    "sentinels": ["sentinels/"],
    "labs": ["labs/"],
    "specs": ["specs/", "schemas/", "configs/", "tests/", "canon/", "docs/epicon/"],
}

# Scope -> labels to apply
SCOPE_LABELS = {
    "docs": ["scope:docs"],
    "ci": ["scope:ci"],
    "core": ["scope:core"],
    "infra": ["scope:infra"],
    "sentinels": ["scope:sentinels"],
    "labs": ["scope:labs"],
    "specs": ["scope:specs"],
}

# Scope -> reviewers (teams must be "org/team-slug")
SCOPE_REVIEWERS = {
    "docs": {"reviewers": [], "team_reviewers": ["kaizencycle/aurea"]},
    "ci": {"reviewers": [], "team_reviewers": ["kaizencycle/atlas"]},
    "core": {"reviewers": [], "team_reviewers": ["kaizencycle/atlas", "kaizencycle/hermes"]},
    "infra": {"reviewers": [], "team_reviewers": ["kaizencycle/atlas", "kaizencycle/hermes"]},
    "sentinels": {"reviewers": [], "team_reviewers": ["kaizencycle/zeus", "kaizencycle/eve"]},
    "labs": {"reviewers": [], "team_reviewers": ["kaizencycle/atlas"]},
    "specs": {"reviewers": [], "team_reviewers": ["kaizencycle/aurea", "kaizencycle/atlas"]},
}


# -----------------------------
# GitHub API helpers
# -----------------------------
def gh_request(method, path, data=None):
    """Make a GitHub API request."""
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "mobius-pr-bot",
    }
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"GitHub API error: {e.code} {e.reason}")
        return None


def post_or_update_sticky_comment(pr_number, body_markdown):
    """Post or update the bot's sticky comment on a PR."""
    comments = gh_request("GET", f"/repos/{REPO}/issues/{pr_number}/comments")
    if comments is None:
        comments = []
    
    existing = None
    for c in comments:
        if BOT_MARKER in (c.get("body") or ""):
            existing = c
            break
    
    payload = {"body": f"{BOT_MARKER}\n{body_markdown}"}
    if existing:
        gh_request("PATCH", f"/repos/{REPO}/issues/comments/{existing['id']}", payload)
    else:
        gh_request("POST", f"/repos/{REPO}/issues/{pr_number}/comments", payload)


def add_labels(pr_number, labels):
    """Add labels to a PR."""
    if labels:
        gh_request("POST", f"/repos/{REPO}/issues/{pr_number}/labels", {"labels": labels})


def request_reviewers(pr_number, reviewers=None, team_reviewers=None):
    """Request reviewers for a PR."""
    reviewers = reviewers or []
    team_reviewers = team_reviewers or []
    if not reviewers and not team_reviewers:
        return
    payload = {"reviewers": reviewers, "team_reviewers": team_reviewers}
    try:
        gh_request("POST", f"/repos/{REPO}/pulls/{pr_number}/requested_reviewers", payload)
    except Exception:
        # Some repos/orgs restrict auto review requests
        pass


def create_issue(title, body, labels=None):
    """Create a GitHub issue."""
    payload = {"title": title, "body": body}
    if labels:
        payload["labels"] = labels
    return gh_request("POST", f"/repos/{REPO}/issues", payload)


def find_existing_debt_issue(pr_number):
    """Find existing transparency debt issue for a PR."""
    try:
        issues = gh_request(
            "GET",
            f"/repos/{REPO}/issues?state=open&labels=transparency-debt&per_page=50"
        )
        if issues is None:
            return None
        token = f"PR #{pr_number}"
        for it in issues:
            if token in (it.get("body") or ""):
                return it
    except Exception:
        return None
    return None


# -----------------------------
# Parsing helpers
# -----------------------------
def extract_intent_block(text):
    """Extract the EPICON-02 Intent Publication block from PR body."""
    header_re = re.compile(
        rf"#+\s*{re.escape(REQUIRED_BLOCK_HEADER)}\s*",
        re.IGNORECASE
    )
    if not header_re.search(text):
        return None, ["Missing required header: 'EPICON-02 INTENT PUBLICATION'"]
    
    m = re.search(r"```intent\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if not m:
        return None, ["Missing fenced ```intent block under EPICON-02 header"]
    
    return m.group(1).strip(), []


def parse_kv_block(raw):
    """Parse a YAML-like key-value block."""
    lines = raw.splitlines()
    data, errors = {}, []
    i = 0

    def indent(s):
        return len(s) - len(s.lstrip(" "))

    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip() or line.strip().startswith("#"):
            i += 1
            continue
        
        m = re.match(r"^([a-zA-Z0-9_]+)\s*:\s*(.*)$", line)
        if not m:
            errors.append(f"Unparseable line: {line}")
            i += 1
            continue
        
        key, val = m.group(1), m.group(2)

        # Multi-line blocks
        if key in ("justification", "evolution_reason"):
            block = []
            i += 1
            while i < len(lines) and (lines[i].strip() == "" or indent(lines[i]) >= 2):
                block.append(lines[i][2:] if indent(lines[i]) >= 2 else "")
                i += 1
            data[key] = "\n".join(block).strip()
            continue

        # List blocks
        if key == "counterfactuals":
            items = []
            i += 1
            while i < len(lines) and lines[i].lstrip().startswith("-"):
                items.append(lines[i].lstrip()[1:].strip())
                i += 1
            data[key] = [x for x in items if x]
            continue

        data[key] = val.strip()
        i += 1

    return data, errors


def sha256_text(s):
    """Compute SHA-256 hash of text."""
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def parse_iso(s):
    """Parse ISO-8601 timestamp."""
    try:
        if s.endswith("Z"):
            return datetime.fromisoformat(s.replace("Z", "+00:00"))
        return datetime.fromisoformat(s)
    except Exception:
        return None


def days_between(a, b):
    """Calculate days between two datetimes."""
    return (b - a).total_seconds() / 86400.0


def hours_between(a, b):
    """Calculate hours between two datetimes."""
    return (b - a).total_seconds() / 3600.0


def truthy(s):
    """Check if string is truthy."""
    return str(s).strip().lower() in ("true", "yes", "1", "y")


# -----------------------------
# Git helpers
# -----------------------------
def changed_files():
    """Get list of files changed in PR."""
    try:
        out = subprocess.check_output(
            ["git", "diff", "--name-only", f"{PR_BASE_SHA}..{PR_HEAD_SHA}"]
        ).decode().strip()
        return [x for x in out.splitlines() if x.strip()]
    except subprocess.CalledProcessError:
        return []


def scope_allows_files(scope_label, files):
    """Check if all files are within one or more declared scopes (comma-separated union)."""
    labels = [part.strip() for part in scope_label.split(",") if part.strip()]
    if not labels:
        return False, list(files)

    unknown = [label for label in labels if label not in SCOPE_MAP]
    if unknown:
        return False, [
            f"Unknown scope '{label}'. Allowed: {', '.join(SCOPE_MAP.keys())}"
            for label in unknown
        ]

    bad = []
    for f in files:
        if not any(_file_in_scope(f, SCOPE_MAP[label]) for label in labels):
            bad.append(f)

    return len(bad) == 0, bad


def _file_in_scope(file_path, allowed_prefixes):
    return any(
        file_path == prefix.rstrip("/") or file_path.startswith(prefix)
        for prefix in allowed_prefixes
    )


# -----------------------------
# Emergency detection
# -----------------------------
def is_emergency(intent):
    """Check if PR is in emergency mode."""
    mode = (intent.get("mode") or "").lower()
    return mode == "emergency"


# -----------------------------
# Divergence severity scoring
# -----------------------------
def divergence_severity(failures, out_of_scope_files):
    """
    Score divergence severity.
    
    HIGH:
      - Missing intent block or missing ledger_id/justification
      - Out-of-scope changes to core paths
      - Emergency without emergency_scope
    
    MEDIUM:
      - Time window too long
      - Unknown scope
      - Out-of-scope docs-only changes
    
    LOW:
      - Missing counterfactuals
      - Formatting problems
    """
    text = "\n".join(failures).lower()

    # High severity indicators
    if "missing required header" in text or "missing fenced" in text:
        return "high"
    if "missing required field: ledger_id" in text or "missing required field: justification" in text:
        return "high"
    if "emergency mode requires" in text:
        return "high"

    # Out of scope analysis
    if out_of_scope_files:
        core_hits = [
            f for f in out_of_scope_files
            if f.startswith(("src/", "packages/", "apps/", "services/"))
        ]
        if core_hits:
            return "high"
        doclike = all(f.startswith(("docs/", "epicon/")) for f in out_of_scope_files)
        if doclike:
            return "medium"
        return "medium"

    # Medium severity indicators
    if "authority window too long" in text or "expires_at" in text:
        return "medium"
    if "unknown scope" in text or "scope violation" in text:
        return "medium"

    # Low severity indicators
    if "counterfactuals missing" in text:
        return "low"
    if "unparseable line" in text:
        return "low"

    return "low"


# -----------------------------
# Intent evolution enforcement
# -----------------------------
def enforce_intent_evolution(intent, new_hash, previous_hash):
    """
    Enforce intent evolution rules.
    
    If justification_hash changes:
    - intent_evolution must be true
    - supersedes_hash must match previous hash
    - evolution_reason must be non-empty
    """
    failures = []
    intent_evo = truthy(intent.get("intent_evolution", "false"))
    supersedes = (intent.get("supersedes_hash") or "").strip()
    evo_reason = (intent.get("evolution_reason") or "").strip()

    if previous_hash and new_hash and new_hash != previous_hash:
        if not intent_evo:
            failures.append(
                "Justification hash changed but intent_evolution is not true."
            )
        if not supersedes:
            failures.append(
                "Justification hash changed but supersedes_hash is missing."
            )
        elif supersedes != previous_hash:
            failures.append(
                f"supersedes_hash ({supersedes[:16]}...) does not match "
                f"previous justification_hash ({previous_hash[:16]}...)."
            )
        if not evo_reason:
            failures.append(
                "intent_evolution is true but evolution_reason is empty."
            )
    
    return failures


# -----------------------------
# Main
# -----------------------------
def main():
    failures, notes = [], []
    out_of_scope = []

    # Extract and parse intent block
    raw, errs = extract_intent_block(PR_BODY)
    if errs:
        failures.extend(errs)
        raw = None

    intent, parse_errors = ({}, [])
    if raw:
        intent, parse_errors = parse_kv_block(raw)
        failures.extend(parse_errors)

    # Required fields validation
    required = ["ledger_id", "scope", "issued_at", "expires_at", "justification"]
    for k in required:
        if not intent.get(k, "").strip():
            failures.append(f"Missing required field: {k}")

    emergency = is_emergency(intent)

    # Time validation
    issued = parse_iso(intent.get("issued_at", ""))
    expires = parse_iso(intent.get("expires_at", ""))

    if issued is None and intent.get("issued_at"):
        failures.append("issued_at must be ISO-8601 (e.g., 2025-12-20T18:00:00Z)")
    if expires is None and intent.get("expires_at"):
        failures.append("expires_at must be ISO-8601 (e.g., 2026-03-19T18:00:00Z)")

    if issued and expires:
        if expires <= issued:
            failures.append("expires_at must be after issued_at")
        
        window_days = days_between(issued, expires)
        window_hours = hours_between(issued, expires)
        
        if emergency:
            if window_hours > EMERGENCY_MAX_HOURS:
                failures.append(
                    f"Emergency window too long: {window_hours:.1f}h > {EMERGENCY_MAX_HOURS}h"
                )
            notes.append(
                f"⚠️ Emergency mode active → "
                f"Transparency Debt due within {TRANSPARENCY_DEBT_HOURS}h post-merge."
            )
        else:
            if window_days > MAX_WINDOW_DAYS:
                failures.append(
                    f"Authority window too long: {window_days:.1f} days > {MAX_WINDOW_DAYS} days"
                )

    # Counterfactuals recommendation
    if not intent.get("counterfactuals"):
        notes.append("⚠️ counterfactuals missing (recommended): add at least 1")

    # Changed files & scope validation
    files = changed_files()
    scope = (intent.get("scope") or "").strip()
    applied_scope_label = scope

    if emergency:
        emergency_scope = (intent.get("emergency_scope") or "").strip()
        if not emergency_scope:
            failures.append(
                "Emergency mode requires: emergency_scope: <docs|ci|core|infra|sentinels|labs|specs>"
            )
            # ok_scope is False implicitly via the missing scope
            out_of_scope = files[:]
        else:
            applied_scope_label = emergency_scope
            ok_scope, out_of_scope = scope_allows_files(emergency_scope, files)
            if not ok_scope:
                failures.append(
                    "Scope violation: PR changes files outside declared emergency_scope"
                )
    else:
        ok_scope, out_of_scope = scope_allows_files(scope, files) if scope else (False, files[:])
        if not ok_scope:
            failures.append("Scope violation: PR changes files outside declared scope")

    if out_of_scope:
        sample = out_of_scope[:20]
        failures.append("Out-of-scope files:\n- " + "\n- ".join(sample))
        if len(out_of_scope) > 20:
            failures.append(f"... and {len(out_of_scope) - 20} more")

    # Compute justification hash
    justification = (intent.get("justification") or "").strip()
    new_hash = sha256_text(justification) if justification else ""

    # Check previous bot comment for prior hash (intent evolution)
    previous_hash = None
    try:
        comments = gh_request("GET", f"/repos/{REPO}/issues/{PR_NUMBER}/comments")
        if comments:
            for c in comments:
                body = c.get("body") or ""
                if BOT_MARKER in body:
                    m = re.search(
                        r"justification_hash \(sha256\):\s*`([0-9a-f]{64})`",
                        body
                    )
                    if m:
                        previous_hash = m.group(1)
                    break
    except Exception:
        # Silently ignore comment fetch failures - previous_hash stays None
        previous_hash = None

    # Enforce intent evolution rules
    evo_failures = enforce_intent_evolution(intent, new_hash, previous_hash)
    failures.extend(evo_failures)
    if previous_hash and new_hash and new_hash != previous_hash:
        notes.append(
            f"📝 Intent evolution detected: `{previous_hash[:12]}…` → `{new_hash[:12]}…`"
        )

    # Apply labels
    labels = []
    if emergency:
        labels += ["mode:emergency", "transparency-debt"]
    for scope_label in [part.strip() for part in applied_scope_label.split(",") if part.strip()]:
        labels += SCOPE_LABELS.get(scope_label, [])
    add_labels(PR_NUMBER, labels)

    # Request reviewers
    reviewers_cfg = SCOPE_REVIEWERS.get(
        applied_scope_label,
        {"reviewers": [], "team_reviewers": []}
    )
    request_reviewers(
        PR_NUMBER,
        reviewers_cfg.get("reviewers"),
        reviewers_cfg.get("team_reviewers")
    )

    # Divergence severity scoring
    severity = divergence_severity(failures, out_of_scope)

    # Emergency transparency debt issue
    debt_issue = None
    if emergency:
        existing = find_existing_debt_issue(PR_NUMBER)
        if existing:
            debt_issue = existing
        else:
            due = (datetime.now(timezone.utc) + timedelta(hours=TRANSPARENCY_DEBT_HOURS))
            due_str = due.strftime("%Y-%m-%dT%H:%M:%SZ")
            title = f"🚨 Transparency Debt — PR #{PR_NUMBER}"
            body = (
                f"## Emergency Mode Transparency Debt\n\n"
                f"Emergency authority was invoked. Post-facto justification required.\n\n"
                f"### Details\n\n"
                f"- **PR:** #{PR_NUMBER}\n"
                f"- **Author:** @{PR_USER}\n"
                f"- **Declared emergency_scope:** `{intent.get('emergency_scope', '')}`\n"
                f"- **ledger_id:** `{intent.get('ledger_id', '')}`\n"
                f"- **justification_hash:** `{new_hash}`\n"
                f"- **Debt due by (UTC):** `{due_str}`\n\n"
                f"### Required Follow-up\n\n"
                f"1. Publish full EPICON-02 post-facto justification (anchors + boundaries)\n"
                f"2. Confirm scope remained contained\n"
                f"3. Link any incident context / tests / remediation\n"
                f"4. Close this issue once debt is fulfilled\n\n"
                f"---\n\n"
                f"*Reference: [EPICON-02 Specification](../docs/epicon/EPICON-02.md)*"
            )
            try:
                debt_issue = create_issue(
                    title,
                    body,
                    labels=["transparency-debt", "mode:emergency"]
                )
            except Exception:
                debt_issue = None

    # Compose comment
    status = "✅ PASS" if not failures else "❌ FAIL"
    severity_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(severity, "⚪")
    
    sample_files = "\n".join([f"- `{f}`" for f in files[:15]])
    if len(files) > 15:
        sample_files += f"\n- … +{len(files) - 15} more"

    debt_line = ""
    if debt_issue and debt_issue.get("html_url"):
        debt_line = f"- **Transparency Debt Issue:** {debt_issue['html_url']}"

    comment_parts = [
        f"## 🌀 Mobius PR Bot — EPICON-02 Check: {status}",
        "",
        "### Intent Publication",
        "",
        f"| Field | Value |",
        f"|-------|-------|",
        f"| ledger_id | `{intent.get('ledger_id', '')}` |",
        f"| scope | `{intent.get('scope', '')}` |",
        f"| mode | `{intent.get('mode', 'normal')}` |",
        f"| emergency_scope | `{intent.get('emergency_scope', '')}` |",
        f"| issued_at | `{intent.get('issued_at', '')}` |",
        f"| expires_at | `{intent.get('expires_at', '')}` |",
        f"| justification_hash (sha256) | `{new_hash}` |",
        f"| previous_hash | `{previous_hash or '(none)'}` |",
        "",
        "### Divergence Severity",
        "",
        f"{severity_emoji} **{severity.upper()}**",
        "",
        "### Changed Files",
        "",
        sample_files if files else "- (none)",
        "",
        "### Labels Applied",
        "",
        "\n".join([f"- `{l}`" for l in labels]) if labels else "- (none)",
        "",
    ]

    if debt_line:
        comment_parts += [
            "### Transparency Debt",
            "",
            debt_line,
            "",
        ]

    if notes:
        comment_parts += [
            "### Notes",
            "",
            "\n".join([f"- {n}" for n in notes]),
            "",
        ]

    if failures:
        comment_parts += [
            "### Failures",
            "",
            "\n".join([f"- ❌ {f}" for f in failures]),
            "",
        ]
        
        # Add auto-generated template if available
        if HAS_TEMPLATE_GEN and files:
            template = generate_template(files)
            comment_parts += [
                "### 📝 Auto-Generated Template",
                "",
                "**Paste this template into your PR description and fill it out:**",
                "",
                template,
                "",
            ]
        
        comment_parts += [
            "### How to Fix",
            "",
            "1. Ensure the PR body includes the `EPICON-02 INTENT PUBLICATION` block",
            "2. Fill all required fields: `ledger_id`, `scope`, `issued_at`, `expires_at`, `justification`",
            "3. Keep `scope` aligned with changed files (or reduce PR surface)",
            "4. Use ISO-8601 timestamps with `Z` suffix",
            "5. If justification changes, set `intent_evolution: true` with `supersedes_hash` and `evolution_reason`",
            "6. For emergency mode: set `mode: emergency` AND `emergency_scope` (≤72h window)",
            "",
            "### 🔎 Why This Failed",
            "",
            "- Authority was exercised without a published intent.",
            "- Changed files affect governance control-plane.",
            "- EPICON-02 requires time-bounded, auditable justification.",
            "",
            "👉 **Learn more:** [docs/epicon/EXPLAIN_FAILURE.md](../docs/epicon/EXPLAIN_FAILURE.md)",
            "",
        ]

    comment_parts += [
        "---",
        "",
        "*[EPICON-02 Reference](../docs/epicon/EPICON-02.md) · " +
        "[Formal Invariants](../docs/epicon/EPICON-02-INVARIANTS.md)*",
    ]

    post_or_update_sticky_comment(PR_NUMBER, "\n".join(comment_parts))

    if failures:
        print(f"FAIL: {len(failures)} issue(s)")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    
    print("PASS")
    sys.exit(0)


if __name__ == "__main__":
    if not (GITHUB_TOKEN and PR_NUMBER and REPO and PR_BASE_SHA and PR_HEAD_SHA):
        print("Missing required env vars: GITHUB_TOKEN, PR_NUMBER, REPO, PR_BASE_SHA, PR_HEAD_SHA")
        sys.exit(2)
    main()
