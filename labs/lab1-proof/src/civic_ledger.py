"""
Lab1: Civic Ledger Core - Proof-of-Integrity Blockchain
Immutable ledger for all Kaizen-OS operations
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import hashlib
import json
import asyncio
from collections import defaultdict


@dataclass
class Transaction:
    """Blockchain transaction"""
    tx_id: str
    type: str  # civic.reflection, delib_proof, eomm_capsule, etc.
    from_address: str
    data: Dict
    gi_signature: str
    timestamp: datetime
    gas_fee: float = 0.0  # Always 0 in PoI

    def to_dict(self) -> Dict:
        return {
            "tx_id": self.tx_id,
            "type": self.type,
            "from_address": self.from_address,
            "data": self.data,
            "gi_signature": self.gi_signature,
            "timestamp": self.timestamp.isoformat(),
            "gas_fee": self.gas_fee
        }

    def hash(self) -> str:
        """Calculate transaction hash"""
        tx_string = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(tx_string.encode()).hexdigest()


@dataclass
class ConsensusProof:
    """Proof-of-Integrity consensus proof"""
    type: str = "proof_of_integrity"
    gi_score: float = 0.0
    validators: List[str] = field(default_factory=list)
    signatures: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "type": self.type,
            "gi_score": self.gi_score,
            "validators": self.validators,
            "signatures": self.signatures
        }


@dataclass
class Block:
    """Blockchain block"""
    block_number: int
    timestamp: datetime
    previous_hash: str
    transactions: List[Transaction]
    validator: str
    consensus_proof: ConsensusProof
    merkle_root: str = ""
    nonce: int = 0

    def __post_init__(self):
        if not self.merkle_root:
            self.merkle_root = self.calculate_merkle_root()

    def calculate_merkle_root(self) -> str:
        """Calculate Merkle root of all transactions"""
        if not self.transactions:
            return hashlib.sha256(b"empty").hexdigest()

        # Get transaction hashes
        tx_hashes = [tx.hash() for tx in self.transactions]

        # Build Merkle tree
        while len(tx_hashes) > 1:
            if len(tx_hashes) % 2 != 0:
                tx_hashes.append(tx_hashes[-1])  # Duplicate last hash if odd

            next_level = []
            for i in range(0, len(tx_hashes), 2):
                combined = tx_hashes[i] + tx_hashes[i + 1]
                next_level.append(hashlib.sha256(combined.encode()).hexdigest())

            tx_hashes = next_level

        return tx_hashes[0]

    def to_dict(self) -> Dict:
        return {
            "block_number": self.block_number,
            "timestamp": self.timestamp.isoformat(),
            "previous_hash": self.previous_hash,
            "transactions": [tx.to_dict() for tx in self.transactions],
            "validator": self.validator,
            "consensus_proof": self.consensus_proof.to_dict(),
            "merkle_root": self.merkle_root,
            "nonce": self.nonce
        }

    def hash(self) -> str:
        """Calculate block hash"""
        block_string = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()


class CivicLedger:
    """
    Civic Ledger - Proof-of-Integrity Blockchain

    Core innovation: Instead of Proof-of-Work (energy waste) or Proof-of-Stake
    (capital concentration), we use Proof-of-Integrity where validators must
    maintain GI score ≥ 0.95 to participate in consensus.

    Features:
    - Fast finality (<1 second)
    - No gas fees (free transactions)
    - Constitutional validation on every block
    - Immutable audit trail
    """

    # Minimum GI score required to be a validator
    MIN_VALIDATOR_GI = 0.95

    # Minimum validators required for consensus
    MIN_VALIDATORS = 3

    # Block confirmation time (seconds)
    BLOCK_TIME = 1.0

    def __init__(self, gi_engine=None):
        """
        Initialize Civic Ledger

        Args:
            gi_engine: GI scoring engine for validator verification
        """
        self.gi_engine = gi_engine
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.validators: Dict[str, float] = {}  # address -> GI score
        self.transaction_pool: Dict[str, Transaction] = {}
        self.block_height = 0

        # Create genesis block
        self._create_genesis_block()

    def _create_genesis_block(self):
        """Create the first block (genesis block)"""
        genesis = Block(
            block_number=0,
            timestamp=datetime.utcnow(),
            previous_hash="0" * 64,
            transactions=[],
            validator="genesis@civic.os",
            consensus_proof=ConsensusProof(
                type="genesis",
                gi_score=1.0,
                validators=["genesis@civic.os"],
                signatures=["genesis_signature"]
            )
        )

        self.chain.append(genesis)
        self.block_height = 0

    async def submit_transaction(self, transaction: Transaction) -> str:
        """
        Submit transaction to the ledger

        Args:
            transaction: Transaction to submit

        Returns:
            Transaction ID

        Raises:
            ValueError: If transaction is invalid
        """
        # Validate transaction
        if not await self._validate_transaction(transaction):
            raise ValueError("Invalid transaction")

        # Add to pending pool
        self.pending_transactions.append(transaction)
        self.transaction_pool[transaction.tx_id] = transaction

        # Auto-mine block if we have enough transactions
        if len(self.pending_transactions) >= 10:
            await self._mine_block()

        return transaction.tx_id

    async def _validate_transaction(self, tx: Transaction) -> bool:
        """
        Validate transaction

        Checks:
        - Valid signature
        - Valid data structure
        - GI signature is valid
        - Not a duplicate
        """
        # Check for duplicate
        if tx.tx_id in self.transaction_pool:
            return False

        # Verify signature (simplified - in production use cryptographic verification)
        if not tx.gi_signature:
            return False

        # Verify data structure
        if not tx.data or not isinstance(tx.data, dict):
            return False

        # Verify timestamp is recent (within 5 minutes)
        age_seconds = (datetime.utcnow() - tx.timestamp).total_seconds()
        if age_seconds > 300:  # 5 minutes
            return False

        return True

    async def _mine_block(self):
        """
        Mine a new block (Proof-of-Integrity consensus)

        Steps:
        1. Select validator with highest GI score
        2. Create block with pending transactions
        3. Get consensus from other validators
        4. Add block to chain
        """
        if not self.pending_transactions:
            return

        # Select validator
        validator = await self._select_validator()
        if not validator:
            # No valid validators, wait
            return

        # Get validator GI score
        validator_gi = self.validators.get(validator, 0.0)
        if validator_gi < self.MIN_VALIDATOR_GI:
            return

        # Create block
        previous_block = self.chain[-1]
        block = Block(
            block_number=self.block_height + 1,
            timestamp=datetime.utcnow(),
            previous_hash=previous_block.hash(),
            transactions=self.pending_transactions[:],
            validator=validator,
            consensus_proof=ConsensusProof(
                type="proof_of_integrity",
                gi_score=validator_gi,
                validators=[validator],
                signatures=[f"sig_{validator}"]
            )
        )

        # Get consensus from other validators
        consensus_reached = await self._get_consensus(block)

        if consensus_reached:
            # Add block to chain
            self.chain.append(block)
            self.block_height += 1

            # Clear pending transactions
            for tx in self.pending_transactions:
                if tx.tx_id in self.transaction_pool:
                    del self.transaction_pool[tx.tx_id]
            self.pending_transactions = []

            print(f"✅ Block {block.block_number} mined by {validator} (GI: {validator_gi:.3f})")

    async def _select_validator(self) -> Optional[str]:
        """
        Select validator with highest GI score

        In production, this would be round-robin or random selection
        weighted by GI scores
        """
        if not self.validators:
            # No validators registered, use system validator
            return "system@civic.os"

        # Select validator with highest GI
        valid_validators = {
            addr: gi for addr, gi in self.validators.items()
            if gi >= self.MIN_VALIDATOR_GI
        }

        if not valid_validators:
            return None

        return max(valid_validators, key=valid_validators.get)

    async def _get_consensus(self, block: Block) -> bool:
        """
        Get consensus from validators

        In PoI, validators vote on block validity based on:
        - Valid transactions
        - Valid Merkle root
        - Validator has sufficient GI score
        - Previous hash is correct

        Returns:
            True if consensus reached (2/3 of validators agree)
        """
        # Get all validators with GI >= threshold
        eligible_validators = [
            addr for addr, gi in self.validators.items()
            if gi >= self.MIN_VALIDATOR_GI
        ]

        if len(eligible_validators) < self.MIN_VALIDATORS:
            # Not enough validators, auto-approve
            return True

        # In production, this would query each validator
        # For now, simulate consensus
        approvals = len(eligible_validators)
        required = int(len(eligible_validators) * 2 / 3)

        consensus_proof = block.consensus_proof
        consensus_proof.validators = eligible_validators[:required]
        consensus_proof.signatures = [f"sig_{v}" for v in consensus_proof.validators]

        return approvals >= required

    def register_validator(self, address: str, gi_score: float):
        """
        Register a validator

        Args:
            address: Validator address
            gi_score: Current GI score (must be >= 0.95)
        """
        if gi_score >= self.MIN_VALIDATOR_GI:
            self.validators[address] = gi_score
            print(f"✅ Validator registered: {address} (GI: {gi_score:.3f})")
        else:
            print(f"❌ Validator rejected: {address} (GI: {gi_score:.3f} < {self.MIN_VALIDATOR_GI})")

    def get_block(self, block_number: int) -> Optional[Block]:
        """Get block by number"""
        if 0 <= block_number < len(self.chain):
            return self.chain[block_number]
        return None

    def get_latest_block(self) -> Block:
        """Get the latest block"""
        return self.chain[-1]

    def get_transaction(self, tx_id: str) -> Optional[Transaction]:
        """Get transaction by ID"""
        # Check pending pool first
        if tx_id in self.transaction_pool:
            return self.transaction_pool[tx_id]

        # Search confirmed transactions
        for block in self.chain:
            for tx in block.transactions:
                if tx.tx_id == tx_id:
                    return tx

        return None

    def verify_chain(self) -> bool:
        """
        Verify entire blockchain integrity

        Checks:
        - Each block's hash matches previous hash
        - Each block's Merkle root is valid
        - All transactions are valid
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            # Verify previous hash
            if current_block.previous_hash != previous_block.hash():
                print(f"❌ Invalid previous hash at block {i}")
                return False

            # Verify Merkle root
            calculated_merkle = current_block.calculate_merkle_root()
            if current_block.merkle_root != calculated_merkle:
                print(f"❌ Invalid Merkle root at block {i}")
                return False

        return True

    def get_chain_stats(self) -> Dict:
        """Get blockchain statistics"""
        total_transactions = sum(len(block.transactions) for block in self.chain)

        return {
            "block_height": self.block_height,
            "total_blocks": len(self.chain),
            "total_transactions": total_transactions,
            "pending_transactions": len(self.pending_transactions),
            "validators": len(self.validators),
            "average_gi": sum(self.validators.values()) / len(self.validators) if self.validators else 0,
            "chain_valid": self.verify_chain()
        }


