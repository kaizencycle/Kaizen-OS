from .models import RubricScores

def xp_from_rubric(r: RubricScores) -> int:
    # simple demo: weighted sum * 5
    return int((r.accuracy*0.35 + r.depth*0.30 + r.originality*0.20 + r.integrity*0.15) * 5 * 2)

def level_after(total_xp: int) -> int:
    # quadratic-ish curve: base 100, growth 1.35 (approx)
    # L1 starts at 0; every ~1.35x more XP increases a level
    level = 1
    threshold = 100.0
    remaining = total_xp
    while remaining >= threshold:
        remaining -= threshold
        level += 1
        threshold *= 1.35
    return level
