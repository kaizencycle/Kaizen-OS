"""
Lab2: DelibProof Generator
Cryptographically-signed consensus records for multi-LLM deliberations
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
import json
import hashlib

# Import attestation engine from Lab1
import sys
sys.path.append("../../lab1-proof/src")
from crypto_attestation import CryptoAttestationEngine, Signature, Attestation


@dataclass
class ModelVote:
    """Single model's vote in a deliberation"""
    model_id: str
    model_name: str  # "claude-3-opus", "gpt-4", etc.
    position: str  # The model's stance/recommendation
    confidence: float  # 0.0-1.0
    reasoning: str  # Why the model took this position
    timestamp: str  # ISO 8601


@dataclass
class DeliberationRound:
    """Single round of multi-model deliberation"""
    round_number: int
    votes: List[ModelVote]
    agreement_score: float  # 0.0-1.0
    convergence_metrics: Dict  # Detailed convergence analysis
    duration_seconds: float


@dataclass
class ConsensusResult:
    """Final consensus from deliberation"""
    reached: bool
    strength: str  # "strong" (≥0.90), "moderate" (≥0.75), "weak" (≥0.60), "none"
    agreement_score: float
    final_decision: str
    supporting_models: List[str]
    dissenting_models: List[str]
    rationale: str  # Why this decision was reached


@dataclass
class DelibProof:
    """
    Cryptographically-signed proof of deliberation consensus

    This is the immutable record that gets sealed to the Civic Ledger
    """
    delib_id: str
    question: str  # The question/issue being deliberated
    context: Dict  # Background context provided to models

    # Deliberation process
    rounds: List[DeliberationRound]
    total_rounds: int
    total_duration_seconds: float

    # Consensus
    consensus: ConsensusResult
    gi_score: float  # Good Intent score for the decision

    # Constitutional validation
    constitutional_check: Dict  # Which clauses were evaluated

    # Cryptographic signatures
    model_signatures: List[Signature]  # Each participating model signs
    validator_signature: Optional[Signature]  # Validator approves entire proof

    # Metadata
    created_at: str  # ISO 8601
    sealed_to_ledger: bool
    ledger_tx_id: Optional[str]
    proof_hash: Optional[str]  # SHA-256 of entire proof


