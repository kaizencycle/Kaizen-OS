#!/usr/bin/env python3
"""
Proof-of-Cycle (PoC) Consensus Implementation

This module implements the Proof-of-Cycle consensus mechanism for the Civic Protocol.
PoC rewards verified civic activity rather than raw compute power, creating a blockchain
that is purpose-built for civilization state management.
"""

import hashlib
import time
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, date
from enum import Enum
import secrets
import hmac

class CycleStatus(Enum):
    """Status of a civic cycle"""
    SEED = "seed"
    SWEEP = "sweep"
    SEAL = "seal"
    LEDGER = "ledger"

class BlockType(Enum):
    """Types of blocks in the chain"""
    L1_BLOCK = "l1_block"
    MICROBLOCK = "microblock"

@dataclass
class CitizenID:
    """Citizen identity"""
    pubkey: str
    nonce: int = 0
    activity_score: float = 0.0
    last_activity: Optional[str] = None

@dataclass
class CompanionID:
    """AI companion identity"""
    pubkey: str
    citizen_owner: str
    capabilities: List[str]
    rate_limits: Dict[str, int]

@dataclass
class Reflection:
    """Civic reflection with privacy protection"""
    ref_id: str
    envelope_hash: str  # Hash of encrypted content
    author: str  # CitizenID or CompanionID
    companion: Optional[str]
    visibility: str  # "private" or "public"
    tags: List[str]
    timestamp: int
    zk_proof: str  # Zero-knowledge proof of validity
    rate_limit_proof: str  # Proof of rate limit compliance

@dataclass
class Cycle:
    """Civic cycle (Seed → Sweep → Seal → Ledger)"""
    cycle_id: str
    date: str  # YYYY-MM-DD
    seed_hash: str
    sweeps_root: str  # Merkle root of sweeps
    seal_hash: str
    day_root: str  # Final day root
    counts: Dict[str, int]  # {seeds, sweeps, seals}
    status: CycleStatus
    timestamp: int
    proposer: str  # CitizenID who proposed this cycle

@dataclass
class GICAccount:
    """GIC (Governance Incentive Currency) account"""
    address: str
    nonce: int
    balance: int  # In smallest units (wei-like)
    vesting: int
    staked: int
    last_updated: int

@dataclass
class GICTransaction:
    """GIC transaction"""
    tx_id: str
    from_addr: str
    to_addr: str
    amount: int
    nonce: int
    memo: Optional[str]
    signature: str
    timestamp: int

@dataclass
class EarnTransaction:
    """Earn transaction for civic activity"""
    tx_id: str
    to_addr: str
    amount: int
    reason: str  # "reflection", "attestation", "vote", etc.
    cycle_id: str
    attestation_hash: str
    zk_proof: str
    signature: str
    timestamp: int

@dataclass
class Policy:
    """Protocol policy configuration"""
    version: str
    rate_limits: Dict[str, int]  # Per-identity limits
    reward_schedule: Dict[str, float]  # Reward multipliers
    privacy_flags: Dict[str, bool]
    consensus_params: Dict[str, Any]
    hash: str

@dataclass
class GovernanceProposal:
    """Governance proposal"""
    proposal_id: str
    proposer: str
    title: str
    description: str
    payload_hash: str  # Hash of proposal content
    proposal_type: str  # "policy_change", "parameter_update", etc.
    voting_period: int  # Blocks
    created_at: int
    status: str  # "active", "passed", "rejected", "executed"

@dataclass
class Vote:
    """Governance vote"""
    vote_id: str
    proposal_id: str
    voter: str
    choice: str  # "yes", "no", "abstain"
    weight: float  # Based on stake + activity
    signature: str
    timestamp: int

@dataclass
class BlockHeader:
    """Block header for L1 blocks"""
    parent_hash: str
    height: int
    timestamp: int
    proposer: str
    state_root: str
    tx_root: str
    cycle_root: str
    policy_version: str
    committee_sigs: List[str]  # Multi-signature from committee

@dataclass
class L1Block:
    """L1 (canonical) block"""
    header: BlockHeader
    transactions: List[GICTransaction]
    earn_transactions: List[EarnTransaction]
    cycles: List[Cycle]
    policy_updates: List[Policy]
    hash: str

@dataclass
class Microblock:
    """Microblock for low-latency reflections"""
    parent_hash: str
    height: int
    timestamp: int
    proposer: str
    reflections: List[Reflection]
    attestations: List[Dict[str, Any]]
    hash: str

