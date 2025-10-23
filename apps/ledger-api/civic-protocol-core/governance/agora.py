#!/usr/bin/env python3
"""
Agora Governance System

This module implements the Agora governance system for the Civic Protocol,
enabling democratic decision-making through proposals, voting, and execution.
"""

import hashlib
import time
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import math

class ProposalType(Enum):
    """Types of governance proposals"""
    POLICY_CHANGE = "policy_change"
    PARAMETER_UPDATE = "parameter_update"
    TREASURY_SPEND = "treasury_spend"
    PROTOCOL_UPGRADE = "protocol_upgrade"
    EMERGENCY_PAUSE = "emergency_pause"
    COMMUNITY_INITIATIVE = "community_initiative"

class ProposalStatus(Enum):
    """Status of a governance proposal"""
    DRAFT = "draft"
    ACTIVE = "active"
    PASSED = "passed"
    REJECTED = "rejected"
    EXECUTED = "executed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class VoteChoice(Enum):
    """Vote choices"""
    YES = "yes"
    NO = "no"
    ABSTAIN = "abstain"

@dataclass
class GovernanceProposal:
    """Governance proposal"""
    proposal_id: str
    proposer: str
    title: str
    description: str
    proposal_type: ProposalType
    payload: Dict[str, Any]  # Proposal content
    voting_period: int  # Duration in blocks
    execution_delay: int  # Delay before execution in blocks
    created_at: int
    voting_starts_at: int
    voting_ends_at: int
    execution_at: Optional[int]
    status: ProposalStatus
    quorum_threshold: float  # Minimum participation required
    approval_threshold: float  # Minimum approval required
    total_votes: int
    yes_votes: int
    no_votes: int
    abstain_votes: int
    execution_tx_hash: Optional[str]

@dataclass
class Vote:
    """Governance vote"""
    vote_id: str
    proposal_id: str
    voter: str
    choice: VoteChoice
    weight: float  # Voting weight based on stake + activity
    signature: str
    timestamp: int
    block_height: int

@dataclass
class VotingPower:
    """Voting power calculation"""
    address: str
    staked_amount: float
    activity_score: float
    governance_power: float
    quadratic_power: float  # Square root of governance power
    last_updated: int

@dataclass
class ProposalExecution:
    """Proposal execution record"""
    proposal_id: str
    executed_at: int
    executor: str
    tx_hash: str
    result: str  # "success", "failed", "partial"
    error_message: Optional[str]

