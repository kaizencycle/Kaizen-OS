from pydantic import BaseModel, AnyHttpUrl, Field
from typing import Any, List, Optional, Dict, Literal
from datetime import datetime

class Endpoint(BaseModel):
    path: str
    method: Literal["GET","POST","PUT","DELETE","PATCH"] = "GET"
    schema: Optional[str] = None
    notes: Optional[str] = None

class Source(BaseModel):
    id: str                       # e.g. "src:public-apis:open-meteo"
    name: str
    domain: str
    category: List[str] = []
    auth: Literal["none","apiKey","oauth2","other"] = "none"
    license: Optional[str] = None
    owner: Optional[Dict[str,str]] = None
    endpoints: List[Endpoint] = []
    meta: Dict[str, str] = {}
    last_update: Optional[datetime] = None
    tags: List[str] = []

class SourceScore(BaseModel):
    source_id: str
    scores: Dict[str, float]      # provenance, permission, freshness, quality, safety, reputation
    composite: float
    policy_gate: Literal["pass","deny","review"]

class IngestRequest(BaseModel):
    # Option A: provide a URL to a JSON list of sources
    url: Optional[AnyHttpUrl] = None
    # Option B: inline sources in request
    sources: Optional[List[Source]] = None
    # Optional: label for where we ingested from
    origin: str = "manual"

class FilterRequest(BaseModel):
    source: Source

class FilterResult(BaseModel):
    score: SourceScore
    reasons: List[str] = []  # which rules fired

class ReputeVote(BaseModel):
    source_id: str
    voter_id: str
    stake_gic: float = 0.0
    opinion: Literal["up","down","neutral"] = "neutral"
    comment: Optional[str] = None

class ReputeResult(BaseModel):
    ok: bool
    new_reputation: float
    total_votes: int
    attestation: Optional[Dict[str, Any]] = None  # NEW

class VerifyRequest(BaseModel):
    attestation: Dict[str, Any]

class VerifyResponse(BaseModel):
    ok: bool
    reason: Optional[str] = None
    recomputed_hash: Optional[str] = None
    signer_known: Optional[bool] = None
    ts_ok: Optional[bool] = None
    nonce_ok: Optional[bool] = None