class MerkleTree:
    """Simple Merkle tree implementation"""
    
    def __init__(self, data: List[str]):
        self.data = data
        self.tree = self._build_tree()
    
    def _build_tree(self) -> List[List[str]]:
        """Build the Merkle tree"""
        if not self.data:
            return []
        
        # Pad to power of 2
        padded_data = self.data[:]
        while len(padded_data) & (len(padded_data) - 1):
            padded_data.append("")
        
        tree = [padded_data]
        current_level = padded_data
        
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else ""
                combined = left + right
                hash_value = hashlib.sha256(combined.encode()).hexdigest()
                next_level.append(hash_value)
            tree.append(next_level)
            current_level = next_level
        
        return tree
    
    def get_root(self) -> str:
        """Get the Merkle root"""
        if not self.tree:
            return ""
        return self.tree[-1][0]
    
    def get_proof(self, index: int) -> List[str]:
        """Get Merkle proof for an element"""
        if index >= len(self.data):
            return []
        
        proof = []
        current_index = index
        
        for level in self.tree[:-1]:
            if current_index % 2 == 0:
                # Left node, need right sibling
                sibling_index = current_index + 1
            else:
                # Right node, need left sibling
                sibling_index = current_index - 1
            
            if sibling_index < len(level):
                proof.append(level[sibling_index])
            
            current_index //= 2
        
        return proof

