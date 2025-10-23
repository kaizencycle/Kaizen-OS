from .models import BalanceResponse

_FAKE_BALANCES: dict[str, float] = {}

def apply_tx(wallet: str, amount: float, tx_id: str) -> None:
    _FAKE_BALANCES[wallet] = _FAKE_BALANCES.get(wallet, 0.0) + amount

def get_balance(wallet: str) -> BalanceResponse:
    bal = _FAKE_BALANCES.get(wallet, 0.0)
    return BalanceResponse(wallet=wallet, balance=bal, last_tx_id=None)
