import hashlib
from .models import RewardIntentRequest, RewardIntentResponse

def maybe_mint(req: RewardIntentRequest) -> RewardIntentResponse | None:
    # demo rule: mint only on level-ups; amount grows every 5 levels
    if req.level_after <= req.level_before:
        return None
    bonus = 3.0 if (req.level_after % 5 == 0) else 0.0
    base = 0.5 if req.level_after == 2 else 1.0
    amount = base + bonus
    tx_id = hashlib.sha256(f"{req.user_id}|{req.attestation_id}|{amount}".encode()).hexdigest()[:24]
    return RewardIntentResponse(tx_id=tx_id, amount=amount, status="pending")

