import os, httpx
from .models import RubricScores

BASE = os.getenv("RUBRIC_BASE_URL", "http://localhost:8090")

async def score_async(prompt: str, answer: str, prev_answer: str | None = None) -> RubricScores:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(f"{BASE}/rubric/score", json={"prompt": prompt, "answer": answer, "prev_answer": prev_answer})
        r.raise_for_status()
        data = r.json()["scores"]
        return RubricScores(**data)

