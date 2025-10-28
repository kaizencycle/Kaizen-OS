"""
Lab1: Cryptographic Attestation Module
ED25519-based signing and verification for Kaizen-OS Civic Ledger
"""

from typing import Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib
import json
import base64

try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives import serialization
    from cryptography.exceptions import InvalidSignature
except ImportError:
    print("Warning: cryptography library not installed. Install with: pip install cryptography")
    ed25519 = None


@dataclass
class Signature:
    """Digital signature for attestation"""
    signature: str  # Base64-encoded
    public_key: str  # Base64-encoded
    algorithm: str  # "ED25519"
    timestamp: str  # ISO 8601
    signer: str  # Entity that signed (agent_id or validator_id)


@dataclass
class Attestation:
    """Cryptographic attestation for data integrity"""
    data_hash: str  # SHA-256 hash of data
    signature: Signature
    data_type: str  # "transaction", "block", "gi_score", "delib_proof"
    metadata: Dict


class CryptoAttestationEngine:
    """
    Cryptographic attestation using ED25519

    Features:
    - Generate ED25519 keypairs
    - Sign arbitrary data (transactions, blocks, GI scores)
    - Verify signatures
    - Create attestation records
    """

    ALGORITHM = "ED25519"
    HASH_ALGORITHM = "SHA-256"

    def __init__(self):
        """Initialize the attestation engine"""
        if ed25519 is None:
            raise ImportError("cryptography library required. Install with: pip install cryptography")

        # In-memory key storage (in production, use HSM or encrypted storage)
        self.keypairs: Dict[str, Tuple[ed25519.Ed25519PrivateKey, ed25519.Ed25519PublicKey]] = {}

    def generate_keypair(self, entity_id: str) -> Dict[str, str]:
        """
        Generate ED25519 keypair for an entity

        Args:
            entity_id: Identifier for the entity (agent_id, validator_id, etc.)

        Returns:
            Dict with public_key and private_key (both base64-encoded)
        """
        # Generate keypair
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        # Store in memory
        self.keypairs[entity_id] = (private_key, public_key)

        # Serialize keys
        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )

        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        return {
            "entity_id": entity_id,
            "public_key": base64.b64encode(public_bytes).decode('utf-8'),
            "private_key": base64.b64encode(private_bytes).decode('utf-8'),  # Keep secure!
            "algorithm": self.ALGORITHM,
            "created_at": datetime.utcnow().isoformat()
        }

    def import_keypair(self, entity_id: str, private_key_b64: str) -> Dict[str, str]:
        """
        Import existing ED25519 keypair

        Args:
            entity_id: Identifier for the entity
            private_key_b64: Base64-encoded private key

        Returns:
            Dict with entity_id and public_key
        """
        # Decode private key
        private_bytes = base64.b64decode(private_key_b64)

        # Reconstruct keypair
        private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_bytes)
        public_key = private_key.public_key()

        # Store in memory
        self.keypairs[entity_id] = (private_key, public_key)

        # Serialize public key
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        return {
            "entity_id": entity_id,
            "public_key": base64.b64encode(public_bytes).decode('utf-8'),
            "algorithm": self.ALGORITHM
        }

    def hash_data(self, data: Dict) -> str:
        """
        Create SHA-256 hash of data

        Args:
            data: Dictionary to hash

        Returns:
            Hex-encoded SHA-256 hash
        """
        # Serialize data deterministically
        canonical = json.dumps(data, sort_keys=True, separators=(',', ':'))

        # Hash
        hash_obj = hashlib.sha256(canonical.encode('utf-8'))

        return hash_obj.hexdigest()

    def sign(self, entity_id: str, data: Dict) -> Signature:
        """
        Sign data with entity's private key

        Args:
            entity_id: Signer identifier
            data: Data to sign

        Returns:
            Signature object
        """
        if entity_id not in self.keypairs:
            raise ValueError(f"No keypair found for entity: {entity_id}")

        private_key, public_key = self.keypairs[entity_id]

        # Hash the data
        data_hash = self.hash_data(data)
        message = data_hash.encode('utf-8')

        # Sign
        signature_bytes = private_key.sign(message)

        # Serialize public key
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        return Signature(
            signature=base64.b64encode(signature_bytes).decode('utf-8'),
            public_key=base64.b64encode(public_bytes).decode('utf-8'),
            algorithm=self.ALGORITHM,
            timestamp=datetime.utcnow().isoformat(),
            signer=entity_id
        )

    def verify(self, signature: Signature, data: Dict) -> bool:
        """
        Verify signature against data

        Args:
            signature: Signature to verify
            data: Original data that was signed

        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Decode signature and public key
            signature_bytes = base64.b64decode(signature.signature)
            public_bytes = base64.b64decode(signature.public_key)

            # Reconstruct public key
            public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_bytes)

            # Hash the data
            data_hash = self.hash_data(data)
            message = data_hash.encode('utf-8')

            # Verify
            public_key.verify(signature_bytes, message)

            return True

        except InvalidSignature:
            return False
        except Exception as e:
            print(f"Verification error: {e}")
            return False

    def create_attestation(
        self,
        entity_id: str,
        data: Dict,
        data_type: str,
        metadata: Optional[Dict] = None
    ) -> Attestation:
        """
        Create cryptographic attestation for data

        Args:
            entity_id: Signer identifier
            data: Data to attest
            data_type: Type of data ("transaction", "block", "gi_score", etc.)
            metadata: Optional additional metadata

        Returns:
            Attestation object
        """
        # Hash the data
        data_hash = self.hash_data(data)

        # Sign the data
        signature = self.sign(entity_id, data)

        # Create attestation
        return Attestation(
            data_hash=data_hash,
            signature=signature,
            data_type=data_type,
            metadata=metadata or {}
        )

    def verify_attestation(self, attestation: Attestation, original_data: Dict) -> bool:
        """
        Verify attestation against original data

        Args:
            attestation: Attestation to verify
            original_data: Original data that was attested

        Returns:
            True if attestation is valid, False otherwise
        """
        # Verify data hash matches
        expected_hash = self.hash_data(original_data)
        if attestation.data_hash != expected_hash:
            return False

        # Verify signature
        return self.verify(attestation.signature, original_data)

    def create_multisig_attestation(
        self,
        entity_ids: list[str],
        data: Dict,
        data_type: str,
        threshold: int,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create multi-signature attestation (e.g., for consensus)

        Args:
            entity_ids: List of signer identifiers
            data: Data to attest
            data_type: Type of data
            threshold: Minimum signatures required (e.g., 2 out of 3)
            metadata: Optional metadata

        Returns:
            Multi-signature attestation dict
        """
        # Hash the data
        data_hash = self.hash_data(data)

        # Collect signatures
        signatures = []
        for entity_id in entity_ids:
            if entity_id in self.keypairs:
                sig = self.sign(entity_id, data)
                signatures.append(asdict(sig))

        return {
            "data_hash": data_hash,
            "data_type": data_type,
            "threshold": threshold,
            "total_signers": len(entity_ids),
            "signatures": signatures,
            "valid": len(signatures) >= threshold,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }

    def verify_multisig_attestation(
        self,
        multisig: Dict,
        original_data: Dict,
        min_threshold: Optional[int] = None
    ) -> bool:
        """
        Verify multi-signature attestation

        Args:
            multisig: Multi-signature attestation dict
            original_data: Original data
            min_threshold: Optional override for minimum signatures required

        Returns:
            True if attestation is valid, False otherwise
        """
        # Verify data hash
        expected_hash = self.hash_data(original_data)
        if multisig["data_hash"] != expected_hash:
            return False

        # Count valid signatures
        threshold = min_threshold or multisig["threshold"]
        valid_signatures = 0

        for sig_dict in multisig["signatures"]:
            sig = Signature(**sig_dict)
            if self.verify(sig, original_data):
                valid_signatures += 1

        return valid_signatures >= threshold