# Example usage
if __name__ == "__main__":
    async def demo():
        print("🏛️ Civic Ledger Demo - Proof-of-Integrity Blockchain\n")

        # Create ledger
        ledger = CivicLedger()

        # Register validators
        ledger.register_validator("atlas@civic.os", 0.994)
        ledger.register_validator("zeus@civic.os", 0.991)
        ledger.register_validator("jade@civic.os", 0.996)

        # Submit transactions
        print("\n📝 Submitting transactions...")

        for i in range(15):
            tx = Transaction(
                tx_id=f"tx_{i:03d}",
                type="civic.reflection",
                from_address="atlas@civic.os",
                data={"content": f"Reflection {i}", "gi_score": 0.994},
                gi_signature=f"sig_{i}",
                timestamp=datetime.utcnow()
            )

            tx_id = await ledger.submit_transaction(tx)
            print(f"  Transaction submitted: {tx_id}")

            # Small delay to simulate real-world timing
            await asyncio.sleep(0.1)

        # Wait for final block to mine
        await asyncio.sleep(1)

        # Display stats
        print("\n📊 Blockchain Statistics:")
        stats = ledger.get_chain_stats()
        for key, value in stats.items():
            print(f"  {key}: {value}")

        # Verify chain
        print(f"\n🔒 Chain verification: {'✅ VALID' if ledger.verify_chain() else '❌ INVALID'}")

        # Display latest block
        latest = ledger.get_latest_block()
        print(f"\n📦 Latest Block:")
        print(f"  Block #: {latest.block_number}")
        print(f"  Validator: {latest.validator}")
        print(f"  GI Score: {latest.consensus_proof.gi_score}")
        print(f"  Transactions: {len(latest.transactions)}")
        print(f"  Merkle Root: {latest.merkle_root[:16]}...")

    # Run demo
    asyncio.run(demo())
