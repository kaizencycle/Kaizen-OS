from typing import Dict, List
from .models import Source, SourceScore

# In-memory store (swap to DB later)
SOURCES: Dict[str, Source] = {}
SCORES: Dict[str, SourceScore] = {}
VOTES: Dict[str, list[dict]] = {}

def upsert_source(s: Source, score: SourceScore):
    SOURCES[s.id] = s
    SCORES[s.id] = score

def list_sources(min_score: float = 0.0, gate: str|None = None) -> List[tuple[Source, SourceScore]]:
    out = []
    for sid, s in SOURCES.items():
        sc = SCORES.get(sid)
        if not sc: continue
        if sc.composite < min_score: continue
        if gate and sc.policy_gate != gate: continue
        out.append((s, sc))
    # sort by composite desc
    out.sort(key=lambda t: t[1].composite, reverse=True)
    return out

def record_vote(source_id: str, vote: dict):
    VOTES.setdefault(source_id, []).append(vote)

def votes_count(source_id: str) -> int:
    return len(VOTES.get(source_id, []))

def summarize_reputation(source_id: str) -> float:
    votes = VOTES.get(source_id, [])
    if not votes:
        return 0.7  # baseline neutral
    up = sum(1 for v in votes if v["opinion"] == "up")
    down = sum(1 for v in votes if v["opinion"] == "down")
    total = len(votes)
    base = (up - down) / max(1, total)
    stake_bonus = sum(v["stake_gic"] * (1 if v["opinion"] == "up" else -1) for v in votes)
    rep = 0.7 + 0.15*base + 0.001*stake_bonus
    return max(0.0, min(1.0, rep))
