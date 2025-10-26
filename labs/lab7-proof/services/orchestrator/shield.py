from .models import ShieldScanResult, SubmitRequest, RubricScores
from .policy import load_policy

def scan(req: SubmitRequest) -> ShieldScanResult:
    policy = load_policy()
    lower = (req.prompt + " " + req.answer).lower()
    hits = [w for w in policy.get("content_filters", {}).get("blocked_keywords", []) if w in lower]
    if hits:
        return ShieldScanResult(ok=False, reasons=[f"blocked_keyword:{w}" for w in hits])
    return ShieldScanResult(ok=True, reasons=[])

def passes_mint_gates(rubric: RubricScores, attestation_sig_present: bool) -> tuple[bool, list[str]]:
    p = load_policy().get("mint_gates", {})
    issues = []
    if p.get("require_attestation_sig", True) and not attestation_sig_present:
        issues.append("missing_attestation_sig")
    if rubric.integrity < p.get("min_integrity_score", 4):
        issues.append("integrity_below_threshold")
    avg = (rubric.accuracy + rubric.depth + rubric.originality + rubric.integrity) / 4.0
    if avg < p.get("min_overall_rubric_avg", 3.5):
        issues.append("avg_rubric_below_threshold")
    return (len(issues) == 0, issues)

