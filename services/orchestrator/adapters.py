from typing import Dict
from .models import MentorName

def route_to_mentors(prompt: str, mentors: list[MentorName]) -> Dict[MentorName, str]:
    # STUB: return playful drafts; replace with real SDK calls
    replies: Dict[MentorName, str] = {}
    for m in mentors:
        replies[m] = f"[{m}] draft for: {prompt[:80]}..."
    return replies
