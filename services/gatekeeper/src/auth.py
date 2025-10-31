"""DID signature verification and short-lived token minting."""
import time
import jwt
from fastapi import HTTPException
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.exceptions import InvalidSignature

ISSUER = "kaizen-gatekeeper"
AUD = "kaizen-internal"
TTL = 60  # seconds

def verify_did_signature(payload: bytes, did_pubkey_pem: bytes, signature: bytes) -> bool:
    """
    Verify DID signature using Ed25519.
    
    Args:
        payload: The signed payload bytes
        did_pubkey_pem: Public key in PEM format
        signature: The signature bytes
        
    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # In production, parse DID to extract public key
        # For now, assume pubkey_pem is already in correct format
        pubkey = Ed25519PublicKey.from_public_bytes(did_pubkey_pem)
        pubkey.verify(signature, payload)
        return True
    except (InvalidSignature, ValueError, Exception):
        return False

def mint_scoped_token(actor_did: str, scope: str, seconds: int = 30) -> str:
    """
    Mint a short-lived scoped token for the actor.
    
    Args:
        actor_did: DID of the actor
        scope: Scope of the token (e.g., "execute_script", "http_request")
        seconds: Token lifetime in seconds
        
    Returns:
        JWT token string
        
    Note:
        In production, replace "**KMS_SIGNER**" with actual KMS/HSM signer hook
    """
    now = int(time.time())
    return jwt.encode(
        {
            "sub": actor_did,
            "scope": scope,
            "iat": now,
            "exp": now + seconds,
            "iss": ISSUER,
            "aud": AUD
        },
        key="**KMS_SIGNER**",  # TODO: Replace with KMS/HSM signer hook
        algorithm="HS256"
    )

def require_scope(token: str, scope: str):
    """
    Verify token and check scope matches.
    
    Args:
        token: JWT token string
        scope: Required scope
        
    Raises:
        HTTPException: If token is invalid or scope doesn't match
    """
    try:
        claims = jwt.decode(token, "**KMS_SIGNER**", algorithms=["HS256"], audience=AUD)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Bad token")
    
    if claims.get("scope") != scope:
        raise HTTPException(status_code=403, detail="Scope mismatch")
