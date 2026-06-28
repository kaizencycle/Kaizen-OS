"""
api/routes/canon_reserve_blocks.py
Repo: mobius-civic-platform (CPC)

FastAPI routes for Reserve Block .dat hash anchor storage and retrieval.
CPC stores hash PROOFS only — not block data.
Auth: AGENT_SERVICE_TOKEN via X-Service-Token header (or Bearer).

EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.canon import DatHashAnchor
from ..config import settings

router = APIRouter(prefix="/api/canon/reserve-blocks", tags=["canon"])


# ─── Auth ─────────────────────────────────────────────────────────────────────

def require_service_token(
    authorization: Optional[str] = Header(None),
    x_service_token: Optional[str] = Header(None, alias="X-Service-Token"),
):
    token = x_service_token
    if not token and authorization:
        scheme, _, value = authorization.partition(" ")
        if scheme.lower() == "bearer":
            token = value
    if not token or token != settings.agent_service_token:
        raise HTTPException(status_code=401, detail="Invalid service token")
    return token


# ─── Schemas ──────────────────────────────────────────────────────────────────

class DatHashAnchorPayload(BaseModel):
    dat_file: str = Field(..., pattern=r"^blk\d{4}\.dat$")
    file_hash: str = Field(..., pattern=r"^sha256:[0-9a-f]{64}$")
    block_range_start: int = Field(..., ge=1)
    block_range_end: int = Field(..., ge=1)
    block_count: int = Field(..., ge=1, le=100)
    chain_tip_hash: str = Field(..., pattern=r"^sha256:[0-9a-f]{64}$")
    manifest_hash: Optional[str] = Field(None, pattern=r"^sha256:[0-9a-f]{64}$")
    version: str = Field(default="1.0")
    canonized_at: datetime


class DatHashAnchorResponse(BaseModel):
    status: str = "ok"
    action: str  # "anchored" | "idempotent"
    dat_file: str
    blocks: str
    chain_tip: str


class ManifestAnchor(BaseModel):
    id: int
    dat_file: str
    file_hash: str
    block_range_start: int
    block_range_end: int
    block_count: int
    chain_tip_hash: str
    version: str
    canonized_at: str
    created_at: str


class ManifestResponse(BaseModel):
    total_dat_files: int
    total_blocks_anchored: int
    total_mic_anchored: float
    chain_tip: Optional[str]
    chain_tip_hash: Optional[str]
    anchors: list[ManifestAnchor]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/anchor", response_model=DatHashAnchorResponse)
async def post_dat_hash_anchor(
    payload: DatHashAnchorPayload,
    epicon: Optional[str] = Header(None, alias="X-Mobius-EPICON"),
    db: AsyncSession = Depends(get_db),
    _token: str = Depends(require_service_token),
):
    """
    Store a .dat file hash anchor. Idempotent on (dat_file, file_hash).
    Returns 409 if the same dat_file exists with a DIFFERENT hash (canon conflict).
    """
    existing = await DatHashAnchor.get_by_file(db, payload.dat_file)

    if existing:
        if existing.file_hash == payload.file_hash:
            return DatHashAnchorResponse(
                action="idempotent",
                dat_file=existing.dat_file,
                blocks=f"{existing.block_range_start}-{existing.block_range_end}",
                chain_tip=existing.chain_tip_hash,
            )
        raise HTTPException(
            status_code=409,
            detail=(
                f"Canon conflict: {payload.dat_file} already anchored with "
                f"hash {existing.file_hash[:16]}… — "
                f"submitted {payload.file_hash[:16]}…"
            ),
        )

    anchor = DatHashAnchor(
        dat_file=payload.dat_file,
        file_hash=payload.file_hash,
        block_range_start=payload.block_range_start,
        block_range_end=payload.block_range_end,
        block_count=payload.block_count,
        chain_tip_hash=payload.chain_tip_hash,
        manifest_hash=payload.manifest_hash,
        version=payload.version,
        canonized_at=payload.canonized_at,
        epicon_cycle=epicon,
    )
    db.add(anchor)
    await db.commit()
    await db.refresh(anchor)

    return DatHashAnchorResponse(
        action="anchored",
        dat_file=anchor.dat_file,
        blocks=f"{anchor.block_range_start}-{anchor.block_range_end}",
        chain_tip=anchor.chain_tip_hash,
    )


@router.get("/manifest", response_model=ManifestResponse)
async def get_manifest(
    db: AsyncSession = Depends(get_db),
):
    """Public manifest of all anchored .dat files and their chain state."""
    anchors = await DatHashAnchor.get_all_ordered(db)

    if not anchors:
        return ManifestResponse(
            total_dat_files=0,
            total_blocks_anchored=0,
            total_mic_anchored=0.0,
            chain_tip=None,
            chain_tip_hash=None,
            anchors=[],
        )

    latest = anchors[-1]
    total_blocks = sum(a.block_count for a in anchors)

    return ManifestResponse(
        total_dat_files=len(anchors),
        total_blocks_anchored=total_blocks,
        total_mic_anchored=float(total_blocks * 50),
        chain_tip=latest.dat_file,
        chain_tip_hash=latest.chain_tip_hash,
        anchors=[
            ManifestAnchor(
                id=a.id,
                dat_file=a.dat_file,
                file_hash=a.file_hash,
                block_range_start=a.block_range_start,
                block_range_end=a.block_range_end,
                block_count=a.block_count,
                chain_tip_hash=a.chain_tip_hash,
                version=a.version,
                canonized_at=a.canonized_at.isoformat(),
                created_at=a.created_at.isoformat(),
            )
            for a in anchors
        ],
    )


@router.get("/verify/{dat_file}")
async def verify_dat_anchor(
    dat_file: str,
    file_hash: str = Query(..., description="SHA-256 hash to verify against stored anchor"),
    db: AsyncSession = Depends(get_db),
):
    """Verify that a .dat file hash matches the stored anchor."""
    anchor = await DatHashAnchor.get_by_file(db, dat_file)
    if not anchor:
        raise HTTPException(status_code=404, detail=f"{dat_file} not anchored")

    match = anchor.file_hash == file_hash
    return {
        "dat_file": dat_file,
        "match": match,
        "stored_hash": anchor.file_hash,
        "submitted_hash": file_hash,
        "block_range": f"{anchor.block_range_start}-{anchor.block_range_end}",
        "canonized_at": anchor.canonized_at.isoformat(),
    }
