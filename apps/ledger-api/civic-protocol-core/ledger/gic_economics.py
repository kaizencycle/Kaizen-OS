#!/usr/bin/env python3
"""
GIC (Governance Incentive Currency) Economics Implementation

This module implements the economic model for the Civic Protocol, including
GIC issuance, staking, burning, and reward distribution mechanisms.
"""

import hashlib
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import math

class TransactionType(Enum):
    """Types of GIC transactions"""
    TRANSFER = "transfer"
    EARN = "earn"
    BURN = "burn"
    STAKE = "stake"
    UNSTAKE = "unstake"
    VEST = "vest"
    AIRDROP = "airdrop"

@dataclass
class GICAccount:
    """GIC account with balance and staking information"""
    address: str
    nonce: int
    balance: int  # In smallest units (wei-like, 18 decimals)
    vesting: int  # Vesting balance
    staked: int  # Staked balance
    unstaking: int  # Balance being unstaked
    unstake_epoch: Optional[int]  # Epoch when unstaking completes
    last_updated: int
    activity_score: float  # For reward calculations
    governance_power: float  # Voting power

@dataclass
class GICTransaction:
    """GIC transaction"""
    tx_id: str
    tx_type: TransactionType
    from_addr: Optional[str]
    to_addr: Optional[str]
    amount: int
    nonce: int
    memo: Optional[str]
    signature: str
    timestamp: int
    block_height: int
    gas_fee: int = 0

@dataclass
class RewardEvent:
    """Reward event for civic activity"""
    event_id: str
    recipient: str
    amount: int
    reason: str  # "reflection", "attestation", "vote", "cycle_participation"
    cycle_id: str
    multiplier: float
    timestamp: int
    block_height: int

@dataclass
class StakingInfo:
    """Staking information for an account"""
    address: str
    staked_amount: int
    stake_epoch: int
    unstaking_amount: int
    unstake_epoch: Optional[int]
    rewards_earned: int
    last_claim_epoch: int

@dataclass
class VestingSchedule:
    """Vesting schedule for locked tokens"""
    address: str
    total_amount: int
    vested_amount: int
    start_epoch: int
    duration_epochs: int
    cliff_epochs: int

