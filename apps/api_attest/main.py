from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime
import os

app = FastAPI(title="Kaizen Attest API", version="0.1.0")

# CORS middleware
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = allowed_origins_env.split(",") if allowed_origins_env and allowed_origins_env != "*" else ["*"]
# Security: cannot use allow_credentials=True with allow_origins=["*"]
# Browsers reject credentialed requests when Access-Control-Allow-Origin is "*"
is_wildcard = origins == ["*"] or "*" in origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=not is_wildcard,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


class OSINTRef(BaseModel):
    source: str
    url: Optional[HttpUrl] = None
    note: Optional[str] = None


class ConsensusResult(BaseModel):
    agreement: float = Field(ge=0, le=1)
    votes: int
    label: str  # "authentic" | "synthetic_declared" | "synthetic_undeclared" | "indeterminate"
    rationale: List[str] = []


class AttestIn(BaseModel):
    media_hash: str                 # sha256 hex
    c2pa: bool = False              # content credentials present
    watermark_ok: bool = False      # robust/invisible watermark detected?
    declared_synthetic: bool = False
    capture_signature: Optional[str] = None # DID or device cert
    capture_ts: Optional[str] = None       # ISO8601
    osint_refs: List[OSINTRef] = []
    delib_votes: List[ConsensusResult] = []  # optional precomputed votes
    creator_did: Optional[str] = None
    context_tags: List[str] = []


class AttestOut(BaseModel):
    type: str = "media.attestation/v1"
    hash: str
    c2pa: bool
    watermark: str                  # "ok" | "missing"
    declared: bool
    consensus: ConsensusResult
    gi_effect: float
    creator_did: Optional[str]
    timestamp: str
    osint_refs: List[OSINTRef] = []


def _synth_label(declared: bool) -> str:
    return "synthetic_declared" if declared else "synthetic_undeclared"


@app.post("/attest", response_model=AttestOut)
def attest(payload: AttestIn):
    # Simple consensus fold (if client didn't send delib_votes, default neutral)
    if payload.delib_votes:
        avg_agreement = sum(v.agreement for v in payload.delib_votes)/len(payload.delib_votes)
        votes = sum(v.votes for v in payload.delib_votes)
        # majority label by weighted agreement
        by_label = {}
        for v in payload.delib_votes:
            by_label.setdefault(v.label, []).append(v.agreement * v.votes)
        label = max(by_label, key=lambda k: sum(by_label[k]))
        rationale = [f"{len(payload.delib_votes)} panel votes; majority={label}"]
        consensus = ConsensusResult(agreement=avg_agreement, votes=votes, label=label, rationale=rationale)
    else:
        # infer a conservative label
        if payload.c2pa or payload.watermark_ok:
            label = "authentic" if not payload.declared_synthetic else "synthetic_declared"
            consensus = ConsensusResult(agreement=0.75, votes=3, label=label, rationale=["heuristic: provenance present"])
        else:
            label = _synth_label(payload.declared_synthetic)
            consensus = ConsensusResult(agreement=0.55, votes=3, label=label, rationale=["heuristic: provenance weak"])

    # GI effect: reward honest disclosure + provenance; penalize undeclared synthetic
    gi_effect = 0.0
    gi_effect += 0.003 if payload.c2pa else 0.0
    gi_effect += 0.002 if payload.watermark_ok else 0.0
    gi_effect += 0.003 if consensus.label == "authentic" else 0.0
    gi_effect += 0.002 if consensus.label == "synthetic_declared" else 0.0
    gi_effect -= 0.006 if consensus.label == "synthetic_undeclared" else 0.0

    out = AttestOut(
        hash=payload.media_hash,
        c2pa=payload.c2pa,
        watermark="ok" if payload.watermark_ok else "missing",
        declared=payload.declared_synthetic,
        consensus=consensus,
        gi_effect=round(gi_effect, 6),
        creator_did=payload.creator_did,
        timestamp=datetime.utcnow().isoformat() + "Z",
        osint_refs=payload.osint_refs,
    )
    # TODO: seal to Civic Ledger (async queue) & emit GI update
    return out


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "attest", "version": "0.1.0"}

