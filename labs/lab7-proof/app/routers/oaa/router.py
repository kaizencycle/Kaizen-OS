from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from typing import Optional, List
from datetime import datetime
import httpx
import os, time, uuid, asyncio

from .models import IngestRequest, FilterRequest, FilterResult, Source, SourceScore, ReputeVote, ReputeResult, VerifyRequest, VerifyResponse
from .scoring import score_source
from .policy import Policy, apply_policy
from .store import upsert_source, list_sources, record_vote, summarize_reputation, votes_count, SOURCES, SCORES
from .keys import keyset
from .state import build_state, sign_state, anchor_to_ledger
from .echo_routes import router as echo_router
from app.crypto.ed25519 import ed25519_sign, ed25519_verify, canonical_json, sha256_hex

router = APIRouter(prefix="/oaa", tags=["OAA"])

ADMIN_TOKEN = None  # set from env in main if you like

def _require_admin(x_admin_token: Optional[str]):
    if ADMIN_TOKEN and x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/ingest/snapshot")
async def ingest_snapshot(req: IngestRequest, x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)

    sources: List[Source] = []

    if req.sources:
        sources = req.sources
    elif req.url:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(str(req.url))
            r.raise_for_status()
            payload = r.json()
            # Expecting list[dict] shaped close to Source; normalize
            for item in payload:
                try:
                    # basic normalization
                    item.setdefault("id", item.get("id") or item.get("name","").lower().replace(" ","-"))
                    # coerce last_update if present
                    if "last_update" in item and isinstance(item["last_update"], str):
                        try:
                            item["last_update"] = datetime.fromisoformat(item["last_update"].replace("Z",""))
                        except:
                            item.pop("last_update", None)
                    s = Source(**item)
                    sources.append(s)
                except Exception:
                    continue
    else:
        raise HTTPException(status_code=400, detail="Provide url or sources")

    pol = Policy.load()
    added = 0
    results = []
    for s in sources:
        sc = score_source(s)
        sc, reasons = apply_policy(pol, s, sc)
        upsert_source(s, sc)
        results.append({"id": s.id, "composite": sc.composite, "gate": sc.policy_gate, "reasons": reasons})
        added += 1

    # TODO: anchor snapshot hash to Civic Ledger here
    return {"ok": True, "added": added, "results": results, "policy": "default_policy.yaml"}

@router.post("/filter", response_model=FilterResult)
async def filter_source(req: FilterRequest):
    pol = Policy.load()
    sc = score_source(req.source)
    sc, reasons = apply_policy(pol, req.source, sc)
    return FilterResult(score=sc, reasons=reasons)

@router.get("/sources")
def get_sources(min_score: float = 0.0, gate: Optional[str] = None):
    items = []
    for src, sc in list_sources(min_score=min_score, gate=gate):
        items.append({
            "source": src.model_dump(),
            "score": sc.model_dump()
        })
    return {"count": len(items), "items": items}

@router.post("/repute/vote", response_model=ReputeResult)
async def repute_vote(v: ReputeVote):
    if v.source_id not in SOURCES:
        raise HTTPException(status_code=404, detail="Source not found")

    prev_rep = SCORES[v.source_id].scores.get("reputation", 0.7)

    # Record vote locally
    record_vote(v.source_id, v.model_dump())

    # Recompute reputation and update score
    new_rep = summarize_reputation(v.source_id)
    sc = SCORES[v.source_id]
    sc.scores["reputation"] = round(new_rep, 2)
    SCORES[v.source_id] = sc

    # --- Build attestation payload ---
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    att = {
        "type": "oaa.repute.vote",
        "source_id": v.source_id,
        "voter_id": v.voter_id,
        "stake_gic": v.stake_gic,
        "opinion": v.opinion,
        "comment": v.comment or "",
        "prev_reputation": prev_rep,
        "new_reputation": new_rep,
        "oaa_policy_version": "default_policy.yaml",
        "oaa_version": "lab7-v1",
        "ts": now_iso,
        "nonce": str(uuid.uuid4()),
    }

    attestation = None
    priv_b64 = os.getenv("OAA_ED25519_PRIVATE_B64", "")
    pub_b64  = os.getenv("OAA_ED25519_PUBLIC_B64", "")
    ledger_url = os.getenv("LEDGER_URL", "").rstrip("/")
    try:
        if priv_b64 and pub_b64:
            content_hash, sig_b64 = ed25519_sign(priv_b64, att)
            attestation = {
                "content": att,
                "content_hash": f"sha256:{content_hash}",
                "signature": f"ed25519:{sig_b64}",
                "public_key_b64": pub_b64,
                "signing_key": "oaa:ed25519:v1",
            }
            if ledger_url:
                async with httpx.AsyncClient(timeout=15) as client:
                    r = await client.post(f"{ledger_url}/attest", json=attestation)
                    r.raise_for_status()
                    attestation["ledger_receipt"] = r.json()
    except Exception as e:
        attestation = attestation or {"content": att, "error": str(e)}

    return ReputeResult(
        ok=True,
        new_reputation=new_rep,
        total_votes=votes_count(v.source_id),
        attestation=attestation
    )

