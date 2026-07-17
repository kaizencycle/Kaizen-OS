#!/usr/bin/env python3
"""
EPICON Intent Template Generator

Generates context-aware EPICON-02 intent publication templates
based on changed files and detected scope.

Reference: docs/epicon/EPICON-02.md
"""

from datetime import datetime, timezone, timedelta
from typing import Optional


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
    "ci": [".github/", "ci/", "scripts/"],
    "core": ["src/", "packages/", "apps/", "services/", "package.json", "package-lock.json"],
    "infra": ["infra/", "deploy/", "docker/", "monitoring/", "grafana/"],
    "sentinels": ["sentinels/"],
    "labs": ["labs/"],
    "specs": ["specs/", "schemas/", "configs/", "tests/", "canon/"],
}

# Governance-sensitive patterns
GOVERNANCE_PATTERNS = [
    "CODEOWNERS",
    "PULL_REQUEST_TEMPLATE",
    ".github/workflows/",
    "SECURITY.md",
    "GOVERNANCE.md",
    "CHARTER.md",
    "BYLAWS.md",
]


def detect_scope(changed_files: list[str]) -> list[str]:
    """
    Detect scope categories from changed files.
    
    Args:
        changed_files: List of file paths changed in the PR
        
    Returns:
        List of detected scope labels
    """
    scopes = set()
    
    for f in changed_files:
        for scope, prefixes in SCOPE_MAP.items():
            for prefix in prefixes:
                if f == prefix.rstrip("/") or f.startswith(prefix):
                    scopes.add(scope)
                    break
    
    # Check for governance-sensitive files
    for f in changed_files:
        for pattern in GOVERNANCE_PATTERNS:
            if pattern in f:
                scopes.add("governance")
                break
    
    # Check for code ownership changes
    if any("CODEOWNERS" in f for f in changed_files):
        scopes.add("code_ownership")
    
    # Check for process changes
    if any("PULL_REQUEST_TEMPLATE" in f for f in changed_files):
        scopes.add("process")
    
    return sorted(scopes) if scopes else ["feature"]


def detect_mode(changed_files: list[str]) -> str:
    """
    Detect if emergency mode might be needed.
    
    Args:
        changed_files: List of file paths changed in the PR
        
    Returns:
        "normal" or "emergency"
    """
    # By default, return normal mode
    # Emergency mode should be explicitly set by the author
    return "normal"


def calculate_expires_at(
    issued_at: datetime,
    mode: str = "normal",
    scope: list[str] | None = None
) -> datetime:
    """
    Calculate appropriate expiration time.
    
    Args:
        issued_at: When the intent was issued
        mode: "normal" or "emergency"
        scope: List of scope categories
        
    Returns:
        Expiration datetime
    """
    if mode == "emergency":
        # Emergency: max 72 hours
        return issued_at + timedelta(hours=72)
    
    # Governance changes: shorter window (30 days)
    if scope and ("governance" in scope or "code_ownership" in scope):
        return issued_at + timedelta(days=30)
    
    # Default: 90 days max
    return issued_at + timedelta(days=90)


