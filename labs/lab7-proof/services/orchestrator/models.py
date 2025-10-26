from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime

MentorName = Literal["gemini", "claude", "deepseek", "perplexity"]

class StartSessionRequest(BaseModel):
    user_id: str
    mentors: List[MentorName] = ["gemini", "claude"]

class StartSessionResponse(BaseModel):
    session_id: str
    mentors: List[MentorName]
    started_at: datetime

class TurnRequest(BaseModel):
    session_id: str
    prompt: str
    tools: List[MentorName] | None = None

class TurnResponse(BaseModel):
    session_id: str
    drafts: Dict[MentorName, str]
    meta: Dict[str, Any] = {}

class SubmitRequest(BaseModel):
    session_id: str
    user_id: str
    prompt: str
    answer: str

class ShieldScanResult(BaseModel):
    ok: bool
    reasons: List[str] = []

class RubricScores(BaseModel):
    accuracy: int = Field(ge=0, le=5)
    depth: int = Field(ge=0, le=5)
    originality: int = Field(ge=0, le=5)
    integrity: int = Field(ge=0, le=5)

class SubmitResponse(BaseModel):
    attestation_id: str
    xp_awarded: int
    level_before: int
    level_after: int
    reward_tx_id: Optional[str] = None
    balance_after: Optional[float] = None

class AttestationCommitRequest(BaseModel):
    session_id: str
    user_id: str
    mentors_used: List[MentorName]
    rubric: RubricScores
    xp_awarded: int

class AttestationCommitResponse(BaseModel):
    attestation_id: str
    gi_snapshot: float
    merkle_root: str
    sig: str
    ts: datetime

class RewardIntentRequest(BaseModel):
    user_id: str
    attestation_id: str
    level_before: int
    level_after: int
    xp_total: int

class RewardIntentResponse(BaseModel):
    tx_id: str
    amount: float
    status: Literal["pending", "confirmed"]

class BalanceResponse(BaseModel):
    wallet: str
    balance: float
    last_tx_id: Optional[str] = None

class CritiqueRequest(BaseModel):
    session_id: str
    prompt: str
    answer: str

class CritiqueResponse(BaseModel):
    rubric: RubricScores
    critique: str

