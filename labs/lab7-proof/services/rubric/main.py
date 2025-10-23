from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
import textdistance

app = FastAPI(title="lab7 Rubric", version="0.1.0")

class ScoreRequest(BaseModel):
    prompt: str
    answer: str
    prev_answer: Optional[str] = None

class RubricScores(BaseModel):
    accuracy: int = Field(ge=0, le=5)
    depth: int = Field(ge=0, le=5)
    originality: int = Field(ge=0, le=5)
    integrity: int = Field(ge=0, le=5)

class ScoreResponse(BaseModel):
    scores: RubricScores
    meta: dict = {}

@app.post("/rubric/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    # toy heuristics: length/depth; originality via Jaccard against prev_answer; integrity constant 5
    length = len(req.answer.split())
    depth = 5 if length > 180 else 4 if length > 120 else 3 if length > 60 else 2
    acc = 4 if "because" in req.answer or "therefore" in req.answer else 3
    if "citation" in req.answer.lower(): acc = min(5, acc + 1)

    if req.prev_answer:
        sim = textdistance.jaccard.similarity(set(req.answer.lower().split()), set(req.prev_answer.lower().split()))
        originality = 5 if sim < 0.3 else 4 if sim < 0.45 else 3 if sim < 0.6 else 2
    else:
        originality = 4

    integrity = 5  # stub; later: fact checks, shield signals
    scores = RubricScores(accuracy=acc, depth=depth, originality=originality, integrity=integrity)

    return ScoreResponse(scores=scores, meta={"length_words": length})