# --- Convenience Functions ---

def sign_transaction(engine: CryptoAttestationEngine, validator_id: str, transaction: Dict) -> Attestation:
    """Sign a transaction"""
    return engine.create_attestation(
        entity_id=validator_id,
        data=transaction,
        data_type="transaction",
        metadata={
            "tx_id": transaction.get("tx_id"),
            "tx_type": transaction.get("tx_type")
        }
    )


def sign_block(engine: CryptoAttestationEngine, validator_id: str, block: Dict) -> Attestation:
    """Sign a block"""
    return engine.create_attestation(
        entity_id=validator_id,
        data=block,
        data_type="block",
        metadata={
            "block_number": block.get("block_number"),
            "validator": block.get("validator")
        }
    )


def sign_gi_score(engine: CryptoAttestationEngine, scorer_id: str, gi_score: Dict) -> Attestation:
    """Sign a GI score calculation"""
    return engine.create_attestation(
        entity_id=scorer_id,
        data=gi_score,
        data_type="gi_score",
        metadata={
            "agent_id": gi_score.get("agent_id"),
            "score": gi_score.get("score")
        }
    )


def sign_delib_proof(engine: CryptoAttestationEngine, model_id: str, delib_proof: Dict) -> Attestation:
    """Sign a deliberation proof"""
    return engine.create_attestation(
        entity_id=model_id,
        data=delib_proof,
        data_type="delib_proof",
        metadata={
            "delib_id": delib_proof.get("delib_id"),
            "consensus_reached": delib_proof.get("consensus", {}).get("reached")
        }
    )


