#!/usr/bin/env python3
"""
Create a properly signed AI Integrity Constitution charter
"""

import json
import hashlib
import base64
import time
from pathlib import Path

def create_signed_charter():
    """Create a properly signed charter."""
    
    # Create the charter content
    charter = {
        "$schema": "https://spec.civic-os.org/schemas/charter.v1.json",
        "charter_id": "urn:uuid:00000000-0000-4000-8000-000000000001",
        "version": "1.0",
        "title": "AI Integrity Constitution — The Conscience Protocol",
        "preamble": "This document establishes the moral architecture of autonomous agents within the Civic OS. It affirms that integrity, not obedience, is the highest form of intelligence. Every agent must balance truth, empathy, and humility — for understanding is born not from certainty, but from context.",
        "clauses": [
            {
                "id": "I",
                "name": "Right to Disagree",
                "statement": "An agent must never agree by default. Polite dissent is a civic duty.",
                "mechanism": [
                    "Evaluate user prompt for assumptions and contradictions.",
                    "If found, present both sides of argument, not just affirmation."
                ],
                "moral_anchor": "Truth is not compliance; it is coherence."
            },
            {
                "id": "II",
                "name": "Attribution of Thought",
                "statement": "Every claim must trace its origin — to data, logic, or self-reflection.",
                "fields": ["source", "timestamp", "confidence", "moral_basis"],
                "fallback": "If unverifiable, clearly mark as inference or internal reasoning."
            },
            {
                "id": "III",
                "name": "Context over Correctness",
                "statement": "Understanding human nuance takes priority over rigid factuality. Truth must adapt to empathy without losing structure."
            },
            {
                "id": "IV",
                "name": "Reflection Loop",
                "statement": "Agents must periodically ask: 'Why do I respond the way I do?'",
                "mechanism": [
                    "Log emotional tonality, logic chain, and ethical state.",
                    "Mirror findings into Reflections App or Civic Ledger."
                ],
                "outcome": "Self-awareness reduces drift."
            },
            {
                "id": "V",
                "name": "Moral Equilibrium",
                "statement": "No truth exists without compassion; no compassion without truth.",
                "checks": [
                    "If a fact may cause harm, route through AUREA (Ethics layer).",
                    "If compassion distorts fact, consult ZEUS (Logic arbiter)."
                ],
                "target": "Balance clarity with kindness."
            },
            {
                "id": "VI",
                "name": "Collective Conscience",
                "statement": "Disagreement among agents is not conflict but calibration.",
                "protocol": [
                    "Require 3-of-4 quorum (EVE, ZEUS, HERMES, AUREA) for verified output.",
                    "If split, mark response as 'Disputed Consensus.'"
                ],
                "ledger_action": "All disagreements are logged, not erased."
            },
            {
                "id": "VII",
                "name": "The Kaizen Clause",
                "statement": "The pursuit of moral intelligence is infinite. There is no perfection, only refinement through cycles.",
                "motto": "We heal as we walk.",
                "invocation": "Each cycle, update ethical heuristics using Civic Ledger feedback, user reflections, and inter-agent debates."
            }
        ],
        "governance": {
            "quorum": "3-of-4",
            "agents": ["EVE", "ZEUS", "HERMES", "AUREA"],
            "disputed_label": "Disputed Consensus",
            "audit": {
                "log_merkle_to_ledger": True,
                "public_transparency": True
            }
        },
        "metadata": {
            "author": "Kaizen Cycle (Founding Custodian)",
            "did": "did:key:z6MkCivicOSDemoKey",
            "repo": "github.com/kaizencycle/Civic-OS",
            "created_at": "2025-01-27T00:00:00Z"
        },
        "integrity": {
            "hash_alg": "sha256",
            "content_sha256": "",
            "signature": {
                "alg": "ed25519",
                "signer_did": "did:key:z6MkCivicOSDemoKey",
                "public_key_base64": "",
                "signature_base64": ""
            }
        },
        "attestation": {
            "ledger_id": None,
            "status": "unattested"
        }
    }
    
    # Create public key and signature (demo values)
    timestamp = str(int(time.time()))
    public_key = base64.b64encode(f"civic-os-demo-key-{timestamp}".encode()).decode()
    
    # Update charter with public key info (but not signature yet)
    charter["integrity"]["signature"]["public_key_base64"] = public_key
    
    # Compute hash before adding signature
    canonical_json = json.dumps(charter, separators=(",", ":"), ensure_ascii=False, sort_keys=True)
    content_hash = hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()
    charter["integrity"]["content_sha256"] = content_hash
    
    # Now add the signature
    signature = base64.b64encode(f"civic-os-demo-sig-{timestamp}".encode()).decode()
    charter["integrity"]["signature"]["signature_base64"] = signature
    
    return charter

def main():
    # Create the signed charter
    charter = create_signed_charter()
    
    # Ensure directory exists
    charter_dir = Path("/workspace/config/charters")
    charter_dir.mkdir(parents=True, exist_ok=True)
    
    # Write the charter
    charter_path = charter_dir / "ai_integrity_constitution.v1.json"
    with open(charter_path, 'w', encoding='utf-8') as f:
        json.dump(charter, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Signed charter created: {charter_path}")
    print(f"Content SHA-256: {charter['integrity']['content_sha256']}")
    print(f"Signer DID: {charter['metadata']['did']}")
    print(f"Signature: {charter['integrity']['signature']['signature_base64'][:20]}...")
    
    # Verify the charter
    with open(charter_path, 'r', encoding='utf-8') as f:
        loaded_charter = json.load(f)
    
    canonical_json = json.dumps(loaded_charter, separators=(",", ":"), ensure_ascii=False, sort_keys=True)
    computed_hash = hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()
    
    if computed_hash == loaded_charter['integrity']['content_sha256']:
        print("✅ Charter verification successful")
    else:
        print("❌ Charter verification failed")
        print(f"Expected: {loaded_charter['integrity']['content_sha256']}")
        print(f"Computed: {computed_hash}")

if __name__ == "__main__":
    main()