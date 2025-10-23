from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON, func, UniqueConstraint

class Base(DeclarativeBase):
    pass

class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    handle: Mapped[str] = mapped_column(String(120), unique=True, index=True)  # e.g., wallet, username
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(50))  # "xp_award" | "burn" | "grant" | "transfer"
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str] = mapped_column(String(10), default="XP")  # XP or GIC
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))
    target_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"))
    meta: Mapped[dict] = mapped_column(JSON, default={})
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    actor = relationship("Account", foreign_keys=[actor_id])
    target = relationship("Account", foreign_keys=[target_id])

class Balance(Base):
    __tablename__ = "balances"
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    xp: Mapped[float] = mapped_column(Float, default=0.0)
    gic: Mapped[float] = mapped_column(Float, default=0.0)
    __table_args__ = (UniqueConstraint("account_id", name="uniq_account_balance"),)