@router.get("/.well-known/oaa-keys.json")
def well_known_keys():
    return keyset()

@router.get("/state/snapshot")
def get_state_snapshot():
    snap = build_state()
    # Also return hash for quick diffing
    return {"snapshot": snap, "hash": "sha256:" + sha256_hex(snap)}

@router.post("/state/anchor")
async def post_state_anchor(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    snap = build_state()
    att  = sign_state(snap)
    try:
        receipt = await anchor_to_ledger(att)
        att["ledger_receipt"] = receipt
    except Exception as e:
        att["ledger_error"] = str(e)
    return {"ok": True, "attestation": att}

@router.post("/cron/daily")
async def cron_daily(background: BackgroundTasks, x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    # run anchor in background so cron returns fast
    async def _job():
        snap = build_state()
        att  = sign_state(snap)
        try:
            receipt = await anchor_to_ledger(att)
            # you could write to disk or log here if desired
        except Exception:
            pass

    background.add_task(_job)
    return {"ok": True, "queued": True, "ts": time.time()}

@router.post("/verify", response_model=VerifyResponse)
async def verify_attestation(req: VerifyRequest):
    """
    Verify an attestation object from OAA
    """
    try:
        att = req.attestation
        
        # 1) Check hash
        canon = canonical_json(att["content"])
        recomputed = sha256_hex(att["content"])
        got = att.get("content_hash", "").replace("sha256:", "")
        
        if not got or got != recomputed:
            return VerifyResponse(
                ok=False,
                reason="hash_mismatch",
                recomputed_hash=recomputed
            )

        # 2) Verify signature
        if not att.get("signature", "").startswith("ed25519:"):
            return VerifyResponse(
                ok=False,
                reason="bad_sig_format",
                recomputed_hash=recomputed
            )
        
        sig_b64 = att["signature"].split(":", 1)[1]
        pub_b64 = att["public_key_b64"]
        
        # Check if signer is known (optional key pinning)
        signer_known = True
        try:
            keyset_data = keyset()
            allowed_pubs = {k["x"] for k in keyset_data.get("keys", [])}
            signer_known = pub_b64 in allowed_pubs
        except:
            signer_known = None  # keyset unavailable

        # 3) Check timestamp freshness (optional)
        ts_ok = True
        content = att.get("content", {})
        if content.get("ts"):
            try:
                ts = datetime.fromisoformat(content["ts"].replace("Z", ""))
                now = datetime.utcnow()
                diff_minutes = abs((now - ts).total_seconds()) / 60
                ts_window = int(os.getenv("OAA_VERIFY_TS_WINDOW_MIN", "10"))
                ts_ok = diff_minutes <= ts_window
            except:
                ts_ok = None  # timestamp parsing failed

        # 4) Nonce replay defense (basic check - would need Redis for production)
        nonce_ok = True
        # This is a placeholder - in production you'd check Redis
        # nonce_ok = not await nonce_seen_async(content.get("voter_id", ""), content.get("nonce", ""))

        # 5) Verify Ed25519 signature
        sig_ok = ed25519_verify(pub_b64, att["content"], sig_b64)
        
        if not sig_ok:
            return VerifyResponse(
                ok=False,
                reason="signature_invalid",
                recomputed_hash=recomputed,
                signer_known=signer_known,
                ts_ok=ts_ok,
                nonce_ok=nonce_ok
            )

        return VerifyResponse(
            ok=True,
            recomputed_hash=recomputed,
            signer_known=signer_known,
            ts_ok=ts_ok,
            nonce_ok=nonce_ok
        )

    except KeyError as e:
        return VerifyResponse(
            ok=False,
            reason=f"missing_field: {str(e)}"
        )
    except Exception as e:
        return VerifyResponse(
            ok=False,
            reason=f"verification_error: {str(e)}"
        )

@router.get("/_health/redis")
async def redis_health():
    # Placeholder for Redis health check
    return {"ok": False, "error": "Redis not configured"}

# Include echo routes
router.include_router(echo_router)
