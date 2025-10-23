import yaml
from pathlib import Path
from typing import Dict, Any, List, Tuple
from .models import Source, SourceScore

DEFAULT_PATH = Path(__file__).with_name("default_policy.yaml")

class Policy:
    def __init__(self, spec: Dict[str, Any]):
        self.spec = spec
        self.rules = spec.get("rules", [])
        self.default_effect = spec.get("defaults","review")

    @classmethod
    def load(cls, p: Path|None = None) -> "Policy":
        path = p or DEFAULT_PATH
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        return cls(data)

    def eval(self, src: Source, score: SourceScore) -> Tuple[str, List[str]]:
        """
        Return (effect, reasons)
        effect in {"pass","deny","review"}
        """
        reasons: List[str] = []
        effect_order = {"deny": 0, "review": 1, "pass": 2}
        final_effect = self.default_effect

        ctx = {
            "license": (src.license or "").upper(),
            "tags": set(src.tags),
            "composite": score.composite,
            "scores": score.scores,
            "meta": src.meta,
            "has_pii_leak": ("pii_leak" in src.tags),
            "last_update_days": None,
        }

        if src.last_update:
            from datetime import datetime
            ctx["last_update_days"] = (datetime.utcnow() - src.last_update).days

        for r in self.rules:
            rid = r.get("id","rule")
            when = r.get("when","")
            effect = r.get("effect","review")
            try:
                # CAUTION: eval on trusted policy only (your own YAML)
                if eval(when, {}, ctx):
                    reasons.append(f"{rid}:{effect}")
                    # choose the strongest (deny < review < pass)
                    if effect_order[effect] < effect_order[final_effect]:
                        final_effect = effect
            except Exception:
                reasons.append(f"{rid}:error")

        return final_effect, reasons

def apply_policy(policy: Policy, src: Source, score: SourceScore) -> SourceScore:
    eff, reasons = policy.eval(src, score)
    score.policy_gate = eff  # mutate
    return score, reasons
