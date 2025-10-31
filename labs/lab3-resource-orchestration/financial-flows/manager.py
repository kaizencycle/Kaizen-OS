#!/usr/bin/env python3
"""
Lab 3 - Module 4: Financial Flows Manager
Manages GIC settlement, epoch processing, PublicGoodsPool allocation
"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

class TransactionType(str, Enum):
    GIC_MINT = "gic_mint"
    GIC_TRANSFER = "gic_transfer"
    GIC_BURN = "gic_burn"
    EPOCH_DISTRIBUTE = "epoch_distribute"
    PUBLIC_GOODS_GRANT = "public_goods_grant"
    DEBT_REPAYMENT = "debt_repayment"

@dataclass
class Transaction:
    tx_id: str
    type: TransactionType
    from_did: Optional[str]
    to_did: Optional[str]
    amount_gic: float
    timestamp: int
    metadata: Dict

class FinancialFlowsManager:
    """Manages all GIC financial flows"""

    def __init__(self):
        self.epoch_length_days = 90
        self.current_epoch = 120  # C-120
        self.public_goods_pool_balance = 1_000_000.0  # GIC
        self.total_gic_supply = 10_000_000.0
        self.transactions = []

    def process_gic_transfer(
        self,
        from_did: str,
        to_did: str,
        amount: float,
        reason: str
    ) -> Transaction:
        """Process GIC transfer between citizens"""
        tx = Transaction(
            tx_id=f"tx_{len(self.transactions)}",
            type=TransactionType.GIC_TRANSFER,
            from_did=from_did,
            to_did=to_did,
            amount_gic=amount,
            timestamp=int(time.time()),
            metadata={"reason": reason}
        )
        self.transactions.append(tx)
        return tx

    def allocate_public_goods_grant(
        self,
        recipient_did: str,
        amount: float,
        project: str
    ) -> Optional[Transaction]:
        """Allocate grant from PublicGoodsPool"""
        if amount > self.public_goods_pool_balance:
            return None

        tx = Transaction(
            tx_id=f"grant_{len(self.transactions)}",
            type=TransactionType.PUBLIC_GOODS_GRANT,
            from_did="PublicGoodsPool",
            to_did=recipient_did,
            amount_gic=amount,
            timestamp=int(time.time()),
            metadata={"project": project}
        )
        self.public_goods_pool_balance -= amount
        self.transactions.append(tx)
        return tx

    def get_balance(self, citizen_did: str) -> float:
        """Get citizen's GIC balance"""
        balance = 0.0
        for tx in self.transactions:
            if tx.to_did == citizen_did:
                balance += tx.amount_gic
            if tx.from_did == citizen_did:
                balance -= tx.amount_gic
        return balance

FINANCIAL_MANAGER = FinancialFlowsManager()