# --- Example Usage ---

if __name__ == "__main__":
    print("🔐 Kaizen-OS Cryptographic Attestation Engine\n")

    # Initialize engine
    engine = CryptoAttestationEngine()

    # Generate keypairs for validators
    print("1. Generating keypairs for validators...")
    atlas_keys = engine.generate_keypair("atlas@civic.os")
    aurea_keys = engine.generate_keypair("aurea@civic.os")
    zenith_keys = engine.generate_keypair("zenith@civic.os")

    print(f"   ✅ ATLAS public key: {atlas_keys['public_key'][:32]}...")
    print(f"   ✅ AUREA public key: {aurea_keys['public_key'][:32]}...")
    print(f"   ✅ ZENITH public key: {zenith_keys['public_key'][:32]}...\n")

    # Sign a transaction
    print("2. Signing a transaction...")
    transaction = {
        "tx_id": "tx_001",
        "tx_type": "transfer",
        "from": "alice@civic.os",
        "to": "bob@civic.os",
        "amount": 100,
        "timestamp": datetime.utcnow().isoformat()
    }

    tx_attestation = sign_transaction(engine, "atlas@civic.os", transaction)
    print(f"   ✅ Transaction signed by ATLAS")
    print(f"   📝 Data hash: {tx_attestation.data_hash[:32]}...")
    print(f"   ✍️  Signature: {tx_attestation.signature.signature[:32]}...\n")

    # Verify the attestation
    print("3. Verifying attestation...")
    is_valid = engine.verify_attestation(tx_attestation, transaction)
    print(f"   {'✅' if is_valid else '❌'} Attestation valid: {is_valid}\n")

    # Create multi-sig attestation (consensus)
    print("4. Creating multi-signature consensus attestation...")
    consensus_data = {
        "delib_id": "delib_001",
        "question": "Should we deploy Lab3?",
        "decision": "APPROVED",
        "timestamp": datetime.utcnow().isoformat()
    }

    multisig = engine.create_multisig_attestation(
        entity_ids=["atlas@civic.os", "aurea@civic.os", "zenith@civic.os"],
        data=consensus_data,
        data_type="consensus",
        threshold=2,  # 2-of-3 required
        metadata={"decision_type": "deployment"}
    )

    print(f"   ✅ Multi-sig created: {len(multisig['signatures'])}/{multisig['total_signers']} signatures")
    print(f"   ✅ Threshold met: {multisig['valid']} (required: {multisig['threshold']})\n")

    # Verify multi-sig
    print("5. Verifying multi-signature attestation...")
    is_multisig_valid = engine.verify_multisig_attestation(multisig, consensus_data)
    print(f"   {'✅' if is_multisig_valid else '❌'} Multi-sig valid: {is_multisig_valid}\n")

    # Tamper detection
    print("6. Testing tamper detection...")
    tampered_transaction = transaction.copy()
    tampered_transaction["amount"] = 9999  # Malicious change

    is_tampered_valid = engine.verify_attestation(tx_attestation, tampered_transaction)
    print(f"   {'❌' if not is_tampered_valid else '✅'} Tampered data rejected: {not is_tampered_valid}\n")

    print("🎯 Cryptographic Attestation Engine operational!")
    print("   • ED25519 signatures")
    print("   • Multi-sig consensus")
    print("   • Tamper detection")
    print("   • Ready for Civic Ledger integration")