class ProofOfCycle:
    """Proof-of-Cycle consensus implementation"""
    
    def __init__(self, genesis_policy: Policy):
        self.policy = genesis_policy
        self.citizens: Dict[str, CitizenID] = {}
        self.companions: Dict[str, CompanionID] = {}
        self.cycles: Dict[str, Cycle] = {}
        self.blocks: List[L1Block] = []
        self.microblocks: List[Microblock] = []
        self.balances: Dict[str, GICAccount] = {}
        self.proposals: Dict[str, GovernanceProposal] = {}
        self.votes: Dict[str, Vote] = {}
        self.committee_size = 7  # Default committee size
        self.epoch_duration = 300  # 5 minutes in seconds
        
    def register_citizen(self, pubkey: str) -> str:
        """Register a new citizen"""
        citizen_id = f"citizen_{len(self.citizens):06d}"
        self.citizens[citizen_id] = CitizenID(pubkey=pubkey)
        self.balances[citizen_id] = GICAccount(
            address=citizen_id,
            nonce=0,
            balance=1000 * 10**18,  # 1000 GIC with 18 decimals
            vesting=0,
            staked=0,
            last_updated=int(time.time())
        )
        return citizen_id
    
    def register_companion(self, pubkey: str, citizen_owner: str, 
                          capabilities: List[str]) -> str:
        """Register a new AI companion"""
        companion_id = f"companion_{len(self.companions):06d}"
        self.companions[companion_id] = CompanionID(
            pubkey=pubkey,
            citizen_owner=citizen_owner,
            capabilities=capabilities,
            rate_limits={"reflections_per_day": 10, "attestations_per_day": 5}
        )
        return companion_id
    
    def create_reflection(self, author: str, content_hash: str, 
                         visibility: str = "private", tags: List[str] = None,
                         companion: Optional[str] = None) -> Reflection:
        """Create a new reflection with privacy protection"""
        # Check rate limits
        if not self._check_rate_limit(author, "reflections_per_day"):
            raise Exception("Rate limit exceeded for reflections")
        
        ref_id = f"ref_{int(time.time() * 1000)}_{secrets.token_hex(8)}"
        
        # Create zero-knowledge proof (simplified)
        zk_proof = self._create_zk_proof(author, "reflection")
        rate_limit_proof = self._create_rate_limit_proof(author, "reflections_per_day")
        
        reflection = Reflection(
            ref_id=ref_id,
            envelope_hash=content_hash,
            author=author,
            companion=companion,
            visibility=visibility,
            tags=tags or [],
            timestamp=int(time.time()),
            zk_proof=zk_proof,
            rate_limit_proof=rate_limit_proof
        )
        
        # Update activity score
        if author in self.citizens:
            self.citizens[author].activity_score += 1.0
            self.citizens[author].last_activity = datetime.now().isoformat()
        
        return reflection
    
    def create_cycle(self, proposer: str, date: str) -> Cycle:
        """Create a new civic cycle"""
        cycle_id = f"cycle_{date.replace('-', '')}"
        
        # Generate cycle hashes (simplified)
        seed_hash = hashlib.sha256(f"seed_{date}_{proposer}".encode()).hexdigest()
        sweeps_root = hashlib.sha256(f"sweeps_{date}".encode()).hexdigest()
        seal_hash = hashlib.sha256(f"seal_{date}".encode()).hexdigest()
        day_root = hashlib.sha256(f"day_{date}_{seed_hash}{sweeps_root}{seal_hash}".encode()).hexdigest()
        
        cycle = Cycle(
            cycle_id=cycle_id,
            date=date,
            seed_hash=seed_hash,
            sweeps_root=sweeps_root,
            seal_hash=seal_hash,
            day_root=day_root,
            counts={"seeds": 0, "sweeps": 0, "seals": 0},
            status=CycleStatus.SEED,
            timestamp=int(time.time()),
            proposer=proposer
        )
        
        self.cycles[cycle_id] = cycle
        return cycle
    
    def select_committee(self, epoch: int) -> List[str]:
        """Select committee for the current epoch using VRF + stake + activity"""
        # Get all citizens with stake
        staked_citizens = [
            (citizen_id, self.balances[citizen_id].staked + 
             self.citizens[citizen_id].activity_score * 100)
            for citizen_id in self.citizens.keys()
            if self.balances[citizen_id].staked > 0
        ]
        
        if len(staked_citizens) < self.committee_size:
            # Not enough staked citizens, use all available
            return list(self.citizens.keys())[:self.committee_size]
        
        # Sort by combined stake + activity score
        staked_citizens.sort(key=lambda x: x[1], reverse=True)
        
        # Select top committee_size citizens
        committee = [citizen_id for citizen_id, _ in staked_citizens[:self.committee_size]]
        
        # Add some randomness using VRF (simplified)
        vrf_seed = f"epoch_{epoch}_{self.policy.hash}"
        random_factor = int(hashlib.sha256(vrf_seed.encode()).hexdigest(), 16)
        
        # Shuffle committee based on VRF
        for i in range(len(committee)):
            j = (i + random_factor) % len(committee)
            committee[i], committee[j] = committee[j], committee[i]
        
        return committee[:self.committee_size]
    
    def propose_block(self, proposer: str, transactions: List[GICTransaction],
                     earn_transactions: List[EarnTransaction], cycles: List[Cycle]) -> L1Block:
        """Propose a new L1 block"""
        if not self.blocks:
            parent_hash = "0" * 64  # Genesis
            height = 0
        else:
            parent_hash = self.blocks[-1].hash
            height = self.blocks[-1].header.height + 1
        
        # Create Merkle trees
        tx_hashes = [self._hash_transaction(tx) for tx in transactions]
        tx_tree = MerkleTree(tx_hashes)
        tx_root = tx_tree.get_root()
        
        earn_tx_hashes = [self._hash_earn_transaction(tx) for tx in earn_transactions]
        earn_tx_tree = MerkleTree(earn_tx_hashes)
        earn_tx_root = earn_tx_tree.get_root()
        
        cycle_hashes = [self._hash_cycle(cycle) for cycle in cycles]
        cycle_tree = MerkleTree(cycle_hashes)
        cycle_root = cycle_tree.get_root()
        
        # Create state root (simplified)
        state_root = self._compute_state_root()
        
        # Create block header
        header = BlockHeader(
            parent_hash=parent_hash,
            height=height,
            timestamp=int(time.time()),
            proposer=proposer,
            state_root=state_root,
            tx_root=tx_root,
            cycle_root=cycle_root,
            policy_version=self.policy.version,
            committee_sigs=[]  # Will be filled by committee
        )
        
        # Create block
        block = L1Block(
            header=header,
            transactions=transactions,
            earn_transactions=earn_transactions,
            cycles=cycles,
            policy_updates=[],
            hash=""
        )
        
        # Compute block hash
        block.hash = self._hash_block(block)
        
        return block
    
    def validate_block(self, block: L1Block) -> bool:
        """Validate a proposed block"""
        # Check block hash
        if block.hash != self._hash_block(block):
            return False
        
        # Check parent hash
        if block.header.height > 0:
            if block.header.parent_hash != self.blocks[-1].hash:
                return False
        
        # Validate transactions
        for tx in block.transactions:
            if not self._validate_transaction(tx):
                return False
        
        # Validate earn transactions
        for tx in block.earn_transactions:
            if not self._validate_earn_transaction(tx):
                return False
        
        # Validate cycles
        for cycle in block.cycles:
            if not self._validate_cycle(cycle):
                return False
        
        return True
    
    def add_block(self, block: L1Block) -> bool:
        """Add a validated block to the chain"""
        if not self.validate_block(block):
            return False
        
        self.blocks.append(block)
        
        # Apply transactions
        for tx in block.transactions:
            self._apply_transaction(tx)
        
        for tx in block.earn_transactions:
            self._apply_earn_transaction(tx)
        
        # Update cycles
        for cycle in block.cycles:
            self.cycles[cycle.cycle_id] = cycle
        
        return True
    
    def create_earn_transaction(self, to_addr: str, amount: int, reason: str,
                               cycle_id: str, attestation_hash: str) -> EarnTransaction:
        """Create an earn transaction for civic activity"""
        tx_id = f"earn_{int(time.time() * 1000)}_{secrets.token_hex(8)}"
        
        # Create ZK proof of valid activity
        zk_proof = self._create_zk_proof(to_addr, reason)
        
        earn_tx = EarnTransaction(
            tx_id=tx_id,
            to_addr=to_addr,
            amount=amount,
            reason=reason,
            cycle_id=cycle_id,
            attestation_hash=attestation_hash,
            zk_proof=zk_proof,
            signature="",  # Will be signed by the system
            timestamp=int(time.time())
        )
        
        return earn_tx
    
    def _check_rate_limit(self, identity: str, limit_type: str) -> bool:
        """Check if identity is within rate limits"""
        if identity in self.citizens:
            # Check citizen rate limits
            limits = self.policy.rate_limits.get(limit_type, 100)
            # Simplified: assume unlimited for now
            return True
        elif identity in self.companions:
            # Check companion rate limits
            limits = self.companions[identity].rate_limits.get(limit_type, 10)
            # Simplified: assume unlimited for now
            return True
        
        return False
    
    def _create_zk_proof(self, identity: str, activity_type: str) -> str:
        """Create a zero-knowledge proof (simplified)"""
        # In a real implementation, this would use actual ZK proof systems
        proof_data = f"{identity}_{activity_type}_{int(time.time())}"
        return hashlib.sha256(proof_data.encode()).hexdigest()
    
    def _create_rate_limit_proof(self, identity: str, limit_type: str) -> str:
        """Create a rate limit proof (simplified)"""
        # In a real implementation, this would use ZK proofs
        proof_data = f"{identity}_{limit_type}_{int(time.time())}"
        return hashlib.sha256(proof_data.encode()).hexdigest()
    
    def _hash_transaction(self, tx: GICTransaction) -> str:
        """Hash a GIC transaction"""
        tx_data = f"{tx.tx_id}{tx.from_addr}{tx.to_addr}{tx.amount}{tx.nonce}{tx.timestamp}"
        return hashlib.sha256(tx_data.encode()).hexdigest()
    
    def _hash_earn_transaction(self, tx: EarnTransaction) -> str:
        """Hash an earn transaction"""
        tx_data = f"{tx.tx_id}{tx.to_addr}{tx.amount}{tx.reason}{tx.cycle_id}{tx.timestamp}"
        return hashlib.sha256(tx_data.encode()).hexdigest()
    
    def _hash_cycle(self, cycle: Cycle) -> str:
        """Hash a cycle"""
        cycle_data = f"{cycle.cycle_id}{cycle.date}{cycle.day_root}{cycle.timestamp}"
        return hashlib.sha256(cycle_data.encode()).hexdigest()
    
    def _hash_block(self, block: L1Block) -> str:
        """Hash a block"""
        block_data = f"{block.header.parent_hash}{block.header.height}{block.header.timestamp}{block.header.proposer}{block.header.state_root}{block.header.tx_root}{block.header.cycle_root}"
        return hashlib.sha256(block_data.encode()).hexdigest()
    
    def _compute_state_root(self) -> str:
        """Compute the current state root"""
        # Simplified state root computation
        state_data = ""
        for addr, account in self.balances.items():
            state_data += f"{addr}{account.balance}{account.nonce}"
        return hashlib.sha256(state_data.encode()).hexdigest()
    
    def _validate_transaction(self, tx: GICTransaction) -> bool:
        """Validate a GIC transaction"""
        # Check if sender has sufficient balance
        if tx.from_addr in self.balances:
            account = self.balances[tx.from_addr]
            if account.balance < tx.amount:
                return False
            if account.nonce != tx.nonce:
                return False
        
        return True
    
    def _validate_earn_transaction(self, tx: EarnTransaction) -> bool:
        """Validate an earn transaction"""
        # Check if the reason is valid
        valid_reasons = ["reflection", "attestation", "vote", "cycle_participation"]
        if tx.reason not in valid_reasons:
            return False
        
        # Check if cycle exists
        if tx.cycle_id not in self.cycles:
            return False
        
        return True
    
    def _validate_cycle(self, cycle: Cycle) -> bool:
        """Validate a cycle"""
        # Check if cycle date is valid
        try:
            datetime.strptime(cycle.date, "%Y-%m-%d")
        except ValueError:
            return False
        
        # Check if proposer is valid
        if cycle.proposer not in self.citizens:
            return False
        
        return True
    
    def _apply_transaction(self, tx: GICTransaction):
        """Apply a GIC transaction to state"""
        if tx.from_addr in self.balances:
            self.balances[tx.from_addr].balance -= tx.amount
            self.balances[tx.from_addr].nonce += 1
        
        if tx.to_addr not in self.balances:
            self.balances[tx.to_addr] = GICAccount(
                address=tx.to_addr,
                nonce=0,
                balance=0,
                vesting=0,
                staked=0,
                last_updated=int(time.time())
            )
        
        self.balances[tx.to_addr].balance += tx.amount
        self.balances[tx.to_addr].last_updated = int(time.time())
    
    def _apply_earn_transaction(self, tx: EarnTransaction):
        """Apply an earn transaction to state"""
        if tx.to_addr not in self.balances:
            self.balances[tx.to_addr] = GICAccount(
                address=tx.to_addr,
                nonce=0,
                balance=0,
                vesting=0,
                staked=0,
                last_updated=int(time.time())
            )
        
        self.balances[tx.to_addr].balance += tx.amount
        self.balances[tx.to_addr].last_updated = int(time.time())
        
        # Update activity score
        if tx.to_addr in self.citizens:
            self.citizens[tx.to_addr].activity_score += 1.0