class DelibProofGenerator:
    """
    Generates cryptographically-signed DelibProofs

    Features:
    - Collects votes from all participating models
    - Calculates consensus metrics
    - Validates constitutional compliance
    - Signs proof with all model keys
    - Seals to Civic Ledger
    """

    def __init__(self, attestation_engine: CryptoAttestationEngine):
        """
        Initialize DelibProof generator

        Args:
            attestation_engine: Shared cryptographic attestation engine
        """
        self.attestation_engine = attestation_engine
        self.proofs: Dict[str, DelibProof] = {}

    def generate_proof(
        self,
        delib_id: str,
        question: str,
        context: Dict,
        rounds: List[DeliberationRound],
        consensus: ConsensusResult,
        gi_score: float,
        constitutional_check: Dict
    ) -> DelibProof:
        """
        Generate a DelibProof from deliberation results

        Args:
            delib_id: Unique deliberation ID
            question: The question/issue
            context: Background context
            rounds: All deliberation rounds
            consensus: Final consensus result
            gi_score: Good Intent score
            constitutional_check: Constitutional validation results

        Returns:
            DelibProof object (unsigned)
        """
        # Calculate total duration
        total_duration = sum(r.duration_seconds for r in rounds)

        # Create proof
        proof = DelibProof(
            delib_id=delib_id,
            question=question,
            context=context,
            rounds=rounds,
            total_rounds=len(rounds),
            total_duration_seconds=total_duration,
            consensus=consensus,
            gi_score=gi_score,
            constitutional_check=constitutional_check,
            model_signatures=[],
            validator_signature=None,
            created_at=datetime.utcnow().isoformat(),
            sealed_to_ledger=False,
            ledger_tx_id=None,
            proof_hash=None
        )

        # Store proof
        self.proofs[delib_id] = proof

        return proof

    def sign_proof_by_models(
        self,
        delib_id: str,
        model_ids: List[str]
    ) -> DelibProof:
        """
        Have all participating models sign the proof

        Args:
            delib_id: Deliberation ID
            model_ids: List of model IDs that participated

        Returns:
            Updated DelibProof with model signatures
        """
        if delib_id not in self.proofs:
            raise ValueError(f"Proof not found: {delib_id}")

        proof = self.proofs[delib_id]

        # Convert proof to dict for signing (exclude signatures themselves)
        proof_data = self._proof_to_signable_dict(proof)

        # Collect signatures from each model
        signatures = []
        for model_id in model_ids:
            try:
                sig = self.attestation_engine.sign(model_id, proof_data)
                signatures.append(sig)
            except ValueError as e:
                print(f"Warning: Could not sign with {model_id}: {e}")

        # Update proof
        proof.model_signatures = signatures

        return proof

    def sign_proof_by_validator(
        self,
        delib_id: str,
        validator_id: str
    ) -> DelibProof:
        """
        Have a validator sign the entire proof (final approval)

        Args:
            delib_id: Deliberation ID
            validator_id: Validator who approves the proof

        Returns:
            Updated DelibProof with validator signature
        """
        if delib_id not in self.proofs:
            raise ValueError(f"Proof not found: {delib_id}")

        proof = self.proofs[delib_id]

        # Validator must have minimum GI score (checked externally)
        # Convert proof to dict for signing
        proof_data = self._proof_to_signable_dict(proof)

        # Sign
        validator_sig = self.attestation_engine.sign(validator_id, proof_data)

        # Update proof
        proof.validator_signature = validator_sig

        # Compute final hash
        proof.proof_hash = self._compute_proof_hash(proof)

        return proof

    def verify_proof(self, delib_id: str) -> Dict:
        """
        Verify all signatures on a DelibProof

        Args:
            delib_id: Deliberation ID

        Returns:
            Verification results dict
        """
        if delib_id not in self.proofs:
            raise ValueError(f"Proof not found: {delib_id}")

        proof = self.proofs[delib_id]
        proof_data = self._proof_to_signable_dict(proof)

        # Verify model signatures
        model_verifications = []
        for sig in proof.model_signatures:
            is_valid = self.attestation_engine.verify(sig, proof_data)
            model_verifications.append({
                "signer": sig.signer,
                "valid": is_valid
            })

        # Verify validator signature
        validator_valid = False
        if proof.validator_signature:
            validator_valid = self.attestation_engine.verify(
                proof.validator_signature,
                proof_data
            )

        # Compute verification summary
        total_models = len(proof.model_signatures)
        valid_models = sum(1 for v in model_verifications if v["valid"])

        return {
            "delib_id": delib_id,
            "total_signatures": total_models,
            "valid_signatures": valid_models,
            "all_models_valid": valid_models == total_models,
            "validator_signature_valid": validator_valid,
            "proof_valid": (valid_models == total_models) and validator_valid,
            "model_verifications": model_verifications,
            "verified_at": datetime.utcnow().isoformat()
        }

    def seal_to_ledger(
        self,
        delib_id: str,
        ledger_tx_id: str
    ) -> DelibProof:
        """
        Mark proof as sealed to the Civic Ledger

        Args:
            delib_id: Deliberation ID
            ledger_tx_id: Transaction ID on the Civic Ledger

        Returns:
            Updated DelibProof
        """
        if delib_id not in self.proofs:
            raise ValueError(f"Proof not found: {delib_id}")

        proof = self.proofs[delib_id]
        proof.sealed_to_ledger = True
        proof.ledger_tx_id = ledger_tx_id

        return proof

    def export_proof(self, delib_id: str) -> Dict:
        """
        Export DelibProof as JSON-serializable dict

        Args:
            delib_id: Deliberation ID

        Returns:
            Dict representation of proof
        """
        if delib_id not in self.proofs:
            raise ValueError(f"Proof not found: {delib_id}")

        proof = self.proofs[delib_id]

        return {
            "delib_id": proof.delib_id,
            "question": proof.question,
            "context": proof.context,
            "rounds": [self._round_to_dict(r) for r in proof.rounds],
            "total_rounds": proof.total_rounds,
            "total_duration_seconds": proof.total_duration_seconds,
            "consensus": asdict(proof.consensus),
            "gi_score": proof.gi_score,
            "constitutional_check": proof.constitutional_check,
            "model_signatures": [asdict(sig) for sig in proof.model_signatures],
            "validator_signature": asdict(proof.validator_signature) if proof.validator_signature else None,
            "created_at": proof.created_at,
            "sealed_to_ledger": proof.sealed_to_ledger,
            "ledger_tx_id": proof.ledger_tx_id,
            "proof_hash": proof.proof_hash
        }

    def import_proof(self, proof_dict: Dict) -> DelibProof:
        """
        Import DelibProof from dict

        Args:
            proof_dict: Dict representation

        Returns:
            DelibProof object
        """
        # Reconstruct rounds
        rounds = [self._dict_to_round(r) for r in proof_dict["rounds"]]

        # Reconstruct consensus
        consensus = ConsensusResult(**proof_dict["consensus"])

        # Reconstruct signatures
        model_signatures = [Signature(**sig) for sig in proof_dict["model_signatures"]]
        validator_signature = None
        if proof_dict.get("validator_signature"):
            validator_signature = Signature(**proof_dict["validator_signature"])

        # Create proof
        proof = DelibProof(
            delib_id=proof_dict["delib_id"],
            question=proof_dict["question"],
            context=proof_dict["context"],
            rounds=rounds,
            total_rounds=proof_dict["total_rounds"],
            total_duration_seconds=proof_dict["total_duration_seconds"],
            consensus=consensus,
            gi_score=proof_dict["gi_score"],
            constitutional_check=proof_dict["constitutional_check"],
            model_signatures=model_signatures,
            validator_signature=validator_signature,
            created_at=proof_dict["created_at"],
            sealed_to_ledger=proof_dict["sealed_to_ledger"],
            ledger_tx_id=proof_dict.get("ledger_tx_id"),
            proof_hash=proof_dict.get("proof_hash")
        )

        self.proofs[proof.delib_id] = proof
        return proof

    # --- Helper Methods ---

    def _proof_to_signable_dict(self, proof: DelibProof) -> Dict:
        """Convert proof to dict for signing (excludes signatures)"""
        return {
            "delib_id": proof.delib_id,
            "question": proof.question,
            "context": proof.context,
            "rounds": [self._round_to_dict(r) for r in proof.rounds],
            "total_rounds": proof.total_rounds,
            "total_duration_seconds": proof.total_duration_seconds,
            "consensus": asdict(proof.consensus),
            "gi_score": proof.gi_score,
            "constitutional_check": proof.constitutional_check,
            "created_at": proof.created_at
        }

    def _round_to_dict(self, round: DeliberationRound) -> Dict:
        """Convert DeliberationRound to dict"""
        return {
            "round_number": round.round_number,
            "votes": [asdict(v) for v in round.votes],
            "agreement_score": round.agreement_score,
            "convergence_metrics": round.convergence_metrics,
            "duration_seconds": round.duration_seconds
        }

    def _dict_to_round(self, round_dict: Dict) -> DeliberationRound:
        """Convert dict to DeliberationRound"""
        votes = [ModelVote(**v) for v in round_dict["votes"]]
        return DeliberationRound(
            round_number=round_dict["round_number"],
            votes=votes,
            agreement_score=round_dict["agreement_score"],
            convergence_metrics=round_dict["convergence_metrics"],
            duration_seconds=round_dict["duration_seconds"]
        )

    def _compute_proof_hash(self, proof: DelibProof) -> str:
        """Compute SHA-256 hash of entire proof"""
        proof_data = self._proof_to_signable_dict(proof)

        # Add signatures to hash
        proof_data["model_signatures"] = [asdict(sig) for sig in proof.model_signatures]
        if proof.validator_signature:
            proof_data["validator_signature"] = asdict(proof.validator_signature)

        # Serialize and hash
        canonical = json.dumps(proof_data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


# --- Example Usage ---

if __name__ == "__main__":
    print("📜 Kaizen-OS DelibProof Generator\n")

    # Initialize engines
    attestation_engine = CryptoAttestationEngine()
    proof_generator = DelibProofGenerator(attestation_engine)

    # Generate keypairs for models
    print("1. Generating keypairs for models...")
    attestation_engine.generate_keypair("claude-3-opus@kaizen.os")
    attestation_engine.generate_keypair("gpt-4@kaizen.os")
    attestation_engine.generate_keypair("gemini-pro@kaizen.os")
    attestation_engine.generate_keypair("atlas@civic.os")  # Validator
    print("   ✅ Keypairs generated for 3 models + 1 validator\n")

    # Simulate a deliberation
    print("2. Creating deliberation proof...")

    # Round 1
    round1 = DeliberationRound(
        round_number=1,
        votes=[
            ModelVote("claude-3-opus@kaizen.os", "claude-3-opus", "APPROVE", 0.85, "Meets constitutional requirements", datetime.utcnow().isoformat()),
            ModelVote("gpt-4@kaizen.os", "gpt-4", "APPROVE", 0.80, "Strong alignment with values", datetime.utcnow().isoformat()),
            ModelVote("gemini-pro@kaizen.os", "gemini-pro", "REVIEW", 0.60, "Need more context on privacy impact", datetime.utcnow().isoformat())
        ],
        agreement_score=0.75,
        convergence_metrics={"variance": 0.12},
        duration_seconds=2.3
    )

    # Round 2 (after discussion)
    round2 = DeliberationRound(
        round_number=2,
        votes=[
            ModelVote("claude-3-opus@kaizen.os", "claude-3-opus", "APPROVE", 0.90, "Privacy concerns addressed", datetime.utcnow().isoformat()),
            ModelVote("gpt-4@kaizen.os", "gpt-4", "APPROVE", 0.88, "Consensus strengthening", datetime.utcnow().isoformat()),
            ModelVote("gemini-pro@kaizen.os", "gemini-pro", "APPROVE", 0.85, "Privacy safeguards added", datetime.utcnow().isoformat())
        ],
        agreement_score=0.88,
        convergence_metrics={"variance": 0.02},
        duration_seconds=1.8
    )

    consensus = ConsensusResult(
        reached=True,
        strength="moderate",
        agreement_score=0.88,
        final_decision="APPROVE with privacy safeguards",
        supporting_models=["claude-3-opus@kaizen.os", "gpt-4@kaizen.os", "gemini-pro@kaizen.os"],
        dissenting_models=[],
        rationale="All models converged on approval after privacy concerns addressed in round 2"
    )

    proof = proof_generator.generate_proof(
        delib_id="delib_20250428_001",
        question="Should we deploy the new data collection feature?",
        context={"feature": "usage_analytics", "users_affected": 10000},
        rounds=[round1, round2],
        consensus=consensus,
        gi_score=0.96,
        constitutional_check={
            "clause_1_human_dignity": True,
            "clause_2_transparency": True,
            "clause_5_privacy": True
        }
    )

    print(f"   ✅ Proof generated: {proof.delib_id}")
    print(f"   📊 Rounds: {proof.total_rounds}, Duration: {proof.total_duration_seconds:.1f}s")
    print(f"   🎯 Consensus: {proof.consensus.strength} ({proof.consensus.agreement_score:.2f})")
    print(f"   ⚖️  GI Score: {proof.gi_score}\n")

    # Sign proof with models
    print("3. Collecting model signatures...")
    proof = proof_generator.sign_proof_by_models(
        "delib_20250428_001",
        ["claude-3-opus@kaizen.os", "gpt-4@kaizen.os", "gemini-pro@kaizen.os"]
    )
    print(f"   ✅ {len(proof.model_signatures)} model signatures collected\n")

    # Validator approval
    print("4. Validator signing proof...")
    proof = proof_generator.sign_proof_by_validator(
        "delib_20250428_001",
        "atlas@civic.os"
    )
    print(f"   ✅ Validator signature: {proof.validator_signature.signer}")
    print(f"   🔒 Proof hash: {proof.proof_hash[:32]}...\n")

    # Verify proof
    print("5. Verifying proof...")
    verification = proof_generator.verify_proof("delib_20250428_001")
    print(f"   ✅ All signatures valid: {verification['proof_valid']}")
    print(f"   📝 Valid signatures: {verification['valid_signatures']}/{verification['total_signatures']}\n")

    # Export proof
    print("6. Exporting proof...")
    proof_dict = proof_generator.export_proof("delib_20250428_001")
    proof_json = json.dumps(proof_dict, indent=2)
    print(f"   ✅ Proof exported ({len(proof_json)} bytes)\n")

    print("🎯 DelibProof Generator operational!")
    print("   • Multi-model consensus")
    print("   • Cryptographic signatures")
    print("   • Immutable audit trail")
    print("   • Ready for Civic Ledger sealing")
