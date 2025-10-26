from .models import RubricScores

def critique_text(prompt: str, answer: str, rubric: RubricScores) -> str:
    """Light, rubric-aligned critique with actionable edits."""
    tips = []
    if rubric.accuracy < 5:
        tips.append("- Cite a source or definition for key claims to raise accuracy.")
    if rubric.depth < 5:
        tips.append("- Add 2–3 concrete examples or a step-by-step to deepen explanation.")
    if rubric.originality < 5:
        tips.append("- Rephrase repeated ideas and add a novel analogy to increase originality.")
    if rubric.integrity < 5:
        tips.append("- Remove speculative/unsafe advice; keep to verifiable statements.")

    return f"""# Critique
Prompt: {prompt}

## Strengths
- Clear structure in parts.
- Addresses the question directly.

## Weak Spots
{chr(10).join(tips) if tips else "- Already strong across rubric; polish wording and flow."}

## Suggested Rewrite (keep voice, improve clarity)
1) Start with a one-sentence thesis answering the prompt.
2) Provide a crisp definition or core idea in 1–2 sentences.
3) Add two concrete examples (everyday + technical).
4) End with a 1–2 sentence takeaway the learner can act on.
"""