def generate_template(
    changed_files: list[str],
    ledger_id: Optional[str] = None,
    mode: Optional[str] = None,
    pr_title: Optional[str] = None,
    pr_author: Optional[str] = None
) -> str:
    """
    Generate an EPICON-02 intent publication template.
    
    Args:
        changed_files: List of file paths changed in the PR
        ledger_id: Optional ledger ID to use
        mode: Optional mode override ("normal" or "emergency")
        pr_title: Optional PR title for context
        pr_author: Optional PR author username
        
    Returns:
        Formatted intent template as markdown
    """
    scope = detect_scope(changed_files)
    mode = mode or detect_mode(changed_files)
    
    now = datetime.now(timezone.utc)
    issued_at = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    expires_at = calculate_expires_at(now, mode, scope).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    ledger_id = ledger_id or "mobius:<your-ledger-id>"
    
    # Build scope string
    scope_str = ", ".join(scope)
    
    # Build justification hint based on scope
    justification_hints = []
    if "governance" in scope:
        justification_hints.append("This change affects governance structures.")
    if "code_ownership" in scope:
        justification_hints.append("This change modifies code ownership rules.")
    if "process" in scope:
        justification_hints.append("This change updates contribution processes.")
    if "ci" in scope:
        justification_hints.append("This change affects CI/CD pipelines.")
    if "core" in scope:
        justification_hints.append("This change modifies core application code.")
    
    justification_hint = " ".join(justification_hints) if justification_hints else \
        "Explain WHY this change is needed and what it accomplishes."
    
    # Build counterfactual hints
    counterfactual_hints = [
        "If this change breaks existing functionality, it should be reverted.",
    ]
    if "governance" in scope or "code_ownership" in scope:
        counterfactual_hints.append(
            "If this change concentrates power without consensus, it should be blocked."
        )
    
    # Build the template
    template_lines = [
        "## EPICON-02 INTENT PUBLICATION",
        "",
        "```intent",
        f"ledger_id: {ledger_id}",
        f"scope: {scope_str}",
        f"mode: {mode}",
    ]
    
    # Add emergency_scope if emergency mode
    if mode == "emergency":
        # Use the primary scope as emergency_scope
        emergency_scope = scope[0] if scope else "core"
        template_lines.append(f"emergency_scope: {emergency_scope}")
    
    template_lines.extend([
        f"issued_at: {issued_at}",
        f"expires_at: {expires_at}",
        "justification: |",
        f"  {justification_hint}",
        "counterfactuals:",
    ])
    
    for hint in counterfactual_hints:
        template_lines.append(f"  - {hint}")
    
    template_lines.append("```")
    
    return "\n".join(template_lines)


def generate_failure_comment(
    changed_files: list[str],
    failures: list[str],
    severity: str = "high"
) -> str:
    """
    Generate a failure comment with auto-generated template.
    
    Args:
        changed_files: List of file paths changed in the PR
        failures: List of failure messages
        severity: Divergence severity (low, medium, high)
        
    Returns:
        Formatted comment as markdown
    """
    template = generate_template(changed_files)
    
    severity_emoji = {
        "low": "🟢",
        "medium": "🟡", 
        "high": "🔴"
    }.get(severity, "⚪")
    
    comment_lines = [
        "## ❌ **EPICON-02 Check: FAIL**",
        "",
        "Missing or incomplete intent publication.",
        "",
        f"### Divergence Severity: {severity_emoji} **{severity.upper()}**",
        "",
        "### Failures",
        "",
    ]
    
    for failure in failures:
        comment_lines.append(f"- ❌ {failure}")
    
    comment_lines.extend([
        "",
        "---",
        "",
        "### 📝 Auto-Generated Template",
        "",
        "**Paste this template into your PR description and fill it out:**",
        "",
        template,
        "",
        "---",
        "",
        "### 🔎 Why This Failed",
        "",
        "- Authority was exercised without a published intent.",
        "- Changed files affect governance control-plane.",
        "- EPICON-02 requires time-bounded, auditable justification.",
        "",
        "👉 **Learn more:** [docs/epicon/EXPLAIN_FAILURE.md](../docs/epicon/EXPLAIN_FAILURE.md)",
        "",
        "---",
        "",
        "*[EPICON-02 Reference](../docs/epicon/EPICON-02.md) · " +
        "[Formal Invariants](../docs/epicon/EPICON-02-INVARIANTS.md)*",
    ])
    
    return "\n".join(comment_lines)


def main():
    """CLI entry point for testing."""
    import sys
    
    # Example usage
    test_files = [
        ".github/CODEOWNERS",
        ".github/PULL_REQUEST_TEMPLATE.md",
    ]
    
    if len(sys.argv) > 1:
        test_files = sys.argv[1:]
    
    print("=== Detected Scope ===")
    scope = detect_scope(test_files)
    print(f"Scope: {scope}")
    print()
    
    print("=== Generated Template ===")
    template = generate_template(test_files)
    print(template)
    print()
    
    print("=== Failure Comment Example ===")
    failures = [
        "Missing required header: 'EPICON-02 INTENT PUBLICATION'",
        "Missing fenced ```intent block under EPICON-02 header",
    ]
    comment = generate_failure_comment(test_files, failures)
    print(comment)


if __name__ == "__main__":
    main()
