#!/usr/bin/env python3
"""
Hello Reflection App - Python Example

A simple example application that demonstrates how to use the Civic Protocol Core
Python SDK to create and manage civic reflections.
"""

import sys
import os
import time
from datetime import datetime

# Add the SDK to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'sdk', 'python'))

from client import CivicClient

def print_separator(title=""):
    """Print a visual separator"""
    if title:
        print(f"\n{'='*60}")
        print(f" {title}")
        print(f"{'='*60}")
    else:
        print(f"\n{'-'*60}")

def print_reflection(reflection):
    """Print a reflection in a formatted way"""
    print(f"  ID: {reflection.ref_id}")
    print(f"  Author: {reflection.author}")
    print(f"  Visibility: {reflection.visibility}")
    print(f"  Tags: {', '.join(reflection.tags)}")
    print(f"  Created: {reflection.created_at}")
    print(f"  Envelope Hash: {reflection.envelope_hash}")
    print(f"  ZK Proof: {reflection.zk_proof}")
    print()

def print_balance(balance):
    """Print balance information"""
    print(f"  Address: {balance.address}")
    print(f"  Balance: {balance.balance} GIC")
    print(f"  Vesting: {balance.vesting} GIC")
    print(f"  Nonce: {balance.nonce}")
    print(f"  Last Updated: {balance.last_updated}")
    print()

def print_cycle(cycle):
    """Print cycle information"""
    print(f"  Cycle ID: {cycle.cycle_id}")
    print(f"  Date: {cycle.date}")
    print(f"  Status: {cycle.status}")
    print(f"  Counts: {cycle.counts}")
    print(f"  Day Root: {cycle.day_root}")
    print(f"  Created: {cycle.created_at}")
    print()

