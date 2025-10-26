from pydantic import BaseModel
from typing import Optional, Dict, Any

class Seed(BaseModel):
    date: str
    time: str
    intent: str
    meta: Optional[Dict[str, Any]] = None

class Sweep(BaseModel):
    chamber: str
    note: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class Seal(BaseModel):
    date: str
    wins: str
    blocks: str
    tomorrow_intent: str
    meta: Optional[Dict[str, Any]] = None

class BonusRun(BaseModel):
    # choose one: week="latest"  OR  start/end explicit window
    week: Optional[str] = None          # "latest"
    start: Optional[str] = None         # "YYYY-MM-DD"
    end: Optional[str] = None           # "YYYY-MM-DD"

    # options
    dry: bool = False
    top_n: int = 10
    min_len: int = 200
    bonus_min: int = 50
    bonus_max: int = 100
    payout_day: Optional[str] = None    # default = today; else "YYYY-MM-DD"