def create_genesis_policy() -> Policy:
    """Create the genesis policy configuration"""
    return Policy(
        version="0.1.0",
        rate_limits={
            "reflections_per_day": 10,
            "attestations_per_day": 5,
            "votes_per_proposal": 1
        },
        reward_schedule={
            "reflection": 1.0,
            "attestation": 2.0,
            "vote": 0.5,
            "cycle_participation": 3.0
        },
        privacy_flags={
            "default_private": True,
            "allow_public_opt_in": True,
            "enable_view_keys": True
        },
        consensus_params={
            "committee_size": 7,
            "epoch_duration": 300,
            "block_time": 5,
            "finality_blocks": 2
        },
        hash="genesis_policy_v0_1_0"
    )

# Example usage
if __name__ == "__main__":
    # Create genesis policy
    policy = create_genesis_policy()
    
    # Initialize PoC consensus
    poc = ProofOfCycle(policy)
    
    # Register some citizens
    citizen1 = poc.register_citizen("0x1234567890abcdef")
    citizen2 = poc.register_citizen("0xfedcba0987654321")
    
    print(f"Registered citizens: {citizen1}, {citizen2}")
    
    # Create a reflection
    reflection = poc.create_reflection(
        author=citizen1,
        content_hash="0xabcdef1234567890",
        visibility="public",
        tags=["hello", "cycle0"]
    )
    print(f"Created reflection: {reflection.ref_id}")
    
    # Create a cycle
    cycle = poc.create_cycle(proposer=citizen1, date="2024-01-01")
    print(f"Created cycle: {cycle.cycle_id}")
    
    # Create an earn transaction
    earn_tx = poc.create_earn_transaction(
        to_addr=citizen1,
        amount=100 * 10**18,  # 100 GIC
        reason="reflection",
        cycle_id=cycle.cycle_id,
        attestation_hash="0xattestation123"
    )
    print(f"Created earn transaction: {earn_tx.tx_id}")
    
    # Select committee
    committee = poc.select_committee(epoch=1)
    print(f"Selected committee: {committee}")
    
    # Propose a block
    block = poc.propose_block(
        proposer=citizen1,
        transactions=[],
        earn_transactions=[earn_tx],
        cycles=[cycle]
    )
    print(f"Proposed block: {block.hash}")
    
    # Add block to chain
    if poc.add_block(block):
        print("✓ Block added to chain successfully")
    else:
        print("✗ Failed to add block to chain")
    
    print(f"Chain height: {len(poc.blocks)}")
    print(f"Citizen 1 balance: {poc.balances[citizen1].balance / 10**18} GIC")

