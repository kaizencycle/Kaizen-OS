from fastapi import FastAPI, HTTPException, APIRouter
from datetime import datetime
from typing import Dict

from .models import (
    StartSessionRequest, StartSessionResponse, TurnRequest, TurnResponse,
    SubmitRequest, SubmitResponse, RubricScores,
    AttestationCommitRequest, AttestationCommitResponse,
    RewardIntentRequest, RewardIntentResponse, BalanceResponse,
    CritiqueRequest, CritiqueResponse
)
from .adapters import route_to_mentors
from .shield import scan, passes_mint_gates
from .xp import xp_from_rubric, level_after
from .attest import commit_attestation
from .rewards import maybe_mint
from .indexer import apply_tx, get_balance
from .critique import critique_text
from .rubric_client import score_async

app = FastAPI(title="lab7-proof OAA Orchestrator", version="0.1.0")

# Create v1 API router
api = APIRouter(prefix="/v1")

# In-memory demo stores (swap to Postgres/Redis later)
_SESSIONS: Dict[str, Dict] = {}     # session_id -> {user_id, mentors, total_xp, level}
_USER_WALLETS: Dict[str, str] = {}  # user_id -> wallet (demo)

def _mk_session_id(user_id: str) -> str:
    return f"sess_{user_id}_{int(datetime.utcnow().timestamp())}"

def _get_wallet(user_id: str) -> str:
    if user_id not in _USER_WALLETS:
        _USER_WALLETS[user_id] = f"gic_{user_id[-6:]}"
    return _USER_WALLETS[user_id]

@api.post("/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    session_id = _mk_session_id(req.user_id)
    _SESSIONS[session_id] = {
        "user_id": req.user_id,
        "mentors": req.mentors,
        "total_xp": 0,
        "level": 1,
        "turns": []
    }
    return StartSessionResponse(
        session_id=session_id,
        mentors=req.mentors,
        started_at=datetime.utcnow()
    )

@api.post("/session/turn", response_model=TurnResponse)
def session_turn(req: TurnRequest):
    sess = _SESSIONS.get(req.session_id)
    if not sess:
        raise HTTPException(404, "session not found")
    mentors = req.tools or sess["mentors"]
    drafts = route_to_mentors(req.prompt, mentors)
    sess["turns"].append({"prompt": req.prompt, "drafts": drafts})
    return TurnResponse(session_id=req.session_id, drafts=drafts, meta={"mentors_used": mentors})

@api.post("/session/submit", response_model=SubmitResponse)
async def session_submit(req: SubmitRequest):
    sess = _SESSIONS.get(req.session_id)
    if not sess:
        raise HTTPException(404, "session not found")

    # 1) Shield scan
    shield = scan(req)
    if not shield.ok:
        raise HTTPException(400, f"Shield blocked submission: {shield.reasons}")

    # 2) Get rubric scoring from service
    prev_answer = None
    if sess["turns"]:
        last = sess["turns"][-1]
        prev_answer = last.get("answer")
    rubric = await score_async(req.prompt, req.answer, prev_answer)

    # 3) XP + Level
    xp = xp_from_rubric(rubric)
    before = sess["level"]
    sess["total_xp"] += xp
    after = level_after(sess["total_xp"])
    sess["level"] = after

    # 4) Attestation
    mentors_used = sess["mentors"]
    att_req = AttestationCommitRequest(
        session_id=req.session_id,
        user_id=req.user_id,
        mentors_used=mentors_used,
        rubric=rubric,
        xp_awarded=xp
    )
    att: AttestationCommitResponse = commit_attestation(att_req)

    # 5) Reward intent → mint (optional)
    reward_tx_id = None
    balance_after = None
    if after > before:
        ok_mint, reasons = passes_mint_gates(rubric, attestation_sig_present=bool(att.sig))
        if not ok_mint:
            # Level up but no mint due to policy; still return attestation/xp
            return SubmitResponse(
                attestation_id=att.attestation_id,
                xp_awarded=xp,
                level_before=before,
                level_after=after,
                reward_tx_id=None,
                balance_after=None
            )
        # proceed to mint
        rew_req = RewardIntentRequest(
            user_id=req.user_id,
            attestation_id=att.attestation_id,
            level_before=before,
            level_after=after,
            xp_total=sess["total_xp"]
        )
        res = maybe_mint(rew_req)
        if res:
            reward_tx_id = res.tx_id
            wallet = _get_wallet(req.user_id)
            apply_tx(wallet, res.amount, res.tx_id)
            balance_after = get_balance(wallet).balance

    return SubmitResponse(
        attestation_id=att.attestation_id,
        xp_awarded=xp,
        level_before=before,
        level_after=after,
        reward_tx_id=reward_tx_id,
        balance_after=balance_after
    )

@api.post("/session/critique", response_model=CritiqueResponse)
async def session_critique(req: CritiqueRequest):
    # score current draft using rubric service
    rubric = await score_async(req.prompt, req.answer, None)
    text = critique_text(req.prompt, req.answer, rubric)
    return CritiqueResponse(rubric=rubric, critique=text)

# ----- Internal endpoints (stubs you can wire to separate services) -----

@api.post("/attest/commit", response_model=AttestationCommitResponse)
def attest_commit(req: AttestationCommitRequest):
    return commit_attestation(req)

@api.post("/reward/intent", response_model=RewardIntentResponse)
def reward_intent(req: RewardIntentRequest):
    res = maybe_mint(req)
    if res is None:
        raise HTTPException(400, "No reward minted (no level-up)")
    # apply to fake balance
    wallet = _get_wallet(req.user_id)
    apply_tx(wallet, res.amount, res.tx_id)
    return res

@api.get("/ledger/balance/{user_id}", response_model=BalanceResponse)
def ledger_balance(user_id: str):
    wallet = _get_wallet(user_id)
    return get_balance(wallet)

# Include the v1 router
app.include_router(api)

# Legacy endpoints for backward compatibility
@app.post("/session/start", response_model=StartSessionResponse)
def start_session_legacy(req: StartSessionRequest):
    return start_session(req)

@app.post("/session/turn", response_model=TurnResponse)
def session_turn_legacy(req: TurnRequest):
    return session_turn(req)

@app.post("/session/submit", response_model=SubmitResponse)
async def session_submit_legacy(req: SubmitRequest):
    return await session_submit(req)

@app.post("/session/critique", response_model=CritiqueResponse)
async def session_critique_legacy(req: CritiqueRequest):
    return await session_critique(req)

@app.post("/attest/commit", response_model=AttestationCommitResponse)
def attest_commit_legacy(req: AttestationCommitRequest):
    return attest_commit(req)

@app.post("/reward/intent", response_model=RewardIntentResponse)
def reward_intent_legacy(req: RewardIntentRequest):
    return reward_intent(req)

@app.get("/ledger/balance/{user_id}", response_model=BalanceResponse)
def ledger_balance_legacy(user_id: str):
    return ledger_balance(user_id)
