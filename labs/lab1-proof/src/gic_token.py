"""
Lab1: GIC Token Engine - Goodness Integrity Credit
Integrity-based cryptocurrency with UBI and contribution rewards
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
import asyncio


@dataclass
class Account:
    """GIC account"""
    address: str
    balance: Decimal
    gi_score: float
    created_at: datetime
    last_ubi: Optional[datetime] = None
    is_verified: bool = False

    def to_dict(self) -> Dict:
        return {
            "address": self.address,
            "balance": str(self.balance),
            "gi_score": self.gi_score,
            "created_at": self.created_at.isoformat(),
            "last_ubi": self.last_ubi.isoformat() if self.last_ubi else None,
            "is_verified": self.is_verified
        }


@dataclass
class Transfer:
    """GIC transfer"""
    from_address: str
    to_address: str
    amount: Decimal
    memo: str
    timestamp: datetime
    tx_id: str

    def to_dict(self) -> Dict:
        return {
            "from_address": self.from_address,
            "to_address": self.to_address,
            "amount": str(self.amount),
            "memo": self.memo,
            "timestamp": self.timestamp.isoformat(),
            "tx_id": self.tx_id
        }


class GICTokenEngine:
    """
    Goodness Integrity Credit (GIC) Token Engine

    Features:
    - Universal Basic Income (UBI) distribution
    - Contribution-based rewards
    - Integrity-based staking
    - No gas fees
    - GI-based minting/burning

    Token Economics:
    - Total supply: 1 billion GIC (hard cap)
    - Distribution: 40% UBI, 30% rewards, 20% treasury, 10% founders
    - Minting: Only if system GI ≥ 0.95 (1000 GIC/day)
    - Burning: Automatic for bad actors (GI < 0.90)
    """

    # Token configuration
    TOTAL_SUPPLY = Decimal("1000000000")  # 1 billion
    DAILY_MINT_AMOUNT = Decimal("1000")   # If GI ≥ 0.95
    DAILY_UBI = Decimal("10")             # Per verified citizen
    MIN_GI_FOR_UBI = 0.95
    MIN_GI_FOR_MINTING = 0.95
    BURN_GI_THRESHOLD = 0.90

    # Special addresses
    TREASURY_ADDRESS = "treasury@civic.os"
    REWARDS_ADDRESS = "rewards@civic.os"
    BURN_ADDRESS = "burn@civic.os"

    def __init__(self, ledger=None):
        """
        Initialize GIC Token Engine

        Args:
            ledger: Civic Ledger for recording transactions
        """
        self.ledger = ledger
        self.accounts: Dict[str, Account] = {}
        self.transfers: List[Transfer] = []
        self.current_supply = Decimal("0")
        self.total_burned = Decimal("0")

        # Initialize system accounts
        self._initialize_system_accounts()

    def _initialize_system_accounts(self):
        """Create system accounts (treasury, rewards, burn)"""
        now = datetime.utcnow()

        # Treasury account (20% of total supply)
        self.accounts[self.TREASURY_ADDRESS] = Account(
            address=self.TREASURY_ADDRESS,
            balance=self.TOTAL_SUPPLY * Decimal("0.20"),
            gi_score=1.0,
            created_at=now,
            is_verified=True
        )

        # Rewards account (30% of total supply)
        self.accounts[self.REWARDS_ADDRESS] = Account(
            address=self.REWARDS_ADDRESS,
            balance=self.TOTAL_SUPPLY * Decimal("0.30"),
            gi_score=1.0,
            created_at=now,
            is_verified=True
        )

        # Burn address (receives burned tokens)
        self.accounts[self.BURN_ADDRESS] = Account(
            address=self.BURN_ADDRESS,
            balance=Decimal("0"),
            gi_score=0.0,
            created_at=now,
            is_verified=False
        )

        # Update current supply
        self.current_supply = (
            self.accounts[self.TREASURY_ADDRESS].balance +
            self.accounts[self.REWARDS_ADDRESS].balance
        )

        print(f"💰 GIC Token Engine initialized")
        print(f"   Total supply: {self.TOTAL_SUPPLY:,} GIC")
        print(f"   Treasury: {self.accounts[self.TREASURY_ADDRESS].balance:,} GIC")
        print(f"   Rewards: {self.accounts[self.REWARDS_ADDRESS].balance:,} GIC")

    def create_account(
        self,
        address: str,
        gi_score: float,
        is_verified: bool = False
    ) -> Account:
        """
        Create a new GIC account

        Args:
            address: Account address (e.g., "user@civic.os")
            gi_score: Initial GI score
            is_verified: Whether the account is verified (for UBI eligibility)

        Returns:
            Created account
        """
        if address in self.accounts:
            raise ValueError(f"Account already exists: {address}")

        account = Account(
            address=address,
            balance=Decimal("0"),
            gi_score=gi_score,
            created_at=datetime.utcnow(),
            is_verified=is_verified
        )

        self.accounts[address] = account
        print(f"✅ Account created: {address} (GI: {gi_score:.3f})")

        return account

    async def transfer(
        self,
        from_address: str,
        to_address: str,
        amount: Decimal,
        memo: str = ""
    ) -> Transfer:
        """
        Transfer GIC between accounts

        Args:
            from_address: Sender address
            to_address: Recipient address
            amount: Amount to transfer
            memo: Optional memo

        Returns:
            Transfer object

        Raises:
            ValueError: If transfer is invalid
        """
        # Validate accounts exist
        if from_address not in self.accounts:
            raise ValueError(f"Sender account not found: {from_address}")

        if to_address not in self.accounts:
            # Auto-create recipient account
            await self.create_account(to_address, gi_score=0.0)

        sender = self.accounts[from_address]
        recipient = self.accounts[to_address]

        # Validate balance
        if sender.balance < amount:
            raise ValueError(
                f"Insufficient balance: {sender.balance} < {amount}"
            )

        # Validate amount
        if amount <= 0:
            raise ValueError("Amount must be positive")

        # Perform transfer
        sender.balance -= amount
        recipient.balance += amount

        # Record transfer
        transfer = Transfer(
            from_address=from_address,
            to_address=to_address,
            amount=amount,
            memo=memo,
            timestamp=datetime.utcnow(),
            tx_id=f"gic_tx_{len(self.transfers):06d}"
        )

        self.transfers.append(transfer)

        # Record to ledger if available
        if self.ledger:
            await self.ledger.submit_transaction({
                "type": "gic.transfer",
                "from": from_address,
                "to": to_address,
                "amount": str(amount),
                "memo": memo,
                "tx_id": transfer.tx_id
            })

        print(f"💸 Transfer: {amount} GIC from {from_address} to {to_address}")

        return transfer

    async def distribute_ubi(self, system_gi: float) -> Dict:
        """
        Distribute Universal Basic Income to verified citizens

        Args:
            system_gi: Current system GI score

        Returns:
            Distribution summary
        """
        if system_gi < self.MIN_GI_FOR_UBI:
            return {
                "distributed": False,
                "reason": f"System GI too low: {system_gi} < {self.MIN_GI_FOR_UBI}",
                "recipients": 0,
                "total_amount": Decimal("0")
            }

        # Get eligible citizens
        eligible = [
            account for account in self.accounts.values()
            if account.is_verified
            and account.gi_score >= self.MIN_GI_FOR_UBI
            and account.address not in [self.TREASURY_ADDRESS, self.REWARDS_ADDRESS, self.BURN_ADDRESS]
        ]

        # Check if UBI already distributed today
        now = datetime.utcnow()
        eligible = [
            acc for acc in eligible
            if not acc.last_ubi or (now - acc.last_ubi) >= timedelta(days=1)
        ]

        if not eligible:
            return {
                "distributed": False,
                "reason": "No eligible citizens (already received UBI today)",
                "recipients": 0,
                "total_amount": Decimal("0")
            }

        # Calculate total UBI needed
        total_ubi = self.DAILY_UBI * len(eligible)

        # Check treasury balance
        treasury = self.accounts[self.TREASURY_ADDRESS]
        if treasury.balance < total_ubi:
            return {
                "distributed": False,
                "reason": "Insufficient treasury balance",
                "recipients": 0,
                "total_amount": Decimal("0")
            }

        # Distribute UBI
        for account in eligible:
            await self.transfer(
                from_address=self.TREASURY_ADDRESS,
                to_address=account.address,
                amount=self.DAILY_UBI,
                memo="UBI distribution"
            )
            account.last_ubi = now

        print(f"💰 UBI distributed to {len(eligible)} citizens ({total_ubi} GIC)")

        return {
            "distributed": True,
            "recipients": len(eligible),
            "total_amount": total_ubi,
            "per_citizen": self.DAILY_UBI
        }

    async def reward_contribution(
        self,
        contributor: str,
        contribution_value: float,
        description: str
    ) -> Decimal:
        """
        Reward valuable contributions to the ecosystem

        Args:
            contributor: Contributor address
            contribution_value: Contribution value score (0.0-1.0)
            description: Description of contribution

        Returns:
            Reward amount
        """
        if contributor not in self.accounts:
            raise ValueError(f"Contributor not found: {contributor}")

        account = self.accounts[contributor]

        # Calculate reward
        base_reward = Decimal("100")
        value_multiplier = Decimal(str(contribution_value))
        gi_bonus = Decimal(str(account.gi_score))

        reward = base_reward * value_multiplier * gi_bonus

        # Transfer from rewards pool
        await self.transfer(
            from_address=self.REWARDS_ADDRESS,
            to_address=contributor,
            amount=reward,
            memo=f"Contribution reward: {description}"
        )

        print(f"🏆 Contribution reward: {reward} GIC to {contributor}")
        print(f"   Description: {description}")
        print(f"   Value score: {contribution_value:.2f}")
        print(f"   GI bonus: {account.gi_score:.3f}")

        return reward

    async def mint_tokens(self, system_gi: float) -> Decimal:
        """
        Mint new GIC tokens if system GI is sufficient

        Args:
            system_gi: Current system GI score

        Returns:
            Amount minted
        """
        if system_gi < self.MIN_GI_FOR_MINTING:
            print(f"⚠️  Minting blocked: System GI {system_gi} < {self.MIN_GI_FOR_MINTING}")
            return Decimal("0")

        # Check if we've reached supply cap
        if self.current_supply >= self.TOTAL_SUPPLY:
            print(f"⚠️  Minting blocked: Total supply reached")
            return Decimal("0")

        # Mint daily amount
        mint_amount = min(
            self.DAILY_MINT_AMOUNT,
            self.TOTAL_SUPPLY - self.current_supply
        )

        # Add to treasury
        treasury = self.accounts[self.TREASURY_ADDRESS]
        treasury.balance += mint_amount
        self.current_supply += mint_amount

        print(f"🪙 Minted {mint_amount} GIC (System GI: {system_gi:.3f})")
        print(f"   Current supply: {self.current_supply:,} / {self.TOTAL_SUPPLY:,}")

        return mint_amount

    async def burn_tokens(self, address: str, reason: str) -> Decimal:
        """
        Burn tokens from bad actor

        Args:
            address: Address to burn from
            reason: Reason for burning

        Returns:
            Amount burned
        """
        if address not in self.accounts:
            raise ValueError(f"Account not found: {address}")

        account = self.accounts[address]

        # Determine burn amount based on violation severity
        if account.gi_score < 0.50:
            burn_percentage = Decimal("0.50")  # 50% burn
        elif account.gi_score < 0.70:
            burn_percentage = Decimal("0.25")  # 25% burn
        elif account.gi_score < self.BURN_GI_THRESHOLD:
            burn_percentage = Decimal("0.10")  # 10% burn
        else:
            return Decimal("0")  # No burn

        # Calculate burn amount
        burn_amount = account.balance * burn_percentage

        if burn_amount == 0:
            return Decimal("0")

        # Transfer to burn address
        await self.transfer(
            from_address=address,
            to_address=self.BURN_ADDRESS,
            amount=burn_amount,
            memo=f"Token burn: {reason}"
        )

        self.total_burned += burn_amount

        print(f"🔥 Burned {burn_amount} GIC from {address}")
        print(f"   Reason: {reason}")
        print(f"   GI score: {account.gi_score:.3f}")
        print(f"   Total burned: {self.total_burned:,}")

        return burn_amount

    def get_balance(self, address: str) -> Decimal:
        """Get account balance"""
        if address not in self.accounts:
            return Decimal("0")
        return self.accounts[address].balance

    def get_account(self, address: str) -> Optional[Account]:
        """Get account details"""
        return self.accounts.get(address)

    def get_transfer_history(
        self,
        address: str,
        limit: int = 100
    ) -> List[Transfer]:
        """Get transfer history for an address"""
        history = [
            tx for tx in self.transfers
            if tx.from_address == address or tx.to_address == address
        ]
        return history[-limit:]

    def get_token_stats(self) -> Dict:
        """Get token statistics"""
        return {
            "current_supply": str(self.current_supply),
            "total_supply": str(self.TOTAL_SUPPLY),
            "total_burned": str(self.total_burned),
            "circulating_supply": str(self.current_supply - self.total_burned),
            "total_accounts": len(self.accounts),
            "verified_accounts": sum(1 for acc in self.accounts.values() if acc.is_verified),
            "total_transfers": len(self.transfers),
            "treasury_balance": str(self.accounts[self.TREASURY_ADDRESS].balance),
            "rewards_balance": str(self.accounts[self.REWARDS_ADDRESS].balance)
        }


# Example usage
if __name__ == "__main__":
    async def demo():
        print("💰 GIC Token Engine Demo\n")

        # Create token engine
        gic = GICTokenEngine()

        # Create citizen accounts
        print("\n👥 Creating citizen accounts...")
        gic.create_account("alice@civic.os", gi_score=0.96, is_verified=True)
        gic.create_account("bob@civic.os", gi_score=0.94, is_verified=True)
        gic.create_account("charlie@civic.os", gi_score=0.98, is_verified=True)

        # Distribute UBI
        print("\n💵 Distributing UBI...")
        ubi_result = await gic.distribute_ubi(system_gi=0.95)
        print(f"   Recipients: {ubi_result['recipients']}")
        print(f"   Total distributed: {ubi_result['total_amount']} GIC")

        # Reward contribution
        print("\n🏆 Rewarding contribution...")
        reward = await gic.reward_contribution(
            contributor="alice@civic.os",
            contribution_value=0.8,
            description="Improved documentation for Lab1"
        )

        # Mint tokens
        print("\n🪙 Minting new tokens...")
        minted = await gic.mint_tokens(system_gi=0.96)

        # Transfer between users
        print("\n💸 Transferring between users...")
        await gic.transfer(
            from_address="alice@civic.os",
            to_address="bob@civic.os",
            amount=Decimal("5.0"),
            memo="Payment for code review"
        )

        # Display account balances
        print("\n💰 Account Balances:")
        for address in ["alice@civic.os", "bob@civic.os", "charlie@civic.os"]:
            balance = gic.get_balance(address)
            print(f"   {address}: {balance} GIC")

        # Display token stats
        print("\n📊 Token Statistics:")
        stats = gic.get_token_stats()
        for key, value in stats.items():
            print(f"   {key}: {value}")

    # Run demo
    asyncio.run(demo())
