from sqlalchemy import create_engine, select, update, func
from sqlalchemy.orm import sessionmaker
from .config import settings
from .models import Base, Account, Balance, Event

engine = create_engine(settings.DB_URL, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)

def init_db():
    Base.metadata.create_all(engine)

def get_or_create_account(db, handle: str) -> Account:
    acct = db.scalar(select(Account).where(Account.handle == handle))
    if not acct:
        acct = Account(handle=handle)
        db.add(acct); db.flush()
        db.add(Balance(account_id=acct.id, xp=0.0, gic=0.0))
    return acct

def apply_event(db, kind: str, amount: float, unit: str, actor: str | None, target: str | None, meta: dict):
    actor_acct = get_or_create_account(db, actor) if actor else None
    target_acct = get_or_create_account(db, target) if target else None
    ev = Event(kind=kind, amount=amount, unit=unit,
               actor_id=actor_acct.id if actor_acct else None,
               target_id=target_acct.id if target_acct else None,
               meta=meta or {})
    db.add(ev)
    # Adjust balances
    ratio = settings.XP_TO_GIC_RATIO
    def bump(handle, dx_xp=0.0, dx_gic=0.0):
        acct = get_or_create_account(db, handle)
        bal = db.scalar(select(Balance).where(Balance.account_id==acct.id))
        bal.xp += dx_xp
        bal.gic += dx_gic

    if kind == "xp_award" and target:
        bump(target, dx_xp=amount)
    elif kind == "grant" and target and unit=="GIC":
        bump(target, dx_gic=amount)
    elif kind == "burn" and actor and unit=="GIC":
        bump(actor, dx_gic= -amount)
    elif kind == "transfer" and actor and target and unit=="GIC":
        bump(actor, dx_gic= -amount); bump(target, dx_gic= amount)

def compute_supply(db):
    xp_pool = db.scalar(select(func.sum(Balance.xp))) or 0.0
    gic_direct = db.scalar(select(func.sum(Balance.gic))) or 0.0
    gic_from_xp = xp_pool * settings.XP_TO_GIC_RATIO
    return {
        "xp_pool": float(xp_pool),
        "total_gic": float(gic_direct + gic_from_xp),
        "circulating_gic": float(gic_direct)  # direct GIC grants/transfers considered circulating
    }