class AgoraGovernance:
    """Agora governance system implementation"""
    
    def __init__(self, gic_economics, consensus_system):
        """
        Initialize Agora governance
        
        Args:
            gic_economics: GIC economics system for voting power calculation
            consensus_system: Consensus system for block height tracking
        """
        self.gic_economics = gic_economics
        self.consensus_system = consensus_system
        self.proposals: Dict[str, GovernanceProposal] = {}
        self.votes: Dict[str, Vote] = {}
        self.voting_power: Dict[str, VotingPower] = {}
        self.executions: Dict[str, ProposalExecution] = {}
        
        # Governance parameters
        self.min_proposal_deposit = 1000 * 10**18  # 1000 GIC
        self.voting_period = 7 * 24 * 60 * 60 // 300  # 7 days in blocks (5min blocks)
        self.execution_delay = 24 * 60 * 60 // 300  # 1 day in blocks
        self.quorum_threshold = 0.20  # 20% participation required
        self.approval_threshold = 0.50  # 50% approval required
        self.emergency_threshold = 0.67  # 67% for emergency proposals
        
        # Proposal counters
        self.next_proposal_id = 1
        self.next_vote_id = 1
    
    def create_proposal(self, proposer: str, title: str, description: str,
                       proposal_type: ProposalType, payload: Dict[str, Any],
                       voting_period: Optional[int] = None,
                       execution_delay: Optional[int] = None) -> GovernanceProposal:
        """Create a new governance proposal"""
        # Check if proposer has sufficient deposit
        if proposer not in self.gic_economics.accounts:
            raise Exception(f"Proposer {proposer} does not exist")
        
        proposer_account = self.gic_economics.accounts[proposer]
        if proposer_account.balance < self.min_proposal_deposit:
            raise Exception(f"Insufficient balance for proposal deposit: {proposer_account.balance} < {self.min_proposal_deposit}")
        
        # Create proposal
        proposal_id = f"prop_{self.next_proposal_id:06d}"
        self.next_proposal_id += 1
        
        current_time = int(time.time())
        voting_period = voting_period or self.voting_period
        execution_delay = execution_delay or self.execution_delay
        
        proposal = GovernanceProposal(
            proposal_id=proposal_id,
            proposer=proposer,
            title=title,
            description=description,
            proposal_type=proposal_type,
            payload=payload,
            voting_period=voting_period,
            execution_delay=execution_delay,
            created_at=current_time,
            voting_starts_at=current_time + (24 * 60 * 60),  # 24 hour delay
            voting_ends_at=current_time + (24 * 60 * 60) + (voting_period * 300),
            execution_at=None,
            status=ProposalStatus.DRAFT,
            quorum_threshold=self.quorum_threshold,
            approval_threshold=self.approval_threshold,
            total_votes=0,
            yes_votes=0,
            no_votes=0,
            abstain_votes=0,
            execution_tx_hash=None
        )
        
        # Deduct proposal deposit
        proposer_account.balance -= self.min_proposal_deposit
        proposer_account.nonce += 1
        
        # Move deposit to treasury (will be returned if proposal passes)
        self.gic_economics.accounts["treasury"].balance += self.min_proposal_deposit
        
        self.proposals[proposal_id] = proposal
        return proposal
    
    def activate_proposal(self, proposal_id: str) -> bool:
        """Activate a proposal for voting"""
        if proposal_id not in self.proposals:
            return False
        
        proposal = self.proposals[proposal_id]
        current_time = int(time.time())
        
        if proposal.status != ProposalStatus.DRAFT:
            return False
        
        if current_time < proposal.voting_starts_at:
            return False
        
        proposal.status = ProposalStatus.ACTIVE
        return True
    
    def cast_vote(self, proposal_id: str, voter: str, choice: VoteChoice,
                 signature: str = "") -> Vote:
        """Cast a vote on a proposal"""
        if proposal_id not in self.proposals:
            raise Exception(f"Proposal {proposal_id} not found")
        
        proposal = self.proposals[proposal_id]
        current_time = int(time.time())
        
        if proposal.status != ProposalStatus.ACTIVE:
            raise Exception(f"Proposal {proposal_id} is not active for voting")
        
        if current_time < proposal.voting_starts_at or current_time > proposal.voting_ends_at:
            raise Exception(f"Voting period has not started or has ended")
        
        # Check if voter has already voted
        existing_vote = self._find_existing_vote(proposal_id, voter)
        if existing_vote:
            raise Exception(f"Voter {voter} has already voted on proposal {proposal_id}")
        
        # Calculate voting power
        voting_power = self._calculate_voting_power(voter)
        
        # Create vote
        vote_id = f"vote_{self.next_vote_id:06d}"
        self.next_vote_id += 1
        
        vote = Vote(
            vote_id=vote_id,
            proposal_id=proposal_id,
            voter=voter,
            choice=choice,
            weight=voting_power.governance_power,
            signature=signature,
            timestamp=current_time,
            block_height=self.consensus_system.current_epoch
        )
        
        self.votes[vote_id] = vote
        
        # Update proposal vote counts
        proposal.total_votes += 1
        if choice == VoteChoice.YES:
            proposal.yes_votes += 1
        elif choice == VoteChoice.NO:
            proposal.no_votes += 1
        elif choice == VoteChoice.ABSTAIN:
            proposal.abstain_votes += 1
        
        # Check if proposal should be finalized
        self._check_proposal_finalization(proposal_id)
        
        return vote
    
    def execute_proposal(self, proposal_id: str, executor: str) -> ProposalExecution:
        """Execute a passed proposal"""
        if proposal_id not in self.proposals:
            raise Exception(f"Proposal {proposal_id} not found")
        
        proposal = self.proposals[proposal_id]
        current_time = int(time.time())
        
        if proposal.status != ProposalStatus.PASSED:
            raise Exception(f"Proposal {proposal_id} has not passed")
        
        if proposal.execution_at and current_time < proposal.execution_at:
            raise Exception(f"Proposal execution delay has not elapsed")
        
        # Execute based on proposal type
        try:
            result = self._execute_proposal_payload(proposal)
            execution = ProposalExecution(
                proposal_id=proposal_id,
                executed_at=current_time,
                executor=executor,
                tx_hash=f"exec_{int(time.time() * 1000)}",
                result="success",
                error_message=None
            )
            
            proposal.status = ProposalStatus.EXECUTED
            proposal.execution_tx_hash = execution.tx_hash
            
        except Exception as e:
            execution = ProposalExecution(
                proposal_id=proposal_id,
                executed_at=current_time,
                executor=executor,
                tx_hash=f"exec_{int(time.time() * 1000)}",
                result="failed",
                error_message=str(e)
            )
        
        self.executions[proposal_id] = execution
        return execution
    
    def get_proposal(self, proposal_id: str) -> Optional[GovernanceProposal]:
        """Get a proposal by ID"""
        return self.proposals.get(proposal_id)
    
    def list_proposals(self, status: Optional[ProposalStatus] = None,
                      proposer: Optional[str] = None,
                      limit: int = 50, offset: int = 0) -> List[GovernanceProposal]:
        """List proposals with optional filtering"""
        proposals = list(self.proposals.values())
        
        if status:
            proposals = [p for p in proposals if p.status == status]
        
        if proposer:
            proposals = [p for p in proposals if p.proposer == proposer]
        
        # Sort by creation time (newest first)
        proposals.sort(key=lambda p: p.created_at, reverse=True)
        
        return proposals[offset:offset + limit]
    
    def get_votes(self, proposal_id: str) -> List[Vote]:
        """Get all votes for a proposal"""
        return [vote for vote in self.votes.values() if vote.proposal_id == proposal_id]
    
    def get_voting_power(self, address: str) -> VotingPower:
        """Get voting power for an address"""
        return self._calculate_voting_power(address)
    
    def _calculate_voting_power(self, address: str) -> VotingPower:
        """Calculate voting power for an address"""
        if address not in self.gic_economics.accounts:
            return VotingPower(
                address=address,
                staked_amount=0.0,
                activity_score=0.0,
                governance_power=0.0,
                quadratic_power=0.0,
                last_updated=int(time.time())
            )
        
        account = self.gic_economics.accounts[address]
        
        # Get staked amount
        staked_amount = account.staked / 10**18  # Convert to GIC units
        
        # Get activity score
        activity_score = account.activity_score
        
        # Calculate governance power (stake + activity bonus)
        activity_bonus = min(activity_score * 100, staked_amount * 0.5)
        governance_power = staked_amount + activity_bonus
        
        # Apply quadratic scaling
        quadratic_power = math.sqrt(governance_power) if governance_power > 0 else 0
        
        voting_power = VotingPower(
            address=address,
            staked_amount=staked_amount,
            activity_score=activity_score,
            governance_power=governance_power,
            quadratic_power=quadratic_power,
            last_updated=int(time.time())
        )
        
        self.voting_power[address] = voting_power
        return voting_power
    
    def _find_existing_vote(self, proposal_id: str, voter: str) -> Optional[Vote]:
        """Find existing vote by voter on proposal"""
        for vote in self.votes.values():
            if vote.proposal_id == proposal_id and vote.voter == voter:
                return vote
        return None
    
    def _check_proposal_finalization(self, proposal_id: str):
        """Check if a proposal should be finalized"""
        proposal = self.proposals[proposal_id]
        
        if proposal.status != ProposalStatus.ACTIVE:
            return
        
        current_time = int(time.time())
        
        # Check if voting period has ended
        if current_time > proposal.voting_ends_at:
            self._finalize_proposal(proposal_id)
            return
        
        # Check if quorum and approval thresholds are met
        total_voting_power = sum(vp.governance_power for vp in self.voting_power.values())
        proposal_voting_power = sum(
            vote.weight for vote in self.votes.values() 
            if vote.proposal_id == proposal_id
        )
        
        participation_rate = proposal_voting_power / total_voting_power if total_voting_power > 0 else 0
        
        if participation_rate >= proposal.quorum_threshold:
            approval_rate = proposal.yes_votes / proposal.total_votes if proposal.total_votes > 0 else 0
            
            if approval_rate >= proposal.approval_threshold:
                proposal.status = ProposalStatus.PASSED
                proposal.execution_at = current_time + (proposal.execution_delay * 300)
            else:
                proposal.status = ProposalStatus.REJECTED
    
    def _finalize_proposal(self, proposal_id: str):
        """Finalize a proposal after voting period ends"""
        proposal = self.proposals[proposal_id]
        
        if proposal.total_votes == 0:
            proposal.status = ProposalStatus.REJECTED
            return
        
        # Calculate participation and approval rates
        total_voting_power = sum(vp.governance_power for vp in self.voting_power.values())
        proposal_voting_power = sum(
            vote.weight for vote in self.votes.values() 
            if vote.proposal_id == proposal_id
        )
        
        participation_rate = proposal_voting_power / total_voting_power if total_voting_power > 0 else 0
        approval_rate = proposal.yes_votes / proposal.total_votes
        
        if participation_rate >= proposal.quorum_threshold and approval_rate >= proposal.approval_threshold:
            proposal.status = ProposalStatus.PASSED
            proposal.execution_at = int(time.time()) + (proposal.execution_delay * 300)
        else:
            proposal.status = ProposalStatus.REJECTED
    
    def _execute_proposal_payload(self, proposal: GovernanceProposal) -> str:
        """Execute the payload of a proposal"""
        proposal_type = proposal.proposal_type
        payload = proposal.payload
        
        if proposal_type == ProposalType.POLICY_CHANGE:
            return self._execute_policy_change(payload)
        elif proposal_type == ProposalType.PARAMETER_UPDATE:
            return self._execute_parameter_update(payload)
        elif proposal_type == ProposalType.TREASURY_SPEND:
            return self._execute_treasury_spend(payload)
        elif proposal_type == ProposalType.PROTOCOL_UPGRADE:
            return self._execute_protocol_upgrade(payload)
        elif proposal_type == ProposalType.EMERGENCY_PAUSE:
            return self._execute_emergency_pause(payload)
        elif proposal_type == ProposalType.COMMUNITY_INITIATIVE:
            return self._execute_community_initiative(payload)
        else:
            raise Exception(f"Unknown proposal type: {proposal_type}")
    
    def _execute_policy_change(self, payload: Dict[str, Any]) -> str:
        """Execute a policy change proposal"""
        # Update governance parameters
        if "quorum_threshold" in payload:
            self.quorum_threshold = payload["quorum_threshold"]
        if "approval_threshold" in payload:
            self.approval_threshold = payload["approval_threshold"]
        if "min_proposal_deposit" in payload:
            self.min_proposal_deposit = payload["min_proposal_deposit"]
        
        return "Policy change executed successfully"
    
    def _execute_parameter_update(self, payload: Dict[str, Any]) -> str:
        """Execute a parameter update proposal"""
        # Update GIC economics parameters
        if "inflation_rate" in payload:
            self.gic_economics.inflation_rate = payload["inflation_rate"]
        if "staking_reward_rate" in payload:
            self.gic_economics.staking_reward_rate = payload["staking_reward_rate"]
        if "burn_rate" in payload:
            self.gic_economics.burn_rate = payload["burn_rate"]
        
        return "Parameter update executed successfully"
    
    def _execute_treasury_spend(self, payload: Dict[str, Any]) -> str:
        """Execute a treasury spend proposal"""
        recipient = payload.get("recipient")
        amount = payload.get("amount")
        reason = payload.get("reason", "Treasury spend")
        
        if not recipient or not amount:
            raise Exception("Missing recipient or amount in treasury spend proposal")
        
        # Transfer from treasury
        self.gic_economics.transfer("treasury", recipient, amount, reason)
        
        return f"Treasury spend executed: {amount / 10**18} GIC to {recipient}"
    
    def _execute_protocol_upgrade(self, payload: Dict[str, Any]) -> str:
        """Execute a protocol upgrade proposal"""
        version = payload.get("version")
        upgrade_hash = payload.get("upgrade_hash")
        
        if not version or not upgrade_hash:
            raise Exception("Missing version or upgrade_hash in protocol upgrade proposal")
        
        # In a real implementation, this would trigger the upgrade process
        return f"Protocol upgrade to version {version} initiated"
    
    def _execute_emergency_pause(self, payload: Dict[str, Any]) -> str:
        """Execute an emergency pause proposal"""
        duration = payload.get("duration", 24 * 60 * 60)  # Default 24 hours
        reason = payload.get("reason", "Emergency pause")
        
        # In a real implementation, this would pause the protocol
        return f"Emergency pause activated for {duration} seconds: {reason}"
    
    def _execute_community_initiative(self, payload: Dict[str, Any]) -> str:
        """Execute a community initiative proposal"""
        initiative_type = payload.get("type")
        description = payload.get("description")
        
        if not initiative_type or not description:
            raise Exception("Missing type or description in community initiative proposal")
        
        # In a real implementation, this would execute the specific initiative
        return f"Community initiative '{initiative_type}' executed: {description}"

