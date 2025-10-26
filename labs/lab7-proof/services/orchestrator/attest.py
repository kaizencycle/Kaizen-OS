import hashlib, time
from datetime import datetime
from .models import AttestationCommitRequest, AttestationCommitResponse

def commit_attestation(req: AttestationCommitRequest) -> AttestationCommitResponse:
    # Create a fake merkle root from fields
    payload = f"{req.session_id}|{req.user_id}|{req.mentors_used}|{req.rubric.model_dump()}|{req.xp_awarded}"
    merkle_root = hashlib.sha256(payload.encode()).hexdigest()
    sig = hashlib.sha256((merkle_root + ":ed25519_stub").encode()).hexdigest()
    gi_snapshot = 0.99  # demo constant; wire to GI calc later
    attestation_id = hashlib.sha1((merkle_root + str(time.time())).encode()).hexdigest()[:16]
    return AttestationCommitResponse(
        attestation_id=attestation_id,
        gi_snapshot=gi_snapshot,
        merkle_root=merkle_root,
        sig=sig,
        ts=datetime.utcnow(),
    )