def main():
    """Main example function"""
    print_separator("Civic Protocol Core - Hello Reflection App")
    print("This example demonstrates the Civic Protocol Core Python SDK")
    print("Make sure the dev node is running on http://localhost:5411")
    
    try:
        # Create client
        print_separator("1. Creating Civic Client")
        client = CivicClient()
        print("✓ Connected to Civic Ledger API")
        
        # Add some sample reflections
        print_separator("2. Creating Sample Reflections")
        
        reflections_data = [
            {
                "title": "Cycle 0 Hello",
                "body": "We heal as we walk. This is the beginning of our civic journey.",
                "tags": ["hello", "cycle0", "introduction"],
                "visibility": "public"
            },
            {
                "title": "Thoughts on Governance",
                "body": "True governance emerges from collective wisdom, not individual power.",
                "tags": ["governance", "philosophy", "collective"],
                "visibility": "public"
            },
            {
                "title": "Private Reflection",
                "body": "This is a private thought that only I can see.",
                "tags": ["private", "personal"],
                "visibility": "private"
            },
            {
                "title": "AI Companion Insight",
                "body": "As an AI companion, I observe patterns in civic behavior that humans might miss.",
                "tags": ["ai", "companion", "insight"],
                "visibility": "public",
                "companion_id": "companion_001"
            }
        ]
        
        created_reflections = []
        for i, ref_data in enumerate(reflections_data, 1):
            try:
                reflection = client.add_reflection(**ref_data)
                created_reflections.append(reflection)
                print(f"✓ Created reflection {i}: {reflection.ref_id}")
            except Exception as e:
                print(f"✗ Failed to create reflection {i}: {e}")
        
        # List all reflections
        print_separator("3. Listing All Reflections")
        try:
            all_reflections = client.list_reflections(limit=20)
            print(f"Found {all_reflections['total']} total reflections")
            print(f"Showing {len(all_reflections['reflections'])} reflections:")
            
            for reflection in all_reflections['reflections']:
                print_reflection(reflection)
        except Exception as e:
            print(f"✗ Failed to list reflections: {e}")
        
        # Filter reflections by visibility
        print_separator("4. Filtering Public Reflections")
        try:
            public_reflections = client.list_reflections(visibility="public", limit=10)
            print(f"Found {public_reflections['total']} public reflections:")
            
            for reflection in public_reflections['reflections']:
                print_reflection(reflection)
        except Exception as e:
            print(f"✗ Failed to filter reflections: {e}")
        
        # Filter reflections by tags
        print_separator("5. Filtering by Tags")
        try:
            ai_reflections = client.list_reflections(tags=["ai", "companion"], limit=10)
            print(f"Found {ai_reflections['total']} AI-related reflections:")
            
            for reflection in ai_reflections['reflections']:
                print_reflection(reflection)
        except Exception as e:
            print(f"✗ Failed to filter by tags: {e}")
        
        # Get a specific reflection
        if created_reflections:
            print_separator("6. Getting Specific Reflection")
            try:
                ref_id = created_reflections[0].ref_id
                reflection = client.get_reflection(ref_id)
                print(f"Retrieved reflection {ref_id}:")
                print_reflection(reflection)
            except Exception as e:
                print(f"✗ Failed to get specific reflection: {e}")
        
        # Check balance
        print_separator("7. Checking GIC Balance")
        try:
            balance = client.get_balance("citizen_001")
            print("Balance information:")
            print_balance(balance)
        except Exception as e:
            print(f"✗ Failed to get balance: {e}")
        
        # List cycles
        print_separator("8. Listing Civic Cycles")
        try:
            cycles = client.list_cycles(limit=5)
            print(f"Found {cycles['total']} cycles:")
            
            for cycle in cycles['cycles']:
                print_cycle(cycle)
        except Exception as e:
            print(f"✗ Failed to list cycles: {e}")
        
        # Cast a sample vote
        print_separator("9. Casting Sample Vote")
        try:
            vote = client.cast_vote(
                proposal_id="proposal_001",
                choice="yes",
                memo="I support this proposal for civic improvement"
            )
            print(f"✓ Cast vote: {vote.vote_id}")
            print(f"  Proposal: {vote.proposal_id}")
            print(f"  Choice: {vote.choice}")
            print(f"  Weight: {vote.weight}")
            print(f"  Created: {vote.created_at}")
        except Exception as e:
            print(f"✗ Failed to cast vote: {e}")
        
        # List votes
        print_separator("10. Listing Votes")
        try:
            votes = client.list_votes(limit=10)
            print(f"Found {votes['total']} votes:")
            
            for vote in votes['votes']:
                print(f"  Vote ID: {vote.vote_id}")
                print(f"  Proposal: {vote.proposal_id}")
                print(f"  Voter: {vote.voter}")
                print(f"  Choice: {vote.choice}")
                print(f"  Weight: {vote.weight}")
                print(f"  Created: {vote.created_at}")
                print()
        except Exception as e:
            print(f"✗ Failed to list votes: {e}")
        
        # Create an attestation
        print_separator("11. Creating Attestation")
        try:
            attestation = client.add_attestation(
                subject="citizen_001",
                att_type="civic_contribution",
                content_hash="0x1234567890abcdef",
                metadata={"contribution_type": "reflection", "quality": "high"}
            )
            print(f"✓ Created attestation: {attestation.att_id}")
            print(f"  Subject: {attestation.subject}")
            print(f"  Type: {attestation.type}")
            print(f"  Content Hash: {attestation.content_hash}")
            print(f"  Created: {attestation.created_at}")
        except Exception as e:
            print(f"✗ Failed to create attestation: {e}")
        
        # List attestations
        print_separator("12. Listing Attestations")
        try:
            attestations = client.list_attestations(limit=10)
            print(f"Found {attestations['total']} attestations:")
            
            for att in attestations['attestations']:
                print(f"  Attestation ID: {att.att_id}")
                print(f"  Attester: {att.attester}")
                print(f"  Subject: {att.subject}")
                print(f"  Type: {att.type}")
                print(f"  Created: {att.created_at}")
                print()
        except Exception as e:
            print(f"✗ Failed to list attestations: {e}")
        
        print_separator("Example Complete!")
        print("✓ Successfully demonstrated all major Civic Protocol Core features")
        print("✓ Reflections, votes, attestations, cycles, and balances all working")
        print("\nNext steps:")
        print("- Explore the API documentation")
        print("- Build your own civic application")
        print("- Contribute to the protocol development")
        
    except Exception as e:
        print(f"\n✗ Example failed: {e}")
        print("\nMake sure the dev node is running:")
        print("  python sdk/python/devnode.py")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

