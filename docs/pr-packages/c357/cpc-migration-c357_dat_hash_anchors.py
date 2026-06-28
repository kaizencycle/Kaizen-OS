"""
alembic/versions/c357_dat_hash_anchors.py
Repo: mobius-civic-platform (CPC)

Creates dat_hash_anchors table for Reserve Block .dat file hash proofs.

EPICON: C-357 | RESERVE_BLOCK_DAT_CANONIZATION
Revision: c357_dat_hash_anchors
"""

from alembic import op
import sqlalchemy as sa

revision = "c357_dat_hash_anchors"
down_revision = None  # set to previous head before applying
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "dat_hash_anchors",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("dat_file", sa.String(32), nullable=False, unique=True),
        sa.Column("file_hash", sa.String(73), nullable=False),   # "sha256:" + 64 hex
        sa.Column("block_range_start", sa.Integer(), nullable=False),
        sa.Column("block_range_end", sa.Integer(), nullable=False),
        sa.Column("block_count", sa.Integer(), nullable=False),
        sa.Column("chain_tip_hash", sa.String(73), nullable=False),
        sa.Column("manifest_hash", sa.String(73), nullable=True),
        sa.Column("version", sa.String(16), nullable=False, server_default="1.0"),
        sa.Column("canonized_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("epicon_cycle", sa.String(16), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint("block_range_end >= block_range_start", name="ck_dat_range_order"),
        sa.CheckConstraint("block_count >= 1 AND block_count <= 100", name="ck_dat_block_count"),
        sa.CheckConstraint("file_hash LIKE 'sha256:%'", name="ck_dat_file_hash_prefix"),
        sa.CheckConstraint("chain_tip_hash LIKE 'sha256:%'", name="ck_dat_chain_tip_prefix"),
    )

    op.create_index("ix_dat_hash_anchors_dat_file", "dat_hash_anchors", ["dat_file"])
    op.create_index("ix_dat_hash_anchors_block_range_start", "dat_hash_anchors", ["block_range_start"])
    op.create_index("ix_dat_hash_anchors_canonized_at", "dat_hash_anchors", ["canonized_at"])


def downgrade() -> None:
    op.drop_index("ix_dat_hash_anchors_canonized_at", table_name="dat_hash_anchors")
    op.drop_index("ix_dat_hash_anchors_block_range_start", table_name="dat_hash_anchors")
    op.drop_index("ix_dat_hash_anchors_dat_file", table_name="dat_hash_anchors")
    op.drop_table("dat_hash_anchors")


# ─── SQLAlchemy model (add to models/canon.py) ───────────────────────────────
#
# from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, select
# from sqlalchemy.ext.asyncio import AsyncSession
# from .base import Base
#
# class DatHashAnchor(Base):
#     __tablename__ = "dat_hash_anchors"
#
#     id = Column(Integer, primary_key=True)
#     dat_file = Column(String(32), nullable=False, unique=True)
#     file_hash = Column(String(73), nullable=False)
#     block_range_start = Column(Integer, nullable=False)
#     block_range_end = Column(Integer, nullable=False)
#     block_count = Column(Integer, nullable=False)
#     chain_tip_hash = Column(String(73), nullable=False)
#     manifest_hash = Column(String(73), nullable=True)
#     version = Column(String(16), nullable=False, default="1.0")
#     canonized_at = Column(DateTime(timezone=True), nullable=False)
#     epicon_cycle = Column(String(16), nullable=True)
#     created_at = Column(DateTime(timezone=True), nullable=False, server_default="NOW()")
#
#     @classmethod
#     async def get_by_file(cls, db: AsyncSession, dat_file: str):
#         result = await db.execute(select(cls).where(cls.dat_file == dat_file))
#         return result.scalar_one_or_none()
#
#     @classmethod
#     async def get_all_ordered(cls, db: AsyncSession):
#         result = await db.execute(select(cls).order_by(cls.block_range_start))
#         return result.scalars().all()
