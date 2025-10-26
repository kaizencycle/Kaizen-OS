import os, asyncio
import redis.asyncio as redis

_redis_url = os.getenv("OAA_NONCE_REDIS_URL")
_ttl = int(os.getenv("OAA_NONCE_TTL_SEC", "600") or "600")

# Lazy global
_redis: redis.Redis | None = None

async def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        if not _redis_url:
            raise RuntimeError("OAA_NONCE_REDIS_URL not configured")
        _redis = redis.from_url(_redis_url, decode_responses=True)
    return _redis

async def nonce_seen(voter_id: str, nonce: str) -> bool:
    """Returns True if already seen, False otherwise (and records)."""
    if not voter_id or not nonce:
        return False
    r = await get_redis()
    key = f"nonce:{voter_id}:{nonce}"
    ok = await r.set(key, "1", ex=_ttl, nx=True)
    # redis.set returns True if key was set, None if exists
    return ok is None  # True means replay (already exists)