# Example usage
if __name__ == "__main__":
    # This would normally be initialized with actual systems
    from ledger.gic_economics import GICEconomics
    from consensus.proof_of_cycle import ProofOfCycle, create_genesis_policy
    
    # Create systems
    policy = create_genesis_policy()
    consensus = ProofOfCycle(policy)
    gic = GICEconomics()
    
    # Initialize governance
    agora = AgoraGovernance(gic, consensus)
    
    # Register some citizens
    alice = gic.create_account("alice", 10000 * 10**18)
    bob = gic.create_account("bob", 5000 * 10**18)
    
    # Stake for governance
    gic.stake("alice", 5000 * 10**18)
    gic.stake("bob", 2000 * 10**18)
    
    # Create a proposal
    proposal = agora.create_proposal(
        proposer="alice",
        title="Increase Staking Rewards",
        description="Increase staking rewards from 8% to 10% annually",
        proposal_type=ProposalType.PARAMETER_UPDATE,
        payload={"staking_reward_rate": 0.10}
    )
    
    print(f"Created proposal: {proposal.proposal_id}")
    
    # Activate proposal
    agora.activate_proposal(proposal.proposal_id)
    print(f"Proposal activated: {proposal.status}")
    
    # Cast votes
    vote1 = agora.cast_vote(proposal.proposal_id, "alice", VoteChoice.YES)
    vote2 = agora.cast_vote(proposal.proposal_id, "bob", VoteChoice.YES)
    
    print(f"Alice voted: {vote1.choice} (weight: {vote1.weight:.2f})")
    print(f"Bob voted: {vote2.choice} (weight: {vote2.weight:.2f})")
    
    # Check proposal status
    proposal = agora.get_proposal(proposal.proposal_id)
    print(f"Proposal status: {proposal.status}")
    print(f"Votes: {proposal.yes_votes} yes, {proposal.no_votes} no, {proposal.abstain_votes} abstain")
    
    # Get voting power
    alice_power = agora.get_voting_power("alice")
    print(f"Alice voting power: {alice_power.governance_power:.2f}")
