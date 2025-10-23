from pydantic import BaseModel, Field
from typing import Optional, Literal

class HealthOut(BaseModel):
    status: Literal["ok"] = "ok"

class IngestEvent(BaseModel):
    kind: Literal["xp_award","burn","grant","transfer"]
    amount: float = Field(gt=0)
    unit: Literal["XP","GIC"] = "XP"
    actor: Optional[str] = None
    target: Optional[str] = None
    meta: dict = {}

class BalanceOut(BaseModel):
    handle: str
    xp: float
    gic: float
    gic_from_xp: float
    total_gic: float

class SupplyOut(BaseModel):
    total_gic: float
    circulating_gic: float
    xp_pool: float

class EventOut(BaseModel):
    id: int
    kind: str
    amount: float
    unit: str
    actor: str | None = None
    target: str | None = None
    created_at: str
    meta: dict = {}