class GICEconomics:
    """GIC economic system implementation"""
    
    def __init__(self, genesis_supply: int = 1000000 * 10**18):
        """
        Initialize GIC economics
        
        Args:
            genesis_supply: Initial GIC supply in smallest units
        """
        self.genesis_supply = genesis_supply
        self.total_supply = genesis_supply
        self.circulating_supply = genesis_supply
        self.accounts: Dict[str, GICAccount] = {}
        self.transactions: List[GICTransaction] = []
        self.reward_events: List[RewardEvent] = []
        self.staking_info: Dict[str, StakingInfo] = {}
        self.vesting_schedules: Dict[str, VestingSchedule] = {}
        
        # Economic parameters
        self.inflation_rate = 0.05  # 5% annual inflation
        self.staking_reward_rate = 0.08  # 8% annual staking rewards
        self.burn_rate = 0.02  # 2% of transactions burned
        self.epoch_duration = 300  # 5 minutes in seconds
        self.current_epoch = 0
        
        # Reward pools
        self.reflection_reward_pool = 0
        self.attestation_reward_pool = 0
        self.vote_reward_pool = 0
        self.cycle_reward_pool = 0
        self.staking_reward_pool = 0
        
        # Initialize genesis distribution
        self._initialize_genesis_distribution()
    
    def _initialize_genesis_distribution(self):
        """Initialize the genesis distribution of GIC"""
        # Distribute to various pools and accounts
        treasury_amount = int(self.genesis_supply * 0.3)  # 30% to treasury
        community_amount = int(self.genesis_supply * 0.2)  # 20% to community
        staking_rewards = int(self.genesis_supply * 0.1)  # 10% for staking rewards
        civic_activity = int(self.genesis_supply * 0.4)  # 40% for civic activity rewards
        
        # Create treasury account
        self.accounts["treasury"] = GICAccount(
            address="treasury",
            nonce=0,
            balance=treasury_amount,
            vesting=0,
            staked=0,
            unstaking=0,
            unstake_epoch=None,
            last_updated=int(time.time()),
            activity_score=0.0,
            governance_power=0.0
        )
        
        # Create community pool
        self.accounts["community_pool"] = GICAccount(
            address="community_pool",
            nonce=0,
            balance=community_amount,
            vesting=0,
            staked=0,
            unstaking=0,
            unstake_epoch=None,
            last_updated=int(time.time()),
            activity_score=0.0,
            governance_power=0.0
        )
        
        # Initialize reward pools
        self.reflection_reward_pool = int(civic_activity * 0.4)  # 40% for reflections
        self.attestation_reward_pool = int(civic_activity * 0.3)  # 30% for attestations
        self.vote_reward_pool = int(civic_activity * 0.2)  # 20% for votes
        self.cycle_reward_pool = int(civic_activity * 0.1)  # 10% for cycle participation
        self.staking_reward_pool = staking_rewards
    
    def create_account(self, address: str, initial_balance: int = 0) -> GICAccount:
        """Create a new GIC account"""
        if address in self.accounts:
            return self.accounts[address]
        
        account = GICAccount(
            address=address,
            nonce=0,
            balance=initial_balance,
            vesting=0,
            staked=0,
            unstaking=0,
            unstake_epoch=None,
            last_updated=int(time.time()),
            activity_score=0.0,
            governance_power=0.0
        )
        
        self.accounts[address] = account
        return account
    
    def transfer(self, from_addr: str, to_addr: str, amount: int, 
                memo: Optional[str] = None) -> GICTransaction:
        """Transfer GIC between accounts"""
        # Validate accounts exist
        if from_addr not in self.accounts:
            raise Exception(f"Sender account {from_addr} does not exist")
        
        if to_addr not in self.accounts:
            self.create_account(to_addr)
        
        from_account = self.accounts[from_addr]
        to_account = self.accounts[to_addr]
        
        # Check balance
        if from_account.balance < amount:
            raise Exception(f"Insufficient balance: {from_account.balance} < {amount}")
        
        # Calculate gas fee (simplified)
        gas_fee = min(amount // 1000, 1000)  # 0.1% or max 1000 units
        
        # Create transaction
        tx = GICTransaction(
            tx_id=f"tx_{int(time.time() * 1000)}_{hashlib.sha256(f'{from_addr}{to_addr}{amount}'.encode()).hexdigest()[:8]}",
            tx_type=TransactionType.TRANSFER,
            from_addr=from_addr,
            to_addr=to_addr,
            amount=amount,
            nonce=from_account.nonce,
            memo=memo,
            signature="",  # Would be signed by wallet
            timestamp=int(time.time()),
            block_height=0,  # Will be set when included in block
            gas_fee=gas_fee
        )
        
        # Apply transaction
        self._apply_transfer(tx)
        
        return tx
    
    def earn_reward(self, recipient: str, amount: int, reason: str, 
                   cycle_id: str, multiplier: float = 1.0) -> RewardEvent:
        """Award GIC for civic activity"""
        if recipient not in self.accounts:
            self.create_account(recipient)
        
        # Apply multiplier
        final_amount = int(amount * multiplier)
        
        # Create reward event
        event = RewardEvent(
            event_id=f"reward_{int(time.time() * 1000)}_{hashlib.sha256(f'{recipient}{reason}'.encode()).hexdigest()[:8]}",
            recipient=recipient,
            amount=final_amount,
            reason=reason,
            cycle_id=cycle_id,
            multiplier=multiplier,
            timestamp=int(time.time()),
            block_height=0  # Will be set when included in block
        )
        
        # Apply reward
        self._apply_reward(event)
        
        return event
    
    def stake(self, address: str, amount: int) -> GICTransaction:
        """Stake GIC for governance and rewards"""
        if address not in self.accounts:
            raise Exception(f"Account {address} does not exist")
        
        account = self.accounts[address]
        
        if account.balance < amount:
            raise Exception(f"Insufficient balance: {account.balance} < {amount}")
        
        # Create transaction
        tx = GICTransaction(
            tx_id=f"stake_{int(time.time() * 1000)}_{hashlib.sha256(f'{address}{amount}'.encode()).hexdigest()[:8]}",
            tx_type=TransactionType.STAKE,
            from_addr=address,
            to_addr=None,
            amount=amount,
            nonce=account.nonce,
            memo="Staking for governance",
            signature="",
            timestamp=int(time.time()),
            block_height=0
        )
        
        # Apply staking
        self._apply_stake(tx)
        
        return tx
    
    def unstake(self, address: str, amount: int) -> GICTransaction:
        """Initiate unstaking of GIC"""
        if address not in self.accounts:
            raise Exception(f"Account {address} does not exist")
        
        if address not in self.staking_info:
            raise Exception(f"No staking found for {address}")
        
        staking = self.staking_info[address]
        
        if staking.staked_amount < amount:
            raise Exception(f"Insufficient staked amount: {staking.staked_amount} < {amount}")
        
        # Create transaction
        tx = GICTransaction(
            tx_id=f"unstake_{int(time.time() * 1000)}_{hashlib.sha256(f'{address}{amount}'.encode()).hexdigest()[:8]}",
            tx_type=TransactionType.UNSTAKE,
            from_addr=address,
            to_addr=None,
            amount=amount,
            nonce=self.accounts[address].nonce,
            memo="Unstaking from governance",
            signature="",
            timestamp=int(time.time()),
            block_height=0
        )
        
        # Apply unstaking
        self._apply_unstake(tx)
        
        return tx
    
    def burn(self, from_addr: str, amount: int, reason: str = "voluntary") -> GICTransaction:
        """Burn GIC (remove from circulation)"""
        if from_addr not in self.accounts:
            raise Exception(f"Account {from_addr} does not exist")
        
        account = self.accounts[from_addr]
        
        if account.balance < amount:
            raise Exception(f"Insufficient balance: {account.balance} < {amount}")
        
        # Create transaction
        tx = GICTransaction(
            tx_id=f"burn_{int(time.time() * 1000)}_{hashlib.sha256(f'{from_addr}{amount}'.encode()).hexdigest()[:8]}",
            tx_type=TransactionType.BURN,
            from_addr=from_addr,
            to_addr=None,
            amount=amount,
            nonce=account.nonce,
            memo=f"Burning GIC: {reason}",
            signature="",
            timestamp=int(time.time()),
            block_height=0
        )
        
        # Apply burning
        self._apply_burn(tx)
        
        return tx
    
    def airdrop(self, recipients: List[str], amount_per_recipient: int, 
               reason: str = "community_distribution") -> List[GICTransaction]:
        """Airdrop GIC to multiple recipients"""
        total_amount = len(recipients) * amount_per_recipient
        
        if self.accounts["treasury"].balance < total_amount:
            raise Exception(f"Insufficient treasury balance: {self.accounts['treasury'].balance} < {total_amount}")
        
        transactions = []
        
        for recipient in recipients:
            if recipient not in self.accounts:
                self.create_account(recipient)
            
            tx = GICTransaction(
                tx_id=f"airdrop_{int(time.time() * 1000)}_{hashlib.sha256(f'{recipient}{amount_per_recipient}'.encode()).hexdigest()[:8]}",
                tx_type=TransactionType.AIRDROP,
                from_addr="treasury",
                to_addr=recipient,
                amount=amount_per_recipient,
                nonce=self.accounts["treasury"].nonce,
                memo=f"Airdrop: {reason}",
                signature="",
                timestamp=int(time.time()),
                block_height=0
            )
            
            self._apply_transfer(tx)
            transactions.append(tx)
        
        return transactions
    
    def calculate_governance_power(self, address: str) -> float:
        """Calculate governance power for an address"""
        if address not in self.accounts:
            return 0.0
        
        account = self.accounts[address]
        
        # Base power from staked amount
        staked_power = account.staked / 10**18  # Convert to GIC units
        
        # Activity bonus (up to 50% of staked power)
        activity_bonus = min(account.activity_score * 100, staked_power * 0.5)
        
        # Quadratic scaling for governance power
        total_power = staked_power + activity_bonus
        governance_power = math.sqrt(total_power)
        
        account.governance_power = governance_power
        return governance_power
    
    def distribute_staking_rewards(self, epoch: int) -> List[RewardEvent]:
        """Distribute staking rewards for the epoch"""
        if self.staking_reward_pool <= 0:
            return []
        
        # Calculate total staked amount
        total_staked = sum(info.staked_amount for info in self.staking_info.values())
        
        if total_staked == 0:
            return []
        
        # Calculate rewards per staked GIC
        rewards_per_gic = self.staking_reward_pool / total_staked
        
        reward_events = []
        
        for address, staking in self.staking_info.items():
            if staking.staked_amount > 0:
                reward_amount = int(staking.staked_amount * rewards_per_gic)
                
                if reward_amount > 0:
                    event = RewardEvent(
                        event_id=f"staking_reward_{epoch}_{address}",
                        recipient=address,
                        amount=reward_amount,
                        reason="staking_reward",
                        cycle_id=f"epoch_{epoch}",
                        multiplier=1.0,
                        timestamp=int(time.time()),
                        block_height=0
                    )
                    
                    self._apply_reward(event)
                    reward_events.append(event)
        
        return reward_events
    
    def process_epoch(self, epoch: int) -> Dict[str, Any]:
        """Process a new epoch (inflation, rewards, etc.)"""
        self.current_epoch = epoch
        
        # Calculate inflation
        inflation_amount = int(self.circulating_supply * self.inflation_rate / (365 * 24 * 60 * 60 / self.epoch_duration))
        
        # Add to treasury
        self.accounts["treasury"].balance += inflation_amount
        self.total_supply += inflation_amount
        self.circulating_supply += inflation_amount
        
        # Distribute staking rewards
        staking_rewards = self.distribute_staking_rewards(epoch)
        
        # Process unstaking
        self._process_unstaking(epoch)
        
        # Update activity scores (decay)
        self._decay_activity_scores()
        
        return {
            "epoch": epoch,
            "inflation_amount": inflation_amount,
            "staking_rewards": len(staking_rewards),
            "total_supply": self.total_supply,
            "circulating_supply": self.circulating_supply
        }
    
    def _apply_transfer(self, tx: GICTransaction):
        """Apply a transfer transaction"""
        from_account = self.accounts[tx.from_addr]
        to_account = self.accounts[tx.to_addr]
        
        # Deduct from sender
        from_account.balance -= tx.amount + tx.gas_fee
        from_account.nonce += 1
        
        # Add to recipient
        to_account.balance += tx.amount
        
        # Add gas fee to treasury
        self.accounts["treasury"].balance += tx.gas_fee
        
        # Update timestamps
        from_account.last_updated = tx.timestamp
        to_account.last_updated = tx.timestamp
        
        self.transactions.append(tx)
    
    def _apply_reward(self, event: RewardEvent):
        """Apply a reward event"""
        account = self.accounts[event.recipient]
        account.balance += event.amount
        account.activity_score += 1.0
        account.last_updated = event.timestamp
        
        self.reward_events.append(event)
    
    def _apply_stake(self, tx: GICTransaction):
        """Apply a staking transaction"""
        account = self.accounts[tx.from_addr]
        
        # Move from balance to staked
        account.balance -= tx.amount
        account.staked += tx.amount
        account.nonce += 1
        account.last_updated = tx.timestamp
        
        # Update staking info
        if tx.from_addr in self.staking_info:
            staking = self.staking_info[tx.from_addr]
            staking.staked_amount += tx.amount
        else:
            self.staking_info[tx.from_addr] = StakingInfo(
                address=tx.from_addr,
                staked_amount=tx.amount,
                stake_epoch=self.current_epoch,
                unstaking_amount=0,
                unstake_epoch=None,
                rewards_earned=0,
                last_claim_epoch=self.current_epoch
            )
        
        self.transactions.append(tx)
    
    def _apply_unstake(self, tx: GICTransaction):
        """Apply an unstaking transaction"""
        account = self.accounts[tx.from_addr]
        staking = self.staking_info[tx.from_addr]
        
        # Move from staked to unstaking
        account.staked -= tx.amount
        account.unstaking += tx.amount
        account.nonce += 1
        account.last_updated = tx.timestamp
        
        # Set unstaking epoch (7 days from now)
        unstake_epoch = self.current_epoch + (7 * 24 * 60 * 60 // self.epoch_duration)
        account.unstake_epoch = unstake_epoch
        
        staking.staked_amount -= tx.amount
        staking.unstaking_amount += tx.amount
        staking.unstake_epoch = unstake_epoch
        
        self.transactions.append(tx)
    
    def _apply_burn(self, tx: GICTransaction):
        """Apply a burn transaction"""
        account = self.accounts[tx.from_addr]
        
        # Remove from balance
        account.balance -= tx.amount
        account.nonce += 1
        account.last_updated = tx.timestamp
        
        # Reduce supply
        self.total_supply -= tx.amount
        self.circulating_supply -= tx.amount
        
        self.transactions.append(tx)
    
    def _process_unstaking(self, epoch: int):
        """Process completed unstaking"""
        for address, account in self.accounts.items():
            if account.unstake_epoch and epoch >= account.unstake_epoch:
                # Complete unstaking
                account.balance += account.unstaking
                account.unstaking = 0
                account.unstake_epoch = None
                
                # Update staking info
                if address in self.staking_info:
                    staking = self.staking_info[address]
                    staking.unstaking_amount = 0
                    staking.unstake_epoch = None
    
    def _decay_activity_scores(self):
        """Apply decay to activity scores"""
        decay_factor = 0.99  # 1% decay per epoch
        for account in self.accounts.values():
            account.activity_score *= decay_factor

# Example usage
if __name__ == "__main__":
    # Create GIC economics system
    gic = GICEconomics()
    
    # Create some accounts
    alice = gic.create_account("alice", 10000 * 10**18)
    bob = gic.create_account("bob", 5000 * 10**18)
    
    print(f"Alice balance: {alice.balance / 10**18} GIC")
    print(f"Bob balance: {bob.balance / 10**18} GIC")
    
    # Transfer GIC
    tx = gic.transfer("alice", "bob", 1000 * 10**18, "Payment for services")
    print(f"Transfer: {tx.amount / 10**18} GIC from {tx.from_addr} to {tx.to_addr}")
    
    # Stake GIC
    stake_tx = gic.stake("alice", 5000 * 10**18)
    print(f"Alice staked: {stake_tx.amount / 10**18} GIC")
    
    # Earn reward
    reward = gic.earn_reward("bob", 100 * 10**18, "reflection", "cycle_001", 1.5)
    print(f"Bob earned: {reward.amount / 10**18} GIC for {reward.reason}")
    
    # Check balances
    print(f"Alice balance: {gic.accounts['alice'].balance / 10**18} GIC")
    print(f"Alice staked: {gic.accounts['alice'].staked / 10**18} GIC")
    print(f"Bob balance: {gic.accounts['bob'].balance / 10**18} GIC")
    
    # Process epoch
    epoch_result = gic.process_epoch(1)
    print(f"Epoch 1 processed: {epoch_result}")
    
    # Calculate governance power
    alice_power = gic.calculate_governance_power("alice")
    bob_power = gic.calculate_governance_power("bob")
    print(f"Alice governance power: {alice_power:.2f}")
    print(f"Bob governance power: {bob_power:.2f}")

